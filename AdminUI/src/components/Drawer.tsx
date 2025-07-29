import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}


export function Drawer({ open, onClose, children }: Props) {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-20" onClick={onClose} aria-label="Close drawer">
            <div className="absolute inset-0 bg-black/50" />
            <div
                className="absolute inset-y-0 right-0 w-64 max-sm:w-4/5 transform transition-transform bg-white dark:bg-gray-800 shadow-lg overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button aria-label="Close" className="float-right m-2" onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}
