import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaUserLock, FaGoogle } from 'react-icons/fa';

const LoginCheck = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleGoogleLogin = async () => {
            const query = new URLSearchParams(location.search);
            const token = query.get('token');

            if (token) {
                try {
                    // Fetch full user profile before redirecting
                    // This prevents 'partial user' state where only token exists
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };
                    const { data } = await axios.get('/api/users/profile', config);

                    // Save full user info to localStorage
                    // data contains: _id, name, email, role (no token usually from profile endpoint)
                    const userInfo = { ...data, token };
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));

                    // Force full reload to ensure AuthContext picks up the new state cleanly
                    window.location.href = '/';
                } catch (error) {
                    console.error("Google Login Verification Failed", error);
                    // Optionally show error or redirect to login
                    navigate('/login');
                }
            }
        };

        handleGoogleLogin();
    }, [location, navigate]);

    // Show a loading text while processing
    const query = new URLSearchParams(location.search);
    if (query.get('token')) {
        return (
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Verifying Google Login...</p>
            </div>
        );
    }

    return null;
}

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const { success, message, user } = await login(email, password);
            // Note: my login function returns object with success/message. 
            // Wait, looking at AuthContext.jsx implementation:
            // It returns { success: true } or { success: false, message: ... }
            // It also sets user state.

            if (success) {
                const query = new URLSearchParams(location.search);
                const redirect = query.get('redirect') || '/';
                navigate(redirect);
            } else {
                setError(message);
            }
        } catch (err) {
            setError("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <LoginCheck />
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-center mb-6">
                    <FaUserLock className="text-4xl text-indigo-600 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                    <p className="text-gray-600">Login to continue to SmartKart</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-4 flex items-center justify-between">
                    <hr className="w-full border-gray-300" />
                    <span className="px-2 text-gray-500 text-sm">OR</span>
                    <hr className="w-full border-gray-300" />
                </div>

                <button
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-300"
                    onClick={() => window.location.href = 'http://localhost:5001/api/users/google'} // Placeholder for Google Auth route
                >
                    <FaGoogle className="text-red-500" /> Continue with Google
                </button>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?
                        <span
                            className="text-indigo-600 font-bold cursor-pointer ml-1 hover:underline"
                            onClick={() => navigate('/register')}
                        >
                            Register
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
