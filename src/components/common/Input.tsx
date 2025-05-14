// src/components/common/Input.tsx
import React, { InputHTMLAttributes, ReactNode } from 'react'; // Adicione ReactNode
import { cn } from '../../utils/cn'; // Ou o caminho correto para cn

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode; // <<< ADICIONAR ESTA LINHA (ReactNode permite passar componentes como ícones)
  // Se você quiser o ícone posicionado, pode precisar de mais props ou lógica de classes
  iconPosition?: 'left' | 'right'; 
}

const Input: React.FC<InputProps> = ({
  className,
  label,
  error,
  id,
  icon, // <<< DESESTRUTURAR A PROP AQUI
  iconPosition = 'left', // Exemplo de default se for usar iconPosition
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Lógica para classes de padding se houver ícone
  const hasIconLeft = icon && iconPosition === 'left';
  const hasIconRight = icon && iconPosition === 'right';

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-text-secondary mb-2 font-medium">
          {label}
        </label>
      )}
      <div className="relative flex items-center"> {/* Wrapper para input e ícone */}
        {hasIconLeft && (
          <span className="absolute left-3 inset-y-0 flex items-center pointer-events-none text-text-muted">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'input w-full', // Sua classe .input base
            hasIconLeft ? 'pl-10' : undefined, // Adiciona padding à esquerda se houver ícone à esquerda
            hasIconRight ? 'pr-10' : undefined, // Adiciona padding à direita se houver ícone à direita
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
            className
          )}
          {...props}
        />
        {hasIconRight && (
          <span className="absolute right-3 inset-y-0 flex items-center pointer-events-none text-text-muted">
            {icon}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Input;