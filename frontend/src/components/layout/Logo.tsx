import React from 'react';
import { TrendingUp } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 18, text: 'text-lg' },
    md: { container: 'w-12 h-12', icon: 26, text: 'text-2xl' },
    lg: { container: 'w-16 h-16', icon: 36, text: 'text-4xl' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${s.container} bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 relative overflow-hidden group`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <TrendingUp className="text-white relative z-10" size={s.icon} strokeWidth={2.5} />
        <div className="absolute inset-0 shadow-inner rounded-2xl" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`${s.text} font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent leading-none`}
          >
            Nassets
          </span>
          <span className="text-xs text-gray-500 font-medium">Financial Planner</span>
        </div>
      )}
    </div>
  );
};
