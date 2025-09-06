import React, { useState } from 'react';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';


const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setIsAuthenticated, isAuthenticated, setIsMe, setIsValidUser, setCurrentUser, validateToken } = useAuth();
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await login(email, password);

            // Save token to localStorage or context if needed
            if (response.access_token) {
                localStorage.setItem('access_token', response.access_token);
                await validateToken();
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleLogin} className="space-y-6">
            <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
            />
            
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="w-full px-4 py-3 rounded-lg bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-xs"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                >
                    {showPassword ? 'Hide' : 'Show'}
                </button>
            </div>

            <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-60"
                disabled={loading}
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default LoginForm;