import { Button } from '@/components/ui';
import { Minus, Package, Plus, X } from 'lucide-react';
import React from 'react';

type TransactionType = 'income' | 'expense' | 'savings';

interface TransactionTypeSelectorProps {
  onSelect: (type: TransactionType) => void;
  onClose: () => void;
}

const TRANSACTION_TYPES = [
  {
    type: 'income' as const,
    label: 'Income',
    description: 'Add money received',
    icon: Plus,
    gradient: 'from-success-50 to-success-100 hover:from-success-100 hover:to-success-200',
    border: 'border-success-500',
    iconBg: 'from-success-500 to-success-600',
  },
  {
    type: 'expense' as const,
    label: 'Expense',
    description: 'Add money spent',
    icon: Minus,
    gradient: 'from-danger-50 to-danger-100 hover:from-danger-100 hover:to-danger-200',
    border: 'border-danger-500',
    iconBg: 'from-danger-500 to-danger-600',
  },
  {
    type: 'savings' as const,
    label: 'Savings',
    description: 'Set money aside',
    icon: Package,
    gradient: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
    border: 'border-blue-500',
    iconBg: 'from-blue-500 to-blue-600',
  },
];

export const TransactionTypeSelector: React.FC<TransactionTypeSelectorProps> = ({
  onSelect,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-md w-full p-8 animate-slideUp transform perspective-1000"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-3">
          {TRANSACTION_TYPES.map(({ type, label, description, icon: Icon, gradient, border, iconBg }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`w-full flex items-center gap-4 p-4 bg-gradient-to-r ${gradient} border-2 ${border} rounded-xl transition-all duration-200 hover:scale-105 group`}
            >
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${iconBg} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}
              >
                <Icon size={24} strokeWidth={3} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">{label}</div>
                <div className="text-sm text-gray-600">{description}</div>
              </div>
            </button>
          ))}
        </div>

        <Button variant="secondary" onClick={onClose} className="w-full mt-6">
          Cancel
        </Button>
      </div>
    </div>
  );
};
