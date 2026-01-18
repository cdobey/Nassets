import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    endOfWeek,
    format,
    getWeek,
    startOfWeek,
    subDays,
    subMonths,
    subWeeks,
    subYears,
} from 'date-fns';
import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    AssetList,
    BudgetOverview,
    CalendarView,
    DayDetail,
    Header,
    Modal,
    SavingsModal,
    Sidebar,
    TransactionForm,
    TransactionTypeSelector,
    UpcomingTransactions,
} from '@/components';
import { useBudgetSummary, useCalendar, useCreateSaving, useCurrentUser, useLogout } from '@/hooks';
import { RecurrenceType } from '@/types';

interface DroppedAsset {
  id: number;
  name: string;
  amount: number;
  date: Date;
}

type ViewMode = 'day' | 'week' | 'month' | 'year';
type SidebarView = 'budget' | 'assets' | 'upcoming' | 'day-detail';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: user } = useCurrentUser();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'savings' | null>(
    null
  );
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [sidebarView, setSidebarView] = useState<SidebarView>('budget');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [droppedAsset, setDroppedAsset] = useState<DroppedAsset | null>(null);
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: budgetSummary } = useBudgetSummary(year, month);
  const { data: calendar } = useCalendar(year, month);
  const createSaving = useCreateSaving();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTransactionForm) {
          setShowTransactionForm(false);
          setTransactionType(null);
        } else if (selectedDay) {
          setSelectedDay(null);
          setSidebarView('budget');
        } else if (sidebarExpanded) {
          setSidebarExpanded(false);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showTransactionForm, selectedDay, sidebarExpanded]);

  useEffect(() => {
    const handleDragEnd = () => setIsDraggingAsset(false);
    window.addEventListener('dragend', handleDragEnd);
    return () => window.removeEventListener('dragend', handleDragEnd);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePrevious = () => {
    const actions = {
      day: () => setCurrentDate(subDays(currentDate, 1)),
      week: () => setCurrentDate(subWeeks(currentDate, 1)),
      month: () => setCurrentDate(subMonths(currentDate, 1)),
      year: () => setCurrentDate(subYears(currentDate, 1)),
    };
    actions[viewMode]();
  };

  const handleNext = () => {
    const actions = {
      day: () => setCurrentDate(addDays(currentDate, 1)),
      week: () => setCurrentDate(addWeeks(currentDate, 1)),
      month: () => setCurrentDate(addMonths(currentDate, 1)),
      year: () => setCurrentDate(addYears(currentDate, 1)),
    };
    actions[viewMode]();
  };

  const getDateRangeLabel = (): string => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week': {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `Week ${getWeek(currentDate, { weekStartsOn: 1 })}, ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setSidebarView('day-detail');
    setSidebarExpanded(true);
  };

  const handleAddTransaction = () => {
    setShowTransactionForm(true);
  };

  const handleTransactionTypeSelect = (type: 'income' | 'expense' | 'savings') => {
    setTransactionType(type);
  };

  const handleSavingsConfirm = async (
    percentage: number,
    recurrenceType: RecurrenceType,
    recurrenceEndDate?: string
  ) => {
    if (!droppedAsset) return;

    const amount = (droppedAsset.amount * percentage) / 100;
    const dateStr = format(droppedAsset.date, 'yyyy-MM-dd');

    try {
      await createSaving.mutateAsync({
        asset_id: droppedAsset.id,
        title: `Saving for ${droppedAsset.name}`,
        amount,
        date: dateStr,
        recurrence_type: recurrenceType,
        recurrence_end_date: recurrenceEndDate,
        description: `${percentage}% contribution towards ${droppedAsset.name}`,
        percentage,
      });
      setDroppedAsset(null);
    } catch (error) {
      console.error('Error creating saving:', error);
    }
  };

  const handleAssetDrop = (date: Date, assetData: string) => {
    const asset = JSON.parse(assetData);
    setDroppedAsset({ ...asset, date });
    setIsDraggingAsset(false);
  };

  const handleSidebarViewChange = (view: SidebarView) => {
    setSidebarView(view);
    setSidebarExpanded(true);
    if (view !== 'day-detail') {
      setSelectedDay(null);
    }
  };

  const handleCloseSidebar = () => {
    setSidebarExpanded(false);
  };

  const handleCloseDayDetail = () => {
    setSelectedDay(null);
    setSidebarView('budget');
  };

  const closeTransactionForm = () => {
    setTransactionType(null);
    setShowTransactionForm(false);
  };

  const closeSavingsModal = () => {
    setDroppedAsset(null);
    setTransactionType(null);
    setShowTransactionForm(false);
  };

  const renderSidebarContent = () => {
    if (sidebarView === 'day-detail' && selectedDay) {
      return (
        <DayDetail
          day={selectedDay}
          calendar={calendar}
          onClose={handleCloseDayDetail}
          onAddTransaction={handleAddTransaction}
        />
      );
    }

    switch (sidebarView) {
      case 'budget':
        return <BudgetOverview summary={budgetSummary} />;
      case 'assets':
        return <AssetList onDragStart={() => setIsDraggingAsset(true)} />;
      case 'upcoming':
        return <UpcomingTransactions calendar={calendar} />;
      default:
        return <BudgetOverview summary={budgetSummary} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Header
        user={user}
        viewMode={viewMode}
        dateLabel={getDateRangeLabel()}
        balance={budgetSummary?.remaining || 0}
        sidebarExpanded={sidebarExpanded}
        showProfileMenu={showProfileMenu}
        onViewModeChange={setViewMode}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToggleProfileMenu={() => setShowProfileMenu(!showProfileMenu)}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <div
          className={`transition-all duration-300 flex-shrink-0 ${
            sidebarExpanded ? 'w-[400px]' : 'w-20'
          }`}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            <CalendarView
              calendar={calendar}
              year={year}
              month={month}
              currentDate={currentDate}
              selectedDay={selectedDay}
              viewMode={viewMode}
              onDayClick={handleDayClick}
              onAddTransaction={handleAddTransaction}
              onAssetDrop={handleAssetDrop}
              isDraggingAsset={isDraggingAsset}
            />
          </div>
        </div>

        <Sidebar
          expanded={sidebarExpanded}
          view={sidebarView}
          selectedDay={selectedDay}
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          onViewChange={handleSidebarViewChange}
          onClose={handleCloseSidebar}
          onLogout={handleLogout}
        >
          {renderSidebarContent()}
        </Sidebar>
      </div>

      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={handleAddTransaction}
          className="group relative w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-blue-600 hover:from-primary-600 hover:via-primary-700 hover:to-blue-700 text-white rounded-full shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
          title="Add Transaction"
        >
          <Plus
            size={28}
            strokeWidth={3}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {showTransactionForm && !transactionType && (
        <TransactionTypeSelector
          onSelect={handleTransactionTypeSelect}
          onClose={() => setShowTransactionForm(false)}
        />
      )}

      {transactionType && transactionType !== 'savings' && (
        <Modal isOpen onClose={closeTransactionForm}>
          <TransactionForm type={transactionType} onClose={closeTransactionForm} />
        </Modal>
      )}

      {(droppedAsset || transactionType === 'savings') && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={closeSavingsModal}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SavingsModal
              assetName={droppedAsset?.name || 'General Savings'}
              assetAmount={droppedAsset?.amount || 0}
              date={droppedAsset?.date || new Date()}
              onConfirm={handleSavingsConfirm}
              onClose={closeSavingsModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
