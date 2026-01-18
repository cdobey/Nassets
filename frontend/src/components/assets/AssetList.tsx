import { GripVertical, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { Button, ProgressBar } from '@/components/ui';
import { useAssets, useCreateAsset, useDeleteAsset } from '@/hooks';
import type { Asset } from '@/types';

interface AssetListProps {
  onDragStart?: (asset: Asset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ onDragStart }) => {
  const { data: assets = [], isLoading } = useAssets();
  const createAsset = useCreateAsset();
  const deleteAsset = useDeleteAsset();

  const [showForm, setShowForm] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', amount: '' });

  const handleAddAsset = async () => {
    if (newAsset.name && newAsset.amount) {
      try {
        await createAsset.mutateAsync({
          name: newAsset.name,
          amount: parseFloat(newAsset.amount),
          contributed: 0,
        });
        setNewAsset({ name: '', amount: '' });
        setShowForm(false);
      } catch (error) {
        console.error('Error creating asset:', error);
      }
    }
  };

  const handleDeleteAsset = async (id: number) => {
    try {
      await deleteAsset.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.setData('asset', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(asset);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setNewAsset({ name: '', amount: '' });
  };

  const totalValue = assets.reduce((sum, a) => sum + a.amount, 0);
  const totalContributed = assets.reduce((sum, a) => sum + a.contributed, 0);

  if (isLoading) {
    return (
      <div className="p-6 h-full overflow-auto">
        <div className="text-center py-8 text-gray-400">Loading wish list...</div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Wish List</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all duration-200 hover:scale-110"
          disabled={createAsset.isPending}
        >
          <Plus size={20} />
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-gray-200 animate-slideDown">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Item name (e.g., New Laptop)"
              value={newAsset.name}
              onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              className="input-field text-sm"
            />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                €
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newAsset.amount}
                onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })}
                className="input-field text-sm pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="success"
                onClick={handleAddAsset}
                className="flex-1 text-sm"
                isLoading={createAsset.isPending}
              >
                Add Item
              </Button>
              <Button variant="secondary" onClick={handleCancelForm} className="text-sm">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {assets.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No items in your wish list yet. Add some things you want to save for!
          </div>
        )}

        {assets.map((asset) => {
          const progressPercentage =
            asset.amount > 0 ? (asset.contributed / asset.amount) * 100 : 0;
          const remaining = asset.amount - asset.contributed;

          return (
            <div
              key={asset.id}
              draggable
              onDragStart={(e) => handleDragStart(e, asset)}
              className="group relative p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 cursor-move"
            >
              <div className="flex items-start gap-3 mb-3">
                <GripVertical
                  size={20}
                  className="text-gray-400 group-hover:text-primary-500 transition-colors mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 mb-1">{asset.name}</div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                      €{asset.amount.toFixed(2)}
                    </div>
                    {asset.contributed > 0 && (
                      <div className="text-sm text-gray-600">
                        €{asset.contributed.toFixed(2)} saved
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAsset(asset.id)}
                  disabled={deleteAsset.isPending}
                  className="p-2 hover:bg-danger-50 hover:text-danger-600 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{progressPercentage.toFixed(0)}% complete</span>
                  <span>€{remaining.toFixed(2)} to go</span>
                </div>
                <ProgressBar percentage={progressPercentage} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200">
        <div className="text-sm text-gray-600 mb-2">Total Wish List Value:</div>
        <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
          €{totalValue.toFixed(2)}
        </div>
        {totalContributed > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            €{totalContributed.toFixed(2)} saved so far
          </div>
        )}
      </div>
    </div>
  );
};
