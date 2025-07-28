import type { ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

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
    return (
        <Panel open={open} onClick={e => e.stopPropagation()}>
            <button aria-label="Close" style={{ float: 'right' }} onClick={onClose}>
                &times;
            </button>
            {children}
        </Panel>
    );
}
