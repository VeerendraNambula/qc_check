import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    label,
    className,
    checked,
    onChange,
    disabled,
    ...props
}) => {
    return (
        <label className={clsx(
            "inline-flex items-center gap-2 select-none group cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed",
            className
        )}>
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    {...props}
                />
                <div className={clsx(
                    "w-4 h-4 rounded border transition-all",
                    checked
                        ? "bg-qc-primary border-qc-primary"
                        : "bg-white border-qc-border group-hover:border-qc-primary/50"
                )}>
                    <Check
                        size={12}
                        className={clsx(
                            "text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200",
                            checked ? "scale-100" : "scale-0"
                        )}
                        strokeWidth={4}
                    />
                </div>
            </div>
            {label && (
                <span className="text-sm text-qc-text-main font-medium">{label}</span>
            )}
        </label>
    );
};
