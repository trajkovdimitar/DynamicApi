import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
};

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    ...props
}: Props) {
    return (
        <button
            className={clsx(
                'rounded focus:outline-none focus:ring focus:ring-indigo-300 disabled:opacity-50',
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            {...props}
        />
    );
}
