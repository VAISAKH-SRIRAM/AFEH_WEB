import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, Lock, User, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API}/auth/login`, {
                username,
                password
            });

            if (response.data.success) {
                const userData = response.data.user;
                login(userData);

                // Role-based redirection
                switch (userData.role) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'nurse':
                        navigate('/nurse');
                        break;
                    case 'doctor':
                        navigate('/doctor');
                        break;
                    default:
                        navigate('/');
                }
            } else {
                toast.error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-teal-900/40 backdrop-blur-sm" />

            <Card className="w-full max-w-md shadow-2xl glass border-0 relative animate-fade-in">
                <CardHeader className="space-y-1 text-center pb-8 border-b border-white/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="absolute left-4 top-4 text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Home
                    </Button>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Staff Portal</CardTitle>
                    <CardDescription className="text-base text-gray-500">Secure access for hospital staff</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="pl-10 h-11 bg-white/50"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-11 bg-white/50"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-11 bg-primary hover:bg-blue-700 text-lg shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...</> : 'Access Portal'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Demo Credentials</p>
                        <div className="flex flex-wrap gap-2 justify-center text-xs">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">admin / admin123</span>
                            <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-100">nurse / nurse123</span>
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">doctor / doctor123</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
