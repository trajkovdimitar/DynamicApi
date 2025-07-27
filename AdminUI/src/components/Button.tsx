import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
    const styles: Record<'primary' | 'secondary' | 'danger', string> = {
        primary: 'bg-primary text-white hover:bg-primary-dark',
        secondary: 'bg-secondary text-gray-800 hover:bg-secondary-dark dark:text-white',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    return (
        <button
            className={`px-3 py-1 rounded ${styles[variant]} ${className}`.trim()}
            {...props}
        >
            {children}
        </button>
    );
}
