import type { ReactNode } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

export function Modal({ open, onClose, children }: Props) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-800 p-4 rounded" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
