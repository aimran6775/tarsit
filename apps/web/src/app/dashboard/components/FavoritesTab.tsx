'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Building2 } from 'lucide-react';
import { Favorite } from '../types';

interface FavoritesTabProps {
  favorites: Favorite[];
  onRemoveFavorite: (favoriteId: string, businessId: string) => void;
}

export function FavoritesTab({ favorites, onRemoveFavorite }: FavoritesTabProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Saved Businesses</h2>
      
      {favorites.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-6 w-6 text-white/40" />
          </div>
          <h3 className="font-medium text-white mb-2">No favorites yet</h3>
          <p className="text-sm text-white/50 mb-6">Save businesses you love for quick access</p>
          <Link 
            href="/search"
            className="inline-flex px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
          >
            Explore Businesses
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden group">
              <Link href={`/business/${fav.business.slug}`}>
                <div className="relative h-32 bg-neutral-900">
                  {fav.business.coverImage ? (
                    <Image src={fav.business.coverImage} alt="" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                      <Building2 className="h-10 w-10 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/business/${fav.business.slug}`} className="font-semibold text-white hover:text-purple-400 transition-colors">
                      {fav.business.name}
                    </Link>
                    <p className="text-sm text-white/50">{fav.business.category?.name}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFavorite(fav.id, fav.business.id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-white/60">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    {fav.business.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/50">{fav.business.city}, {fav.business.state}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
