import styled from 'styled-components';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const sizeMap = {
    sm: '0.25rem 0.5rem',
    md: '0.5rem 1rem',
    lg: '0.75rem 1.5rem',
};

const StyledButton = styled.button<{ variant: ButtonVariant; size: ButtonSize }>`
    padding: ${({ size }) => sizeMap[size]};
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
            case 'outline':
                return 'transparent';
            default:
                return theme.colors.primary;
        }
    }};
    ${({ variant, theme }) =>
        variant === 'outline' &&
        `color: ${theme.colors.text}; border-color: ${theme.colors.primary};`}
    transition: background ${({ theme }) => theme.transitions.fast};
    &:hover {
        opacity: 0.9;
        ${({ variant, theme }) =>
            variant === 'outline' && `background:${theme.colors.primaryLight}20;`}
    }
    &:focus-visible {
        outline: 2px solid ${({ theme }) => theme.colors.primaryLight};
        outline-offset: 2px;
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export function Button({ variant = 'primary', size = 'md', ...props }: Props) {
    return <StyledButton variant={variant} size={size} {...props} />;
}
