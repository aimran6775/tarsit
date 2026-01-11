'use client';

import { useRegion } from '@/contexts/region-context';
import { Clock, RefreshCw } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currencyCode?: string;
  duration?: number;
  bookable: boolean;
  // Price conversion fields
  originalPrice?: number;
  originalCurrency?: string;
  convertedPrice?: number;
  targetCurrencyCode?: string;
  targetCurrencySymbol?: string;
  formattedPrice?: string;
  formattedConvertedPrice?: string;
}

interface ServicesListProps {
  services: Service[];
  appointmentsEnabled: boolean;
  onBookService: (serviceId: string) => void;
}

export function ServicesList({ services, appointmentsEnabled, onBookService }: ServicesListProps) {
  const { formatPrice, region } = useRegion();
  
  if (!services || services.length === 0) return null;

  // Check if any service has a different currency than user's region
  const hasConvertedPrices = services.some(s => s.formattedConvertedPrice);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Services</h2>
        {hasConvertedPrices && region && (
          <span className="text-xs text-white/40 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Prices converted to {region.defaultCurrency}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {services.map((service) => (
          <div 
            key={service.id} 
            className="flex items-start justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-white">{service.name}</h4>
                {service.bookable && appointmentsEnabled && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    Bookable
                  </span>
                )}
              </div>
              {service.description && (
                <p className="text-sm text-white/50 mt-1">{service.description}</p>
              )}
              {service.duration && (
                <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {service.duration} minutes
                </p>
              )}
            </div>
            <div className="text-right ml-4">
              {service.price !== undefined && service.price !== null && (
                <div className="space-y-1">
                  {/* Show converted price if available */}
                  {service.formattedConvertedPrice ? (
                    <>
                      <span className="font-semibold text-emerald-400">
                        {service.formattedConvertedPrice}
                      </span>
                      <span className="block text-xs text-white/40">
                        ({service.formattedPrice || `${service.currencyCode || 'USD'} ${service.price}`})
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-emerald-400">
                      {service.formattedPrice || formatPrice(service.price, service.currencyCode)}
                    </span>
                  )}
                </div>
              )}
              {service.bookable && appointmentsEnabled && (
                <button
                  onClick={() => onBookService(service.id)}
                  className="block mt-2 text-xs text-purple-400 font-medium hover:text-purple-300 transition-colors"
                >
                  Book this →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
