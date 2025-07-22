import { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

interface Props {
    children: ReactNode;
}

export function Layout({ children }: Props) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-neutral-900">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Header />
                <main className="flex-1 overflow-auto p-4">{children}</main>
            </div>
        </div>
    );
}
