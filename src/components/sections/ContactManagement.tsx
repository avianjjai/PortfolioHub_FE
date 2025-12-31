import { Mail, Bell, Search, Trash2, Check, ChevronLeft, ChevronRight, Clock, MessageSquare, Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePortfolio } from "../../context/PortfolioContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Message } from "../../services/modal";
import { markMessagesAsRead } from "../../services/api";
import { getWsBaseUrl } from "../../config/env.config";
import { ModalOverlay } from "../forms/ModalOverlay";
import DeleteConfirmationModal from "../forms/DeleteConfirmationModal";
import { formatDate, normalizeMessage, groupMessage, getConversationMessages } from "../utils/ContactManagementUtils";
import { ComposeMessageForm, NewConversationModal } from "../forms/ContactManagementForm";

type FilterType = 'all' | 'unread';

const MESSAGES_PER_PAGE = 5;

const ContactManagement = () => {
    const { isAuthenticated, currentUser } = useAuth();
    const { 
        messages, setMessages, messageCount, 
        getMessageCount, isMessageLoading, getMessages
    } = usePortfolio();
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<Message[]>([]);
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [readingMessageIds, setReadingMessageIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [showDeleteConfirmationModalForSingleMessage, setShowDeleteConfirmationModalForSingleMessage] = useState(false);
    const [showDeleteConfirmationModalForConversation, setShowDeleteConfirmationModalForConversation] = useState(false);
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);
    const previousConversationKeyRef = useRef<string>('');
    const conversationContainerRef = useRef<HTMLDivElement | null>(null);
    const shouldScrollToBottomRef = useRef<boolean>(false);
    const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const messageObservers = useRef<Map<string, IntersectionObserver>>(new Map());
    const processingMessagesRef = useRef<Set<string>>(new Set());
    const pendingReadIdsRef = useRef<Set<string>>(new Set());
    const processedReadIdsRef = useRef<Set<string>>(new Set());
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const normalizedMessages = useMemo(() => messages.map(normalizeMessage), [messages]);
    const filteredMessages = useMemo(() => {
        let collection = normalizedMessages;

        if (filter === 'unread') {
            collection = collection.filter((msg) => !((msg as any).isRead ?? (msg as any).read ?? false));
        }

        if (searchTerm) {
            const lowered = searchTerm.toLowerCase();
            collection = collection.filter((msg) =>
                msg.senderName.toLowerCase().includes(lowered) ||
                (msg.senderEmail ?? '').toLowerCase().includes(lowered) ||
                (msg.messageSubject ?? '').toLowerCase().includes(lowered) ||
                msg.messageContent.toLowerCase().includes(lowered)
            );
        }

        return collection;
    }, [normalizedMessages, filter, searchTerm]);

    const groupedMessages = useMemo(() => groupMessage(filteredMessages), [filteredMessages]);
    const totalPages = useMemo(() => Math.max(1, Math.ceil(groupedMessages.length / MESSAGES_PER_PAGE)), [groupedMessages.length]);
    const clampedPage = Math.min(currentPage, totalPages);
    useEffect(() => {
        if (clampedPage !== currentPage) {
            setCurrentPage(clampedPage);
        }
    }, [clampedPage, currentPage]);
    const startIndex = (clampedPage - 1) * MESSAGES_PER_PAGE;
    const endIndex = Math.min(startIndex + MESSAGES_PER_PAGE, groupedMessages.length);
    const paginatedGroups = useMemo(
        () => groupedMessages.slice(startIndex, endIndex),
        [groupedMessages, startIndex, endIndex]
    );

    const conversationKey = useMemo(() => {
        if (!selectedConversation || selectedConversation.length === 0) {
            return '';
        }
        // Use conversationId (required field)
        const firstMessage = selectedConversation[0];
        return firstMessage?.conversationId || '';
    }, [selectedConversation]);

    useEffect(() => {
        if (!conversationKey) {
            previousConversationKeyRef.current = '';
            return;
        }

        if (previousConversationKeyRef.current !== conversationKey && selectedConversation && selectedConversation.length > 0) {
            const latest = selectedConversation[selectedConversation.length - 1];
            previousConversationKeyRef.current = conversationKey;
        }
    }, [conversationKey, selectedConversation]);

    const chatPartnerEmail = useMemo(() => {
        if (!selectedConversation || !selectedConversation.length) {
            return '';
        }

        const myEmail = currentUser?.email;
        for (let index = selectedConversation.length - 1; index >= 0; index -= 1) {
            const message = selectedConversation[index];
            if (message.senderEmail && message.senderEmail !== myEmail) {
                return message.senderEmail;
            }
            if (message.recipientEmail && message.recipientEmail !== myEmail) {
                return message.recipientEmail;
            }
        }

        const fallback = selectedConversation[0];
        if (!fallback) {
            return '';
        }

        if (fallback.senderEmail && fallback.senderEmail !== myEmail) {
            return fallback.senderEmail;
        }

        if (fallback.recipientEmail && fallback.recipientEmail !== myEmail) {
            return fallback.recipientEmail;
        }

        return fallback.recipientEmail || fallback.senderEmail || '';
    }, [selectedConversation, currentUser?.email]);

    const chatPartnerName = useMemo(() => {
        if (!selectedConversation || !selectedConversation.length) {
            return '';
        }

        const myEmail = currentUser?.email?.toLowerCase();
        let partnerName = '';
        let partnerEmail = '';

        // Find partner's name and email from messages (prioritize most recent)
        for (let index = selectedConversation.length - 1; index >= 0; index -= 1) {
            const message = selectedConversation[index];
            const senderEmailLower = message.senderEmail?.toLowerCase();
            const recipientEmailLower = message.recipientEmail?.toLowerCase();
            
            // Partner is the sender
            if (senderEmailLower && senderEmailLower !== myEmail && message.senderEmail) {
                partnerEmail = message.senderEmail || '';
                // Prioritize senderName if available and not empty
                if (message.senderName && message.senderName.trim()) {
                    partnerName = message.senderName.trim();
                    break; // Found name, stop searching
                }
                if (!partnerName) {
                    partnerName = message.senderName || ''; // Keep empty if no name, will use email
                }
            }
            
            // Partner is the recipient
            if (recipientEmailLower && recipientEmailLower !== myEmail && message.recipientEmail) {
                partnerEmail = message.recipientEmail || '';
                // Prioritize recipientName if available and not empty
                if (message.recipientName && message.recipientName.trim()) {
                    partnerName = message.recipientName.trim();
                    break; // Found name, stop searching
                }
                if (!partnerName) {
                    partnerName = message.recipientName || ''; // Keep empty if no name, will use email
                }
            }
        }

        // Return name if available, otherwise extract a display name from email
        if (partnerName && partnerName.trim()) {
            return partnerName;
        }
        
        // If no name found, extract a display name from email (e.g., "test1" from "test1@gmail.com")
        if (partnerEmail && partnerEmail.trim()) {
            const emailName = partnerEmail.split('@')[0];
            // Capitalize first letter for better display
            return emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }

        return '';
    }, [selectedConversation, currentUser?.email]);

    useEffect(() => {
        const conversation = getConversationMessages(groupedMessages, selectedMessage);
        setSelectedConversation(conversation || []);
    }, [groupedMessages, selectedMessage]);

    const handleMessageViewed = useCallback((message: Message) => {
        const messageId = (message as any)._id ?? (message as any).id;
        if (!messageId) {
            return;
        }

        const isSentByMe = message.senderUserId && currentUser?.id ? message.senderUserId === currentUser.id : false;
        const isAlreadyRead = (message as any).isRead ?? (message as any).read ?? false;

        if (isSentByMe || isAlreadyRead || processingMessagesRef.current.has(messageId) || processedReadIdsRef.current.has(messageId)) {
            return;
        }

        processingMessagesRef.current.add(messageId);
        pendingReadIdsRef.current.add(messageId);
        setReadingMessageIds((prev) => (prev.includes(messageId) ? prev : [...prev, messageId]));
    }, [currentUser?.id]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const pendingIds = Array.from(pendingReadIdsRef.current);
            if (pendingIds.length === 0) {
                return;
            }

            let idSet: Set<string> | null = null;
            try {
                await markMessagesAsRead(pendingIds);

                idSet = new Set(pendingIds);
                setMessages((prev) => prev.map((msg) => {
                    const msgId = (msg as any)._id ?? (msg as any).id;
                    if (msgId && idSet?.has(msgId)) {
                        return { ...msg, isRead: true, read: true };
                    }
                    return msg;
                }));
                setSelectedConversation((prev) => prev.map((msg) => {
                    const msgId = (msg as any)._id ?? (msg as any).id;
                    if (msgId && idSet?.has(msgId)) {
                        return { ...msg, isRead: true, read: true };
                    }
                    return msg;
                }));
                await getMessageCount();
                pendingIds.forEach((id) => {
                    processingMessagesRef.current.delete(id);
                    processedReadIdsRef.current.add(id);
                });
                pendingReadIdsRef.current.clear();
                setReadingMessageIds((prev) => prev.filter((id) => !idSet?.has(id)));
                shouldScrollToBottomRef.current = true;
            } catch (error) {
                console.error('Failed to mark messages as read', error);
                pendingIds.forEach((id) => {
                    processingMessagesRef.current.delete(id);
                    processedReadIdsRef.current.delete(id);
                });
                if (idSet) {
                    setReadingMessageIds((prev) => prev.filter((id) => !idSet || !idSet.has(id)));
                } else {
                    setReadingMessageIds((prev) => prev.filter((id) => !pendingIds.includes(id)));
                }
                // leave ids in pending to retry next tick
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [getMessageCount, setMessages]);

    useEffect(() => {
        const observers = messageObservers.current;
        observers.forEach((observer) => observer.disconnect());
        observers.clear();

        if (!conversationContainerRef.current) {
            return;
        }

        selectedConversation.forEach((message) => {
            const messageId = (message as any)._id ?? (message as any).id;
            if (!messageId) {
                return;
            }
            const isAlreadyRead = (message as any).isRead ?? (message as any).read ?? false;
            if (isAlreadyRead) {
                return;
            }

            const element = messageRefs.current.get(messageId);
            if (!element) {
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                        handleMessageViewed(message);
                        observer.disconnect();
                        observers.delete(messageId);
                    }
                });
            }, {
                root: conversationContainerRef.current,
                threshold: [0.6]
            });

            observer.observe(element);
            observers.set(messageId, observer);
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
            observers.clear();
        };
    }, [handleMessageViewed, selectedConversation]);

    const handleSocketMessage = useCallback((event: MessageEvent) => {
        try {
            const envelope = JSON.parse(event.data);
            const eventType = envelope?.event;
            const payload = envelope?.payload;

            if (eventType === 'message:new' && payload) {
                const normalized = normalizeMessage(payload);
                const normalizedId = (normalized as any)._id ?? (normalized as any).id;

                setMessages((prev: Message[]) => {
                    if (!normalizedId) {
                        return prev;
                    }

                    const exists = prev.some((msg) => {
                        const msgId = (msg as any)._id ?? (msg as any).id;
                        return msgId === normalizedId;
                    });

                    if (exists) {
                        return prev.map((msg) => {
                            const msgId = (msg as any)._id ?? (msg as any).id;
                            return msgId === normalizedId ? { ...msg, ...normalized } : msg;
                        });
                    }

                    return [...prev, normalized];
                });

                setSelectedConversation((prev) => {
                    if (!prev.length) {
                        return prev;
                    }

                    // Match by conversationId (required field)
                    const shouldAddToConversation = normalized.conversationId && conversationKey && normalized.conversationId === conversationKey;
                    
                    if (shouldAddToConversation) {
                        const existsInConversation = prev.some((msg) => {
                            const msgId = (msg as any)._id ?? (msg as any).id;
                            return msgId === normalizedId;
                        });
                        if (existsInConversation) {
                            return prev.map((msg) => {
                                const msgId = (msg as any)._id ?? (msg as any).id;
                                return msgId === normalizedId ? { ...msg, ...normalized } : msg;
                            });
                        }
                        shouldScrollToBottomRef.current = true;
                        return [...prev, normalized];
                    }
                    return prev;
                });

                const root = conversationContainerRef.current;
                if (root && normalized.recipientUserId && currentUser?.id && normalized.recipientUserId === currentUser.id) {
                    shouldScrollToBottomRef.current = true;
                }

                if (normalized.recipientUserId && currentUser?.id && normalized.recipientUserId === currentUser.id) {
                    getMessageCount();
                }
            }

            if (eventType === 'message:read' && payload?.messageIds) {
                const ids: string[] = (payload.messageIds as string[]).map(String);
                const idSet = new Set(ids);

                if (ids.length === 0) {
                    return;
                }

                setMessages((prev: Message[]) => prev.map((msg) => {
                    const msgId = (msg as any)._id ?? (msg as any).id;
                    if (msgId && idSet.has(msgId)) {
                        return { ...msg, isRead: true, read: true };
                    }
                    return msg;
                }));

                setSelectedConversation((prev) => prev.map((msg) => {
                    const msgId = (msg as any)._id ?? (msg as any).id;
                    if (msgId && idSet.has(msgId)) {
                        return { ...msg, isRead: true, read: true };
                    }
                    return msg;
                }));

                getMessageCount();
            }
        } catch (error) {
            console.error('Failed to handle websocket message', error);
        }
    }, [conversationKey, currentUser?.id, getMessageCount, setMessages]);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            return;
        }

        let shouldReconnect = true;

        const connect = () => {
            const baseUrl = getWsBaseUrl().replace(/\/$/, '');
            const socketUrl = `${baseUrl}/ws/messages?token=${token}`;
            const ws = new WebSocket(socketUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setSocketConnected(true);
            };

            ws.onmessage = handleSocketMessage;

            ws.onclose = () => {
                setSocketConnected(false);
                if (shouldReconnect) {
                    reconnectTimeoutRef.current = setTimeout(connect, 3000);
                }
            };

            ws.onerror = () => {
                ws.close();
            };
        };

        connect();

        return () => {
            shouldReconnect = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [handleSocketMessage, isAuthenticated]);

    useEffect(() => {
        document.title = 'Contact Management';
    }, []);

    // Scroll to top functionality
    const scrollToTop = () => {
        const messageList = document.querySelector('.message-list-container');
        if (messageList) {
            messageList.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Handle scroll events for scroll-to-top button
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        setShowScrollToTop(target.scrollTop > 100);
    };

    useEffect(() => {
        const container = conversationContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [selectedConversation, selectedMessage]);

    useEffect(() => {
        if (!shouldScrollToBottomRef.current) {
            return;
        }

        shouldScrollToBottomRef.current = false;
        const container = conversationContainerRef.current;
        if (container) {
            requestAnimationFrame(() => {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            });
        }
    }, [selectedConversation, readingMessageIds]);

    if (!isAuthenticated) {
        return null;
    }
    
    return (
        <section id="contact-management" className="py-20 bg-gradient-to-br from-blue-500 to-purple-600">
            {showDeleteConfirmationModalForSingleMessage && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModalForSingleMessage(false)}>
                    <DeleteConfirmationModal 
                        setShowDeleteModal={setShowDeleteConfirmationModalForSingleMessage}
                        data={selectedMessage as Message}
                        dataType="message"
                        setSelectedData={setSelectedMessage}
                    />
                </ModalOverlay>
            )}

            {showDeleteConfirmationModalForConversation && (
                <ModalOverlay onClose={() => setShowDeleteConfirmationModalForConversation(false)}>
                    <DeleteConfirmationModal 
                        setShowDeleteModal={setShowDeleteConfirmationModalForConversation}
                        data={selectedConversation}
                        dataType="conversation"
                        setSelectedData={(data) => setSelectedConversation(data || [])}
                    />
                </ModalOverlay>
            )}

            {showNewConversationModal && (
                <NewConversationModal
                    setShowNewConversationModal={setShowNewConversationModal}
                    currentUser={currentUser}
                    onConversationStarted={async (newMessage: Message) => {
                        // Refresh messages to get the updated list
                        const updatedMessages = await getMessages();
                        
                        // Find and select the new conversation
                        const normalizedMessages = updatedMessages.map(normalizeMessage);
                        const refreshedGroups = groupMessage(normalizedMessages);
                        
                        // Find the conversation group that contains the new message
                        const conversationGroup = refreshedGroups.find(group => 
                            group.conversationKey === newMessage.conversationId
                        );
                        
                        if (conversationGroup && conversationGroup.messages.length > 0) {
                            // Select the latest message from the conversation
                            const latestMessage = conversationGroup.latestMessage;
                            setSelectedMessage(latestMessage);
                            setSelectedConversation(conversationGroup.messages);
                        }
                    }}
                />
            )}

            <div className="container mx-auto px-4">
                <div className="w-full">
                    <h2 className="text-4xl font-bold text-white mb-8 text-center">Contact Management</h2>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="group relative bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Mail className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm font-medium mb-1">Total Messages</p>
                                    <p className="text-white text-3xl font-bold">{messageCount.total}</p>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 relative">
                                    <Mail className="w-7 h-7 text-white" />
                                    {messageCount.unread > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                            <span className="text-white text-xs font-bold">{messageCount.unread > 9 ? '9+' : messageCount.unread}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm font-medium mb-1">Unread</p>
                                    <p className="text-white text-3xl font-bold">{messageCount.unread}</p>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Check className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm font-medium mb-1">Read</p>
                                    <p className="text-white text-3xl font-bold">{messageCount.read}</p>
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                        </div>
                    </div>

                    {/* Messages Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Messages List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30 h-[600px] flex flex-col">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-2xl font-bold text-white">Messages</h3>
                                        <button
                                            onClick={() => setShowNewConversationModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                                            title="Start new conversation"
                                        >
                                            <Send size={16} />
                                            New
                                        </button>
                                    </div>
                                    <p className="text-white/80">{groupedMessages.length} conversation{groupedMessages.length !== 1 ? 's' : ''} • {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}</p>
                                </div>

                                {/* Search Input */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search messages"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm text-white placeholder-white/50 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex gap-2 mb-4">
                                    {(['all', 'unread'] as const).map((filterType) => (
                                        <button
                                            key={filterType}
                                            onClick={() => setFilter(filterType)}
                                            className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                                filterType === filter 
                                                    ? 'bg-gradient-to-r from-white/30 to-white/20 text-white shadow-lg scale-105' 
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white hover:scale-105'
                                            } border ${
                                                filterType === filter ? 'border-white/40' : 'border-white/20 hover:border-white/30'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {filterType === 'all' && <Mail className="w-3.5 h-3.5" />}
                                                {filterType === 'unread' && <Bell className="w-3.5 h-3.5" />}
                                                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                                            </span>
                                            {filterType === filter && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Message List */}
                                <div 
                                    className="space-y-3 flex-1 overflow-y-auto mb-4 scrollbar-thin scroll-smooth message-list-container"
                                    onScroll={handleScroll}
                                >
                                    {isMessageLoading ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 border-4 border-white/20 border-t-white/80 rounded-full mx-auto mb-4 animate-spin"></div>
                                            <p className="text-white/70 font-medium">Loading conversations...</p>
                                        </div>
                                    ) : paginatedGroups.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/30 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                                                <Mail className="w-10 h-10 text-white/50" />
                                            </div>
                                            <p className="text-white font-semibold mb-1">No conversations found</p>
                                            <p className="text-white/60 text-sm">Try adjusting your filters or search</p>
                                        </div>
                                    ) : (
                                        paginatedGroups.map((group) => {
                                            const isActive = selectedMessage?.senderEmail === group.senderEmail || selectedMessage?.recipientEmail === group.senderEmail;
                                            const partnerEmail = group.senderEmail === currentUser?.email ? group.recipientEmail : group.senderEmail;
                                            const partnerName = group.senderEmail === currentUser?.email ? group.recipientName || '' : group.sender || '';
                                            const displayName = partnerName?.trim() || partnerEmail;
                                            const initials = (text?: string) => {
                                                if (!text) return 'U';
                                                const parts = text.trim().split(' ').filter(Boolean);
                                                if (parts.length === 1) {
                                                    return parts[0].slice(0, 2).toUpperCase();
                                                }
                                                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                                            };

                                            return (
                                                <div
                                                    key={group.conversationKey}
                                                onClick={() => setSelectedMessage(group.latestMessage)}
                                                    className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-300 border backdrop-blur-sm ${
                                                        isActive
                                                            ? 'bg-gradient-to-r from-white/30 to-white/20 border-white/60 shadow-xl scale-[1.01]'
                                                            : 'bg-white/10 border-white/20 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/15 hover:border-white/30 hover:scale-[1.01]'
                                                    }`}
                                                >
                                                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-gradient-to-br from-blue-400/40 via-purple-400/40 to-pink-400/40 border border-white/30 text-sm font-semibold uppercase text-white">
                                                        {initials(displayName || partnerEmail)}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <p className="text-white font-semibold text-sm truncate">
                                                                    {displayName}
                                                                </p>
                                                                {partnerName && partnerEmail && partnerName.trim().length > 0 && partnerName !== partnerEmail && (
                                                                    <p className="text-white/50 text-xs truncate">
                                                                        {partnerEmail}
                                                                    </p>
                                                            )}
                                                        </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-xs text-white/60">
                                                                {formatDate(group.latestMessage.created_at)}
                                                            </span>
                                                            {group.unreadCount > 0 && (
                                                                    <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-400 px-2 text-xs font-bold text-white shadow-sm">
                                                                        {group.unreadCount}
                                                        </span>
                                                                )}
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t border-white/20 mt-auto">
                                        <div className="text-white/80 text-sm font-medium">
                                            <span className="text-white font-bold">{startIndex + 1}-{Math.min(endIndex, groupedMessages.length)}</span> of <span className="text-white font-bold">{groupedMessages.length}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className={`p-2 rounded-lg transition-all duration-200 ${
                                                    currentPage === 1 
                                                        ? 'text-white/30 cursor-not-allowed' 
                                                        : 'text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-white/20 hover:to-white/15 hover:scale-110'
                                                }`}
                                                title="Previous page"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            
                                            <div className="px-4 py-1.5 bg-gradient-to-r from-white/20 to-white/15 rounded-lg border border-white/30">
                                                <span className="text-white text-sm font-bold">{currentPage}</span>
                                                <span className="text-white/60 text-sm mx-1">/</span>
                                                <span className="text-white/80 text-sm">{totalPages}</span>
                                            </div>
                                            
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className={`p-2 rounded-lg transition-all duration-200 ${
                                                    currentPage === totalPages 
                                                        ? 'text-white/30 cursor-not-allowed' 
                                                        : 'text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-white/20 hover:to-white/15 hover:scale-110'
                                                }`}
                                                title="Next page"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scroll to Top Button */}
                            {showScrollToTop && (
                                <button
                                    onClick={scrollToTop}
                                    className="absolute bottom-20 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl z-10"
                                    title="Scroll to top"
                                >
                                    <ChevronLeft size={20} className="rotate-90" />
                                </button>
                            )}
                        </div>

                        {/* Message Detail */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30 h-[600px] flex flex-col">
                                {selectedMessage ? (
                                    <>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white">Conversation</h3>
                                                <p className="text-white/70 text-sm">{chatPartnerName} • {selectedConversation.length} message{selectedConversation.length !== 1 ? 's' : ''}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteConfirmationModalForConversation(true);
                                                    }}
                                                    className="p-2 text-white/70 hover:text-red-300 hover:bg-white/20 rounded-full transition-colors"
                                                    title="Delete conversation"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            ref={conversationContainerRef}
                                            className="space-y-4 flex-1 overflow-y-auto scrollbar-thin scroll-smooth pr-2"
                                        >
                                            {selectedConversation.map((message, index) => {
                                                const isSentByMe = message.senderUserId && currentUser?.id ? message.senderUserId === currentUser.id : false;
                                                const isActive = selectedMessage?._id === message._id;
                                                const fullDateTooltip = message.created_at ? (() => {
                                                    try {
                                                        const date = new Date(message.created_at);
                                                        return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
                                                    } catch {
                                                        return 'Invalid date';
                                                    }
                                                })() : 'No date available';

                                                const initials = (text?: string, fallback?: string) => {
                                                    const base = (text && text.trim()) || fallback || '';
                                                    if (!base) return 'U';
                                                    const parts = base.split(' ').filter(Boolean);
                                                    if (parts.length === 1) {
                                                        return parts[0].slice(0, 2).toUpperCase();
                                                    }
                                                    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                                                };

                                                const messageKey = message._id ?? `${message.senderEmail ?? 'unknown'}-${message.recipientEmail ?? 'unknown'}-${message.created_at ?? index}`;

                                                return (
                                                    <div
                                                        key={messageKey}
                                                        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`flex max-w-[80%] items-end gap-3 ${isSentByMe ? 'flex-row-reverse' : ''}`}>
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold uppercase text-white/70">
                                                                {initials(
                                                                    isSentByMe ? (currentUser?.first_name || currentUser?.email || '') : message.senderName,
                                                                    isSentByMe ? currentUser?.email : message.senderEmail
                                                                )}
                                                            </div>

                                                            <div
                                                    onClick={() => setSelectedMessage(message)}
                                                                ref={(el) => {
                                                                    const messageIdRef = (message as any)._id ?? (message as any).id;
                                                                    if (!messageIdRef) {
                                                                        return;
                                                                    }
                                                                    if (el) {
                                                                        messageRefs.current.set(messageIdRef, el);
                                                                    } else {
                                                                        messageRefs.current.delete(messageIdRef);
                                                                    }
                                                                }}
                                                                className={[
                                                                    'relative flex cursor-pointer flex-col gap-2 rounded-3xl px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300',
                                                                    isSentByMe
                                                                        ? 'rounded-br-md bg-gradient-to-br from-green-400/90 to-emerald-500/90 text-white'
                                                                        : 'rounded-bl-md bg-white/15 text-white/90',
                                                                    isActive
                                                                        ? 'ring-2 ring-white/60 scale-[1.01]'
                                                                        : 'hover:ring-[1.5px] hover:ring-white/40 hover:scale-[1.01]',
                                                                ].join(' ')}
                                                            >
                                                                <div className={`flex items-start ${isSentByMe ? 'justify-end' : 'justify-between'} gap-3`}>
                                                                    <p className={`text-sm font-semibold uppercase tracking-wide text-white/70 ${isSentByMe ? 'text-right' : 'text-left'}`}>
                                                                        {message.messageSubject || 'No Subject'}
                                                                    </p>

                                                                    <div className="flex items-center gap-2">
                                                                {readingMessageIds.includes(((message as any)._id ?? (message as any).id) ?? '') ? (
                                                                            <div className="flex items-center gap-1 rounded-full bg-blue-400/20 px-2 py-0.5">
                                                                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300"></div>
                                                                                <span className="text-xs font-bold text-blue-200">Reading…</span>
                                                            </div>
                                                                ) : !((message as any).isRead ?? (message as any).read ?? false) ? (
                                                                            <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 px-2 py-0.5 shadow-sm">
                                                                                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></div>
                                                                                <span className="text-xs font-bold text-white">New</span>
                                                                    </div>
                                                                        ) : isSentByMe ? (
                                                                            <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                                                                                <Check className="h-3 w-3" />
                                                                                <span>Read</span>
                                                                    </div>
                                                                        ) : null}
                                                                
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowDeleteConfirmationModalForSingleMessage(true);
                                                                        setSelectedMessage(message);
                                                                    }}
                                                                            className="rounded-full p-1.5 text-white/60 transition-all duration-200 hover:scale-110 hover:bg-white/15 hover:text-red-200"
                                                                    title="Delete this message"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                                <div className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">
                                                                    {message.messageContent}
                                                                </div>

                                                                <div className={`flex items-center gap-2 text-xs ${isSentByMe ? 'justify-end text-white/70' : 'text-white/60'}`}>
                                                                    <span title={fullDateTooltip} className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                {formatDate(message.created_at)}
                                                            </span>
                                                        </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                                    </div>

                                        {(() => {
                                            // Check if both users are registered in the system
                                            // If any message has both senderUserId and recipientUserId, both users are registered
                                            const bothUsersAreRegistered = selectedConversation.some((message) => {
                                                return message.senderUserId && message.recipientUserId;
                                            });
                                            
                                            // Only show compose form if both users are registered
                                            if (!bothUsersAreRegistered && chatPartnerEmail) {
                                                return (
                                                    <div className="mt-6 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                                                        <p className="text-sm text-white/60 text-center">
                                                            This message was sent by an unauthenticated user. You cannot reply to this conversation because the sender is not registered in the system.
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            
                                            return (
                                                <ComposeMessageForm
                                                    selectedConversation={selectedConversation}
                                                    setSelectedConversation={setSelectedConversation}
                                                    setSelectedMessage={setSelectedMessage}
                                                    currentUser={currentUser}
                                                    chatPartnerEmail={chatPartnerEmail}
                                                />
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="relative w-24 h-24 mx-auto mb-6">
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
                                                <div className="relative w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                                                    <MessageSquare className="w-12 h-12 text-white/60" />
                                                </div>
                                            </div>
                                            <h3 className="text-white font-bold text-lg mb-2">No Conversation Selected</h3>
                                            <p className="text-white/60 text-sm">Choose a conversation from the list to view messages</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactManagement;