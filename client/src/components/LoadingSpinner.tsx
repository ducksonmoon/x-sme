import React from 'react'
import { cn } from '@utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const variantClasses = {
    primary: 'border-t-primary-600',
    secondary: 'border-t-secondary-600',
    success: 'border-t-success-600',
    warning: 'border-t-warning-600',
    error: 'border-t-error-600',
  }

  return (
    <div
      className={cn(
        'spinner',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner 