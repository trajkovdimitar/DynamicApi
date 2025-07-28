import styled from 'styled-components';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const StyledButton = styled.button<{ variant: ButtonVariant }>`
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.radius};
    border: 1px solid ${({ theme }) => theme.colors.border};
    font-size: ${({ theme }) => theme.fontSizes.md};
    cursor: pointer;
    color: #fff;
    background: ${({ theme, variant }) => {
        switch (variant) {
            case 'secondary':
                return theme.colors.secondary;
            case 'danger':
                return theme.colors.accent;
            default:
                return theme.colors.primary;
        }
    }};
    transition: background 0.2s;
    &:hover {
        opacity: 0.9;
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export function Button({ variant = 'primary', ...props }: Props) {
    return <StyledButton variant={variant} {...props} />;
}
