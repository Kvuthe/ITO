import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useApi } from "../contexts/ApiProvider.jsx";

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const api = useApi();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            const response = await api.post('/users/create', {
                username: username,
                email: email,
                password: password,
            });

            if (!response.ok) {
                setError(response.body.message || 'Registration failed');
            } else {
                console.log(response);
                navigate('/login');
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-bgPrimary">
            <Card className="max-w-md p-6 bg-fgPrimary border-0">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-poppins text-tBase">Create an Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="bg-fgThird border border-red-400 text-tBase px-4 py-3 rounded relative"
                                 role="alert">
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
                                className="mt-1 block w-full font-poppins text-tBase"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-poppins text-tBase">
                                Email
                            </label>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="mt-1 block w-full font-poppins text-tBase"
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
                                placeholder="Create a password"
                                className="mt-1 block w-full"
                                required
                            />
                            <p className="mt-1 text-sm text-tBase font-poppins">
                                Must be at least 8 characters long
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-poppins text-tBase">
                                Confirm Password
                            </label>
                            <Input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="mt-1 block w-full font-poppins"
                                required
                            />
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full bg-fgThird font-poppins text-tBase hover:bg-fgSecondary hover:text-tDarkBg"
                            >
                                Create Account
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="mt-2 text-sm text-tBase font-poppins">
                                Already have an account?{' '}
                                <Link className="hover:text-tActive" to="/login">Sign in</Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegisterPage;