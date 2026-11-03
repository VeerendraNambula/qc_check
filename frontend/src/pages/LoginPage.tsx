import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Lock } from 'lucide-react';
import { api, setAuthToken } from '../api';
import { AuthLayout } from '../components/ui/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { userId, password: password || undefined });
            const { access_token, userId: dbUserId } = response.data;

            // Keep the session only in this tab unless Remember Me is selected.
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('role');
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('token', access_token);
            storage.setItem('userId', dbUserId);
            storage.setItem('role', response.data.role);

            setAuthToken(access_token);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login failed', err);
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your User ID or Password.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Sign in to QC Portal"
            subtitle="Perform and manage quality checks"
            footerText="Don't have an account?"
            footerLinkText="Sign up"
            footerLinkTo="/register"
        >
            <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-4">
                    <Input
                        id="userId"
                        name="userId"
                        label="User ID"
                        type="text"
                        autoComplete="username"
                        required
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Enter your User ID"
                        icon={User}
                        error={error ? ' ' : undefined}
                    />

                    <div className="space-y-1.5">
                        <Input
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            required
                            placeholder="Enter your password"
                            icon={Lock}
                            disabled={false}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <Checkbox
                        id="remember-me"
                        label="Remember me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-sm font-medium text-qc-primary hover:text-qc-primary-dark transition-colors"
                    >
                        Forgot password?
                    </button>
                </div>

                {error && (
                    <div className="rounded-qc-base bg-qc-error-light p-3 border border-qc-error/20">
                        <p className="text-sm font-medium text-qc-error-dark text-center">{error}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                    icon={!isLoading ? ArrowRight : undefined}
                >
                    Sign In
                </Button>
            </form>
        </AuthLayout>
    );
};
