import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-qc-bg flex">
            {/* Sidebar */}
            <Sidebar
                isExpanded={isExpanded}
                toggleExpanded={() => setIsExpanded(!isExpanded)}
                isMobileOpen={isMobileOpen}
                toggleMobile={() => setIsMobileOpen(!isMobileOpen)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
                <Topbar onMenuClick={() => setIsMobileOpen(true)} />

                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 lg:px-10">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
