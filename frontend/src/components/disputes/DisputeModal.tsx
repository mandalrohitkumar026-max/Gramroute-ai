import React, { useState } from 'react';
import { AlertCircle, Upload, CheckCircle2, DollarSign, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  transporterName?: string;
  onSuccess?: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  bookingId = 'BK-2026-904',
  transporterName = 'Ganesh Transport Services',
  onSuccess
}) => {
  const { t } = useLanguage();
  const [category, setCategory] = useState('CARGO_DAMAGE');
  const [description, setDescription] = useState('');
  const [claimAmount, setClaimAmount] = useState<number>(1500);
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
  ]);
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
      const response = await fetch('/api/v1/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId,
          category,
          description,
          claimAmountInr: Number(claimAmount),
          evidenceImageUrls: evidenceUrls
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to raise dispute: ${response.statusText}`);
      }

      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-300 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-amber-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="text-base font-bold">{t.disputes.title}</h3>
              <p className="text-xs text-amber-200">Booking: {bookingId} | Party: {transporterName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-amber-200 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-navy-900">Dispute Registered</h4>
            <p className="text-xs text-neutral-600">
              GramRoute rural dispute arbitration officers will review photos and contact both parties within 6 hours.
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
              <label className="font-bold text-navy-900 block mb-1">{t.disputes.category}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
              >
                <option value="CARGO_DAMAGE">{t.disputes.damagedCargo}</option>
                <option value="EXTREME_DELAY">{t.disputes.delayedDelivery}</option>
                <option value="QUANTITY_MISMATCH">{t.disputes.quantityMismatch}</option>
                <option value="OVERCHARGING">{t.disputes.overcharging}</option>
                <option value="UNAUTHORIZED_CANCELLATION">{t.disputes.cancellation}</option>
                <option value="MISBEHAVIOR">{t.disputes.serviceQuality}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">Issue Description & What Happened</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the damage or delay details clearly..."
                className="w-full p-2 border border-neutral-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">{t.disputes.claimAmount}</label>
              <input
                type="number"
                min="0"
                value={claimAmount}
                onChange={(e) => setClaimAmount(Number(e.target.value))}
                className="w-full p-2 border border-neutral-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="font-bold text-navy-900 block mb-1">{t.disputes.evidence}</label>
              <div className="border border-dashed border-neutral-300 p-3 rounded-lg text-center space-y-1">
                <Upload className="w-5 h-5 mx-auto text-neutral-400" />
                <span className="text-[11px] text-neutral-500 block">Photo attached: damaged_crates_sample.jpg</span>
              </div>
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
                className="px-4 py-2 font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs"
              >
                {isSubmitting ? t.common.loading : t.disputes.raiseDispute}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
