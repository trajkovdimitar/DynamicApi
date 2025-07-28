import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

const StyledInput = styled.input`
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.radius};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.md};
    &:focus {
        outline: 2px solid ${({ theme }) => theme.colors.primaryLight};
        outline-offset: 2px;
    }
`;

export function Input(props: Props) {
    return <StyledInput {...props} />;
}
