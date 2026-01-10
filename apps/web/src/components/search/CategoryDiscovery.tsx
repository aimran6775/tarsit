'use client';

import { Category, CATEGORY_ICONS } from './types';

interface CategoryDiscoveryProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  className?: string;
}

export function CategoryDiscovery({
  categories,
  selectedCategory,
  onSelectCategory,
  className = '',
}: CategoryDiscoveryProps) {
  const getCategoryIcon = (slug: string) => {
    return CATEGORY_ICONS[slug] || CATEGORY_ICONS.default;
  };

  return (
    <div className={`-mx-4 sm:mx-0 ${className}`}>
      {/* Horizontal scroll container for mobile */}
      <div className="flex gap-2 overflow-x-auto px-4 sm:px-0 pb-2 sm:pb-0 hide-scrollbar sm:flex-wrap">
        {/* All pill */}
        <button
          onClick={() => onSelectCategory('')}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-full text-sm transition-all whitespace-nowrap flex-shrink-0 active:scale-[0.97] ${
            !selectedCategory
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 active:bg-white/15 hover:text-white/80'
          }`}
        >
          <span>✨</span>
          <span>All</span>
        </button>

        {/* Category pills */}
        {categories.map((category) => {
          const icon = getCategoryIcon(category.slug);
          const isSelected = selectedCategory === category.slug;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.slug)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-full text-sm transition-all whitespace-nowrap flex-shrink-0 active:scale-[0.97] ${
                isSelected
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 active:bg-white/15 hover:text-white/80'
              }`}
            >
              <span className="text-base">{icon}</span>
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
