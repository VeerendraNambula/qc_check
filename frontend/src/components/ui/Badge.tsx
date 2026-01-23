import React from 'react';
import { clsx } from 'clsx';
import { TaskStatus, ResponseStatus } from '../../types';

interface BadgeProps {
    status: TaskStatus | ResponseStatus | string;
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md', className }) => {
    const styles: Record<string, string> = {
        PENDING: 'bg-slate-100 text-slate-600 border-slate-200',
        IN_PROGRESS: 'bg-qc-primary-light text-qc-primary border-qc-primary/20',
        COMPLETED: 'bg-qc-success-light text-qc-success-dark border-qc-success/20',
        APPROVED: 'bg-qc-success text-white border-qc-success-dark',
        REJECTED: 'bg-qc-error text-white border-qc-error-dark',
    };

    const labels: Record<string, string> = {
        PENDING: 'Pending',
        IN_PROGRESS: 'In Progress',
        COMPLETED: 'Completed',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
    };

    return (
        <span className={clsx(
            'inline-flex items-center font-bold px-2.5 py-0.5 rounded-full border border-transparent whitespace-nowrap',
            size === 'sm' ? 'text-[10px]' : 'text-xs',
            styles[status] || 'bg-slate-100 text-slate-600',
            className
        )}>
            {labels[status] || status.replace('_', ' ')}
        </span>
    );
};
