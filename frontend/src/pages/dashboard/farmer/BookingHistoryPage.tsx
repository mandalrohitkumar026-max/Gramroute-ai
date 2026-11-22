import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  XCircle,
  Key,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Alert } from '../../../components/ui/Alert';
import { bookingService } from '../../../services/bookingService';
import { MOCK_BOOKINGS, MOCK_SHIPMENTS } from '../../../services/mockData';
import { RatingModal } from '../../../components/ratings/RatingModal';
import { DisputeModal } from '../../../components/disputes/DisputeModal';
import { DigitalDocumentModal } from '../../../components/documents/DigitalDocumentModal';

const WORKFLOW_STEPS = [
  'REQUESTED',
  'CONFIRMED',
  'TRIP_PREPARATION',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED'
];

export const BookingHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // OTP Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReasonCode, setCancelReasonCode] = useState<string>('SHIPPER_SCHEDULE_CHANGE');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Trust & Ecosystem Modals (Phase 8)
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [activeModalBooking, setActiveModalBooking] = useState<any>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getBookings();
      const items = res.data?.items || res.data || [];
      if (items.length > 0) {
        setBookings(items);
      } else {
        setBookings(MOCK_BOOKINGS);
      }
    } catch {
      setBookings(MOCK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRespond = async (bookingId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      await bookingService.respondToBooking(bookingId, action);
      setNotification({ type: 'success', message: `Booking proposal ${action.toLowerCase()}ed!` });
      await fetchBookings();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error?.message || 'Action failed' });
    }
  };

  const handleOpenOtpModal = (booking: any, status: 'PICKED_UP' | 'DELIVERED') => {
    setTargetBooking(booking);
    setTargetStatus(status);
    setOtpInput('');
    setOtpError(null);
    setOtpModalOpen(true);
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBooking) return;
    setOtpError(null);
    try {
      await bookingService.transitionStatus(targetBooking._id || targetBooking.id, targetStatus, otpInput);
      setNotification({
        type: 'success',
        message: `Handoff verified! Booking advanced to ${targetStatus}.`
      });
      setOtpModalOpen(false);
      await fetchBookings();
    } catch (err: any) {
      setOtpError(err.response?.data?.error?.message || 'Invalid verification OTP');
    }
  };

  const handleDirectTransition = async (bookingId: string, status: string) => {
    try {
      await bookingService.transitionStatus(bookingId, status);
      setNotification({ type: 'success', message: `Booking status updated to ${status}` });
      await fetchBookings();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error?.message || 'Transition failed' });
    }
  };

  const handleOpenCancelModal = (booking: any) => {
    setTargetBooking(booking);
    setCancelReasonCode('SHIPPER_SCHEDULE_CHANGE');
    setCancelReason('Harvesting schedule postponed due to weather');
    setCancelError(null);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBooking) return;
    setCancelError(null);
    try {
      await bookingService.cancelBooking(
        targetBooking._id || targetBooking.id,
        cancelReasonCode,
        cancelReason
      );
      setNotification({ type: 'success', message: 'Booking cancelled according to cancellation policy.' });
      setCancelModalOpen(false);
      await fetchBookings();
    } catch (err: any) {
      setCancelError(err.response?.data?.error?.message || 'Cancellation failed');
    }
  };

  const getStepProgress = (currentStatus: string) => {
    if (currentStatus === 'CANCELLED' || currentStatus === 'REJECTED') return -1;
    let idx = WORKFLOW_STEPS.indexOf(currentStatus);
    if (idx === -1 && currentStatus.startsWith('ACCEPTED_')) idx = 0;
    return idx;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Booking Lifecycle & Handoffs</h1>
          <p className="text-xs text-navy-500 mt-1">
            End-to-end management from proposal acceptance to pickup verification, in-transit telemetry, and delivery settlement.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={fetchBookings}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {notification && (
        <Alert
          variant={notification.type === 'success' ? 'success' : 'error'}
          title={notification.type === 'success' ? 'Update Successful' : 'Notice'}
        >
          {notification.message}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-12 text-navy-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest-primary mb-2" />
          Loading active freight bookings...
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <Truck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-navy-900">No active bookings yet</h3>
          <p className="text-xs text-navy-500 max-w-sm mx-auto">
            Bookings appear here when you confirm shared freight proposals with transporters or when farmers accept your trip offers.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => {
            const id = b._id || b.id;
            const status = b.bookingStatus || 'CONFIRMED';
            const shipment = b.shipmentId || MOCK_SHIPMENTS[0];
            const cargoName = shipment?.cargoName || 'Agricultural Produce Consignment';
            const stepIdx = getStepProgress(status);

            return (
              <Card key={id} className="p-6 space-y-5 border-slate-200 hover:border-forest-300 transition-all">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-extrabold text-sm text-navy-900">
                        {b.bookingReference || `GR-2026-${id.substring(id.length - 6).toUpperCase()}`}
                      </span>
                      <Badge
                        variant={
                          status === 'COMPLETED'
                            ? 'success'
                            : status === 'CANCELLED'
                            ? 'error'
                            : status === 'IN_TRANSIT'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {status}
                      </Badge>
                      <span className="text-[11px] bg-slate-100 text-navy-600 px-2 py-0.5 rounded font-mono font-semibold">
                        Escrow: {b.paymentStatus || 'PENDING'}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-navy-900">{cargoName}</h3>
                  </div>

                  <div className="text-right flex items-center gap-4 self-end sm:self-auto">
                    <div>
                      <span className="text-[10px] text-navy-400 uppercase block">Agreed Freight Cost</span>
                      <span className="text-lg font-extrabold text-forest-primary">
                        ₹{(b.totalAgreedAmountInr || 2400).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {!['COMPLETED', 'CANCELLED'].includes(status) && (
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleOpenCancelModal(b)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Workflow Stepper Visualizer */}
                {stepIdx >= 0 && (
                  <div className="py-2">
                    <div className="hidden md:flex justify-between relative">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 -z-0" />
                      {WORKFLOW_STEPS.map((step, idx) => {
                        const isDone = idx < stepIdx;
                        const isCurrent = idx === stepIdx;
                        return (
                          <div key={step} className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-forest-primary text-white'
                                  : isCurrent
                                  ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] mt-1.5 font-semibold text-center whitespace-nowrap ${
                                isCurrent
                                  ? 'text-amber-800 font-extrabold'
                                  : isDone
                                  ? 'text-forest-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.replace(/_/g, ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="md:hidden text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Current Stage: {status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                )}

                {/* Hand-off OTPs Box */}
                {!['COMPLETED', 'CANCELLED'].includes(status) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-forest-100 text-forest-primary">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-navy-400 uppercase block font-semibold">
                          Farm Pickup OTP (Share on Loading)
                        </span>
                        <span className="font-mono font-extrabold text-base text-navy-900 tracking-widest">
                          {b.pickupOtp || '4192'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-navy-400 uppercase block font-semibold">
                          Mandi Delivery OTP (Share on Drop)
                        </span>
                        <span className="font-mono font-extrabold text-base text-navy-900 tracking-widest">
                          {b.deliveryOtp || '8835'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Lifecycle Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-navy-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-forest-primary" />
                    <span>
                      {shipment?.origin?.villageOrTown || 'Dindori'} &rarr;{' '}
                      {shipment?.destination?.mandiOrMarketName || shipment?.destination?.address || 'APMC Mandi'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* State: REQUESTED */}
                    {status === 'REQUESTED' && (
                      <>
                        <Button size="xs" variant="outline" onClick={() => handleRespond(id, 'REJECT')}>
                          Reject Offer
                        </Button>
                        <Button size="xs" variant="primary" onClick={() => handleRespond(id, 'ACCEPT')}>
                          Accept Proposal
                        </Button>
                      </>
                    )}

                    {/* State: ACCEPTED_BY_CUSTOMER / ACCEPTED_BY_TRANSPORTER */}
                    {(status === 'ACCEPTED_BY_CUSTOMER' || status === 'ACCEPTED_BY_TRANSPORTER') && (
                      <Button size="xs" variant="primary" onClick={() => handleRespond(id, 'ACCEPT')}>
                        Confirm Booking
                      </Button>
                    )}

                    {/* State: CONFIRMED */}
                    {status === 'CONFIRMED' && (
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => handleDirectTransition(id, 'TRIP_PREPARATION')}
                      >
                        Start Trip Preparation
                      </Button>
                    )}

                    {/* State: TRIP_PREPARATION */}
                    {status === 'TRIP_PREPARATION' && (
                      <Button
                        size="xs"
                        variant="primary"
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={() => handleOpenOtpModal(b, 'PICKED_UP')}
                      >
                        <Key className="w-3.5 h-3.5 mr-1" />
                        Verify Pickup OTP
                      </Button>
                    )}

                    {/* State: PICKED_UP */}
                    {status === 'PICKED_UP' && (
                      <Button size="xs" variant="primary" onClick={() => handleDirectTransition(id, 'IN_TRANSIT')}>
                        Depart & Set In-Transit
                      </Button>
                    )}

                    {/* State: IN_TRANSIT */}
                    {status === 'IN_TRANSIT' && (
                      <Button
                        size="xs"
                        variant="primary"
                        className="bg-forest-600 hover:bg-forest-700"
                        onClick={() => handleOpenOtpModal(b, 'DELIVERED')}
                      >
                        <Key className="w-3.5 h-3.5 mr-1" />
                        Verify Delivery OTP
                      </Button>
                    )}

                    {/* State: DELIVERED */}
                    {status === 'DELIVERED' && (
                      <Button size="xs" variant="primary" onClick={() => handleDirectTransition(id, 'COMPLETED')}>
                        Complete & Disburse Escrow
                      </Button>
                    )}

                    {status === 'COMPLETED' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="success" size="md">
                          ✓ Delivered
                        </Badge>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setActiveModalBooking(b);
                            setRatingModalOpen(true);
                          }}
                        >
                          Rate Transporter
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-amber-700 border-amber-300 hover:bg-amber-50"
                          onClick={() => {
                            setActiveModalBooking(b);
                            setDisputeModalOpen(true);
                          }}
                        >
                          Dispute
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-forest-700 border-forest-300 hover:bg-forest-50"
                          onClick={() => {
                            setActiveModalBooking(b);
                            setDocModalOpen(true);
                          }}
                        >
                          View e-Bilty
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* OTP Verification Modal */}
      <Modal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        title={targetStatus === 'PICKED_UP' ? 'Verify Farm Pickup OTP' : 'Verify Mandi Delivery OTP'}
      >
        <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
          {otpError && (
            <Alert variant="error" title="Verification Error">
              {otpError}
            </Alert>
          )}

          <p className="text-xs text-navy-600 leading-relaxed">
            {targetStatus === 'PICKED_UP'
              ? 'Enter the 4-digit Pickup OTP provided by the farmer/shipper to verify cargo loading handoff.'
              : 'Enter the 4-digit Delivery OTP provided by the recipient mandi trader to confirm safe delivery.'}
          </p>

          <Input
            label="4-Digit Verification OTP"
            required
            maxLength={4}
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            placeholder="e.g. 4192"
            className="text-center font-mono text-lg tracking-widest font-extrabold"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setOtpModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Handoff
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancellation Modal */}
      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Transport Booking">
        <form onSubmit={handleConfirmCancel} className="space-y-4">
          {cancelError && (
            <Alert variant="error" title="Cancellation Error">
              {cancelError}
            </Alert>
          )}

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              GramRoute Cancellation Policy
            </div>
            <p className="leading-relaxed">
              Cancellations prior to trip preparation are 100% free. If cancelled during preparation, a 10% convenience fee applies. If cancelled after cargo pickup, a 50% driver compensation fee applies.
            </p>
          </div>

          <Select
            label="Cancellation Reason Code"
            value={cancelReasonCode}
            onChange={(e) => setCancelReasonCode(e.target.value)}
            options={[
              { value: 'SHIPPER_SCHEDULE_CHANGE', label: 'Farmer / Shipper Schedule Change' },
              { value: 'TRANSPORTER_BREAKDOWN', label: 'Vehicle Breakdown / Mechanical Issue' },
              { value: 'PRICE_DISAGREEMENT', label: 'Rate or Weight Discrepancy' },
              { value: 'WEATHER_ROAD_BLOCK', label: 'Extreme Weather / Road Closure' },
              { value: 'CARGO_NOT_READY', label: 'Harvest Crop Not Ready for Dispatch' },
              { value: 'OTHER', label: 'Other Reason' }
            ]}
          />

          <Input
            label="Explanation"
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please describe why this consignment is being cancelled"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button variant="primary" className="bg-red-600 hover:bg-red-700" type="submit">
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rating & Review Modal */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        bookingId={activeModalBooking?._id || activeModalBooking?.id}
        counterpartyName="Ganesh Rural Freight Transporter"
        onSuccess={() => {
          setNotification({ type: 'success', message: 'Rating and feedback submitted successfully!' });
        }}
      />

      {/* Dispute Modal */}
      <DisputeModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        bookingId={activeModalBooking?._id || activeModalBooking?.id}
        transporterName="Ganesh Rural Freight Transporter"
        onSuccess={() => {
          setNotification({ type: 'success', message: 'Dispute registered with GramRoute arbitration desk.' });
        }}
      />

      {/* Digital Document Viewer */}
      <DigitalDocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        documentType="E_BILTY"
        data={{
          documentNumber: `BILTY-${activeModalBooking?._id || '904'}`,
          consignorName: 'Kisan Ramesh Patil (Farmer)',
          consigneeName: 'Vashi APMC Wholesale Merchant',
          cargoDescription: 'Nashik Red Onions (Grade A)',
          weightKg: 2500,
          totalFreightInr: activeModalBooking?.finalPriceInr || 2450
        }}
      />
    </div>
  );
};
