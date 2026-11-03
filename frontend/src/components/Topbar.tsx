import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, setAuthToken } from '../api';
import { Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { clsx } from 'clsx';

interface TopbarProps {
    onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notifications: any[] = []; // Empty notifications by default or mock some
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

    const { data: user } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            const res = await api.get(`/users/${userId}`);
            return res.data;
        },
        enabled: !!userId,
    });

    const getPageTitle = () => {
        if (location.pathname === '/' || location.pathname === '/dashboard') return 'Dashboard';
        if (location.pathname.startsWith('/tasks')) return 'QC Tasks';
        if (location.pathname.startsWith('/reports')) return 'Reports';
        return 'QC System';
    };

    const handleLogout = () => {
        // Clear local session data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('role');
        setAuthToken(null);
        navigate('/login', { replace: true });
    };

    return (
        <header className="no-print h-16 bg-white border-b border-qc-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-qc-text-main hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>

                <div className="flex flex-col">
                    <h2 className="text-base font-black text-qc-text-main tracking-tight leading-none h-4 overflow-hidden">
                        {getPageTitle()}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1 h-1 bg-qc-success rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-qc-text-muted uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="relative">
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={clsx(
                            "p-2 text-qc-text-muted hover:text-qc-primary hover:bg-qc-primary-light rounded-full relative transition-all",
                            isNotificationsOpen && "bg-qc-primary-light text-qc-primary"
                        )}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-qc-error rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-qc-lg shadow-qc-lg border border-qc-border py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-2 border-b border-qc-border flex justify-between items-center">
                                    <h3 className="text-xs font-black text-qc-text-muted uppercase tracking-widest">Notifications</h3>
                                    <span className="text-[10px] font-bold text-qc-primary bg-qc-primary-light px-1.5 py-0.5 rounded">
                                        {notifications.length} New
                                    </span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-qc-text-muted italic">
                                            No new notifications
                                        </div>
                                    ) : (
                                        notifications.map((_n: any, i: number) => (
                                            <div key={i} className="px-4 py-3 hover:bg-slate-50 border-b border-qc-border last:border-0 cursor-pointer transition-colors">
                                                <p className="text-sm font-medium text-qc-text-main">Notification {i + 1}</p>
                                                <p className="text-xs text-qc-text-muted mt-0.5">Just now</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="h-8 w-px bg-qc-border mx-1" />

                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className={clsx(
                            "flex items-center gap-2 p-1 pl-2 rounded-full transition-all border",
                            isUserMenuOpen ? "bg-slate-50 border-qc-primary/20" : "border-transparent hover:bg-slate-50"
                        )}
                    >
                        <div className="h-7 w-7 rounded-full bg-qc-primary flex items-center justify-center text-white font-black text-[10px] shadow-qc-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="hidden sm:block text-xs font-bold text-qc-text-main">{user?.name || 'User'}</span>
                        <ChevronDown size={14} className={clsx("text-qc-text-muted transition-transform", isUserMenuOpen && "rotate-180")} />
                    </button>

                    {isUserMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsUserMenuOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-qc-lg shadow-qc-lg border border-qc-border py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                                <button
                                    onClick={() => {
                                        navigate('/profile');
                                        setIsUserMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-2 flex items-center gap-2.5 text-xs font-bold text-qc-text-muted hover:text-qc-primary hover:bg-slate-50 transition-colors"
                                >
                                    <User size={14} /> Profile
                                </button>
                                <div className="h-px bg-qc-border my-1" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 flex items-center gap-2.5 text-xs font-bold text-qc-error hover:bg-qc-error-light transition-colors text-left"
                                >
                                    <LogOut size={14} /> Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
