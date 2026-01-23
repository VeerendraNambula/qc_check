import React from 'react';
import { CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    footerText?: string;
    footerLinkText?: string;
    footerLinkTo?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle,
    footerText,
    footerLinkText,
    footerLinkTo,
}) => {
    return (
        <div className="min-h-screen bg-qc-bg flex flex-col lg:flex-row">
            {/* Left Side - Content/Brand (Optional - for now hidden on mobile, visible on desktop as simple side panel or illustration) */}
            <div className="hidden lg:flex lg:w-1/2 bg-qc-primary flex-col justify-between p-12 relative overflow-hidden">
                <div className="z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                            <CheckSquare className="text-white" size={24} />
                        </div>
                        <span className="text-white font-display font-bold text-xl tracking-tight">QC Enterprise</span>
                    </div>
                </div>

                <div className="z-10 max-w-lg">
                    <h1 className="text-4xl font-display font-bold text-white mb-6 leading-tight">
                        Quality checks made simple, accurate, and efficient.
                    </h1>
                    <p className="text-qc-primary-light text-lg leading-relaxed">
                        Streamline your inspection workflows with our comprehensive digital quality control platform.
                    </p>
                </div>

                <div className="z-10 text-qc-primary-light/60 text-sm">
                    &copy; 2026 QC Enterprise Systems.
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-qc-primary-dark/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 bg-white lg:bg-qc-bg">
                <div className="w-full max-w-md bg-white sm:shadow-qc-lg sm:rounded-qc-xl sm:p-8 sm:border sm:border-qc-border">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="bg-qc-primary p-3 rounded-qc-lg shadow-qc-lg">
                            <CheckSquare className="text-white h-8 w-8" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-display font-bold text-qc-text-main mb-2 tracking-tight">
                            {title}
                        </h2>
                        <p className="text-qc-text-muted text-sm">
                            {subtitle}
                        </p>
                    </div>

                    {children}

                    {footerText && (
                        <div className="mt-8 pt-6 border-t border-qc-border">
                            <p className="text-center text-sm text-qc-text-muted">
                                {footerText}{' '}
                                {footerLinkText && footerLinkTo && (
                                    <Link
                                        to={footerLinkTo}
                                        className="font-bold text-qc-primary hover:text-qc-primary-dark transition-colors"
                                    >
                                        {footerLinkText}
                                    </Link>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
