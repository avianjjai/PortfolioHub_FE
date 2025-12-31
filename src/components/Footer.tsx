import { useAuth } from "../context/AuthContext";
import { Github, Linkedin, Mail, ExternalLink, Eye } from "lucide-react";

const Footer: React.FC = () => {
    const { currentUser, isMe, isValidUser } = useAuth();
    const currentYear = new Date().getFullYear();
    
    const getFullName = () => {
        if (!currentUser) return '';
        const parts = [currentUser.first_name, currentUser.middle_name, currentUser.last_name].filter(Boolean);
        return parts.join(' ') || currentUser.username || '';
    };

    return (
        <footer className="bg-gray-900 text-white py-12 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">About</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {currentUser?.portfolio_description || 
                             "Professional portfolio showcasing skills, experience, and projects."}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a 
                                    href="#about" 
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    About
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#skills" 
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    Skills
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#projects" 
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    Projects
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#experience" 
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    Experience
                                </a>
                            </li>
                            {!isMe && isValidUser && (
                                <li>
                                    <a 
                                        href="#contact" 
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        Contact
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Connect</h3>
                        <div className="flex flex-col space-y-3">
                            {currentUser?.github_url && (
                                <a 
                                    href={currentUser.github_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    <Github size={18} />
                                    <span>GitHub</span>
                                    <ExternalLink size={14} className="opacity-50" />
                                </a>
                            )}
                            {currentUser?.linkedin_url && (
                                <a 
                                    href={currentUser.linkedin_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    <Linkedin size={18} />
                                    <span>LinkedIn</span>
                                    <ExternalLink size={14} className="opacity-50" />
                                </a>
                            )}
                            {currentUser?.email && (
                                <a 
                                    href={`mailto:${currentUser.email}`}
                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    <Mail size={18} />
                                    <span>{currentUser.email}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Copyright and Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-400 text-sm space-y-1">
                            <p>
                                Portfolio content © {currentYear} {getFullName() || 'User'}. All rights reserved.
                            </p>
                            <p className="text-gray-500 text-xs">
                                Platform © {currentYear} Avinash Gupta (cse.avinash.gupta@gmail.com). All rights reserved.
                            </p>
                            {currentUser !== null && (currentUser?.visitor_count ?? 0) > 0 && (
                                <div className="flex items-center gap-2 text-gray-400 text-xs mt-2">
                                    <Eye size={14} className="text-gray-500" />
                                    <span>{(currentUser.visitor_count).toLocaleString()} {currentUser.visitor_count === 1 ? 'visitor' : 'visitors'}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-6 text-sm text-gray-400">
                            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
