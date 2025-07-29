import type { ReactNode } from 'react';
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

interface Props {
    children: ReactNode;
}

export function Layout({ children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
            <a href="#main-content" className="sr-only focus:not-sr-only">
                Skip to content
            </a>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-col flex-1">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main id="main-content" className="flex-1 overflow-auto p-4 md:p-6 2xl:p-11">
                    {children}
                </main>
                <footer className="border-t border-gray-200 p-2 text-center text-sm text-gray-500">
                    DynamicApi © 2025
                </footer>
            </div>
        </div>
    );
}
