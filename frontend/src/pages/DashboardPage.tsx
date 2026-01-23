import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { QcTask } from '../types';
import { Badge } from '../components/ui/Badge';
import { ClipboardList, CheckCircle2, Clock, TrendingUp, XCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const { data: tasks, isLoading } = useQuery<QcTask[]>({
        queryKey: ['tasks'],
        queryFn: async () => {
            const res = await api.get('/qc/tasks');
            return res.data;
        },
    });

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role');

    // Filter tasks based on role
    const filteredTasks = tasks?.filter(task => {
        if (userRole === 'ADMIN') return true;
        return task.assignedToId === userId;
    }) || [];

    const stats = {
        total: filteredTasks.length,
        pending: filteredTasks.filter(t => t.status === 'PENDING').length,
        progress: filteredTasks.filter(t => t.status === 'IN_PROGRESS').length,
        completed: filteredTasks.filter(t => t.status === 'COMPLETED').length,
        rejected: filteredTasks.filter(t => t.status === 'REJECTED').length,
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-slate-200 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-qc-lg border border-qc-border" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-qc-text-main tracking-tight">System Dashboard</h1>
                <p className="text-sm font-bold text-qc-text-muted">Real-time overview of quality control operations.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[
                    { label: 'Total Tasks', value: stats.total, icon: ClipboardList, color: 'text-qc-primary', bg: 'bg-qc-primary-light' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-qc-warning', bg: 'bg-qc-warning-light' },
                    { label: 'In Progress', value: stats.progress, icon: TrendingUp, color: 'text-qc-primary', bg: 'bg-qc-primary-light' },
                    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-qc-success', bg: 'bg-qc-success-light' },
                    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-qc-error', bg: 'bg-qc-error-light' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-qc-lg border border-qc-border shadow-qc-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-qc-text-muted uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-qc-text-main mt-1">{stat.value}</p>
                        </div>
                        <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-qc-text-main">Recent Tasks</h2>
                    <div className="bg-white border border-qc-border rounded-qc-lg shadow-qc-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-qc-border">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Task</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-qc-border">
                                {filteredTasks.slice(0, 5).map(task => (
                                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-qc-text-main">{task.title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={task.status} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs font-medium text-qc-text-muted">
                                            {new Date(task.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!filteredTasks || filteredTasks.length === 0) && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-10 text-center text-sm font-bold text-qc-text-muted italic">
                                            No recent activity found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-black text-qc-text-main">System Health</h2>
                    <div className="bg-white p-6 rounded-qc-lg border border-qc-border shadow-qc-sm space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-qc-success rounded-full animate-pulse" />
                            <div>
                                <p className="text-xs font-bold text-qc-text-main">Database Connection</p>
                                <p className="text-[10px] text-qc-success font-bold uppercase tracking-widest">Established</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-qc-success rounded-full animate-pulse" />
                            <div>
                                <p className="text-xs font-bold text-qc-text-main">API Gateway</p>
                                <p className="text-[10px] text-qc-success font-bold uppercase tracking-widest">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-qc-success rounded-full animate-pulse" />
                            <div>
                                <p className="text-xs font-bold text-qc-text-main">Storage Server</p>
                                <p className="text-[10px] text-qc-success font-bold uppercase tracking-widest">Ready</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
