'use client';

import { Clock } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  bookable: boolean;
}

interface ServicesListProps {
  services: Service[];
  appointmentsEnabled: boolean;
  onBookService: (serviceId: string) => void;
}

export function ServicesList({ services, appointmentsEnabled, onBookService }: ServicesListProps) {
  if (!services || services.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Services</h2>
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
                <span className="font-semibold text-emerald-400">
                  ${service.price}
                </span>
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
