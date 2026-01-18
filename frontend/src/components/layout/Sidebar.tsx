import { format } from 'date-fns';
import {
    Calendar,
    ChevronLeft,
    LayoutDashboard,
    ListChecks,
    LogOut,
    Package,
} from 'lucide-react';
import React from 'react';
import { Logo } from './Logo';

type SidebarView = 'budget' | 'assets' | 'upcoming' | 'day-detail';

interface SidebarProps {
  expanded: boolean;
  view: SidebarView;
  selectedDay: Date | null;
  onToggle: () => void;
  onViewChange: (view: SidebarView) => void;
  onClose: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const VIEW_CONFIG = {
  budget: {
    title: 'Budget Overview',
    subtitle: 'Track your spending',
    icon: LayoutDashboard,
  },
  assets: {
    title: 'Wish List',
    subtitle: 'Save for your goals',
    icon: Package,
  },
  upcoming: {
    title: 'Upcoming',
    subtitle: 'Plan ahead',
    icon: ListChecks,
  },
  'day-detail': {
    title: 'Day Detail',
    subtitle: 'View transactions',
    icon: Calendar,
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  expanded,
  view,
  selectedDay,
  onToggle,
  onViewChange,
  onClose,
  onLogout,
  children,
}) => {
  const NavButton: React.FC<{
    viewKey: SidebarView;
    show?: boolean;
    title?: string;
  }> = ({ viewKey, show = true, title }) => {
    if (!show) return null;

    const config = VIEW_CONFIG[viewKey];
    const Icon = config.icon;
    const isActive = expanded && view === viewKey;

    return (
      <button
        onClick={() => {
          onViewChange(viewKey);
        }}
        className={`flex items-center justify-center w-full p-3 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title={title || config.title}
      >
        <Icon size={22} />
      </button>
    );
  };

  const currentConfig = VIEW_CONFIG[view];

  return (
    <div className="fixed top-0 left-0 bottom-0 flex z-10">
      <div className="w-20 bg-white/90 backdrop-blur-md border-r border-gray-200/50 shadow-2xl flex flex-col">
        <div className="border-b border-gray-200/50">
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-full py-4 hover:bg-gray-100 transition-all duration-200 group"
            title={expanded ? 'Close Menu' : 'Open Menu'}
          >
            <Logo size="md" showText={false} />
          </button>
        </div>

        <div className="flex-1 py-4 space-y-2 px-3">
          <NavButton viewKey="budget" />
          <NavButton viewKey="assets" />
          <NavButton viewKey="upcoming" />
          <NavButton
            viewKey="day-detail"
            show={!!selectedDay}
            title={selectedDay ? `Day Detail - ${format(selectedDay, 'MMM d')}` : undefined}
          />
        </div>

        <div className="border-t border-gray-200/50 py-4 px-3">
          <button
            onClick={onLogout}
            className="flex items-center justify-center w-full p-3 rounded-xl text-danger-600 hover:bg-danger-50 transition-all duration-200 group"
            title="Logout"
          >
            <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      <div
        className={`bg-white/90 backdrop-blur-md border-r border-gray-200/50 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${
          expanded ? 'w-80' : 'w-0'
        }`}
      >
        <div
          className={`border-b border-gray-200/50 px-6 bg-gradient-to-r from-primary-50/50 to-blue-50/50 flex items-center justify-between transition-opacity duration-200 ${
            expanded ? 'opacity-100 delay-150' : 'opacity-0'
          }`}
          style={{ height: '81px', minWidth: '320px' }}
        >
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-800">{currentConfig.title}</span>
            <span className="text-xs text-gray-500 font-medium">{currentConfig.subtitle}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-all duration-200"
            title="Close sidebar"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        </div>

        <div
          className={`flex-1 overflow-auto transition-opacity duration-200 ${
            expanded ? 'opacity-100 delay-150' : 'opacity-0'
          }`}
          style={{ minWidth: '320px' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
