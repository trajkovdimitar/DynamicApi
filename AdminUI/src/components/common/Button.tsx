import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type Props<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<T>;

const sizeClasses = {
  xs: 'px-3 py-2 text-xs',
  sm: 'px-4 py-3 text-sm',
  md: 'px-5 py-3.5 text-sm',
  lg: 'px-6 py-4 text-base',
  xl: 'px-7 py-4.5 text-lg',
  '2xl': 'px-8 py-5 text-xl',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
  outline: 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-white/80 dark:hover:bg-white/[0.1]',
  danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 dark:bg-red-600 dark:hover:bg-red-700',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-white/80 dark:hover:bg-white/[0.05]',
};

export function Button<T extends ElementType = 'button'>({
  as,
  children,
  variant = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  className,
  disabled,
  ...rest
}: Props<T>) {
  const Component = as || 'button';

  return (
    <Component
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg transition',
        sizeClasses[size],
        variantClasses[variant],
        {
          'cursor-not-allowed opacity-50': disabled,
        },
        className
      )}
      disabled={Component === 'button' ? disabled : undefined}
      {...rest}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </Component>
  );
}
