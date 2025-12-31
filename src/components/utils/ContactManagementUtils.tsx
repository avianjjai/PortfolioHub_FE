import { Message, GroupedMessageModel } from "../../services/modal";

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
        // Fix: Ensure proper UTC parsing by adding 'Z' if missing
        let fixedDateString = dateString;
        if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
            fixedDateString = dateString + 'Z';
        }
        
        const date = new Date(fixedDateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        
        // Show relative time for recent messages
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            const result = diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
            return result;
        } else if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            const result = `${hours}h ago`;
            return result;
        } else if (diffInDays < 7) {
            const days = Math.floor(diffInDays);
            const result = `${days}d ago`;
            return result;
        } else {
            // For older messages, show full date
            const result = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            return result;
        }
    } catch (error) {
        return 'Invalid date';
    }
};

const normalizeMessage = (incoming: any): Message => {
    const messageId = incoming._id ?? incoming.id ?? incoming.messageId;
    // conversationId is required - if missing, throw error or generate a fallback
    if (!incoming.conversationId) {
        console.error('Message missing required conversationId:', incoming);
        // For backward compatibility with old messages, generate a temporary conversationId
        // In production, all messages should have conversationId
        throw new Error('Message is missing required conversationId');
    }
    return {
        ...incoming,
        _id: messageId,
        id: messageId,
        conversationId: incoming.conversationId,  // Required field
        isRead: incoming.isRead ?? incoming.read ?? false,
        read: incoming.isRead ?? incoming.read ?? false,
        senderUserId: incoming.senderUserId,
        recipientUserId: incoming.recipientUserId,
        created_at: incoming.created_at ?? incoming.createdAt,
        updated_at: incoming.updated_at ?? incoming.updatedAt,
    } as Message;
};

const groupMessage = (messages: Message[]) => {
    const groupedMessages: GroupedMessageModel[] = [];

    messages.forEach(message => {
        const senderEmail = message.senderEmail ?? '';
        const recipientEmail = message.recipientEmail ?? '';
        const isRead = (message as any).isRead ?? (message as any).read ?? false;
        
        // Use conversationId (required field)
        const conversationKey = message.conversationId;
        
        const existingGroup = groupedMessages.find(group => group.conversationKey === conversationKey);

        if (existingGroup) {
            existingGroup.messages.push(message);
            if (!isRead) existingGroup.unreadCount++;
            if (new Date(message.created_at || '') > new Date(existingGroup.latestMessage.created_at || '')) {
                existingGroup.latestMessage = message;
            }
        } else {
            groupedMessages.push({
                conversationKey,
                sender: message.senderName,
                senderEmail,
                recipientName: message.recipientName ?? '',
                recipientEmail,
                messages: [message],
                unreadCount: isRead ? 0 : 1,
                latestMessage: message
            });
        }
    });

    groupedMessages.sort((a, b) => 
        new Date(b.latestMessage.created_at || '').getTime() - 
        new Date(a.latestMessage.created_at || '').getTime()
    );

    return groupedMessages;
};

const getConversationMessages = (groupedMessages: GroupedMessageModel[], selectedMessage: Message | null) => {
    if (!selectedMessage) {
        return [];
    }

    // Match by conversationId (required field)
    const group = groupedMessages.find(group => group.conversationKey === selectedMessage.conversationId);
    return group?.messages ?? [];
};

export { formatDate, normalizeMessage, groupMessage, getConversationMessages };