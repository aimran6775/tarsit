'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { InteractiveRating } from './StarRating';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { uploadApi, validateImageFile } from '@/lib/api/upload.api';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  onReviewSubmitted?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  businessId,
  businessName,
  onReviewSubmitted,
}: ReviewModalProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
      } else {
        validFiles.push(file);
      }
    }
    
    // Limit to 5 photos
    const newPhotos = [...photos, ...validFiles].slice(0, 5);
    setPhotos(newPhotos);
    
    // Revoke old URLs to prevent memory leaks
    photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    
    // Create new preview URLs
    const newUrls = newPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviewUrls(newUrls);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    
    // Revoke the old URL to prevent memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    const newUrls = photoPreviewUrls.filter((_, i) => i !== index);
    setPhotoPreviewUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!isAuthenticated) {
      setError('Please log in to submit a review');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photos first if any
      const uploadedPhotoUrls: string[] = [];
      
      if (photos.length > 0) {
        for (const photo of photos) {
          try {
            const uploaded = await uploadApi.uploadImage(photo, 'reviews');
            uploadedPhotoUrls.push(uploaded.secureUrl);
          } catch (uploadError) {
            console.error('Photo upload error:', uploadError);
            // Continue with other photos if one fails
          }
        }
      }

      // Submit review with photos
      const reviewData = {
        businessId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        photos: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : undefined,
      };

      await apiClient.post('/reviews', reviewData);

      setSubmitted(true);
      toast.success('Review submitted!', {
        description: 'Thank you for your feedback.',
      });

      // Reset form after brief delay
      setTimeout(() => {
        onReviewSubmitted?.();
        onClose();
        // Reset state
        setRating(0);
        setTitle('');
        setComment('');
        setPhotos([]);
        setPhotoPreviewUrls([]);
        setSubmitted(false);
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error?.response?.data?.message || error?.message || 'Failed to submit review';
      setError(message);
      toast.error('Failed to submit review', { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Clean up photo URLs
      photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50"
          >
            <div className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-semibold text-white">Write a Review</h2>
                  <p className="text-sm text-white/50 mt-1">{businessName}</p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>

              {/* Content */}
              {submitted ? (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">Thank you!</h3>
                  <p className="text-white/60">Your review has been submitted.</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Login Required</h3>
                  <p className="text-white/60 mb-4">Please log in to write a review.</p>
                  <a
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Log In
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-3">
                      Your Rating
                    </label>
                    <InteractiveRating rating={rating} onRatingChange={setRating} />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Review Title <span className="text-white/40">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      placeholder="Sum up your experience"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                    />
                    <p className="text-xs text-white/40 mt-1 text-right">{title.length}/100</p>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Your Review <span className="text-white/40">(optional)</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={2000}
                      rows={4}
                      placeholder="Share details about your experience..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-white/40 mt-1 text-right">{comment.length}/2000</p>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Add Photos <span className="text-white/40">(optional, max 5)</span>
                    </label>
                    
                    {/* Photo Previews */}
                    {photoPreviewUrls.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {photoPreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Photo ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-white/10"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {photos.length < 5 && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-dashed border-white/20 rounded-xl text-white/50 hover:text-white hover:border-white/40 transition-colors w-full justify-center"
                        >
                          <ImageIcon className="h-5 w-5" />
                          <span>Add Photos</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Star className="h-5 w-5" />
                        Submit Review
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ReviewModal;
