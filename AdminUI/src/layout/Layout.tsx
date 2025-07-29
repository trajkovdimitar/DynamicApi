import type { ReactNode } from 'react';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import AppSidebar from './AppSidebar';
import Backdrop from './Backdrop';
import { Header } from '../components/Header';

interface Props {
    children: ReactNode;
}

const LayoutContent: React.FC<Props> = ({ children }) => {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    return (
        <div className="min-h-screen xl:flex">
            <div>
                <AppSidebar />
                <Backdrop />
            </div>
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
                } ${isMobileOpen ? 'ml-0' : ''}`}
            >
                <Header />
                <main id="main-content" className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export function Layout({ children }: Props) {
    return (
        <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
    );
}
