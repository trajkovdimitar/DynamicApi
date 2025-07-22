import type { ReactNode } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

export function Drawer({ open, onClose, children }: Props) {
    return (
        <div className={`fixed inset-y-0 right-0 w-64 bg-white dark:bg-neutral-800 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={e => e.stopPropagation()}>
            <button className="p-2" onClick={onClose}>Close</button>
            {children}
        </div>
    );
}
