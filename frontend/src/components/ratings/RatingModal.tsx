import React, { useState } from 'react';
import { Star, CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  counterpartyName?: string;
  onSuccess?: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  bookingId = 'BK-2026-904',
  counterpartyName = 'Ganesh Transporter',
  onSuccess
}) => {
  const { t } = useLanguage();
  const [overallRating, setOverallRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [cargoCareRating, setCargoCareRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [comment, setComment] = useState('Excellent shared trip! Arrived on time and handled perishable crates carefully.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('gramroute_access_token') || '';
      const response = await fetch('/api/v1/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId,
          overallRating,
          punctualityRating,
          cargoCareRating,
          communicationRating,
          comment
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error?.message || 'Failed to submit review');
      }

      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, setRating: (val: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'
              } transition-colors hover:scale-110`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-neutral-300 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-forest-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Rate Your Experience</h3>
            <p className="text-xs text-forest-200">Trip with {counterpartyName}</p>
          </div>
          <button onClick={onClose} className="text-forest-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-navy-900">Thank You for Your Review!</h4>
            <p className="text-xs text-neutral-600">
              Your feedback builds trust across the rural freight community and rewards reliable transporters.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="font-bold text-navy-900 block mb-1">Overall Trip Rating</label>
              {renderStars(overallRating, setOverallRating)}
            </div>

            <div className="grid grid-cols-3 gap-2 border-y border-neutral-100 py-3">
              <div>
                <span className="text-[11px] text-neutral-500 block mb-1">Punctuality</span>
                {renderStars(punctualityRating, setPunctualityRating)}
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block mb-1">Cargo Care</span>
                {renderStars(cargoCareRating, setCargoCareRating)}
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block mb-1">Communication</span>
                {renderStars(communicationRating, setCommunicationRating)}
              </div>
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Feedback Comments</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share specific details about cargo condition, pickup timing, or driver assistance..."
                className="w-full p-2 border border-neutral-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 font-bold bg-forest-primary hover:bg-forest-800 text-white rounded-lg shadow-xs"
              >
                {isSubmitting ? t.common.loading : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
