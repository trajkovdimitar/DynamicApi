import type { ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Box = styled.div`
    background: ${({ theme }) => theme.colors.background};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: 4px;
`;

export function Modal({ open, onClose, children }: Props) {
    if (!open) return null;
    return (
        <Backdrop onClick={onClose}>
            <Box onClick={e => e.stopPropagation()}>{children}</Box>
        </Backdrop>
    );
}
