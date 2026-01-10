'use client';

import { Calendar, Check, Loader2, X } from 'lucide-react';
import { BusinessDetail, TimeSlot } from '../types';

interface BookingModalProps {
  business: BusinessDetail;
  isOpen: boolean;
  onClose: () => void;
  bookingSuccess: boolean;
  selectedService: string | null;
  setSelectedService: (id: string | null) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  availableSlots: TimeSlot[];
  loadingSlots: boolean;
  selectedSlot: string | null;
  setSelectedSlot: (slot: string | null) => void;
  bookingNotes: string;
  setBookingNotes: (notes: string) => void;
  isBooking: boolean;
  onBook: () => void;
}

export function BookingModal({
  business,
  isOpen,
  onClose,
  bookingSuccess,
  selectedService,
  setSelectedService,
  selectedDate,
  setSelectedDate,
  availableSlots,
  loadingSlots,
  selectedSlot,
  setSelectedSlot,
  bookingNotes,
  setBookingNotes,
  isBooking,
  onBook,
}: BookingModalProps) {
  if (!isOpen) return null;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-neutral-900 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-slide-in-up sm:animate-fade-in">
        {/* Header - Larger touch targets */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white">Book Appointment</h3>
            <p className="text-sm text-white/50">{business.name}</p>
          </div>
          <button
            onClick={onClose}
            className="h-11 w-11 sm:h-10 sm:w-10 rounded-full hover:bg-white/10 active:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>

        {bookingSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">Booking Requested!</h4>
            <p className="text-white/50">
              The business will confirm your appointment soon. You'll receive an email notification.
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[55vh] sm:max-h-[60vh]">
            {/* Service Selection */}
            {business.services && business.services.filter((s) => s.bookable).length > 0 && (
              <div className="mb-5 sm:mb-6">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Select Service
                </label>
                <div className="space-y-2">
                  {business.services
                    .filter((s) => s.bookable)
                    .map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`w-full p-4 rounded-xl border text-left transition-colors ${
                          selectedService === service.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-white">{service.name}</p>
                            {service.duration && (
                              <p className="text-xs text-white/50 mt-1">{service.duration} min</p>
                            )}
                          </div>
                          {service.price && (
                            <span className="font-semibold text-emerald-400">${service.price}</span>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-2">Select Date</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getNext7Days().map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                    className={`flex-shrink-0 w-16 py-3 rounded-xl border text-center transition-colors ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <p
                      className={`text-xs font-medium ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'text-purple-300'
                          : 'text-white/50'
                      }`}
                    >
                      {isToday(date)
                        ? 'Today'
                        : date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-semibold mt-0.5 text-white">{date.getDate()}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/70 mb-2">Select Time</label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="relative w-8 h-8">
                      <div className="w-8 h-8 rounded-full border-2 border-white/10"></div>
                      <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                    </div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => slot.available && setSelectedSlot(slot.start)}
                        disabled={!slot.available}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedSlot === slot.start
                            ? 'bg-purple-500 text-white'
                            : slot.available
                              ? 'border border-white/10 text-white/70 hover:border-white/20 bg-white/5'
                              : 'bg-white/5 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        {formatTime(slot.start)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/50 text-center py-4">
                    No available slots for this date
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Any special requests or notes..."
                className="w-full px-4 py-3 border border-white/10 bg-white/5 rounded-xl text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                rows={3}
              />
            </div>

            {/* Book Button - Larger touch target for mobile */}
            <button
              onClick={onBook}
              disabled={!selectedSlot || isBooking}
              className="w-full h-14 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-base sm:text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 active:from-purple-700 active:to-indigo-700 disabled:from-neutral-700 disabled:to-neutral-700 disabled:text-white/30 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isBooking ? (
                <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <>
                  <Calendar className="h-5 w-5 sm:h-4 sm:w-4" />
                  Request Appointment
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
