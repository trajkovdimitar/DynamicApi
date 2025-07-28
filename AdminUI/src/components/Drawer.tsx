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
    transform: translateX(${({ open }) => (open ? '0' : '100%')});
    transition: transform 0.2s ease-in-out;
`;

export function Drawer({ open, onClose, children }: Props) {
    return (
        <Panel open={open} onClick={e => e.stopPropagation()}>
            <button style={{ padding: '4px' }} onClick={onClose}>Close</button>
            {children}
        </Panel>
    );
}
