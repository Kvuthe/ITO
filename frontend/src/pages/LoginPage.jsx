import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '../contexts/UserProvider.jsx';
import Modal from '../components/ForgotPasswordModal.jsx';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { login } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        const result = await login(username, password);

        if (result === 'ok') {
            let next = '/profile';
            if (location.state && location.state.next) {
                next = location.state.next;
            }
            navigate(next);
        } else {
            setError('Username or password is incorrect');
            console.log(error);
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen bg-bgPrimary"
        >
            <Card className="max-w-md p-6 mx-auto bg-fgPrimary border-0">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-poppins text-tBase">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-fgThird border border-red-400 text-tBase px-4 py-3 rounded relative">
                                {error}
                            </div>
                            )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-poppins text-tBase">
                                Username
                            </label>
                            <Input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="mt-1 block w-full font-poppins"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-poppins text-tBase">
                                Password
                            </label>
                            <Input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="mt-1 block w-full"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="font-poppins text-tBase hover:text-tActive"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full bg-fgThird font-poppins text-tBase hover:bg-fgSecondary hover:text-tDarkBg"
                            >
                                Sign in
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="mt-2 text-sm font-poppins text-tBase">
                                Don't have an account?{' '}
                                <Link className="hover:text-tActive" to="/register">Register here</Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Modal for Forgot Password */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <p>Message kvuthe for a password reset</p>
            </Modal>
        </div>
    );
};

export default LoginPage;