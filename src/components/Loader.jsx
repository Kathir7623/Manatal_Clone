import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500 gap-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin text-blue-600`} />
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );
};

export default Loader;
