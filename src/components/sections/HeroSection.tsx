import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Check, Download, Mail, Share2 } from "lucide-react";

const sortName = (user: any) => {
    return user.first_name.charAt(0).toUpperCase() + user.last_name.charAt(0).toUpperCase();
}

const HeroSection = () => {
    const { isAuthenticated, currentUser, isValidUser, isMe } = useAuth();
    const [showCopied, setShowCopied] = useState(false);

    const handleShare = () => {
        setShowCopied(false);
        let profileUrl = `${window.location.origin}/user/${currentUser.id}`;
        console.log(profileUrl);
        navigator.clipboard.writeText(profileUrl);
        setShowCopied(true);
        setTimeout(() => {
            setShowCopied(false);
        }, 2000);
    };

    return (
        <section className="gradient-blue-purple py-20 relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                            {isValidUser ? `Hi, I'am ${currentUser.first_name} ${currentUser.last_name}` : 'Welcome to Portfolio Hub'}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-8">
                            {isValidUser ? currentUser.portfolio_title : 'Your Title or Tagline'}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            {!isValidUser ? (
                                <>
                                    <button
                                        onClick={() => window.location.href = '/register'}
                                        className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                                    >
                                        <Download size={20}/> Get Started
                                    </button>

                                    <button 
                                        onClick={() => window.location.href = '/login'}
                                        className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                                    >
                                        <Mail size={20} /> Login
                                    </button>
                                </>
                            ): (
                                <>
                                    <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                                        <Download size={20} /> Resume
                                    </button>
                                    {/* Only show Contact Me button when NOT viewing own profile */}
                                    {isMe && (
                                        <button 
                                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                                        >
                                        <Mail size={20} /> Contact Me
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleShare}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        {showCopied ? (
                                        <>
                                            <Check size={20} /> Copied!
                                        </>
                                        ) : (
                                        <>
                                            <Share2 size={20} /> Share Portfolio
                                        </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="lg:w-1/2 flex justify-center">
                    <div className="w-80 h-80 rounded-full gradient-orange-yellow flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">
                        {!isValidUser ? 'PH' : sortName(currentUser)}
                    </span>
                    </div>
                </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection;