import { Button } from '@/components/ui';
import { useCreateExpense, useCreateIncome } from '@/hooks';
import { RecurrenceType } from '@/types';
import { Calendar, DollarSign, FileText, Repeat, Tag, TrendingDown, TrendingUp, X } from 'lucide-react';
import React, { useState } from 'react';

interface TransactionFormProps {
  type: 'income' | 'expense';
  onClose: () => void;
}

const RECURRENCE_OPTIONS = [
  { value: RecurrenceType.NONE, label: 'One-time' },
  { value: RecurrenceType.DAILY, label: 'Daily' },
  { value: RecurrenceType.WEEKLY, label: 'Weekly' },
  { value: RecurrenceType.MONTHLY, label: 'Monthly' },
  { value: RecurrenceType.YEARLY, label: 'Yearly' },
];

export const TransactionForm: React.FC<TransactionFormProps> = ({ type, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    recurrence_type: RecurrenceType.NONE,
    recurrence_end_date: '',
    description: '',
  });

  const createIncomeMutation = useCreateIncome();
  const createExpenseMutation = useCreateExpense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: formData.date,
      recurrence_type: formData.recurrence_type,
      recurrence_end_date: formData.recurrence_end_date || undefined,
      description: formData.description || undefined,
      ...(type === 'expense' && { category: formData.category || undefined }),
    };

    if (type === 'income') {
      await createIncomeMutation.mutateAsync(data);
    } else {
      await createExpenseMutation.mutateAsync(data);
    }

    onClose();
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isIncome = type === 'income';
  const gradient = isIncome ? 'from-success-500 to-success-600' : 'from-danger-500 to-danger-600';
  const isPending = createIncomeMutation.isPending || createExpenseMutation.isPending;

  return (
    <div className="relative">
      <div className={`bg-gradient-to-r ${gradient} p-6 rounded-t-3xl relative overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-white/10" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200 z-10"
        >
          <X size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            {isIncome ? (
              <TrendingUp size={32} className="text-white" />
            ) : (
              <TrendingDown size={32} className="text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Add {isIncome ? 'Income' : 'Expense'}</h2>
            <p className="text-white/80 text-sm">
              {isIncome ? 'Track your earnings' : 'Record your spending'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            Title
          </label>
          <input
            type="text"
            placeholder={isIncome ? 'e.g., Salary, Freelance' : 'e.g., Groceries, Rent'}
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
            className="input-field text-base"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <DollarSign size={16} className="text-gray-400" />
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
              €
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => updateField('amount', e.target.value)}
              required
              className="input-field text-base pl-10 font-semibold"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => updateField('date', e.target.value)}
            required
            className="input-field text-base"
          />
        </div>

        {!isIncome && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Tag size={16} className="text-gray-400" />
              Category <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Food, Transport, Entertainment"
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="input-field text-base"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Repeat size={16} className="text-gray-400" />
            Recurrence
          </label>
          <select
            value={formData.recurrence_type}
            onChange={(e) => updateField('recurrence_type', e.target.value)}
            className="input-field text-base cursor-pointer"
          >
            {RECURRENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {formData.recurrence_type !== RecurrenceType.NONE && (
          <div className="space-y-2 animate-slideDown">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              End Date <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              placeholder="Leave empty for no end date"
              value={formData.recurrence_end_date}
              onChange={(e) => updateField('recurrence_end_date', e.target.value)}
              className="input-field text-base"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            Description <span className="text-xs text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="Add any additional notes..."
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            className="input-field text-base resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isIncome ? 'success' : 'danger'}
            isLoading={isPending}
            className="flex-1"
          >
            Add {isIncome ? 'Income' : 'Expense'}
          </Button>
        </div>
      </form>
    </div>
  );
};
