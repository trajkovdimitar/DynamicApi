import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export function Input({ className, ...props }: Props) {
    return (
        <input
            className={clsx(
                'w-full rounded border border-gray-300 bg-white px-2 py-1 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500',
                className
            )}
            {...props}
        />
    );
}
