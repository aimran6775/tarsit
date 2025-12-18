'use client';

import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { BusinessDetail, BusinessHours } from '../types';

interface ContactInfoProps {
  business: BusinessDetail;
}

export function ContactInfo({ business }: ContactInfoProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h3 className="font-semibold text-white mb-4">Contact</h3>
      <div className="space-y-4">
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(
            `${business.addressLine1}, ${business.city}, ${business.state} ${business.zipCode}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 group"
        >
          <MapPin className="h-5 w-5 text-white/40 mt-0.5 group-hover:text-purple-400 transition-colors" />
          <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
            <p>{business.addressLine1}</p>
            {business.addressLine2 && <p>{business.addressLine2}</p>}
            <p>
              {business.city}, {business.state} {business.zipCode}
            </p>
          </div>
        </a>

        {business.showPhone !== false && (
          <a
            href={`tel:${business.phone}`}
            className="flex items-center gap-3 text-white/60 hover:text-white/80 transition-colors"
          >
            <Phone className="h-5 w-5 text-white/40" />
            <span className="text-sm">{business.phone}</span>
          </a>
        )}

        {business.email && business.showEmail !== false && (
          <a
            href={`mailto:${business.email}`}
            className="flex items-center gap-3 text-white/60 hover:text-white/80 transition-colors"
          >
            <Mail className="h-5 w-5 text-white/40" />
            <span className="text-sm">{business.email}</span>
          </a>
        )}

        {business.website && business.showWebsite !== false && (
          <a
            href={business.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-white/60 hover:text-white/80 transition-colors"
          >
            <Globe className="h-5 w-5 text-white/40" />
            <span className="text-sm">Visit Website</span>
          </a>
        )}
      </div>
    </div>
  );
}

interface BusinessHoursCardProps {
  hours: BusinessHours[];
}

export function BusinessHoursCard({ hours }: BusinessHoursCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <h3 className="font-semibold text-white mb-4">Business Hours</h3>
      {hours.length > 0 ? (
        <div className="space-y-2.5">
          {hours.map((h) => {
            const today = new Date().getDay();
            const isCurrentDay = h.dayOfWeek === today;
            return (
              <div
                key={h.dayOfWeek}
                className={`flex justify-between text-sm ${isCurrentDay ? 'font-medium' : ''}`}
              >
                <span className={isCurrentDay ? 'text-white' : 'text-white/50'}>
                  {h.dayName}
                  {isCurrentDay && (
                    <span className="ml-1.5 text-xs text-emerald-400 font-normal">Today</span>
                  )}
                </span>
                <span
                  className={`${
                    h.isClosed ? 'text-red-400' : isCurrentDay ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {h.isClosed ? 'Closed' : `${h.openTime} - ${h.closeTime}`}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-white/50">Hours not available</p>
      )}
    </div>
  );
}
