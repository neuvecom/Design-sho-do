import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'md',
  active = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed'

  const variantStyles = {
    primary:
      'bg-stone-800 text-white hover:bg-stone-700 focus:ring-stone-500 shadow-sm shadow-stone-300/50',
    secondary:
      'bg-white/80 text-stone-600 border border-stone-200 hover:bg-white hover:border-stone-300 focus:ring-stone-300',
    ghost:
      'bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-700 focus:ring-stone-300',
  }

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const activeStyles = active
    ? 'ring-2 ring-stone-400 bg-stone-100'
    : ''

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${activeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
