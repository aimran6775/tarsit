'use client';

import { useState } from 'react';
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ArrowUpDown,
  Languages,
  DollarSign,
  Clock,
  Phone,
} from 'lucide-react';
import type { Region, Currency } from '../types';

interface RegionsTabProps {
  regions: Region[];
  currencies: Currency[];
  onAddRegion: (data: Partial<Region>) => Promise<void>;
  onEditRegion: (id: string, data: Partial<Region>) => Promise<void>;
  onDeleteRegion: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export function RegionsTab({
  regions,
  currencies,
  onAddRegion,
  onEditRegion,
  onDeleteRegion,
  onRefresh,
}: RegionsTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState<Partial<Region>>({
    code: '',
    name: '',
    nativeName: '',
    defaultLanguage: 'en',
    supportedLangs: ['en'],
    timezone: '',
    isRTL: false,
    flagEmoji: '',
    phoneCode: '',
    active: true,
    order: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRegion) {
        await onEditRegion(editingRegion.id, formData);
      } else {
        await onAddRegion(formData);
      }
      setIsAddModalOpen(false);
      setEditingRegion(null);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Failed to save region:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      nativeName: '',
      defaultLanguage: 'en',
      supportedLangs: ['en'],
      timezone: '',
      isRTL: false,
      flagEmoji: '',
      phoneCode: '',
      active: true,
      order: 0,
    });
  };

  const handleEdit = (region: Region) => {
    setEditingRegion(region);
    setFormData({
      code: region.code,
      name: region.name,
      nativeName: region.nativeName,
      defaultLanguage: region.defaultLanguage,
      supportedLangs: region.supportedLangs,
      currencyId: region.currencyId,
      timezone: region.timezone,
      isRTL: region.isRTL,
      flagEmoji: region.flagEmoji,
      phoneCode: region.phoneCode,
      active: region.active,
      order: region.order,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (region: Region) => {
    if (confirm(`Are you sure you want to delete region "${region.name}"?`)) {
      try {
        await onDeleteRegion(region.id);
        onRefresh();
      } catch (error) {
        console.error('Failed to delete region:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Regions</h2>
          <p className="text-white/60 mt-1">Manage global regions and localization settings</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingRegion(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Region
        </button>
      </div>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((region) => (
          <div
            key={region.id}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{region.flagEmoji}</span>
                <div>
                  <h3 className="font-semibold text-white">{region.name}</h3>
                  <p className="text-sm text-white/60">{region.nativeName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(region)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(region)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <Globe className="w-4 h-4" />
                <span>Code: {region.code}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Languages className="w-4 h-4" />
                <span>Languages: {region.supportedLangs.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <DollarSign className="w-4 h-4" />
                <span>Currency: {region.currency?.code || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4" />
                <span>{region.timezone}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Phone className="w-4 h-4" />
                <span>{region.phoneCode}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  region.active
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {region.active ? 'Active' : 'Inactive'}
              </span>
              {region.isRTL && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">
                  RTL
                </span>
              )}
              <span className="text-xs text-white/40 ml-auto">Order: {region.order}</span>
            </div>
          </div>
        ))}
      </div>

      {regions.length === 0 && (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <Globe className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No regions found</h3>
          <p className="text-white/60">Add your first region to get started</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingRegion ? 'Edit Region' : 'Add Region'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Region Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="US, AE, SA..."
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    value={formData.flagEmoji}
                    onChange={(e) => setFormData({ ...formData, flagEmoji: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="🇺🇸"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Name (English)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="United States"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Native Name</label>
                <input
                  type="text"
                  value={formData.nativeName}
                  onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="United States"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Default Language</label>
                  <select
                    value={formData.defaultLanguage}
                    onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="ur">Urdu</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Currency</label>
                  <select
                    value={formData.currencyId || ''}
                    onChange={(e) => setFormData({ ...formData, currencyId: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select Currency</option>
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Timezone</label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="America/New_York"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Phone Code</label>
                  <input
                    type="text"
                    value={formData.phoneCode}
                    onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    placeholder="+1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Supported Languages</label>
                <input
                  type="text"
                  value={formData.supportedLangs?.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supportedLangs: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="en, ar, es"
                />
                <p className="text-xs text-white/40 mt-1">Comma-separated language codes</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    min={0}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isRTL"
                    checked={formData.isRTL}
                    onChange={(e) => setFormData({ ...formData, isRTL: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="isRTL" className="text-sm text-white/60">
                    RTL Layout
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="active" className="text-sm text-white/60">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingRegion(null);
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
                  {loading ? 'Saving...' : editingRegion ? 'Update Region' : 'Add Region'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
