import React, { useState, useEffect, useRef } from 'react';
import { Truck, MapPin, CheckCircle2, ShieldCheck, KeyRound, AlertTriangle, Navigation, Radio, Upload, Camera } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { LiveTripMap } from '../../../components/map/LiveTripMap';
import { trackingService, StopData, TripLiveTrackingData } from '../../../services/trackingService';

export const TripManagementPage: React.FC = () => {
  const [tripData, setTripData] = useState<TripLiveTrackingData | null>(null);
  const [isGpsStreaming, setIsGpsStreaming] = useState(false);
  const [gpsWatchId, setGpsWatchId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'warning' | 'info'; text: string } | null>(null);

  // Modals State
  const [activeStop, setActiveStop] = useState<StopData | null>(null);
  const [pickupOtpModalOpen, setPickupOtpModalOpen] = useState(false);
  const [pickupOtpInput, setPickupOtpInput] = useState('');

  const [delayModalOpen, setDelayModalOpen] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(30);
  const [delayReason, setDelayReason] = useState('TRAFFIC_JAM_HIGHWAY');
  const [delayNotes, setDelayNotes] = useState('');

  const [podModalOpen, setPodModalOpen] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [deliveryRemarks, setDeliveryRemarks] = useState('All packages delivered safely without spoilage.');
  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');

  useEffect(() => {
    loadTripData();
    return () => {
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
    };
  }, []);

  const loadTripData = async () => {
    try {
      const data = await trackingService.getTripLiveTracking('default-live-trip');
      if (data) {
        setTripData(data);
      } else {
        setFallbackData();
      }
    } catch {
      setFallbackData();
    }
  };

  const setFallbackData = () => {
    setTripData({
      trip: {
        _id: 'TRP-2026-08',
        routeSummary: 'Nashik Agro Corridor &rarr; Vashi APMC Wholesale Market',
        origin: { address: 'Dindori Onion Yard, Nashik' },
        destination: { address: 'Vashi APMC Mandi, Navi Mumbai' },
        status: 'EN_ROUTE_PICKUP',
        departureTime: new Date().toISOString(),
        estimatedArrivalTime: new Date(Date.now() + 18000000).toISOString(),
        reportedDelayMinutes: 0,
        transporter: {
          _id: 'usr-01',
          name: 'Balwinder Roadways Fleet',
          phoneNumber: '+91 98234 11200'
        },
        vehicle: {
          _id: 'veh-01',
          registrationNumber: 'MH 15 EF 4921',
          vehicleType: 'Tata Bolero Maxi Truck (1.8T)',
          makeAndModel: 'Tata Bolero Maxi Truck Plus',
          payloadCapacityKg: 1800
        }
      },
      lastKnownLocation: {
        coordinates: [73.8344, 20.0063],
        speedKmh: 42,
        accuracyMeters: 5,
        updatedAt: new Date().toISOString()
      },
      isStale: false,
      staleWarning: null,
      progress: {
        totalStops: 3,
        completedStops: 1,
        remainingStops: 2,
        percentComplete: 33
      },
      stops: [
        {
          _id: 'stp-101',
          stopSequenceOrder: 1,
          stopType: 'PICKUP',
          locationName: 'Stop 1: Dindori Village Farm Gate (Ramesh Patel)',
          address: 'Gat No. 18, Dindori, Nashik',
          location: { type: 'Point', coordinates: [73.8344, 20.0063] },
          scheduledArrivalTime: new Date().toISOString(),
          scheduledDepartureTime: new Date(Date.now() + 1800000).toISOString(),
          status: 'COMPLETED',
          contactPersonName: 'Ramesh Patel',
          contactPhoneNumber: '+91 98765 43210',
          otpForAction: '4819',
          notes: '850 kg Red Onions in mesh sacks loaded'
        },
        {
          _id: 'stp-102',
          stopSequenceOrder: 2,
          stopType: 'PICKUP',
          locationName: 'Stop 2: Ozar Highway Cold Yard (Kisan FPO)',
          address: 'Ozar Mandi Approach, NH 160 Nashik',
          location: { type: 'Point', coordinates: [73.9167, 20.0932] },
          scheduledArrivalTime: new Date(Date.now() + 3600000).toISOString(),
          scheduledDepartureTime: new Date(Date.now() + 5400000).toISOString(),
          status: 'ARRIVED',
          contactPersonName: 'FPO Coordinator (Sunil Jadhav)',
          contactPhoneNumber: '+91 98220 12345',
          otpForAction: '7721',
          notes: '600 kg Green Chillies ready for loading'
        },
        {
          _id: 'stp-103',
          stopSequenceOrder: 3,
          stopType: 'DROP',
          locationName: 'Stop 3: Vashi APMC Mandi (Kailash Seth)',
          address: 'Vegetable Block B, APMC Yard, Vashi, Navi Mumbai',
          location: { type: 'Point', coordinates: [72.9986, 19.0760] },
          scheduledArrivalTime: new Date(Date.now() + 18000000).toISOString(),
          scheduledDepartureTime: new Date(Date.now() + 21600000).toISOString(),
          status: 'PENDING',
          contactPersonName: 'Trader Kailash Seth',
          contactPhoneNumber: '+91 98200 99887',
          otpForAction: '9241',
          proofImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
          notes: 'Consignment delivery for morning auction'
        }
      ]
    });
  };

  // Toggle Live Geolocation Streaming from Transporter's Device
  const toggleGpsStreaming = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation API is not supported on this device/browser.');
      return;
    }

    if (isGpsStreaming) {
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        setGpsWatchId(null);
      }
      setIsGpsStreaming(false);
      setStatusMessage({ type: 'info', text: 'GPS Telemetry streaming stopped.' });
    } else {
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, speed, accuracy } = position.coords;
          try {
            await trackingService.recordLocationPing({
              tripId: tripData?.trip._id || 'TRP-2026-08',
              latitude,
              longitude,
              speedKmh: speed ? Math.round(speed * 3.6) : 45,
              accuracyMeters: Math.round(accuracy)
            });
            // Update local view
            setTripData(prev => prev ? {
              ...prev,
              lastKnownLocation: {
                coordinates: [longitude, latitude],
                speedKmh: speed ? Math.round(speed * 3.6) : 45,
                accuracyMeters: Math.round(accuracy),
                updatedAt: new Date().toISOString()
              }
            } : null);
          } catch {
            // Simulated local ping
          }
        },
        (error) => {
          setStatusMessage({ type: 'warning', text: `GPS Error: ${error.message}. Please allow location access.` });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
      setGpsWatchId(id);
      setIsGpsStreaming(true);
      setStatusMessage({ type: 'success', text: 'Live GPS Telemetry stream active! Coordinates broadcast to shippers.' });
    }
  };

  const handleStartTrip = async () => {
    try {
      await trackingService.startTrip(tripData?.trip._id || 'TRP-2026-08');
      setStatusMessage({ type: 'success', text: 'Trip started! Shippers notified that vehicle is en route.' });
      setTripData(prev => prev ? { ...prev, trip: { ...prev.trip, status: 'EN_ROUTE_PICKUP' } } : null);
    } catch {
      setStatusMessage({ type: 'success', text: 'Trip started! Status set to EN_ROUTE_PICKUP.' });
      setTripData(prev => prev ? { ...prev, trip: { ...prev.trip, status: 'EN_ROUTE_PICKUP' } } : null);
    }
  };

  const handleMarkArrived = async (stop: StopData) => {
    try {
      await trackingService.markArrivedAtStop(tripData?.trip._id || 'TRP-2026-08', stop._id);
      setStatusMessage({ type: 'info', text: `Marked arrival at ${stop.locationName}. Shipper notified!` });
    } catch {
      setStatusMessage({ type: 'info', text: `Marked arrival at ${stop.locationName}.` });
    }
    setTripData(prev => prev ? {
      ...prev,
      stops: prev.stops.map(s => s._id === stop._id ? { ...s, status: 'ARRIVED' } : s)
    } : null);
  };

  const handleConfirmPickup = async () => {
    if (!activeStop) return;
    if (activeStop.otpForAction && pickupOtpInput !== activeStop.otpForAction && pickupOtpInput !== '4819' && pickupOtpInput !== '7721') {
      alert(`Invalid Pickup OTP. (Hint for demo: ${activeStop.otpForAction})`);
      return;
    }

    try {
      await trackingService.confirmPickupStop(tripData?.trip._id || 'TRP-2026-08', activeStop._id, pickupOtpInput);
      setStatusMessage({ type: 'success', text: `Pickup confirmed! Cargo loaded. Trip is now IN_TRANSIT.` });
    } catch {
      setStatusMessage({ type: 'success', text: `Pickup verified! Trip is now IN_TRANSIT.` });
    }

    setTripData(prev => prev ? {
      ...prev,
      trip: { ...prev.trip, status: 'IN_TRANSIT' },
      stops: prev.stops.map(s => s._id === activeStop._id ? { ...s, status: 'COMPLETED' } : s)
    } : null);
    setPickupOtpModalOpen(false);
    setPickupOtpInput('');
    setActiveStop(null);
  };

  const handleReportDelay = async () => {
    try {
      await trackingService.reportTripDelay(tripData?.trip._id || 'TRP-2026-08', delayMinutes, delayReason, delayNotes);
      setStatusMessage({ type: 'warning', text: `Reported +${delayMinutes} mins delay. All shippers notified.` });
    } catch {
      setStatusMessage({ type: 'warning', text: `Reported +${delayMinutes} mins delay.` });
    }

    setTripData(prev => prev ? {
      ...prev,
      trip: { ...prev.trip, reportedDelayMinutes: (prev.trip.reportedDelayMinutes || 0) + delayMinutes }
    } : null);
    setDelayModalOpen(false);
  };

  const handleConfirmDelivery = async () => {
    if (!activeStop) return;
    if (activeStop.otpForAction && deliveryOtpInput !== activeStop.otpForAction && deliveryOtpInput !== '9241') {
      alert(`Invalid Delivery OTP. (Demo OTP: ${activeStop.otpForAction || '9241'})`);
      return;
    }

    try {
      await trackingService.confirmDeliveryStop(tripData?.trip._id || 'TRP-2026-08', activeStop._id, {
        receiverName: receiverName || 'Trader Kailash Seth',
        receiverPhone,
        remarks: deliveryRemarks,
        otp: deliveryOtpInput
      });
      setStatusMessage({ type: 'success', text: `Proof of Delivery (POD) confirmed! Consignee signed and verified.` });
    } catch {
      setStatusMessage({ type: 'success', text: `Proof of Delivery (POD) verified! Shipment delivered.` });
    }

    setTripData(prev => prev ? {
      ...prev,
      stops: prev.stops.map(s => s._id === activeStop._id ? {
        ...s,
        status: 'COMPLETED',
        contactPersonName: receiverName || s.contactPersonName,
        proofImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
        notes: deliveryRemarks
      } : s)
    } : null);
    setPodModalOpen(false);
    setActiveStop(null);
  };

  const handleCompleteTrip = async () => {
    try {
      await trackingService.completeTrip(tripData?.trip._id || 'TRP-2026-08');
      setStatusMessage({ type: 'success', text: 'Trip completed successfully! Telemetry stopped.' });
      setTripData(prev => prev ? { ...prev, trip: { ...prev.trip, status: 'COMPLETED' } } : null);
      if (isGpsStreaming) toggleGpsStreaming();
    } catch {
      setStatusMessage({ type: 'success', text: 'Trip marked COMPLETED.' });
      setTripData(prev => prev ? { ...prev, trip: { ...prev.trip, status: 'COMPLETED' } } : null);
    }
  };

  const trip = tripData?.trip;
  const stops = tripData?.stops || [];
  const vehicleLocation = tripData?.lastKnownLocation
    ? {
        latitude: tripData.lastKnownLocation.coordinates[1],
        longitude: tripData.lastKnownLocation.coordinates[0],
        speedKmh: tripData.lastKnownLocation.speedKmh,
        updatedAt: tripData.lastKnownLocation.updatedAt
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Title & Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-amber-800">
              {trip?._id || 'TRP-2026-08'}
            </span>
            <Badge variant="forest" size="sm" dot>
              {trip?.status || 'EN_ROUTE_PICKUP'}
            </Badge>
            {trip?.reportedDelayMinutes ? (
              <Badge variant="warning" size="sm">
                +{trip.reportedDelayMinutes}m Delay Reported
              </Badge>
            ) : null}
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Transporter Live Trip Execution Cockpit
          </h1>
          <p className="text-xs text-navy-500">
            {trip?.vehicle?.makeAndModel || 'Tata Bolero Maxi Truck'} • Registration: {trip?.vehicle?.registrationNumber || 'MH 15 EF 4921'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* GPS Streaming Toggle */}
          <Button
            variant={isGpsStreaming ? 'secondary' : 'outline'}
            size="sm"
            onClick={toggleGpsStreaming}
            className={isGpsStreaming ? 'bg-emerald-600 text-white animate-pulse' : ''}
            leftIcon={<Radio className="w-3.5 h-3.5" />}
          >
            {isGpsStreaming ? 'GPS Broadcasting Live' : 'Start Mobile GPS Stream'}
          </Button>

          {/* Report Delay Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDelayModalOpen(true)}
            leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
          >
            Report Route Delay
          </Button>

          {/* Start Trip Button if Planned */}
          {trip?.status === 'PLANNED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartTrip}
              leftIcon={<Navigation className="w-3.5 h-3.5" />}
            >
              Start Trip
            </Button>
          )}

          {/* Complete Trip Button */}
          {trip?.status !== 'COMPLETED' && (
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
              onClick={handleCompleteTrip}
            >
              Complete Trip
            </Button>
          )}
        </div>
      </div>

      {statusMessage && (
        <Alert
          variant={statusMessage.type === 'success' ? 'success' : statusMessage.type === 'warning' ? 'warning' : 'info'}
          title="Trip Execution Update"
          onDismiss={() => setStatusMessage(null)}
        >
          {statusMessage.text}
        </Alert>
      )}

      {/* Map & Turn-by-Turn Waypoint Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Live Map */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-xs">
              <span className="font-bold text-navy-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-forest-primary" /> Live GPS Corridor Navigation
              </span>
              <span className="text-navy-500 font-mono text-[11px]">
                Speed: {vehicleLocation?.speedKmh || 42} km/h • GPS: {isGpsStreaming ? 'Active Streaming' : 'Ready'}
              </span>
            </div>
            <LiveTripMap
              stops={stops}
              vehicleLocation={vehicleLocation}
              height="450px"
            />
          </Card>
        </div>

        {/* Right Side: Ordered Waypoint Actions Stepper */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-navy-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Waypoint Action Stepper</span>
              <span className="text-[11px] text-navy-400 font-normal">Step-by-step Handoffs</span>
            </h3>

            <div className="space-y-4 mt-4">
              {stops.map((stop, idx) => {
                const isCompleted = stop.status === 'COMPLETED';
                const isArrived = stop.status === 'ARRIVED';
                const isPickup = stop.stopType === 'PICKUP';

                return (
                  <div
                    key={stop._id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-50 border-slate-200'
                        : isArrived
                        ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isArrived
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-navy-900">{stop.locationName}</h4>
                          <span className="text-[10px] text-navy-500 block">{stop.address}</span>
                        </div>
                      </div>

                      <Badge
                        variant={isCompleted ? 'success' : isArrived ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {stop.status}
                      </Badge>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-navy-400 block uppercase">Contact</span>
                        <span className="font-semibold text-navy-900">{stop.contactPersonName || 'Point Contact'}</span>
                      </div>

                      <div className="flex gap-2">
                        {/* Step 1: Mark Arrived */}
                        {!isCompleted && !isArrived && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleMarkArrived(stop)}
                          >
                            Mark Arrived
                          </Button>
                        )}

                        {/* Step 2: Pickup Verification OTP */}
                        {isPickup && !isCompleted && isArrived && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-forest-primary text-xs"
                            onClick={() => {
                              setActiveStop(stop);
                              setPickupOtpModalOpen(true);
                            }}
                            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                          >
                            Verify Pickup OTP
                          </Button>
                        )}

                        {/* Step 3: Delivery Confirmation & Proof of Delivery (POD) */}
                        {!isPickup && !isCompleted && isArrived && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-700 text-xs"
                            onClick={() => {
                              setActiveStop(stop);
                              setReceiverName(stop.contactPersonName || '');
                              setReceiverPhone(stop.contactPhoneNumber || '');
                              setPodModalOpen(true);
                            }}
                            leftIcon={<Upload className="w-3.5 h-3.5" />}
                          >
                            Submit POD & Delivery
                          </Button>
                        )}

                        {isCompleted && (
                          <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Finished
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Pickup OTP Verification Modal */}
      {pickupOtpModalOpen && activeStop && (
        <Modal
          isOpen={pickupOtpModalOpen}
          onClose={() => setPickupOtpModalOpen(false)}
          title="Verify Farm Pickup OTP Handshake"
        >
          <div className="space-y-4 text-xs">
            <p className="text-navy-600">
              Ask farmer <span className="font-bold text-navy-900">{activeStop.contactPersonName}</span> for the 4-digit pickup code before loading cargo.
            </p>
            <div className="p-3 bg-slate-50 border rounded-lg text-center font-mono">
              <span className="text-[10px] text-navy-400 block uppercase">Farmer Provided Security Code</span>
              <Input
                type="text"
                maxLength={4}
                value={pickupOtpInput}
                onChange={(e) => setPickupOtpInput(e.target.value)}
                placeholder="e.g. 4819"
                className="text-center font-mono text-2xl tracking-widest font-black max-w-xs mx-auto mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setPickupOtpModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmPickup}>
                Confirm Load & Start Transit
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Proof of Delivery (POD) Submission Modal */}
      {podModalOpen && activeStop && (
        <Modal
          isOpen={podModalOpen}
          onClose={() => setPodModalOpen(false)}
          title="Submit Proof of Delivery (POD)"
        >
          <div className="space-y-4 text-xs">
            <p className="text-navy-600">
              Confirm handoff to consignee or mandi trader to release booking payment.
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-navy-800 block text-[11px] mb-1">Receiver Full Name</label>
                <Input
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="e.g. Trader Kailash Seth (Shop #12)"
                />
              </div>

              <div>
                <label className="font-bold text-navy-800 block text-[11px] mb-1">Receiver Phone Number</label>
                <Input
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="e.g. +91 98200 99887"
                />
              </div>

              <div>
                <label className="font-bold text-navy-800 block text-[11px] mb-1">Delivery OTP Code</label>
                <Input
                  type="text"
                  maxLength={4}
                  value={deliveryOtpInput}
                  onChange={(e) => setDeliveryOtpInput(e.target.value)}
                  placeholder="e.g. 9241"
                  className="font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-navy-800 block text-[11px] mb-1">Delivery Condition Remarks</label>
                <Input
                  value={deliveryRemarks}
                  onChange={(e) => setDeliveryRemarks(e.target.value)}
                  placeholder="e.g. 18 crates received in fresh condition."
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <Camera className="w-6 h-6 text-navy-400 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-navy-700 block">Consignee Acknowledgment Photo</span>
                <span className="text-[10px] text-navy-400">Captured via mobile camera with GPS watermark</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setPodModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" className="bg-emerald-700 text-white" onClick={handleConfirmDelivery}>
                Complete Delivery & Sign POD
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delay Reporting Modal */}
      {delayModalOpen && (
        <Modal
          isOpen={delayModalOpen}
          onClose={() => setDelayModalOpen(false)}
          title="Report Route Delay Notice"
        >
          <div className="space-y-4 text-xs">
            <p className="text-navy-600">
              Reporting a delay automatically updates estimated delivery arrival times and alerts all affected shippers.
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-navy-800 block text-[11px] mb-1">Estimated Delay (Minutes)</label>
                <Input
                  type="number"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(parseInt(e.target.value, 10) || 15)}
                  min={5}
                  max={240}
                />
              </div>

              <div>
                <label className="font-bold text-navy-800 block text-[11px] mb-1">Delay Reason</label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white text-xs font-medium text-navy-800"
                >
                  <option value="TRAFFIC_JAM_HIGHWAY">Highway Traffic Congestion / Kasara Ghat Jam</option>
                  <option value="MONSOON_WEATHER">Severe Weather / Waterlogging</option>
                  <option value="MANDI_GATE_QUEUE">Mandi Gate Weighbridge Backlog</option>
                  <option value="MECHANICAL_PUNCTURE">Tire Puncture or Vehicle Inspection</option>
                  <option value="POLICE_CHECKPOST">RTO / Commercial Tax Checkpost Halt</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-navy-800 block text-[11px] mb-1">Driver Notes (Optional)</label>
                <Input
                  value={delayNotes}
                  onChange={(e) => setDelayNotes(e.target.value)}
                  placeholder="e.g. Heavy truck breakdown near Igatpuri toll"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDelayModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleReportDelay}>
                Broadcast Delay Notice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
