import React, { TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  className,
  label,
  error,
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={textareaId} className="block text-text-secondary mb-2 font-medium">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'textarea w-full',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default TextArea;