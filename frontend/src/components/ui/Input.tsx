import React, { useState } from 'react';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon: Icon,
    type = 'text',
    className,
    fullWidth = true,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
            {label && (
                <label className="text-sm font-medium text-qc-text-main">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-qc-text-muted pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={inputType}
                    className={clsx(
                        'block w-full rounded-qc-base border bg-white px-3 py-2 text-sm placeholder-qc-text-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-qc-primary/20',
                        error
                            ? 'border-qc-error focus:border-qc-error text-qc-error'
                            : 'border-qc-border focus:border-qc-primary text-qc-text-main',
                        Icon && 'pl-10',
                        isPassword && 'pr-10',
                        className
                    )}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-qc-text-muted hover:text-qc-text-main transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && (
                <span className="text-xs font-medium text-qc-error animate-in fade-in slide-in-from-top-1">
                    {error}
                </span>
            )}
        </div>
    );
};
