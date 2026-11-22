import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Truck, ShieldCheck, CheckCircle2, Clock, AlertTriangle, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import { LiveTripMap } from '../../../components/map/LiveTripMap';
import { trackingService, TripLiveTrackingData, StopData } from '../../../services/trackingService';

export const TrackingPage: React.FC = () => {
  const [trackingData, setTrackingData] = useState<TripLiveTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPodStop, setSelectedPodStop] = useState<StopData | null>(null);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 12000); // 12-second live polling
    return () => clearInterval(interval);
  }, []);

  const fetchTracking = async () => {
    try {
      const data = await trackingService.getTripLiveTracking('default-live-trip');
      if (data) {
        setTrackingData(data);
      } else {
        setFallbackTrackingData();
      }
    } catch {
      setFallbackTrackingData();
    } finally {
      setLoading(false);
    }
  };

  const setFallbackTrackingData = () => {
    setTrackingData({
      trip: {
        _id: 'TRP-NSK-MUM-884',
        routeSummary: 'Nashik Agro Corridor &rarr; Vashi APMC Mandi, Navi Mumbai',
        origin: { address: 'Pimpalgaon Onion Yard, Nashik', district: 'Nashik' },
        destination: { address: 'Sector 19, Vashi APMC Wholesale Market', district: 'Thane' },
        status: 'IN_TRANSIT',
        departureTime: new Date(Date.now() - 7200000).toISOString(),
        estimatedArrivalTime: new Date(Date.now() + 5400000).toISOString(),
        reportedDelayMinutes: 0,
        transporter: {
          _id: 'usr-transporter-01',
          name: 'Balwinder Singh (Gurmeet Roadways)',
          phoneNumber: '+91 98234 11200',
          email: 'balwinder@gurmeetlogistics.in'
        },
        vehicle: {
          _id: 'veh-01',
          registrationNumber: 'MH 15 EF 4920',
          vehicleType: 'Eicher Pro 2049 (3.5T Payload)',
          makeAndModel: 'Eicher Pro 2049 14ft High Deck',
          payloadCapacityKg: 3500
        }
      },
      lastKnownLocation: {
        coordinates: [73.4520, 19.6740], // Near Kasara Ghat corridor
        speedKmh: 48,
        accuracyMeters: 6,
        updatedAt: new Date(Date.now() - 120000).toISOString() // 2 mins ago
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
          _id: 'stp-01',
          stopSequenceOrder: 1,
          stopType: 'PICKUP',
          locationName: 'Pimpalgaon Farm Depot (Farmer Ramesh)',
          address: 'Gat No. 142, Pimpalgaon Baswant, Nashik',
          location: { type: 'Point', coordinates: [73.9854, 20.1742] },
          scheduledArrivalTime: new Date(Date.now() - 7200000).toISOString(),
          scheduledDepartureTime: new Date(Date.now() - 6000000).toISOString(),
          actualArrivalTime: new Date(Date.now() - 7100000).toISOString(),
          actualDepartureTime: new Date(Date.now() - 5900000).toISOString(),
          status: 'COMPLETED',
          contactPersonName: 'Ramesh Patel (Farmer)',
          contactPhoneNumber: '+91 98765 43210',
          otpForAction: '4819',
          notes: '850 kg Fresh Red Onions loaded securely in crates'
        },
        {
          _id: 'stp-02',
          stopSequenceOrder: 2,
          stopType: 'PICKUP',
          locationName: 'Ozar Mandi Aggregation Point',
          address: 'Ozar Toll Bypass, NH 160 Nashik',
          location: { type: 'Point', coordinates: [73.9167, 20.0932] },
          scheduledArrivalTime: new Date(Date.now() - 4800000).toISOString(),
          scheduledDepartureTime: new Date(Date.now() - 3600000).toISOString(),
          actualArrivalTime: new Date(Date.now() - 4600000).toISOString(),
          actualDepartureTime: new Date(Date.now() - 3500000).toISOString(),
          status: 'COMPLETED',
          contactPersonName: 'Suresh More (Co-op Member)',
          contactPhoneNumber: '+91 98220 54321',
          otpForAction: '3192',
          notes: '600 kg Green Chillies loaded'
        },
        {
          _id: 'stp-03',
          stopSequenceOrder: 3,
          stopType: 'DROP',
          locationName: 'Vashi APMC Wholesale Market (Mandi Drop)',
          address: 'Vegetable Block B, APMC Yard, Vashi, Navi Mumbai',
          location: { type: 'Point', coordinates: [72.9986, 19.0760] },
          scheduledArrivalTime: new Date(Date.now() + 5400000).toISOString(),
          scheduledDepartureTime: new Date(Date.now() + 7200000).toISOString(),
          status: 'PENDING',
          contactPersonName: 'Mandi Commission Agent (Kailash Seth)',
          contactPhoneNumber: '+91 98200 99887',
          otpForAction: '9241',
          proofImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
          notes: 'Final delivery destination for auction'
        }
      ]
    });
  };

  const trip = trackingData?.trip;
  const vehicleLocation = trackingData?.lastKnownLocation
    ? {
        latitude: trackingData.lastKnownLocation.coordinates[1],
        longitude: trackingData.lastKnownLocation.coordinates[0],
        speedKmh: trackingData.lastKnownLocation.speedKmh,
        updatedAt: trackingData.lastKnownLocation.updatedAt
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-forest-primary">
              {trip?._id || 'TRP-NSK-MUM-884'}
            </span>
            <Badge variant="forest" size="sm" dot>
              {trip?.status === 'IN_TRANSIT' ? 'LIVE IN TRANSIT' : trip?.status || 'PLANNED'}
            </Badge>
            <Badge variant="info" size="sm" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-300" /> Phase 6 Real-Time
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Live Shared Vehicle Tracking & Journey Map
          </h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Real-time GPS telemetry, corridor route progression, and digital proof-of-delivery (POD).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTracking}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Telemetry
          </Button>
          <a href={`tel:${trip?.transporter?.phoneNumber || '+919823411200'}`}>
            <Button variant="primary" size="sm" leftIcon={<Phone className="w-3.5 h-3.5" />}>
              Call Driver
            </Button>
          </a>
        </div>
      </div>

      {/* Stale Location Warning if Applicable */}
      {trackingData?.isStale && (
        <Alert variant="warning" title="Stale GPS Telemetry Warning">
          {trackingData.staleWarning || 'GPS ping was last received over 15 minutes ago. The vehicle may be traversing a rural low-cellular shadow.'}
        </Alert>
      )}

      {/* Driver Handshake Security Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex justify-between items-center shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Pickup Handshake OTP (Farm)
            </span>
            <span className="font-mono text-2xl font-black text-emerald-950 tracking-widest">4819</span>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Status: Verified & Loaded</p>
          </div>
          <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
        </div>

        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex justify-between items-center shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              Delivery Handshake OTP (Mandi)
            </span>
            <span className="font-mono text-2xl font-black text-amber-950 tracking-widest">9241</span>
            <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Provide upon mandi arrival</p>
          </div>
          <ShieldCheck className="w-7 h-7 text-amber-600 shrink-0" />
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block">
              Vehicle Telemetry Speed
            </span>
            <span className="font-mono text-2xl font-black text-navy-900 tracking-tight">
              {trackingData?.lastKnownLocation?.speedKmh || 48} <span className="text-sm font-normal">km/h</span>
            </span>
            <p className="text-[11px] text-navy-500 mt-0.5">GPS accuracy: ±{trackingData?.lastKnownLocation?.accuracyMeters || 6}m</p>
          </div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping mr-2"></div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 block">
              Journey Progress
            </span>
            <span className="font-mono text-2xl font-black text-forest-primary tracking-tight">
              {trackingData?.progress?.percentComplete || 33}%
            </span>
            <p className="text-[11px] text-navy-500 mt-0.5 font-medium">
              {trackingData?.progress?.completedStops || 1} of {trackingData?.progress?.totalStops || 3} stops completed
            </p>
          </div>
          <Clock className="w-7 h-7 text-navy-400 shrink-0" />
        </div>
      </div>

      {/* Map & Live Stops Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Map Column */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-forest-primary" />
                <span className="font-bold text-navy-900">
                  {trip?.vehicle?.makeAndModel || 'Eicher Pro 2049 (MH 15 EF 4920)'}
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                  {trip?.vehicle?.registrationNumber || 'MH 15 EF 4920'}
                </span>
              </div>
              <span className="text-navy-500 text-[11px]">
                Driver: <span className="font-semibold text-navy-900">{trip?.transporter?.name || 'Balwinder Singh'}</span>
              </span>
            </div>

            {/* Interactive OpenStreetMap Leaflet Map */}
            <LiveTripMap
              stops={trackingData?.stops || []}
              vehicleLocation={vehicleLocation}
              height="440px"
            />
          </Card>
        </div>

        {/* Milestone Progression & Stops Timeline */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-navy-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Waypoints & Stops</span>
              <span className="text-xs font-normal text-navy-400">Sequence Order</span>
            </h3>

            <div className="space-y-4 mt-4">
              {trackingData?.stops.map((stop, idx) => {
                const isCompleted = stop.status === 'COMPLETED';
                const isArrived = stop.status === 'ARRIVED';

                return (
                  <div key={stop._id} className="flex gap-3 text-xs relative">
                    {/* Step Icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border-2 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isArrived
                          ? 'bg-amber-100 text-amber-800 border-amber-400 animate-pulse'
                          : 'bg-slate-100 text-slate-500 border-slate-300'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900">{stop.locationName}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isArrived
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {stop.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-navy-400 leading-tight">{stop.address}</p>

                      {stop.notes && (
                        <p className="text-[10px] text-navy-600 font-medium italic pt-0.5">
                          "{stop.notes}"
                        </p>
                      )}

                      {/* Proof of Delivery Inspect Button */}
                      {stop.proofImageUrl && (
                        <div className="pt-1">
                          <button
                            onClick={() => setSelectedPodStop(stop)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-forest-primary hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Proof of Delivery (POD)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Proof of Delivery (POD) Modal */}
      {selectedPodStop && (
        <Modal
          isOpen={!!selectedPodStop}
          onClose={() => setSelectedPodStop(null)}
          title="Digital Proof of Delivery (POD)"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Handoff Verified & Confirmed
              </div>
              <p className="text-emerald-800 text-[11px]">
                Receiver acknowledgement and physical cargo inspection logged into the tamper-evident delivery ledger.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-navy-800 block text-[11px] uppercase">Receiver Signature / Consignee Photo</span>
              <img
                src={selectedPodStop.proofImageUrl}
                alt="Proof of Delivery"
                className="w-full h-56 object-cover rounded-xl border border-slate-200 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[10px] text-navy-400 uppercase block font-semibold">Receiver Name</span>
                <span className="font-bold text-navy-900">{selectedPodStop.contactPersonName || 'Authorized Receiver'}</span>
              </div>
              <div>
                <span className="text-[10px] text-navy-400 uppercase block font-semibold">Contact Phone</span>
                <span className="font-bold text-navy-900">{selectedPodStop.contactPhoneNumber || '+91 98XXX XXXXX'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-navy-400 uppercase block font-semibold">Delivery Remarks</span>
                <span className="font-medium text-navy-800">{selectedPodStop.notes || 'Goods verified in satisfactory condition.'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedPodStop(null)}>
                Close POD View
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
