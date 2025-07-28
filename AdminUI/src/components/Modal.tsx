import type { ReactNode } from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';

interface Props {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Panel = styled.div`
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radius};
    box-shadow: ${({ theme }) => theme.shadows.md};
`;

export function Modal({ open, onClose, children }: Props) {
    if (!open) return null;
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);
    return (
        <Overlay onClick={onClose}>
            <Panel onClick={e => e.stopPropagation()}>
                <button
                    aria-label="Close"
                    onClick={onClose}
                    style={{ float: 'right' }}
                >
                    &times;
                </button>
                {children}
            </Panel>
        </Overlay>
    );
}
