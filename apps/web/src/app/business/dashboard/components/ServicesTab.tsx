'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    Clock,
    DollarSign,
    GripVertical,
    Loader2,
    Package,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    bookable: boolean;
    order: number;
}

interface ServicesTabProps {
    businessId: string;
    services: Service[];
    onServicesUpdated: () => void;
}

export function ServicesTab({ businessId, services: initialServices, onServicesUpdated }: ServicesTabProps) {
    const [services, setServices] = useState<Service[]>(initialServices);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // New service form state
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price: '',
        duration: '30',
        bookable: true,
    });

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        bookable: true,
    });

    useEffect(() => {
        setServices(initialServices);
    }, [initialServices]);

    // Add new service
    const handleAddService = async () => {
        if (!newService.name.trim()) {
            toast.error('Service name is required');
            return;
        }

        const price = parseFloat(newService.price) || 0;
        const duration = parseInt(newService.duration) || 30;

        setIsSaving(true);
        try {
            const res = await apiClient.post('/services', {
                businessId,
                name: newService.name.trim(),
                description: newService.description.trim() || null,
                price,
                duration,
                bookable: newService.bookable,
                order: services.length,
            });

            setServices([...services, res.data]);
            setNewService({ name: '', description: '', price: '', duration: '30', bookable: true });
            setIsAdding(false);
            toast.success('Service added');
            onServicesUpdated();
        } catch (error) {
            console.error('Failed to add service:', error);
            toast.error('Failed to add service');
        } finally {
            setIsSaving(false);
        }
    };

    // Start editing
    const handleStartEdit = (service: Service) => {
        setEditingId(service.id);
        setEditForm({
            name: service.name,
            description: service.description || '',
            price: service.price.toString(),
            duration: service.duration.toString(),
            bookable: service.bookable,
        });
    };

    // Save edit
    const handleSaveEdit = async () => {
        if (!editingId || !editForm.name.trim()) {
            toast.error('Service name is required');
            return;
        }

        const price = parseFloat(editForm.price) || 0;
        const duration = parseInt(editForm.duration) || 30;

        setIsSaving(true);
        try {
            await apiClient.patch(`/services/${editingId}`, {
                name: editForm.name.trim(),
                description: editForm.description.trim() || null,
                price,
                duration,
                bookable: editForm.bookable,
            });

            setServices(services.map(s =>
                s.id === editingId
                    ? { ...s, name: editForm.name, description: editForm.description, price, duration, bookable: editForm.bookable }
                    : s
            ));
            setEditingId(null);
            toast.success('Service updated');
            onServicesUpdated();
        } catch (error) {
            console.error('Failed to update service:', error);
            toast.error('Failed to update service');
        } finally {
            setIsSaving(false);
        }
    };

    // Delete service
    const handleDelete = async (serviceId: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        setDeletingId(serviceId);
        try {
            await apiClient.delete(`/services/${serviceId}`);
            setServices(services.filter(s => s.id !== serviceId));
            toast.success('Service deleted');
            onServicesUpdated();
        } catch (error) {
            console.error('Failed to delete service:', error);
            toast.error('Failed to delete service');
        } finally {
            setDeletingId(null);
        }
    };

    // Toggle bookable
    const handleToggleBookable = async (service: Service) => {
        try {
            await apiClient.patch(`/services/${service.id}`, {
                bookable: !service.bookable,
            });
            setServices(services.map(s =>
                s.id === service.id ? { ...s, bookable: !s.bookable } : s
            ));
            toast.success(service.bookable ? 'Service disabled for booking' : 'Service enabled for booking');
        } catch (error) {
            console.error('Failed to toggle bookable:', error);
            toast.error('Failed to update service');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Services</h2>
                    <p className="text-sm text-white/50">Manage your service offerings and pricing</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                        <Plus className="h-4 w-4" />
                        Add Service
                    </button>
                )}
            </div>

            {/* Add Service Form */}
            {isAdding && (
                <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                    <h3 className="text-white font-medium mb-4">Add New Service</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Service Name *
                            </label>
                            <input
                                type="text"
                                value={newService.name}
                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                placeholder="e.g., Haircut, Consultation, Repair"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Description
                            </label>
                            <textarea
                                value={newService.description}
                                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                placeholder="Describe what's included in this service..."
                                rows={2}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Price ($)
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                <input
                                    type="number"
                                    value={newService.price}
                                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Duration
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                <select
                                    value={newService.duration}
                                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                                >
                                    <option value="15" className="bg-neutral-900">15 minutes</option>
                                    <option value="30" className="bg-neutral-900">30 minutes</option>
                                    <option value="45" className="bg-neutral-900">45 minutes</option>
                                    <option value="60" className="bg-neutral-900">1 hour</option>
                                    <option value="90" className="bg-neutral-900">1.5 hours</option>
                                    <option value="120" className="bg-neutral-900">2 hours</option>
                                    <option value="180" className="bg-neutral-900">3 hours</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newService.bookable}
                                    onChange={(e) => setNewService({ ...newService, bookable: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                                />
                                <span className="text-white/70 text-sm">Allow customers to book this service online</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => {
                                setIsAdding(false);
                                setNewService({ name: '', description: '', price: '', duration: '30', bookable: true });
                            }}
                            className="px-4 py-2 text-white/70 hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddService}
                            disabled={isSaving || !newService.name.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Add Service
                        </button>
                    </div>
                </div>
            )}

            {/* Services List */}
            {services.length === 0 ? (
                <div className="bg-white/5 rounded-xl border border-white/10 p-12 text-center">
                    <Package className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No services yet</h3>
                    <p className="text-white/50 text-sm mb-6">
                        Add your services to let customers know what you offer
                    </p>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                        <Plus className="h-4 w-4" />
                        Add Your First Service
                    </button>
                </div>
            ) : (
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {services.map((service) => (
                            <div key={service.id} className="p-4 hover:bg-white/5 transition">
                                {editingId === service.id ? (
                                    // Edit Mode
                                    <div className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    placeholder="Service name"
                                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                />
                                            </div>

                                            <div className="sm:col-span-2">
                                                <textarea
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    placeholder="Description"
                                                    rows={2}
                                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                                                />
                                            </div>

                                            <div>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                                    <input
                                                        type="number"
                                                        value={editForm.price}
                                                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                        placeholder="Price"
                                                        min="0"
                                                        step="0.01"
                                                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <select
                                                    value={editForm.duration}
                                                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                >
                                                    <option value="15" className="bg-neutral-900">15 minutes</option>
                                                    <option value="30" className="bg-neutral-900">30 minutes</option>
                                                    <option value="45" className="bg-neutral-900">45 minutes</option>
                                                    <option value="60" className="bg-neutral-900">1 hour</option>
                                                    <option value="90" className="bg-neutral-900">1.5 hours</option>
                                                    <option value="120" className="bg-neutral-900">2 hours</option>
                                                    <option value="180" className="bg-neutral-900">3 hours</option>
                                                </select>
                                            </div>

                                            <div className="sm:col-span-2">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.bookable}
                                                        onChange={(e) => setEditForm({ ...editForm, bookable: e.target.checked })}
                                                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                                                    />
                                                    <span className="text-white/70 text-sm">Allow online booking</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-4 py-2 text-white/70 hover:text-white transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4" />
                                                )}
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Display Mode
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            <GripVertical className="h-5 w-5 text-white/20" />
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-white">{service.name}</h4>
                                                        {service.bookable ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Bookable
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Not bookable
                                                            </span>
                                                        )}
                                                    </div>
                                                    {service.description && (
                                                        <p className="text-sm text-white/50 mt-1">{service.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="inline-flex items-center gap-1 text-sm text-white/70">
                                                            <DollarSign className="h-4 w-4" />
                                                            ${service.price.toFixed(2)}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 text-sm text-white/70">
                                                            <Clock className="h-4 w-4" />
                                                            {service.duration >= 60
                                                                ? `${Math.floor(service.duration / 60)}h${service.duration % 60 ? ` ${service.duration % 60}m` : ''}`
                                                                : `${service.duration}m`}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleBookable(service)}
                                                        className={`p-2 rounded-lg transition ${service.bookable
                                                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                                                : 'text-white/40 hover:bg-white/5'
                                                            }`}
                                                        title={service.bookable ? 'Disable booking' : 'Enable booking'}
                                                    >
                                                        <CheckCircle className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStartEdit(service)}
                                                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition"
                                                        title="Edit service"
                                                    >
                                                        <Edit2 className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(service.id)}
                                                        disabled={deletingId === service.id}
                                                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                                                        title="Delete service"
                                                    >
                                                        {deletingId === service.id ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <h4 className="text-sm font-medium text-purple-300 mb-2">Tips for better services</h4>
                <ul className="text-sm text-white/60 space-y-1">
                    <li>• Use clear, descriptive names that customers understand</li>
                    <li>• Include what&apos;s covered in the description</li>
                    <li>• Set accurate durations to manage your schedule</li>
                    <li>• Mark services as &quot;not bookable&quot; if you prefer to quote them</li>
                </ul>
            </div>
        </div>
    );
}
