import React from 'react';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'error' | 'success';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    isLoading,
    className,
    disabled,
    ...props
}) => {
    const variants = {
        primary: 'bg-qc-primary text-white hover:bg-qc-primary-dark shadow-qc-sm',
        secondary: 'bg-white border border-qc-border text-qc-text-main hover:bg-slate-50 shadow-qc-sm',
        ghost: 'bg-transparent text-qc-text-muted hover:text-qc-text-main hover:bg-slate-100',
        error: 'bg-qc-error text-white hover:bg-qc-error-dark shadow-qc-sm',
        success: 'bg-qc-success text-white hover:bg-qc-success-dark shadow-qc-sm',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-12 px-6 text-base gap-2.5',
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={clsx(
                'inline-flex items-center justify-center rounded-qc-base font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && (
                        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />
                    )}
                    {children}
                    {Icon && iconPosition === 'right' && (
                        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />
                    )}
                </>
            )}
        </button>
    );
};
