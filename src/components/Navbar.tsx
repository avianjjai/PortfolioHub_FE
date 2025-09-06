import React, { useState } from 'react';
import { getNavigationItems } from '../config/navigation';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { isAuthenticated, setIsAuthenticated, isMe } = useAuth();
    const navItems = getNavigationItems(isMe);

    const handleNavClick = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const logout = () => {
        console.log('Logout');
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
    }
    
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
                        <div className="hidden lg:flex space-x-4 xl:space-x-6 2xl:space-x-8 items-center">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavClick(item.path)}
                                    className="text-white hover:text-gray-200 transition-colors font-medium text-sm lg:text-base whitespace-nowrap"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

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
                                onClick={logout}
                                className="ml-2 lg:ml-4 px-3 lg:px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow text-sm lg:text-base"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;