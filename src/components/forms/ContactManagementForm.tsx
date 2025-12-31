import { FormEvent, useMemo, useState, useEffect } from "react";
import { Message } from "../../services/modal";
import { usePortfolio } from "../../context/PortfolioContext";
import { Send, Trash2, X } from "lucide-react";
import { deleteMessage, sendAuthenticatedUserMessage } from "../../services/api";
import { groupMessage } from "../utils/ContactManagementUtils";

interface DeleteConfirmationModalProps {
    message: Message;
    selectedConversation: Message[];
    deleteMode: 'single' | 'conversation';
    setShowDeleteConfirmationModal: (show: boolean) => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ message, deleteMode, setShowDeleteConfirmationModal, selectedConversation }) => {
    const [loading, setLoading] = useState(false);
    const { setIsMessageLoading } = usePortfolio();
    const [error, setError] = useState('');

    const handleDeleteSingleMessage = async () => {
        try {
            setLoading(true);
            const deletedMessage = await deleteMessage(message?._id ?? '');
            if (deletedMessage.status_code === 400) {
                throw new Error(deletedMessage.message ?? 'Failed to delete message');
            }
            setShowDeleteConfirmationModal(false);
            setIsMessageLoading(true);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteConversation = async () => {
        try {
            setLoading(true);
            // const deletedConversation = await deleteConversation(selectedConversation?._id ?? '');
            // if (deletedConversation.status_code === 400) {
            //     throw new Error(deletedConversation.message ?? 'Failed to delete conversation');
            // }
            setShowDeleteConfirmationModal(false);
            setIsMessageLoading(true);
        } catch (error: any) {
            setError(error.message ?? '');
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/30 max-w-md w-full">
                <div className="text-center">
                    <div className="w-16 h-16 border-2 border-red-300/70 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Trash2 className="w-8 h-8 text-red-300" />
                    </div>
                    <div className="flex items-center justify-between p-6 border-b border-white/20">
                        <h3 className="text-xl font-bold text-white mb-2">{deleteMode === 'single' ? 'Delete Message' : 'Delete Conversation'}</h3>
                        <button
                            onClick={() => setShowDeleteConfirmationModal(false)}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <p className="text-white/70 mb-6">
                        {deleteMode === 'single' ? (
                            `Are you sure you want to delete this message? This will permanently remove "${message?.messageSubject}" from the conversation.`
                        ) : (
                            `Are you sure you want to delete this conversation? This will permanently remove all ${selectedConversation?.length} message${selectedConversation?.length !== 1 ? 's' : ''} from ${selectedConversation[0]?.senderName}.`
                        )}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => setShowDeleteConfirmationModal(false)}
                            className="flex-1 px-4 py-2 text-white bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={deleteMode === 'single' ? handleDeleteSingleMessage : handleDeleteConversation}
                            className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {deleteMode === 'single' ? 'Deleting Message...' : 'Deleting Conversation...'}
                                </div>
                            ) : (
                                deleteMode === 'single' ? 'Delete Message' : 'Delete Conversation'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ComposeMessageFormProps {
    selectedConversation: Message[];
    setSelectedConversation: (conversation: Message[]) => void;
    setSelectedMessage: (message: Message) => void;
    chatPartnerEmail: string;
    currentUser: any
}
const ComposeMessageForm: React.FC<ComposeMessageFormProps> = ({ selectedConversation, setSelectedConversation, setSelectedMessage, currentUser, chatPartnerEmail }) => {
    const [composerMessage, setComposerMessage] = useState('');
    const [isSendingComposer, setIsSendingComposer] = useState(false);
    const [composerError, setComposerError] = useState<string | null>(null);
    const { 
        getMessages, getMessageCount
    } = usePortfolio();
    
    // Prefill subject from the latest message in the conversation
    const [composerSubject, setComposerSubject] = useState('');
    
    // Update subject when conversation changes - prefill from latest message
    useEffect(() => {
        const latest = selectedConversation.length > 0 ? selectedConversation[selectedConversation.length - 1] : null;
        if (latest?.messageSubject) {
            setComposerSubject(latest.messageSubject);
        } else {
            setComposerSubject('');  // Clear if no subject available
        }
    }, [selectedConversation]);
    
    const sendComposerMessage = async () => {
        if (!canSendComposer) {
            return;
        }

        if (!currentUser) {
            setComposerError('You need to be logged in to send a message.');
            return;
        }

        const trimmedContent = composerMessage.trim();
        if (!trimmedContent) {
            return;
        }

        if (!chatPartnerEmail) {
            setComposerError('Unable to determine the recipient for this conversation.');
            return;
        }

        // Store in const to ensure TypeScript knows it's defined
        const recipientEmail = chatPartnerEmail;

        setIsSendingComposer(true);
        setComposerError(null);

        try {
            // Use the subject from the input field (prefilled from latest message or user-entered)
            // Always send a subject - either user-entered or prefilled from latest message
            const latest = selectedConversation.length > 0 ? selectedConversation[selectedConversation.length - 1] : null;
            const subject = composerSubject.trim() || latest?.messageSubject || undefined;

            await sendAuthenticatedUserMessage({
                messageSubject: subject,  // Send prefilled subject or undefined if none available
                messageContent: trimmedContent,
                recipientEmail: recipientEmail
            });

            setComposerMessage('');
            // Keep the subject for next message (already prefilled)

            const updatedMessages = await getMessages();
            const refreshedGroups = groupMessage(updatedMessages);
            const partnerEmailLower = recipientEmail.toLowerCase();
            const myEmailLower = (currentUser?.email || '').toLowerCase();
            const conversationGroup = refreshedGroups.find(group => {
                const senderLower = group.senderEmail?.toLowerCase();
                const recipientLower = group.recipientEmail?.toLowerCase();
                return (
                    senderLower &&
                    recipientLower &&
                    ((senderLower === partnerEmailLower && recipientLower === myEmailLower) ||
                        (senderLower === myEmailLower && recipientLower === partnerEmailLower))
                );
            });

            const updatedConversation = conversationGroup?.messages ?? [];
            setSelectedConversation(updatedConversation);
            if (updatedConversation.length) {
                const newActiveMessage = updatedConversation[updatedConversation.length - 1];
                setSelectedMessage(newActiveMessage);
            }

            await getMessageCount();
        } catch (error: any) {
            setComposerError(error.message ?? 'Failed to send message. Please try again.');
        } finally {
            setIsSendingComposer(false);
        }
    };
    
    const canSendComposer = Boolean(chatPartnerEmail && composerMessage.trim() && !isSendingComposer);

    const handleComposerSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSendComposer) {
            return;
        }
        await sendComposerMessage();
    };

    const chatPartnerName = useMemo(() => {
        if (!selectedConversation.length) {
            return '';
        }

        const myEmail = currentUser?.email;
        for (let index = selectedConversation.length - 1; index >= 0; index -= 1) {
            const message = selectedConversation[index];
            if (message.senderEmail && message.senderEmail !== myEmail) {
                return message.senderName;
            }
            if (message.recipientEmail && message.recipientEmail !== myEmail) {
                return message.recipientName || message.recipientEmail || '';
            }
        }

        const fallback = selectedConversation[0];
        if (!fallback) {
            return '';
        }

        if (fallback.senderEmail && fallback.senderEmail !== myEmail) {
            return fallback.senderName;
        }

        if (fallback.recipientEmail && fallback.recipientEmail !== myEmail) {
            return fallback.recipientName || fallback.recipientEmail || '';
        }

        return '';
    }, [selectedConversation, currentUser?.email]);

    const handleComposerKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!canSendComposer) {
                return;
            }
            await sendComposerMessage();
        }
    };

    const COMPOSER_CHAR_LIMIT = 1000;
    const composerCharCount = composerMessage.length;
    
    return (
        <form 
            onSubmit={handleComposerSubmit} 
            className="mt-6 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
        >
            {!chatPartnerEmail ? (
                <p className="text-sm text-white/60">
                    Select a conversation to start responding to messages.
                </p>
            ) : (
                <>
                    {composerError && (
                        <div className="mb-3 rounded-2xl border border-red-300/60 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                            {composerError}
                    </div>
                    )}

                    <div className="mb-3">
                        <input
                            type="text"
                            value={composerSubject}
                            onChange={(event) => setComposerSubject(event.target.value)}
                            placeholder="Subject"
                            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/40 transition-all focus:border-white/40 focus:outline-none focus:ring-0"
                        />
                    </div>
                    
                    <div className="flex items-end gap-3">
                        <div className="flex flex-1 items-end rounded-3xl border border-white/15 bg-white/5 px-4 py-3 transition-all focus-within:border-white/40">
                            <textarea
                                value={composerMessage}
                                onChange={(event) => setComposerMessage(event.target.value)}
                                onKeyDown={handleComposerKeyDown}
                                placeholder="Type a message..."
                                rows={1}
                                maxLength={COMPOSER_CHAR_LIMIT}
                                className="max-h-44 min-h-[48px] w-full resize-none bg-transparent text-base text-white placeholder-white/50 focus:outline-none"
                            />
                </div>
                        <span className="text-xs text-white/50">{composerCharCount}/{COMPOSER_CHAR_LIMIT}</span>
                        <button
                            type="submit"
                            disabled={!canSendComposer}
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-all duration-200 ${
                                canSendComposer
                                    ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg hover:from-emerald-400 hover:to-green-400 hover:scale-105 hover:shadow-xl'
                                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                            }`}
                            title="Send message"
                        >
                            {isSendingComposer ? (
                                <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
        </div>
                </>
            )}
        </form>
    );
};

interface NewConversationModalProps {
    setShowNewConversationModal: (show: boolean) => void;
    currentUser: any;
    onConversationStarted: (message: Message) => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ setShowNewConversationModal, currentUser, onConversationStarted }) => {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [messageSubject, setMessageSubject] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getMessages, getMessageCount } = usePortfolio();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!recipientEmail.trim()) {
            setError('Recipient email is required');
            return;
        }

        if (!messageContent.trim()) {
            setError('Message content is required');
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const response = await sendAuthenticatedUserMessage({
                messageSubject: messageSubject.trim() || undefined,  // Send undefined if empty, backend will provide default
                messageContent: messageContent.trim(),
                recipientEmail: recipientEmail.trim()
            });

            // Refresh messages and counts
            await getMessages();
            await getMessageCount();

            // Notify parent component
            onConversationStarted(response);

            // Close modal and reset form
            setShowNewConversationModal(false);
            setRecipientEmail('');
            setMessageSubject('');
            setMessageContent('');
        } catch (error: any) {
            setError(error.message || 'Failed to send message. Please check if the recipient email exists in the system.');
        } finally {
            setIsSending(false);
        }
    };

    const COMPOSER_CHAR_LIMIT = 1000;
    const charCount = messageContent.length;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Start New Conversation</h3>
                    <button
                        onClick={() => setShowNewConversationModal(false)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-2xl border border-red-300/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-white/90 mb-2">
                            Recipient Email <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="Enter recipient email address"
                            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 transition-all focus:border-white/40 focus:outline-none focus:ring-0"
                            disabled={isSending}
                            required
                        />
                        <p className="mt-1 text-xs text-white/60">
                            You can only send messages to users registered in the system
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-white/90 mb-2">
                            Subject <span className="text-white/50 text-xs">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={messageSubject}
                            onChange={(e) => setMessageSubject(e.target.value)}
                            placeholder="Enter message subject"
                            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 transition-all focus:border-white/40 focus:outline-none focus:ring-0"
                            disabled={isSending}
                        />
                        <p className="mt-1 text-xs text-white/60">
                            If left empty, the system will use the previous message's subject or a default
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-white/90 mb-2">
                            Message <span className="text-red-400">*</span>
                        </label>
                        <div className="flex flex-col rounded-3xl border border-white/15 bg-white/5 px-4 py-3 transition-all focus-within:border-white/40">
                            <textarea
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                placeholder="Type your message..."
                                rows={6}
                                maxLength={COMPOSER_CHAR_LIMIT}
                                className="w-full resize-none bg-transparent text-base text-white placeholder-white/50 focus:outline-none"
                                disabled={isSending}
                                required
                            />
                            <div className="flex justify-end mt-2">
                                <span className="text-xs text-white/50">{charCount}/{COMPOSER_CHAR_LIMIT}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowNewConversationModal(false)}
                            className="flex-1 px-4 py-3 text-white bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors disabled:opacity-50"
                            disabled={isSending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 text-white bg-gradient-to-br from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                            disabled={isSending || !recipientEmail.trim() || !messageContent.trim()}
                        >
                            {isSending ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Sending...
                                </div>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Message
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export { DeleteConfirmationModal, ComposeMessageForm, NewConversationModal };