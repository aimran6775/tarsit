'use client';

import { SimpleMap } from '@/components/map';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/businesses/${slug}`);
        setBusiness(response.data);

        // Check if favorited
        if (isAuthenticated) {
          try {
            const favResponse = await apiClient.get(
              `/favorites/check/business/${response.data.id}`
            );
            setIsFavorited(favResponse.data.isFavorited);
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
          setBusinessHours(formattedHours);
        } catch {
          // Ignore hours fetch errors
        }
      } catch (err) {
        console.error('Failed to fetch business:', err);
        setError('Failed to load business details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBusiness();
    }
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
      console.error('Failed to book appointment:', err);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!business || !chatMessage.trim()) return;

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/business/${slug}`);
      return;
    }

    setIsSendingMessage(true);
    try {
      // First check if chat exists
      const chatsResponse = await apiClient.get('/chats');
      const existingChat = chatsResponse.data?.find?.(
        (c: { businessId: string }) => c.businessId === business.id
      );

      let chatId;
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        // Create new chat
        const newChatResponse = await apiClient.post('/chats', { businessId: business.id });
        chatId = newChatResponse.data.id;
      }

      // Send message
      await apiClient.post('/messages', {
        chatId,
        content: chatMessage,
      });

      setShowChatModal(false);
      setChatMessage('');
      router.push('/messages');
    } catch (err) {
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
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleBookService = (serviceId: string) => {
    setSelectedService(serviceId);
    setShowBookingModal(true);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !business) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <BusinessHero
        business={business}
        isFavorited={isFavorited}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions - Mobile */}
            <MobileActions
              appointmentsEnabled={business.appointmentsEnabled}
              onOpenBooking={() => setShowBookingModal(true)}
              onOpenChat={() => setShowChatModal(true)}
            />

            {/* About */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">About</h2>
              <p className="text-white/70 leading-relaxed">{business.description}</p>
            </div>

            {/* Photo Gallery */}
            <PhotoGallery photos={business.photos || []} businessName={business.name} />

            {/* Services */}
            {business.showServices !== false && (
              <ServicesList
                services={business.services || []}
                appointmentsEnabled={business.appointmentsEnabled}
                onBookService={handleBookService}
              />
            )}

            {/* Reviews */}
            {business.showReviews !== false && (
              <ReviewsList
                reviews={business.reviews || []}
                rating={business.rating}
                reviewCount={business.reviewCount}
                businessId={business.id}
                businessName={business.name}
                businessOwnerId={business.owner?.id}
                onReviewAdded={async () => {
                  // Refetch business data to get updated reviews
                  try {
                    const response = await apiClient.get(`/businesses/${slug}`);
                    setBusiness(response.data);
                  } catch {
                    // Ignore errors - user will see stale data until refresh
                  }
                }}
              />
            )}

            {/* Location Map */}
            {business.latitude && business.longitude && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Location</h2>
                <SimpleMap
                  latitude={business.latitude}
                  longitude={business.longitude}
                  businessName={business.name}
                  height="400px"
                  interactive={true}
                  showMarker={true}
                />
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-sm text-white/70 mb-1">
                    {business.addressLine1}
                    {business.addressLine2 && `, ${business.addressLine2}`}
                  </p>
                  <p className="text-sm text-white/70">
                    {business.city}, {business.state} {business.zipCode}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions - Desktop */}
            <ActionsSidebar
              business={business}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              onOpenBooking={() => setShowBookingModal(true)}
              onOpenChat={() => setShowChatModal(true)}
            />

            {/* Contact Info */}
            <ContactInfo business={business} />

            {/* Business Hours */}
            {business.showHours !== false && <BusinessHoursCard hours={businessHours} />}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
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

      {/* Chat Modal */}
      <ChatModal
        businessName={business.name}
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        message={chatMessage}
        setMessage={setChatMessage}
        isSending={isSendingMessage}
        onSend={handleSendMessage}
      />
    </div>
  );
}
