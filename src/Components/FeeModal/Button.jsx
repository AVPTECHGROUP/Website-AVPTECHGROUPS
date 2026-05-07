import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  onClick, 
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-in-out active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap tracking-wide';
  
  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-dark',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    success: 'bg-success text-white hover:bg-[#065F46]',
    danger: 'bg-danger text-white hover:bg-[#991B1B]',
    ghost: 'bg-navy-light text-navy border border-[#C7D7EE] hover:bg-[#DDE8F5]',
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-[11px] rounded-md',
    sm: 'px-3 py-1.5 text-[11.5px] rounded-lg',
    md: 'px-4 py-2 text-[12.5px] rounded-lg',
    lg: 'px-6 py-2.5 text-sm rounded-lg',
  };
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;