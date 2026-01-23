import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, FileText, CheckSquare, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
    isExpanded: boolean;
    toggleExpanded: () => void;
    isMobileOpen: boolean;
    toggleMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isExpanded,
    toggleExpanded,
    isMobileOpen,
    toggleMobile
}) => {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, disabled: false },
        { path: '/tasks', label: 'QC Tasks', icon: ClipboardList, disabled: false },
        { path: '/reports', label: 'Reports', icon: FileText, disabled: false },
    ];

    const sidebarContent = (
        <aside className={clsx(
            "no-print bg-white border-r border-qc-border flex flex-col transition-all duration-300 z-40 h-full",
            isExpanded ? "w-64" : "w-20"
        )}>
            {/* Header / Logo */}
            <div className="h-16 flex items-center border-b border-qc-border overflow-hidden">
                <Link to="/dashboard" className="flex items-center gap-3 px-6 w-full">
                    <div className="bg-qc-primary p-2 rounded-lg shadow-qc-sm shrink-0">
                        <CheckSquare className="text-white" size={20} />
                    </div>
                    {isExpanded && (
                        <div className="truncate">
                            <h1 className="text-lg font-bold leading-tight">QC System</h1>
                            <p className="text-[10px] text-qc-text-muted font-bold tracking-widest uppercase">Enterprise</p>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.disabled ? '#' : item.path}
                            onClick={(e) => {
                                if (item.disabled) e.preventDefault();
                                if (window.innerWidth < 768) toggleMobile();
                            }}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-qc-base transition-all font-bold text-sm",
                                item.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                                isActive && !item.disabled
                                    ? "bg-qc-primary-light text-qc-primary shadow-sm"
                                    : "text-qc-text-muted hover:bg-slate-50 hover:text-qc-text-main"
                            )}
                            title={!isExpanded ? item.label : undefined}
                        >
                            <Icon size={18} className="shrink-0" />
                            {isExpanded && <span className="truncate">{item.label}</span>}
                            {!isExpanded && isActive && <div className="absolute left-0 w-1 h-6 bg-qc-primary rounded-r-full" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle (Desktop only) */}
            <div className="hidden md:block p-4 border-t border-qc-border">
                <button
                    onClick={toggleExpanded}
                    className="w-full flex items-center gap-3 px-3 py-2 text-qc-text-muted hover:text-qc-text-main text-sm font-bold transition-colors group"
                >
                    <div className="w-5 flex justify-center shrink-0">
                        {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </div>
                    {isExpanded && <span>Collapse Sidebar</span>}
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block sticky top-0 h-screen shrink-0">
                {sidebarContent}
            </div>

            {/* Mobile Sidebar Overlay */}
            <div className={clsx(
                "md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300",
                isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )} onClick={toggleMobile}>
                <div className={clsx(
                    "absolute left-0 top-0 bottom-0 w-72 bg-white transition-transform duration-300 shadow-2xl",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )} onClick={e => e.stopPropagation()}>
                    {sidebarContent}
                    <button
                        onClick={toggleMobile}
                        className="absolute top-4 -right-12 p-2 bg-white rounded-lg shadow-lg text-qc-text-main md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </>
    );
};
