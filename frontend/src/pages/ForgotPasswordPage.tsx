import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { AuthLayout } from '../components/ui/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSent(true);
            toast.success("Reset link sent!");
        } catch (err: any) {
            console.error('Forgot password request failed', err);
            toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <AuthLayout
                title="Check your email"
                subtitle={`We've sent a password reset link to ${email}`}
                footerText="Didn't receive the email?"
                footerLinkText="Try again"
                footerLinkTo="/forgot-password"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-qc-primary/5 rounded-qc-base border border-qc-primary/10">
                        <p className="text-sm text-qc-text-main text-center">
                            Please check your inbox (and spam folder) for the reset link.
                        </p>
                    </div>
                    <Link to="/login">
                        <Button variant="secondary" className="w-full">
                            Back to Sign In
                        </Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Forgot Password"
            subtitle="Enter your email to receive a password reset link"
            footerText="Remembered your password?"
            footerLinkText="Sign in"
            footerLinkTo="/login"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    id="email"
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    icon={Mail}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                    icon={!isLoading ? Send : undefined}
                >
                    Send Reset Link
                </Button>

                <Link to="/login" className="flex items-center justify-center text-sm font-medium text-qc-text-muted hover:text-qc-primary transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to login
                </Link>
            </form>
        </AuthLayout>
    );
};
