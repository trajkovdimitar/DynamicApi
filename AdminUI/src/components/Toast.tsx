import { useEffect } from 'react';
import styled from 'styled-components';

interface Props {
    message: string;
    onClose: () => void;
}

const Box = styled.div`
    position: fixed;
    bottom: ${({ theme }) => theme.spacing.md};
    right: ${({ theme }) => theme.spacing.md};
    background: black;
    color: white;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

export default function Toast({ message, onClose }: Props) {
    useEffect(() => {
        if (!message) return;
        const id = setTimeout(onClose, 3000);
        return () => clearTimeout(id);
    }, [message, onClose]);

    if (!message) return null;
    return <Box>{message}</Box>;
}
