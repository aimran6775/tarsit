'use client';

import {
    Scissors,
    UtensilsCrossed,
    Car,
    Home,
    Dumbbell,
    Briefcase,
    ShoppingBag,
    Theater,
    GraduationCap,
    Stethoscope,
    Wrench,
    Camera,
    Music,
    Palette,
    Coffee,
    Wine,
    Plane,
    Hotel,
    PawPrint,
    Baby,
    Sparkles,
    Building2,
    Heart,
    Leaf,
    Zap,
    type LucideIcon,
} from 'lucide-react';

// Category icon mapping - elegant Lucide icons
export const categoryIcons: Record<string, LucideIcon> = {
    // Beauty & Personal Care
    'beauty-spas': Sparkles,
    'beauty-wellness': Sparkles,
    'beauty-spa': Sparkles,
    'hair-salons': Scissors,
    'salons': Scissors,

    // Food & Dining
    'restaurants': UtensilsCrossed,
    'food-dining': UtensilsCrossed,
    'food': UtensilsCrossed,
    'dining': UtensilsCrossed,
    'cafes': Coffee,
    'bars': Wine,

    // Automotive
    'auto-services': Car,
    'automotive': Car,
    'auto': Car,

    // Home Services
    'home-services': Home,
    'home': Home,
    'contractors': Wrench,
    'plumbing': Wrench,
    'electrical': Zap,
    'cleaning': Sparkles,

    // Health & Fitness
    'health-medical': Stethoscope,
    'healthcare': Stethoscope,
    'medical': Stethoscope,
    'fitness': Dumbbell,
    'fitness-health': Dumbbell,
    'health-fitness': Dumbbell,
    'gym': Dumbbell,
    'wellness': Heart,

    // Professional Services
    'professional-services': Briefcase,
    'professional': Briefcase,
    'legal': Briefcase,
    'financial': Briefcase,

    // Shopping & Retail
    'shopping': ShoppingBag,
    'retail': ShoppingBag,

    // Entertainment
    'entertainment': Theater,
    'arts-entertainment': Theater,
    'events': Theater,
    'nightlife': Music,

    // Education
    'education': GraduationCap,
    'tutoring': GraduationCap,
    'schools': GraduationCap,

    // Other Services
    'photography': Camera,
    'art': Palette,
    'travel': Plane,
    'hotels': Hotel,
    'pet-services': PawPrint,
    'pets': PawPrint,
    'childcare': Baby,
    'kids': Baby,
    'eco': Leaf,
    'technology': Zap,
};

// Default icon for unknown categories
export const defaultCategoryIcon = Building2;

// Get icon for a category slug
export function getCategoryIcon(slug: string): LucideIcon {
    return categoryIcons[slug.toLowerCase()] || defaultCategoryIcon;
}

// Category icon component with consistent styling
interface CategoryIconProps {
    slug: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
};

export function CategoryIcon({ slug, className = '', size = 'md' }: CategoryIconProps) {
    const Icon = getCategoryIcon(slug);
    return <Icon className={`${sizeClasses[size]} ${className}`} />;
}

// Category card icon with background
interface CategoryCardIconProps {
    slug: string;
    className?: string;
}

export function CategoryCardIcon({ slug, className = '' }: CategoryCardIconProps) {
    const Icon = getCategoryIcon(slug);
    return (
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center ${className}`}>
            <Icon className="h-6 w-6 text-purple-400" />
        </div>
    );
}
