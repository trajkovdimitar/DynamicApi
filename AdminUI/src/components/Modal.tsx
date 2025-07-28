import type { ReactNode } from 'react';
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
    return (
        <Overlay onClick={onClose}>
            <Panel onClick={e => e.stopPropagation()}>{children}</Panel>
        </Overlay>
    );
}
