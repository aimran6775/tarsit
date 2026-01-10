'use client';

import { useState } from 'react';
import { 
  FolderTree, Plus, Edit2, Trash2, Search, X,
  ChevronDown, ChevronRight, GripVertical
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
  businessCount: number;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
}

interface CategoriesTabProps {
  categories: Category[];
  onAddCategory: (category: Partial<Category>) => void;
  onEditCategory: (id: string, data: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategory: (id: string, newOrder: number) => void;
}

export function CategoriesTab({
  categories = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReorderCategory: _onReorderCategory,
}: CategoriesTabProps) {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    parentId: '',
  });

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = () => {
    onAddCategory({
      name: newCategory.name,
      slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      description: newCategory.description,
      icon: newCategory.icon,
      parentId: newCategory.parentId || undefined,
    });
    setNewCategory({ name: '', slug: '', description: '', icon: '', parentId: '' });
    setShowAddModal(false);
  };

  const handleEditCategory = () => {
    if (editingCategory) {
      onEditCategory(editingCategory.id, editingCategory);
      setEditingCategory(null);
    }
  };

  // Sample data for demo
  const sampleCategories: Category[] = categories.length > 0 ? categories : [
    {
      id: '1',
      name: 'Restaurants',
      slug: 'restaurants',
      description: 'Food and dining establishments',
      businessCount: 245,
      isActive: true,
      sortOrder: 1,
      children: [
        { id: '1a', name: 'Fast Food', slug: 'fast-food', businessCount: 89, isActive: true, sortOrder: 1 },
        { id: '1b', name: 'Fine Dining', slug: 'fine-dining', businessCount: 34, isActive: true, sortOrder: 2 },
        { id: '1c', name: 'Cafes', slug: 'cafes', businessCount: 67, isActive: true, sortOrder: 3 },
      ],
    },
    {
      id: '2',
      name: 'Health & Wellness',
      slug: 'health-wellness',
      description: 'Health and fitness services',
      businessCount: 156,
      isActive: true,
      sortOrder: 2,
      children: [
        { id: '2a', name: 'Gyms', slug: 'gyms', businessCount: 45, isActive: true, sortOrder: 1 },
        { id: '2b', name: 'Spas', slug: 'spas', businessCount: 28, isActive: true, sortOrder: 2 },
        { id: '2c', name: 'Yoga Studios', slug: 'yoga-studios', businessCount: 19, isActive: true, sortOrder: 3 },
      ],
    },
    {
      id: '3',
      name: 'Home Services',
      slug: 'home-services',
      description: 'Services for home maintenance',
      businessCount: 198,
      isActive: true,
      sortOrder: 3,
      children: [
        { id: '3a', name: 'Plumbing', slug: 'plumbing', businessCount: 56, isActive: true, sortOrder: 1 },
        { id: '3b', name: 'Electrical', slug: 'electrical', businessCount: 42, isActive: true, sortOrder: 2 },
        { id: '3c', name: 'Cleaning', slug: 'cleaning', businessCount: 78, isActive: true, sortOrder: 3 },
      ],
    },
    {
      id: '4',
      name: 'Beauty & Personal Care',
      slug: 'beauty-personal-care',
      description: 'Beauty and grooming services',
      businessCount: 312,
      isActive: true,
      sortOrder: 4,
    },
    {
      id: '5',
      name: 'Professional Services',
      slug: 'professional-services',
      description: 'Business and professional services',
      businessCount: 167,
      isActive: true,
      sortOrder: 5,
    },
  ];

  const filteredCategories = sampleCategories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <div
          className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors group"
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          <GripVertical className="h-4 w-4 text-white/20 cursor-grab" />
          
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-1 rounded hover:bg-white/10"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-white/50" />
              ) : (
                <ChevronRight className="h-4 w-4 text-white/50" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{category.name}</span>
              <span className="text-xs text-white/40">/{category.slug}</span>
              {!category.isActive && (
                <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                  Inactive
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-white/50 mt-0.5">{category.description}</p>
            )}
          </div>

          <div className="text-right">
            <span className="text-sm text-white/70">{category.businessCount}</span>
            <p className="text-xs text-white/40">businesses</p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditingCategory(category)}
              className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeleteCategory(category.id)}
              className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-white/10 ml-10">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">{sampleCategories.length}</p>
          <p className="text-sm text-white/50">Main Categories</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">
            {sampleCategories.reduce((acc, cat) => acc + (cat.children?.length || 0), 0)}
          </p>
          <p className="text-sm text-white/50">Subcategories</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-white">
            {sampleCategories.reduce((acc, cat) => acc + cat.businessCount, 0)}
          </p>
          <p className="text-sm text-white/50">Total Businesses</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <p className="text-2xl font-bold text-emerald-400">
            {sampleCategories.filter(cat => cat.isActive).length}
          </p>
          <p className="text-sm text-white/50">Active Categories</p>
        </div>
      </div>

      {/* Categories Tree */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FolderTree className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold text-white">Category Hierarchy</h3>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <FolderTree className="h-16 w-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/50">No categories found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredCategories.map(category => renderCategory(category))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-neutral-900 rounded-2xl border border-white/10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add New Category</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Slug</label>
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="category-slug (auto-generated if empty)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Parent Category</label>
                <select
                  value={newCategory.parentId}
                  onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="" className="bg-neutral-900">No Parent (Root Category)</option>
                  {sampleCategories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-neutral-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.name}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingCategory(null)}
          />
          <div className="relative bg-neutral-900 rounded-2xl border border-white/10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Edit Category</h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Slug</label>
                <input
                  type="text"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                <textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">Active Status</label>
                <button
                  onClick={() => setEditingCategory({ ...editingCategory, isActive: !editingCategory.isActive })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    editingCategory.isActive ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      editingCategory.isActive ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingCategory(null)}
                className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
