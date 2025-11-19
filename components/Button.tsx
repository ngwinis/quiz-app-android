import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  icon,
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30",
    secondary: "bg-white text-gray-800 hover:bg-gray-50 shadow-sm border border-gray-200",
    outline: "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};