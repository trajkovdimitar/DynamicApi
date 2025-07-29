import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

export function Modal({ open, onClose, children }: Props) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handler);

        const first = panelRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        first?.focus();

        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                ref={panelRef}
                onClick={e => e.stopPropagation()}
                className="rounded bg-white p-4 shadow-lg dark:bg-gray-800"
            >
                <button
                    aria-label="Close"
                    onClick={onClose}
                    className="float-right text-lg"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}
