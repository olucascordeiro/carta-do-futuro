import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  className,
  label,
  error,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-text-secondary mb-2 font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'input w-full',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Input;