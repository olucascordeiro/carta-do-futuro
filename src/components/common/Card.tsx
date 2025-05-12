import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-background-light rounded-lg p-6 shadow-md transition-all duration-300',
        hover && 'hover:shadow-lg',
        glow && 'hover:shadow-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;