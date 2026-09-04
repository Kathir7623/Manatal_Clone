import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      error,
      helperText,
      required = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          className={`w-full rounded-lg border px-3.5 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-[#ed7a1c] focus:ring-[#ed7a1c]/20'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
