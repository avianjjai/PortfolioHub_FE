import React, { useState } from 'react';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';


const RegisterForm: React.FC = () => {
    const [user, setUser] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
    })

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            setLoading(true);
            e.preventDefault();

            const userData = {
                ...user,
                username: user.email,
            }

            const response = await register(userData);
            if (response.status_code === 400) {
                throw new Error(response.message ?? 'Registration failed');
            }

            if (response.access_token) {
                localStorage.setItem('access_token', response.access_token);
                window.location.href = '/';
                
            }
        } catch (error: any) {
            setError(error.message ?? 'Registration failed');
        } 
        finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={user.email}
                onChange={e => setUser({ ...user, email: e.target.value })}
                autoComplete="email"
            />

            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="w-full px-4 py-3 rounded-lg bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={user.password}
                    onChange={e => setUser({ ...user, password: e.target.value })}
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

            <div className="relative">
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    className="w-full px-4 py-3 rounded-lg bg-white/80 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={user.confirmPassword}
                    onChange={e => setUser({ ...user, confirmPassword: e.target.value })}
                />
                <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-xs"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    tabIndex={-1}
                >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
            </div>

            <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-60"
                disabled={loading}
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};

export default RegisterForm;