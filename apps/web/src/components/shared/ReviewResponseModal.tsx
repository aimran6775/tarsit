'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Loader2, CheckCircle, Star } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface ReviewResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  reviewerName: string;
  reviewRating: number;
  reviewComment?: string;
  existingResponse?: string;
  onResponseSubmitted?: () => void;
}

export function ReviewResponseModal({
  isOpen,
  onClose,
  reviewId,
  reviewerName,
  reviewRating,
  reviewComment,
  existingResponse,
  onResponseSubmitted,
}: ReviewResponseModalProps) {
  const [response, setResponse] = useState(existingResponse || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post(`/reviews/${reviewId}/respond`, { response: response.trim() });

      setSubmitted(true);
      toast.success('Response posted!');

      setTimeout(() => {
        onResponseSubmitted?.();
        onClose();
        setSubmitted(false);
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error?.response?.data?.message || 'Failed to post response';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
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
                  <h2 className="text-xl font-semibold text-white">
                    {existingResponse ? 'Edit Response' : 'Respond to Review'}
                  </h2>
                  <p className="text-sm text-white/50 mt-1">From {reviewerName}</p>
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
                  <h3 className="text-lg font-semibold text-white mb-2">Response Posted!</h3>
                  <p className="text-white/60">Your response is now visible to customers.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Original Review Preview */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < reviewRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-white/50">{reviewerName}</span>
                    </div>
                    {reviewComment && (
                      <p className="text-sm text-white/60 line-clamp-3">{reviewComment}</p>
                    )}
                  </div>

                  {/* Response Input */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Your Response
                    </label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      maxLength={1000}
                      rows={5}
                      placeholder="Thank the customer and address their feedback professionally..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-white/40 mt-1 text-right">{response.length}/1000</p>
                  </div>

                  {/* Tips */}
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-sm text-purple-300 font-medium mb-2">💡 Tips for responding:</p>
                    <ul className="text-xs text-white/60 space-y-1">
                      <li>• Thank the customer for their feedback</li>
                      <li>• Be professional and courteous</li>
                      <li>• Address specific concerns mentioned</li>
                      <li>• Invite them back if appropriate</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !response.trim()}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-5 w-5" />
                        {existingResponse ? 'Update Response' : 'Post Response'}
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

export default ReviewResponseModal;
