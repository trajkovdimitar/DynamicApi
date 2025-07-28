import type { ReactNode } from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';

interface Props {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

const Overlay = styled.div<{ open: boolean }>`
    display: ${({ open }) => (open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 20;
`;

const Panel = styled.div<{ open: boolean }>`
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    width: 16rem;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(100%)')};
    transition: transform ${({ theme }) => theme.transitions.normal};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    overflow-y: auto;
    @media (max-width: 768px) {
        width: 80%;
    }
`;

export function Drawer({ open, onClose, children }: Props) {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    return (
        <Overlay open={open} onClick={onClose} aria-label="Close drawer">
            <Panel open={open} onClick={e => e.stopPropagation()}>
                <button aria-label="Close" style={{ float: 'right' }} onClick={onClose}>
                    &times;
                </button>
                {children}
            </Panel>
        </Overlay>
    );
}
