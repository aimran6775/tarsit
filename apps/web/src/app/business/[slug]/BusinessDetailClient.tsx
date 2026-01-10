'use client';

import { DynamicSimpleMap } from '@/components/map';
import { useAuth } from '@/contexts/auth-context';
import { useMessages } from '@/contexts/messages-context';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
    ActionsSidebar,
    BookingModal,
    BusinessHero,
    BusinessHoursCard,
    ChatModal,
    ContactInfo,
    ErrorState,
    LoadingState,
    MobileActions,
    PhotoGallery,
    ReviewsList,
    ServicesList,
} from './components';
import { BusinessDetail, BusinessHours, TimeSlot } from './types';

type Props = {
  slug: string;
  initialBusiness?: BusinessDetail | null;
  initialBusinessHours?: BusinessHours[];
};

export default function BusinessDetailClient({
  slug,
  initialBusiness,
  initialBusinessHours,
}: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { openChat } = useMessages();

  const [business, setBusiness] = useState<BusinessDetail | null>(initialBusiness ?? null);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(initialBusinessHours ?? []);
  const [loading, setLoading] = useState<boolean>(!initialBusiness);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Chat state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Fetch business data (client refresh / navigation)
  useEffect(() => {
    let cancelled = false;

    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/businesses/slug/${slug}`);
        if (cancelled) return;
        setBusiness(response.data);

        // Check if favorited
        if (isAuthenticated) {
          try {
            const favResponse = await apiClient.get(
              `/favorites/check/business/${response.data.id}`
            );
            if (!cancelled) setIsFavorited(favResponse.data.isFavorited);
          } catch {
            // Ignore favorite check errors
          }
        }

        // Fetch business hours
        try {
          const hoursResponse = await apiClient.get(`/business-hours/${response.data.id}`);
          const daysOfWeek = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ];
          const formattedHours = hoursResponse.data.map(
            (h: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }) => ({
              ...h,
              dayName: daysOfWeek[h.dayOfWeek],
            })
          );
          if (!cancelled) setBusinessHours(formattedHours);
        } catch {
          // Ignore hours fetch errors
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch business:', err);
        if (!cancelled) setError('Failed to load business details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (slug) {
      fetchBusiness();
    }

    return () => {
      cancelled = true;
    };
  }, [slug, isAuthenticated]);

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !business) return;

      setLoadingSlots(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await apiClient.get(
          `/appointments/available-slots/${business.id}?date=${dateStr}`
        );
        setAvailableSlots(response.data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, business]);

  const handleBookAppointment = async () => {
    if (!business || !selectedSlot) return;

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/business/${slug}`);
      return;
    }

    setIsBooking(true);
    try {
      await apiClient.post('/appointments', {
        businessId: business.id,
        serviceId: selectedService,
        startTime: selectedSlot,
        notes: bookingNotes,
      });
      setBookingSuccess(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to book appointment:', err);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!business || !chatMessage.trim()) return;
    if (business.messagingEnabled === false) return;

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/business/${slug}`);
      return;
    }

    setIsSendingMessage(true);
    try {
      // Create chat or return existing (API handles idempotency)
      const chatResponse = await apiClient.post('/chats', { businessId: business.id });
      const chatId: string | undefined = chatResponse.data?.id;
      if (!chatId) {
        throw new Error('Failed to open chat');
      }

      // Send message
      await apiClient.post('/messages', {
        chatId,
        content: chatMessage.trim(),
      });

      setShowChatModal(false);
      setChatMessage('');

      // Open the messages widget with this chat
      openChat(chatId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/business/${slug}`);
      return;
    }

    if (!business) return;

    try {
      if (isFavorited) {
        await apiClient.delete(`/favorites/business/${business.id}`);
      } else {
        await apiClient.post('/favorites', { businessId: business.id });
      }
      setIsFavorited(!isFavorited);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleBookService = (serviceId: string) => {
    setSelectedService(serviceId);
    setShowBookingModal(true);
  };

  const sectionOrder = useMemo(() => {
    const defaultOrder = ['about', 'photos', 'services', 'reviews', 'location'] as const;
    type SectionKey = (typeof defaultOrder)[number];

    const raw =
      business && Array.isArray(business.publicPageSectionOrder)
        ? business.publicPageSectionOrder
        : [];
    const sanitized = raw.filter((k): k is SectionKey =>
      ['about', 'photos', 'services', 'reviews', 'location'].includes(String(k))
    );
    const unique = Array.from(new Set(sanitized));
    const missing = defaultOrder.filter((k) => !unique.includes(k));
    return [...unique, ...missing];
  }, [business?.publicPageSectionOrder]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !business) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <BusinessHero
        business={business}
        isFavorited={isFavorited}
        onToggleFavorite={handleToggleFavorite}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <MobileActions
              appointmentsEnabled={business.appointmentsEnabled}
              messagingEnabled={business.messagingEnabled !== false}
              primaryCta={business.publicPagePrimaryCta}
              onOpenBooking={() => setShowBookingModal(true)}
              onOpenChat={() => {
                if (business.messagingEnabled === false) return;
                setShowChatModal(true);
              }}
            />

            {sectionOrder.map((section) => {
              switch (section) {
                case 'about':
                  return business.showAbout !== false ? (
                    <div
                      key="about"
                      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                    >
                      <h2 className="text-lg font-semibold text-white mb-4">About</h2>
                      <p className="text-white/70 leading-relaxed">{business.description}</p>
                    </div>
                  ) : null;

                case 'photos':
                  return business.showPhotos !== false ? (
                    <PhotoGallery
                      key="photos"
                      photos={business.photos || []}
                      businessName={business.name}
                    />
                  ) : null;

                case 'services':
                  return business.showServices !== false ? (
                    <ServicesList
                      key="services"
                      services={business.services || []}
                      appointmentsEnabled={business.appointmentsEnabled}
                      onBookService={handleBookService}
                    />
                  ) : null;

                case 'reviews':
                  return business.showReviews !== false ? (
                    <ReviewsList
                      key="reviews"
                      reviews={business.reviews || []}
                      rating={business.rating}
                      reviewCount={business.reviewCount}
                      businessId={business.id}
                      businessName={business.name}
                      businessOwnerId={business.owner?.id}
                      onReviewAdded={async () => {
                        try {
                          const response = await apiClient.get(`/businesses/slug/${slug}`);
                          setBusiness(response.data);
                        } catch {
                          // Ignore errors - user will see stale data until refresh
                        }
                      }}
                    />
                  ) : null;

                case 'location':
                  return business.showMap !== false && business.latitude && business.longitude ? (
                    <div
                      key="location"
                      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                    >
                      <h2 className="text-lg font-semibold text-white mb-4">Location</h2>
                      <DynamicSimpleMap
                        latitude={business.latitude}
                        longitude={business.longitude}
                        businessName={business.name}
                        height="400px"
                        interactive={true}
                        showMarker={true}
                      />
                      {business.showAddress !== false && (
                        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-sm text-white/70 mb-1">
                            {business.addressLine1}
                            {business.addressLine2 && `, ${business.addressLine2}`}
                          </p>
                          <p className="text-sm text-white/70">
                            {business.city}, {business.state} {business.zipCode}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : null;

                default:
                  return null;
              }
            })}
          </div>

          <div className="space-y-4">
            <ActionsSidebar
              business={business}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              onOpenBooking={() => setShowBookingModal(true)}
              onOpenChat={() => {
                if (business.messagingEnabled === false) return;
                setShowChatModal(true);
              }}
              primaryCta={business.publicPagePrimaryCta}
            />

            <ContactInfo business={business} />

            {business.showHours !== false && <BusinessHoursCard hours={businessHours} />}
          </div>
        </div>
      </div>

      <BookingModal
        business={business}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        bookingSuccess={bookingSuccess}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        availableSlots={availableSlots}
        loadingSlots={loadingSlots}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        bookingNotes={bookingNotes}
        setBookingNotes={setBookingNotes}
        isBooking={isBooking}
        onBook={handleBookAppointment}
      />

      {business.messagingEnabled !== false && (
        <ChatModal
          businessName={business.name}
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          message={chatMessage}
          setMessage={setChatMessage}
          isSending={isSendingMessage}
          onSend={handleSendMessage}
        />
      )}
    </div>
  );
}
