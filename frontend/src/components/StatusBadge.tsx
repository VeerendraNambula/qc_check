import React from 'react';
import { clsx } from 'clsx';
import { TaskStatus, ResponseStatus } from '../types';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const getStyle = (status: string) => {
        switch (status) {
            case TaskStatus.PENDING: return 'bg-slate-100 text-slate-600';
            case TaskStatus.IN_PROGRESS: return 'bg-qc-amber/10 text-qc-amber';
            case TaskStatus.COMPLETED: return 'bg-qc-green/10 text-qc-green';
            case TaskStatus.REJECTED:
            case ResponseStatus.REJECTED: return 'bg-qc-red/10 text-qc-red';
            case ResponseStatus.APPROVED: return 'bg-qc-green/10 text-qc-green';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getLabel = (status: string) => {
        switch (status) {
            case TaskStatus.PENDING: return 'Pending';
            case TaskStatus.IN_PROGRESS: return 'In Progress';
            case TaskStatus.COMPLETED: return 'Completed';
            case TaskStatus.REJECTED:
            case ResponseStatus.REJECTED: return 'Rejected';
            case ResponseStatus.APPROVED: return 'Approved';
            default: return status;
        }
    };

    return (
        <span className={clsx(
            'rounded-full font-medium border border-current transition-colors inline-flex items-center justify-center',
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
            getStyle(status)
        )}>
            {getLabel(status)}
        </span>
    );
};
