'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export const Button = ({ children, variant = 'primary', ...props }: ButtonProps) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};
