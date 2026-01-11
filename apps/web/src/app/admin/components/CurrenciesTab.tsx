'use client';

import { useState } from 'react';
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { Currency } from '../types';

interface CurrenciesTabProps {
  currencies: Currency[];
  onAddCurrency: (data: Partial<Currency>) => Promise<void>;
  onEditCurrency: (id: string, data: Partial<Currency>) => Promise<void>;
  onDeleteCurrency: (id: string) => Promise<void>;
  onUpdateRates: () => Promise<void>;
  onRefresh: () => void;
}

export function CurrenciesTab({
  currencies,
  onAddCurrency,
  onEditCurrency,
  onDeleteCurrency,
  onUpdateRates,
  onRefresh,
}: CurrenciesTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState<Partial<Currency>>({
    code: '',
    name: '',
    symbol: '',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    exchangeRateToUSD: 1,
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [updatingRates, setUpdatingRates] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCurrency) {
        await onEditCurrency(editingCurrency.id, formData);
      } else {
        await onAddCurrency(formData);
      }
      setIsAddModalOpen(false);
      setEditingCurrency(null);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Failed to save currency:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandSeparator: ',',
      decimalSeparator: '.',
      exchangeRateToUSD: 1,
      active: true,
    });
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      symbolPosition: currency.symbolPosition,
      decimalPlaces: currency.decimalPlaces,
      thousandSeparator: currency.thousandSeparator,
      decimalSeparator: currency.decimalSeparator,
      exchangeRateToUSD: currency.exchangeRateToUSD,
      active: currency.active,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (currency: Currency) => {
    if (confirm(`Are you sure you want to delete currency "${currency.name}"?`)) {
      try {
        await onDeleteCurrency(currency.id);
        onRefresh();
      } catch (error) {
        console.error('Failed to delete currency:', error);
      }
    }
  };

  const handleUpdateRates = async () => {
    setUpdatingRates(true);
    try {
      await onUpdateRates();
      onRefresh();
    } catch (error) {
      console.error('Failed to update rates:', error);
    } finally {
      setUpdatingRates(false);
    }
  };

  const formatCurrency = (currency: Currency, amount: number = 1234.56) => {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces,
    });
    return currency.symbolPosition === 'before'
      ? `${currency.symbol}${formatted}`
      : `${formatted}${currency.symbol}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Currencies</h2>
          <p className="text-white/60 mt-1">Manage currencies and exchange rates</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdateRates}
            disabled={updatingRates}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${updatingRates ? 'animate-spin' : ''}`} />
            Update Rates
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingCurrency(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Currency
          </button>
        </div>
      </div>

      {/* Currencies Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Currency</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Symbol</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Format</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-white/60">
                Rate to USD
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-white/60">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-white/60">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((currency) => (
              <tr key={currency.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4">
                  <div>
                    <span className="font-medium text-white">{currency.code}</span>
                    <p className="text-sm text-white/60">{currency.name}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xl text-white">{currency.symbol}</span>
                  <span className="text-xs text-white/40 ml-2">
                    ({currency.symbolPosition})
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-white/80">{formatCurrency(currency)}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-white font-mono">
                      {currency.exchangeRateToUSD.toFixed(4)}
                    </span>
                    {currency.code !== 'USD' && (
                      currency.exchangeRateToUSD > 1 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )
                    )}
                  </div>
                  {currency.lastRateUpdate && (
                    <p className="text-xs text-white/40 mt-1">
                      Updated: {new Date(currency.lastRateUpdate).toLocaleDateString()}
                    </p>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      currency.active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {currency.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(currency)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(currency)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {currencies.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No currencies found</h3>
            <p className="text-white/60">Add your first currency to get started</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingCurrency ? 'Edit Currency' : 'Add Currency'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Currency Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="USD"
                    maxLength={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="$"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Currency Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="US Dollar"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Symbol Position</label>
                  <select
                    value={formData.symbolPosition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        symbolPosition: e.target.value as 'before' | 'after',
                      })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="before">Before ($100)</option>
                    <option value="after">After (100$)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Decimal Places</label>
                  <input
                    type="number"
                    value={formData.decimalPlaces}
                    onChange={(e) =>
                      setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    min={0}
                    max={4}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Thousand Separator</label>
                  <input
                    type="text"
                    value={formData.thousandSeparator}
                    onChange={(e) =>
                      setFormData({ ...formData, thousandSeparator: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder=","
                    maxLength={1}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Decimal Separator</label>
                  <input
                    type="text"
                    value={formData.decimalSeparator}
                    onChange={(e) =>
                      setFormData({ ...formData, decimalSeparator: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="."
                    maxLength={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Exchange Rate to USD</label>
                <input
                  type="number"
                  value={formData.exchangeRateToUSD}
                  onChange={(e) =>
                    setFormData({ ...formData, exchangeRateToUSD: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  step="0.0001"
                  min={0}
                  required
                />
                <p className="text-xs text-white/40 mt-1">1 {formData.code || 'XXX'} = X USD</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="currencyActive"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="currencyActive" className="text-sm text-white/60">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCurrency(null);
                  }}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCurrency ? 'Update Currency' : 'Add Currency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
