import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import { api } from '../api';
import { AuthLayout } from '../components/ui/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Invalid reset link. Please request a new one.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword
            });
            setIsSuccess(true);
            toast.success("Password reset successfully!");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            console.error('Password reset failed', err);
            toast.error(err.response?.data?.message || "Failed to reset password. Link may be expired.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <AuthLayout title="Invalid Link" subtitle="The reset link is missing or invalid.">
                <Button className="w-full" onClick={() => navigate('/forgot-password')}>
                    Request New Link
                </Button>
            </AuthLayout>
        );
    }

    if (isSuccess) {
        return (
            <AuthLayout
                title="Success!"
                subtitle="Your password has been reset successfully."
            >
                <div className="flex flex-col items-center space-y-6">
                    <CheckCircle size={64} className="text-qc-success" />
                    <p className="text-center text-qc-text-muted">
                        Redirecting you to login in a few seconds...
                    </p>
                    <Button className="w-full" onClick={() => navigate('/login')}>
                        Sign In Now
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Please enter your new password below"
        >
            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    id="newPassword"
                    name="newPassword"
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                >
                    Update Password
                </Button>
            </form>
        </AuthLayout>
    );
};
