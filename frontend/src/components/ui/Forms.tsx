import React from 'react';
import { clsx } from 'clsx';
import { Search, X, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === 'password';

        return (
            <div className="space-y-1.5 w-full">
                {label && <label className="text-xs font-bold text-qc-text-muted uppercase tracking-wider">{label}</label>}
                <div className="relative">
                    <input
                        ref={ref}
                        type={isPassword ? (showPassword ? 'text' : 'password') : type}
                        className={clsx(
                            'w-full h-10 px-4 bg-white border border-qc-border rounded-qc-base text-sm focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary outline-none transition-all',
                            error && 'border-qc-error focus:ring-qc-error/20',
                            isPassword && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-qc-text-muted hover:text-qc-text-main"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                </div>
                {error && <p className="text-xs font-medium text-qc-error">{error}</p>}
            </div>
        );
    }
);

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onClear, className, ...props }) => (
    <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-qc-text-muted" size={16} />
        <input
            className={clsx(
                'w-full h-10 pl-10 pr-10 bg-white border border-qc-border rounded-qc-base text-sm focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary outline-none transition-all',
                className
            )}
            {...props}
        />
        {props.value && onClear && (
            <button
                onClick={onClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-qc-text-muted hover:text-qc-text-main p-0.5 rounded-full hover:bg-slate-100"
            >
                <X size={14} />
            </button>
        )}
    </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className, ...props }, ref) => (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-xs font-bold text-qc-text-muted uppercase tracking-wider">{label}</label>}
            <select
                ref={ref}
                className={clsx(
                    'w-full h-10 px-3 bg-white border border-qc-border rounded-qc-base text-sm focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary outline-none transition-all appearance-none cursor-pointer',
                    error && 'border-qc-error focus:ring-qc-error/20',
                    className
                )}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs font-medium text-qc-error">{error}</p>}
        </div>
    )
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    currentCount?: number;
    maxCount?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, currentCount, maxCount, className, ...props }, ref) => (
        <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-end">
                {label && <label className="text-xs font-bold text-qc-text-muted uppercase tracking-wider">{label}</label>}
                {maxCount !== undefined && (
                    <span className={clsx(
                        'text-[10px] font-bold',
                        currentCount && currentCount > maxCount ? 'text-qc-error' : 'text-qc-text-muted'
                    )}>
                        {currentCount || 0}/{maxCount}
                    </span>
                )}
            </div>
            <textarea
                ref={ref}
                className={clsx(
                    'w-full p-4 bg-white border border-qc-border rounded-qc-base text-sm focus:ring-2 focus:ring-qc-primary/20 focus:border-qc-primary outline-none transition-all min-h-[100px]',
                    error && 'border-qc-error focus:ring-qc-error/20',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs font-medium text-qc-error">{error}</p>}
        </div>
    )
);

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className, ...props }) => (
    <label className="flex items-center gap-2 cursor-pointer group select-none">
        <div className="relative flex items-center justify-center">
            <input
                type="checkbox"
                className="peer sr-only"
                {...props}
            />
            <div className="w-5 h-5 border-2 border-qc-border rounded-qc-base bg-white peer-checked:bg-qc-primary peer-checked:border-qc-primary transition-all shadow-qc-sm group-hover:border-qc-primary/50" />
            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        </div>
        <span className="text-sm font-bold text-qc-text-main group-hover:text-qc-primary transition-colors">{label}</span>
    </label>
);

export const Radio: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className, ...props }) => (
    <label className="flex items-center gap-3 cursor-pointer group select-none p-4 rounded-qc-lg border border-qc-border hover:border-qc-primary/50 hover:bg-slate-50 transition-all">
        <div className="relative flex items-center justify-center">
            <input
                type="radio"
                className="peer sr-only"
                {...props}
            />
            <div className="w-5 h-5 border-2 border-qc-border rounded-full bg-white peer-checked:border-qc-primary transition-all group-hover:border-qc-primary/50" />
            <div className="absolute w-2.5 h-2.5 bg-qc-primary rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        <span className="text-sm font-bold text-qc-text-main group-hover:text-qc-primary transition-colors">{label}</span>
    </label>
);
