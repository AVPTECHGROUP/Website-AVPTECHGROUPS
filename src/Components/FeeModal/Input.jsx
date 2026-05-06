import React from 'react';

const Input = ({ 
  type = 'text', 
  label, 
  placeholder, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;