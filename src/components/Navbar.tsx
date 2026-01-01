import React, { useState } from 'react';
import { getNavigationItems } from '../config/navigation';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
    const { isAuthenticated, isMe, isValidUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = getNavigationItems(isMe, isValidUser);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavClick = (item: { path: string; isRoute: boolean; label: string }) => {
        if (item.isRoute) {
            // Handle route navigation (e.g., Home -> /)
            if (item.path === '/' && location.pathname === '/') {
                // Already on home page, scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                navigate(item.path);
            }
        } else {
            // Handle hash/section navigation (e.g., #about, #skills)
            const sectionId = item.path.replace('#', '');
            
            if (location.pathname === '/') {
                // Already on home page, scroll to section
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // Not on home page, navigate to home with scroll state
                navigate('/', { state: { scrollTo: sectionId } });
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    }
    
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleMobileNavClick = (item: { path: string; isRoute: boolean; label: string }) => {
        handleNavClick(item);
        setIsMobileMenuOpen(false); // Close mobile menu after navigation
    };

    return (
        <nav className="sticky top-0 z-50">
            <div className="bg-purple-900 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center min-h-[3rem]">
                        <div className="flex items-center">
                            <img 
                                src="/logo.png" 
                                alt="Portfolio Hub Logo" 
                                className="h-12 w-12 lg:h-16 lg:w-16"
                            />
                        </div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex space-x-4 xl:space-x-6 2xl:space-x-8 items-center">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item)}
                                    className="text-white hover:text-gray-200 transition-colors font-medium text-sm lg:text-base whitespace-nowrap"
                                >
                                    {item.label}
                                </button>
                            ))}

                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        to="/login"
                                        className="ml-2 lg:ml-4 px-3 lg:px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow text-sm lg:text-base"
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="ml-2 px-3 lg:px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow text-sm lg:text-base"
                                    >
                                        Register
                                    </Link>
                                </>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    className="ml-2 lg:ml-4 px-3 lg:px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow text-sm lg:text-base"
                                >
                                    Logout
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden text-white p-2 hover:bg-purple-800 rounded-lg transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {isMobileMenuOpen && (
                        <div className="lg:hidden mt-4 pb-4 border-t border-purple-700 pt-4">
                            <div className="flex flex-col space-y-3">
                                {navItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => handleMobileNavClick(item)}
                                        className="text-white hover:text-gray-200 hover:bg-purple-800 transition-colors font-medium text-base py-2 px-4 rounded-lg text-left"
                                    >
                                        {item.label}
                                    </button>
                                ))}

                                <div className="pt-2 border-t border-purple-700">
                                    {!isAuthenticated ? (
                                        <>
                                            <Link
                                                to="/login"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow text-center mb-2"
                                            >
                                                Login
                                            </Link>

                                            <Link
                                                to="/register"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block w-full px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow text-center"
                                            >
                                                Register
                                            </Link>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="block w-full px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow text-center"
                                        >
                                            Logout
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;