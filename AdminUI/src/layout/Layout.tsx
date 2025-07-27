import type { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

interface Props {
    children: ReactNode;
}

export function Layout({ children }: Props) {
    return (
        <div className="flex h-screen bg-primary-50 dark:bg-gray-900 transition-colors duration-300">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Header />
                <main className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-800 rounded-tl-xl">
                    {children}
                </main>
            </div>
        </div>
    );
}
