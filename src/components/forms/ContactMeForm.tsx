import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { sendAuthenticatedUserMessage, sendUnauthenticatedUserMessage } from "../../services/api";
import { Mail, User, Send, MessageSquare } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";

export const ContactMeForm = () => {
    const [message, setMessage] = useState({
        senderName: '',
        senderEmail: '',
        recipientEmail: '',
        messageSubject: '',
        messageContent: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { setIsMessageLoading, setIsMessageCountLoading } = usePortfolio();

    const [isSendButtonActive, setIsSendButtonActive] = useState(false);

    const { isMe, loggedInUser, currentUser, isAuthenticated } = useAuth();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMessage(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    useEffect(() => {
        if (loggedInUser) {
            setMessage(prev => ({
                ...prev,
                senderEmail: loggedInUser.email || '',
                senderName: `${loggedInUser.first_name || ''} ${loggedInUser.last_name || ''}`.trim()
            }));
        }
    }, [loggedInUser]);

    useEffect(() => {
        // Automatically set recipient email to the portfolio owner's email
        if (currentUser?.email) {
            setMessage(prev => ({
                ...prev,
                recipientEmail: currentUser.email
            }));
        }
    }, [currentUser]);

    useEffect(() => {
        // For authenticated users, need recipientEmail
        // For unauthenticated users, need currentUser.id for recipientUserId
        const basicFieldsFilled = 
            message.senderName.trim() !== '' &&
            message.senderEmail.trim() !== '' &&
            message.messageContent.trim() !== '';
            // messageSubject is optional, will use default if not provided
        
        const recipientFieldFilled = isAuthenticated 
            ? message.recipientEmail.trim() !== ''
            : !!currentUser?.id;
        
        setIsSendButtonActive(basicFieldsFilled && recipientFieldFilled);
    }, [message, isAuthenticated, currentUser]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            setLoading(true);
            setError('');
            setSuccess(false);
            e.preventDefault();

            let response;
            if (isAuthenticated) {
                // For authenticated users, use recipientEmail
                response = await sendAuthenticatedUserMessage({
                    messageSubject: message.messageSubject.trim() || undefined,  // Send undefined if empty, backend will provide default
                    messageContent: message.messageContent,
                    recipientEmail: message.recipientEmail || currentUser?.email || ''
                });
            } else {
                // For unauthenticated users, use recipientUserId
                if (!currentUser?.id) {
                    throw new Error('Unable to determine recipient. Please refresh the page.');
                }
                response = await sendUnauthenticatedUserMessage({
                    senderName: message.senderName,
                    senderEmail: message.senderEmail,
                    messageSubject: message.messageSubject.trim() || undefined,  // Send undefined if empty, backend will provide default
                    messageContent: message.messageContent,
                    recipientUserId: currentUser.id
                });
            }

            if (response.status_code === 400) {
                throw new Error(response.message ?? 'Failed to send message');
            }
            
            // Show success message
            setSuccess(true);
            
            // Clear form after successful submission
            setMessage({
                senderName: '',
                senderEmail: '',
                recipientEmail: '',
                messageSubject: '',
                messageContent: ''
            });
            
            // Reload messages if authenticated
            if (isAuthenticated) {
                setIsMessageLoading(true);
                setIsMessageCountLoading(true);
            }
            
            // Clear success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (error: any) {
            setError(error.message ?? 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6 px-4">
            {error && (
                <div className="rounded-2xl border border-red-300/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-2xl border border-green-300/60 bg-green-500/10 px-4 py-3 text-sm text-green-100">
                    Message sent successfully! Thank you for contacting me.
                </div>
            )}
            {/* Sender Information Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sender Name */}
                <div className="space-y-3">
                    <label className="flex items-center gap-3 text-base font-bold text-white/90 drop-shadow-sm">
                        <User className="w-5 h-5 text-purple-300" />
                        Your Name
                    </label>
                    <input
                        type="text"
                        name="senderName"
                        placeholder="John Doe"
                        value={message.senderName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/30 transition-all hover:border-white/50"
                        required
                    />
                </div>

                {/* Sender Email */}
                <div className="space-y-3">
                    <label className="flex items-center gap-3 text-base font-bold text-white/90 drop-shadow-sm">
                        <Mail className="w-5 h-5 text-purple-300" />
                        Your Email
                    </label>
                    <input
                        type="email"
                        name="senderEmail"
                        placeholder="john@example.com"
                        value={message.senderEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/30 transition-all hover:border-white/50"
                        required
                    />
                </div>
            </div>

            {/* Message Subject */}
            <div className="space-y-3">
                <label className="flex items-center gap-3 text-base font-bold text-white/90 drop-shadow-sm">
                    <MessageSquare className="w-5 h-5 text-purple-300" />
                    Subject <span className="text-white/50 text-sm font-normal">(optional)</span>
                </label>
                <input
                    type="text"
                    name="messageSubject"
                    placeholder="What's this about? (optional)"
                    value={message.messageSubject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/30 transition-all hover:border-white/50"
                />
            </div>

            {/* Message Content */}
            <div className="space-y-3">
                <label className="flex items-center gap-3 text-base font-bold text-white/90 drop-shadow-sm">
                    <MessageSquare className="w-5 h-5 text-purple-300" />
                    Message
                </label>
                <textarea
                    name="messageContent"
                    placeholder="Type your message here..."
                    value={message.messageContent}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/30 transition-all hover:border-white/50 resize-none"
                    rows={8}
                    required
                />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={!isSendButtonActive}
                    className={`
                        w-full px-8 py-4 rounded-lg font-semibold text-white text-lg
                        flex items-center justify-center gap-3
                        transition-all duration-200 transform
                        ${isSendButtonActive 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-[1.02] shadow-lg hover:shadow-xl' 
                            : 'bg-gray-400 cursor-not-allowed opacity-60'
                        }
                    `}
                    >
                        {loading ? (
                            <>
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-6 h-6" />
                                Send Message
                            </>
                        )}
                    </button>
            </div>
        </form>
    );
};