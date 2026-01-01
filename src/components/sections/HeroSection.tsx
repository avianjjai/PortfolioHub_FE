import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Check, Download, Mail, Share2, User, Edit2 } from "lucide-react";
import { ModalOverlay } from "../forms/ModalOverlay";
import EditPortfolioForm from "../forms/EditPortfolioForm";
import { downloadResume } from "../../services/api";

const sortName = (user: any) => {
    if (!user) return 'PH';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    if (!firstName && !lastName) {
        return user.username?.charAt(0).toUpperCase() || 'U';
    }
    
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    
    return firstInitial + lastInitial || user.username?.charAt(0).toUpperCase() || 'U';
}

const HeroSection = () => {
    const { currentUser, isMe, isValidUser } = useAuth();
    const [showCopied, setShowCopied] = useState(false);
    const [portfolioData] = useState<any>(null);
    const [isSufficientInfo, setIsSufficientInfo] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    useEffect(() => {
        if (currentUser && (currentUser.first_name || currentUser.last_name)) {
            setIsSufficientInfo(true);
        } else {
            setIsSufficientInfo(false);
        }
    }, [currentUser]);

    const handleShare = () => {
        const userId = currentUser?.id;
        if (userId) {
            let profileUrl = `${window.location.origin}/user/${userId}`;
            navigator.clipboard.writeText(profileUrl);
            setShowCopied(true);
            setTimeout(() => {
                setShowCopied(false);
            }, 2000);
        }
    };

    const handleResumeDownload = async () => {
        try {
            await downloadResume();
        } catch (error: any) {
            alert(error.message || 'Failed to download resume. Please try again.');
        }
    };

    return (
        <section className="gradient-blue-purple py-20 relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
                        {isSufficientInfo && currentUser ? (
                            <>
                                <h1 
                                    className="text-5xl md:text-7xl font-bold text-white mb-6"
                                >
                                    Hi, I'm {(currentUser.first_name || '')} {(currentUser.last_name || '').trim()}
                                </h1>

                                {currentUser.portfolio_title && (
                                    <p className="text-xl md:text-2xl text-white/90 mb-8">
                                        {currentUser.portfolio_title}
                                        {currentUser.portfolio_description && (
                                            <span className="text-white/90"> - {currentUser.portfolio_description}</span>
                                        )}
                                    </p>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                                    <button 
                                        onClick={handleResumeDownload}
                                        className="bg-white text-gray-900 px-6 sm:px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors w-full sm:w-auto"
                                    >
                                        <Download size={20} /> Resume
                                    </button>
                                    {!isMe && isValidUser && <button 
                                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="bg-white text-gray-900 px-6 sm:px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors w-full sm:w-auto"
                                    >
                                        <Mail size={20} /> Contact Me
                                    </button>
                                    }
                                    <button 
                                        onClick={handleShare}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 sm:px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
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
                                </div>
                            </>
                        ) : (
                            <>
                                {currentUser ? (
                                    isMe ? (
                                        <>
                                            <div className="bg-white/20 rounded-3xl p-10 backdrop-blur-sm border border-white/30 relative overflow-hidden max-w-2xl mx-auto lg:mx-0">
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50"></div>
                                                <div className="relative z-10">
                                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-6 shadow-lg border-2 border-white/40">
                                                        <User className="w-12 h-12 text-white" />
                                                    </div>
                                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Complete Your Profile</h1>
                                                    <p className="text-white/90 text-lg mb-6 leading-relaxed">
                                                        Add your name and professional title to personalize your portfolio and make a great first impression.
                                                    </p>

                                                    {/* Put Add Your Information and Share Portfolio buttons in a row */}
                                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                                        <button
                                                        onClick={() => setShowEditForm(true)}
                                                        className="px-6 sm:px-8 py-3 bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:from-white/40 hover:to-white/30 transition-all duration-300 border border-white/40 shadow-lg hover:shadow-xl hover:scale-105 text-base flex items-center gap-2 mx-auto lg:mx-0 w-full sm:w-auto"
                                                    >
                                                        <Edit2 size={20} />
                                                        Add Your Information
                                                    </button>

                                                    <button 
                                                        onClick={handleShare}
                                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 sm:px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
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
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-white/20 rounded-3xl p-10 backdrop-blur-sm border border-white/30 relative overflow-hidden max-w-2xl mx-auto lg:mx-0">
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50"></div>
                                                <div className="relative z-10">
                                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white/30 to-white/10 rounded-full mb-6 shadow-lg border-2 border-white/40">
                                                        <User className="w-12 h-12 text-white" />
                                                    </div>
                                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Profile Coming Soon</h1>
                                                    <p className="text-white/90 text-lg mb-6 leading-relaxed">
                                                        {currentUser.username} hasn't shared their portfolio details yet. Check back again soon.
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                                            Welcome to Portfolio Hub
                                        </h1>
                                        <p className="text-xl md:text-2xl text-white/90 mb-8">
                                            Create your portfolio to showcase your skills and projects
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                            <button
                                                onClick={() => window.location.href = '/register'}
                                                className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                                            >
                                                <Download size={20} /> Get Started
                                            </button>

                                            <button
                                                onClick={() => window.location.href = '/login'}
                                                className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                                            >
                                                <Mail size={20} /> Login
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div className="lg:w-1/2 flex justify-center">
                    <div className="w-80 h-80 rounded-full gradient-orange-yellow flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">
                        {isSufficientInfo && currentUser ? sortName(currentUser) : 'PH'}
                    </span>
                    </div>
                </div>
                </div>
            </div>

            {showEditForm && (
                <ModalOverlay onClose={() => setShowEditForm(false)}>
                    <EditPortfolioForm
                        portfolioData={portfolioData || currentUser || {}}
                        setShowForm={setShowEditForm}
                    />
                </ModalOverlay>
            )}
            </section>
    )
}

export default HeroSection;