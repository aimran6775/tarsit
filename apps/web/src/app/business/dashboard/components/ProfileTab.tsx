'use client';

import { useState, useEffect } from 'react';
import {
    Save,
    Loader2,
    MapPin,
    Phone,
    Globe,
    Mail,
    Building2,
    FileText,
    Tag,
    AlertTriangle,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface BusinessProfileData {
    name: string;
    description: string;
    tagline: string;
    categoryId: string;
    phone: string;
    email: string;
    website: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    priceRange: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
}

interface ProfileTabProps {
    business: {
        id: string;
        name: string;
        description?: string;
        tagline?: string;
        categoryId: string;
        phone?: string;
        email?: string;
        website?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        priceRange?: 'BUDGET' | 'MODERATE' | 'EXPENSIVE';
    };
    onBusinessUpdated: () => void;
}

export function ProfileTab({ business, onBusinessUpdated }: ProfileTabProps) {
    const [formData, setFormData] = useState<BusinessProfileData>({
        name: business.name || '',
        description: business.description || '',
        tagline: business.tagline || '',
        categoryId: business.categoryId || '',
        phone: business.phone || '',
        email: business.email || '',
        website: business.website || '',
        addressLine1: business.addressLine1 || '',
        addressLine2: business.addressLine2 || '',
        city: business.city || '',
        state: business.state || '',
        zipCode: business.zipCode || '',
        country: business.country || '',
        priceRange: business.priceRange || 'MODERATE',
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await apiClient.get('/categories');
                setCategories(res.data || []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Detect changes
    useEffect(() => {
        const changed =
            formData.name !== (business.name || '') ||
            formData.description !== (business.description || '') ||
            formData.tagline !== (business.tagline || '') ||
            formData.categoryId !== (business.categoryId || '') ||
            formData.phone !== (business.phone || '') ||
            formData.email !== (business.email || '') ||
            formData.website !== (business.website || '') ||
            formData.addressLine1 !== (business.addressLine1 || '') ||
            formData.addressLine2 !== (business.addressLine2 || '') ||
            formData.city !== (business.city || '') ||
            formData.state !== (business.state || '') ||
            formData.zipCode !== (business.zipCode || '') ||
            formData.country !== (business.country || '') ||
            formData.priceRange !== (business.priceRange || 'MODERATE');

        setHasChanges(changed);
    }, [formData, business]);

    // Handle save
    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Business name is required');
            return;
        }

        setIsSaving(true);
        try {
            await apiClient.patch(`/businesses/${business.id}`, {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                tagline: formData.tagline.trim() || null,
                categoryId: formData.categoryId || undefined,
                phone: formData.phone.trim() || null,
                email: formData.email.trim() || null,
                website: formData.website.trim() || null,
                addressLine1: formData.addressLine1.trim() || null,
                addressLine2: formData.addressLine2.trim() || null,
                city: formData.city.trim() || null,
                state: formData.state.trim() || null,
                zipCode: formData.zipCode.trim() || null,
                country: formData.country.trim() || null,
                priceRange: formData.priceRange,
            });

            toast.success('Business profile updated');
            setHasChanges(false);
            onBusinessUpdated();
        } catch (error) {
            console.error('Failed to update business:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Unsaved Changes Warning */}
            {hasChanges && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-200">You have unsaved changes</p>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-black rounded-lg text-sm font-medium hover:bg-amber-400 transition disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            )}

            {/* Basic Information */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                        <p className="text-sm text-white/50">Your business identity</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Business Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your business name"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Tagline
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
                            <input
                                type="text"
                                value={formData.tagline}
                                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                placeholder="A short catchy phrase about your business"
                                maxLength={100}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                        <p className="text-xs text-white/40 mt-1">{formData.tagline.length}/100 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Description
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tell customers about your business, what you do, and what makes you special..."
                                rows={5}
                                maxLength={2000}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                            />
                        </div>
                        <p className="text-xs text-white/40 mt-1">{formData.description.length}/2000 characters</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Category
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                            >
                                <option value="" className="bg-neutral-900">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-neutral-900">
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Price Range
                            </label>
                            <select
                                value={formData.priceRange}
                                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value as 'BUDGET' | 'MODERATE' | 'EXPENSIVE' })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                            >
                                <option value="BUDGET" className="bg-neutral-900">$ - Budget Friendly</option>
                                <option value="MODERATE" className="bg-neutral-900">$$ - Moderate</option>
                                <option value="EXPENSIVE" className="bg-neutral-900">$$$ - Premium</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                        <p className="text-sm text-white/50">How customers can reach you</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 (555) 123-4567"
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contact@business.com"
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Website
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-3.5 h-4 w-4 text-white/40" />
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://www.yourbusiness.com"
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Location</h3>
                        <p className="text-sm text-white/50">Your business address</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Street Address
                        </label>
                        <input
                            type="text"
                            value={formData.addressLine1}
                            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                            placeholder="123 Main Street"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Address Line 2
                        </label>
                        <input
                            type="text"
                            value={formData.addressLine2}
                            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                            placeholder="Suite, Floor, Unit (optional)"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                City
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="City"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                State/Province
                            </label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                placeholder="State"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                ZIP/Postal Code
                            </label>
                            <input
                                type="text"
                                value={formData.zipCode}
                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                placeholder="12345"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Country
                            </label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                placeholder="Country"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Save className="h-5 w-5" />
                    )}
                    Save Profile
                </button>
            </div>
        </div>
    );
}
