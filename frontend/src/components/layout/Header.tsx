import type { User } from '@/types';
import { ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react';
import React from 'react';

type ViewMode = 'day' | 'week' | 'month' | 'year';

interface HeaderProps {
  user?: User;
  viewMode: ViewMode;
  dateLabel: string;
  balance: number;
  sidebarExpanded: boolean;
  showProfileMenu: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleProfileMenu: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  viewMode,
  dateLabel,
  balance,
  sidebarExpanded,
  showProfileMenu,
  onViewModeChange,
  onPrevious,
  onNext,
  onToggleProfileMenu,
  onLogout,
}) => {
  const viewModes: ViewMode[] = ['day', 'week', 'month', 'year'];

  const getViewModePosition = () => {
    const index = viewModes.indexOf(viewMode);
    return index === 0 ? '4px' : `calc(${index * 25}% + ${index === 3 ? '-2px' : index === 2 ? '0px' : '2px'})`;
  };

  const getDateLabelWidth = () => {
    const widths = {
      year: 'min-w-[100px]',
      month: 'min-w-[160px]',
      day: 'min-w-[300px]',
      week: 'min-w-[290px]',
    };
    return widths[viewMode];
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm flex-shrink-0 relative z-[5]">
      <div
        className={`px-8 flex items-center justify-between transition-all duration-300 ${
          sidebarExpanded ? 'ml-[400px]' : 'ml-20'
        }`}
        style={{ height: '80px' }}
      >
        <div className="flex items-center gap-6">
          <div className="relative flex gap-1 bg-gray-100 rounded-lg p-1.5">
            <div
              className="absolute top-1 h-[calc(100%-8px)] bg-white rounded-md shadow-sm transition-all duration-300 ease-out"
              style={{
                width: 'calc(25% - 2px)',
                left: getViewModePosition(),
              }}
            />
            {viewModes.map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`relative z-10 w-16 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center capitalize ${
                  viewMode === mode ? 'text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onPrevious}
              className="p-2.5 hover:bg-primary-50 hover:scale-110 rounded-lg transition-all duration-200 group"
            >
              <ChevronLeft size={20} className="text-gray-600 group-hover:text-primary-600" />
            </button>
            <h2
              className={`text-lg font-bold text-gray-800 text-center transition-all duration-300 ${getDateLabelWidth()}`}
            >
              {dateLabel}
            </h2>
            <button
              onClick={onNext}
              className="p-2.5 hover:bg-primary-50 hover:scale-110 rounded-lg transition-all duration-200 group"
            >
              <ChevronRight size={20} className="text-gray-600 group-hover:text-primary-600" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-100">
            <span className="text-sm font-medium text-gray-600">Balance:</span>
            <span className="text-base font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              €{balance.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="relative flex-shrink-0 -mr-4">
          <button
            onClick={onToggleProfileMenu}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            title={user?.full_name || user?.username}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={onToggleProfileMenu} />
              <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 z-[101] animate-slideDown overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {user?.full_name || user?.username}
                      </div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-danger-50 hover:bg-danger-100 text-danger-600 rounded-lg text-sm font-medium transition-all duration-200 group"
                    >
                      <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
