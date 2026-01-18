import { Button, ProgressBar } from '@/components/ui';
import { RecurrenceType } from '@/types';
import { Calendar as CalendarIcon, Repeat, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SavingsModalProps {
  assetName: string;
  assetAmount: number;
  date: Date;
  onConfirm: (percentage: number, recurrenceType: RecurrenceType, recurrenceEndDate?: string) => void;
  onClose: () => void;
}

const RECURRENCE_OPTIONS = [
  { value: RecurrenceType.NONE, label: 'One-time' },
  { value: RecurrenceType.DAILY, label: 'Daily' },
  { value: RecurrenceType.WEEKLY, label: 'Weekly' },
  { value: RecurrenceType.MONTHLY, label: 'Monthly' },
  { value: RecurrenceType.YEARLY, label: 'Yearly' },
];

const QUICK_PERCENTAGES = [25, 50, 75, 100];

export const SavingsModal: React.FC<SavingsModalProps> = ({
  assetName,
  assetAmount,
  date,
  onConfirm,
  onClose,
}) => {
  const [percentage, setPercentage] = useState(100);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(RecurrenceType.NONE);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const savingsAmount = (assetAmount * percentage) / 100;

  const handleSubmit = () => {
    onConfirm(percentage, recurrenceType, recurrenceEndDate || undefined);
  };

  return (
    <div
      className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-lg w-full max-h-[90vh] overflow-auto animate-slideUp"
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-blue-600 p-6 rounded-t-3xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <X size={20} className="text-white" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Save for {assetName}</h2>
          <p className="text-white/80 text-sm">
            {date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-6 border-2 border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Contribution
            </div>
            <div className="text-5xl font-bold text-primary-600">{percentage}%</div>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">You'll save</div>
              <div className="text-3xl font-bold text-gray-900">€{savingsAmount.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Goal</div>
              <div className="text-xl font-semibold text-gray-700">€{assetAmount.toFixed(2)}</div>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar percentage={percentage} size="lg" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-700">Adjust Percentage</label>
          <div className="relative pt-1">
            <input
              type="range"
              min="1"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #4caf50 0%, #4caf50 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              {['1%', '25%', '50%', '75%', '100%'].map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {QUICK_PERCENTAGES.map((val) => (
              <button
                key={val}
                onClick={() => setPercentage(val)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  percentage === val
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Repeat size={16} className="text-gray-400" />
            Recurrence
          </label>
          <select
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
            className="input-field text-base cursor-pointer"
          >
            {RECURRENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {recurrenceType !== RecurrenceType.NONE && (
          <div className="space-y-2 animate-slideDown">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalendarIcon size={16} className="text-gray-400" />
              End Date <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
              className="input-field text-base"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="button" variant="success" onClick={handleSubmit} className="flex-1">
            Add Savings
          </Button>
        </div>
      </div>
    </div>
  );
};
