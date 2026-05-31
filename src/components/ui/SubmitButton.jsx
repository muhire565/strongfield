import React from 'react';
import { Loader2 } from 'lucide-react';

export function SubmitButton({
  isLoading,
  children,
  loadingText = 'Saving...',
  variant = 'primary',
  className = '',
  ...props
}) {
  const base =
    'flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium ' +
    'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm ' +
      'hover:shadow-md focus:ring-blue-500',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm ' +
      'hover:shadow-md focus:ring-red-500',
    secondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 focus:ring-gray-400 ' +
      'dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-700',
  };

  return (
    <button
      disabled={isLoading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={15} className="animate-spin flex-shrink-0" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
