import { Mail, Eye, Bell, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ContactManagement = () => {
    const { isAuthenticated } = useAuth();
    
    return (
        <section id="contact-management" className="py-20 bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="container mx-auto px-4">
                <div className="w-full">
                    <h2 className="text-4xl font-bold text-white mb-4 text-center">Contact Management</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-300/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">Total Messages</p>
                                    <p className="text-white text-2xl font-bold">0</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-300/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">Unread</p>
                                    <p className="text-white text-2xl font-bold">0</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-300/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                    <Bell className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">Read</p>
                                    <p className="text-white text-2xl font-bold">0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            {/* Messages */}
                            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30">
                                <h3 className="text-2xl font-bold text-white mb-4">Messages</h3>
                                <p className="text-white/80 mb-4">0 messages</p>

                                {/* Search Input */}
                                <div className="relative mb-6">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search messages"
                                        className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm text-white placeholder-white/50 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    />
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex gap-2 mb-6">
                                    {(['all', 'unread', 'read'] as const).map((filterType) => (
                                        <button
                                            key={filterType}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                filterType === 'all' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                                            }`}
                                        >
                                            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Message List */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 border-2 border-white/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                                            <Mail className="w-8 h-8 text-white/50" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message Detail */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30">
                                <h3 className="text-2xl font-bold text-white mb-4">Message Detail</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ContactManagement;