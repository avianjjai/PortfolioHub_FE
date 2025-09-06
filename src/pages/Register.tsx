import React, { useState } from 'react';
import RegisterForm from '../components/RegisterForm';

const Register: React.FC = () => {
    const [loading, setLoading] = useState(false);
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="bg-white/90 rounded-2xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Register</h2>
            <RegisterForm loading={loading} />
            <div className="mt-6 text-center text-gray-700">
              Already have an account?{' '}
              {/* <Link to={userId ? `/login?user=${userId}` : '/login'} className="text-blue-600 hover:underline font-semibold">Login</Link> */}
            </div>
          </div>
        </div>
      );
};

export default Register;