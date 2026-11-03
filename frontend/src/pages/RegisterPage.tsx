import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, BadgeCheck } from 'lucide-react';
import { api } from '../api';
import { AuthLayout } from '../components/ui/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { Modal } from '../components/ui/Modal';

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!agreedToTerms) {
            setError('You must agree to the Terms & Conditions');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/users', {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            // On success, redirect to login
            navigate('/login');
        } catch (err: any) {
            console.error('Registration failed', err);
            const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your QC account"
            subtitle="Get started with quality inspections"
            footerText="Already have an account?"
            footerLinkText="Sign in"
            footerLinkTo="/login"
        >
            <form className="space-y-5" onSubmit={handleRegister}>
                <Input
                    id="name"
                    name="name"
                    label="Full Name"
                    placeholder="John Doe"
                    icon={User}
                    required
                    value={formData.name}
                    onChange={handleChange}
                />

                <Input
                    id="username"
                    name="username"
                    label="Username (User ID)"
                    placeholder="johndoe"
                    icon={Mail}
                    required
                    value={formData.username}
                    onChange={handleChange}
                />

                <Input
                    id="email"
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    icon={Mail}
                    required
                    value={formData.email}
                    onChange={handleChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        id="password"
                        name="password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        required
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    label={
                        <span>
                            I agree to the <span
                                className="font-bold text-qc-primary cursor-pointer hover:underline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsTermsOpen(true);
                                }}
                            >Terms & Conditions</span>
                        </span>
                    }
                />

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
                    disabled={!agreedToTerms}
                    icon={!isLoading ? BadgeCheck : undefined}
                >
                    Create Account
                </Button>
            </form>

            <Modal
                isOpen={isTermsOpen}
                onClose={() => setIsTermsOpen(false)}
                title="Terms & Conditions"
                footer={
                    <Button onClick={() => {
                        setAgreedToTerms(true);
                        setIsTermsOpen(false);
                    }}>
                        I Agree
                    </Button>
                }
            >
                <div className="space-y-4 text-sm text-qc-text-main leading-relaxed">
                    <p className="font-bold">1. Introduction</p>
                    <p>Welcome to QC Enterprise System. By accessing or using our platform, you agree to be bound by these terms.</p>

                    <p className="font-bold">2. User Responsibilities</p>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information during registration.</p>

                    <p className="font-bold">3. Data Integrity</p>
                    <p>All quality control data entered into the system must be accurate and truthful. Falsification of records is strictly prohibited and may result in account termination.</p>

                    <p className="font-bold">4. Privacy Policy</p>
                    <p>We collect and store data in accordance with enterprise data protection regulations. Your personal information will only be used for system administration and authentication purposes.</p>

                    <p className="font-bold">5. Acceptable Use</p>
                    <p>You agree not to misuse the system or attempt to bypass security measures. Any unauthorized access attempts will be logged and reported.</p>
                </div>
            </Modal>
        </AuthLayout>
    );
};
