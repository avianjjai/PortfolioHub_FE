import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';

const Login: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="bg-white/90 rounded-2xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Login</h2>
            <LoginForm />
            <div className="mt-6 text-center text-gray-700">
              Don't have an account?{' '}
              {/* <Link to={userId ? `/register?user=${userId}` : '/register'} className="text-blue-600 hover:underline font-semibold">Register</Link> */}
            </div>
          </div>
        </div>
      );
};

export default Login;