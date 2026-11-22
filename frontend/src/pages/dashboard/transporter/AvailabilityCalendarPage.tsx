import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, Clock, MapPin, Truck, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { tripService } from '../../../services/tripService';
import { vehicleService } from '../../../services/vehicleService';
import { MOCK_VEHICLES } from '../../../services/mockData';

export const AvailabilityCalendarPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [publishedTrips, setPublishedTrips] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [originAddress, setOriginAddress] = useState('Pimpalgaon Baswant APMC Market');
  const [originDistrict, setOriginDistrict] = useState('Nashik');
  const [destinationAddress, setDestinationAddress] = useState('Sector 19, Vashi APMC Mandi');
  const [destDistrict, setDestDistrict] = useState('Mumbai Suburban');
  const [departureDate, setDepartureDate] = useState('2026-11-23');
  const [departureTime, setDepartureTime] = useState('06:00');
  const [arrivalDate, setArrivalDate] = useState('2026-11-23');
  const [arrivalTime, setArrivalTime] = useState('14:00');
  const [availableWeightKg, setAvailableWeightKg] = useState<number>(2500);
  const [availableVolumeCbm, setAvailableVolumeCbm] = useState<number>(10);
  const [totalPriceInr, setTotalPriceInr] = useState<number>(4200);
  const [corridor, setCorridor] = useState('Nashik-Mumbai (NH 160)');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehRes, tripRes] = await Promise.all([
        vehicleService.getVehicles(),
        tripService.getTrips({ status: 'PLANNED' })
      ]);

      const loadedVehicles = vehRes.data?.items || vehRes.data || [];
      const loadedTrips = tripRes.data?.items || tripRes.data || [];

      if (loadedVehicles.length > 0) {
        setVehicles(loadedVehicles);
        setSelectedVehicleId(loadedVehicles[0]._id || loadedVehicles[0].id);
        setAvailableWeightKg(loadedVehicles[0].payloadCapacityKg || 2500);
      } else {
        setVehicles(MOCK_VEHICLES);
        setSelectedVehicleId(MOCK_VEHICLES[0]._id);
      }

      setPublishedTrips(loadedTrips);
    } catch {
      setVehicles(MOCK_VEHICLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVehicleChange = (vId: string) => {
    setSelectedVehicleId(vId);
    const chosen = vehicles.find((v) => (v._id || v.id) === vId);
    if (chosen) {
      setAvailableWeightKg(chosen.payloadCapacityKg || 2500);
      setAvailableVolumeCbm(chosen.volumetricCapacityCubicMeters || 10);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      setErrorMsg('Please select a vehicle from your registered fleet.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const depIso = new Date(`${departureDate}T${departureTime}:00Z`).toISOString();
      const arrIso = new Date(`${arrivalDate}T${arrivalTime}:00Z`).toISOString();

      await tripService.publishTrip({
        vehicleId: selectedVehicleId,
        routeSummary: `${originDistrict} to ${destDistrict} via ${corridor}`,
        origin: {
          address: originAddress,
          district: originDistrict,
          state: 'Maharashtra',
          location: { type: 'Point', coordinates: [73.8344, 20.0063] }
        },
        destination: {
          address: destinationAddress,
          district: destDistrict,
          state: 'Maharashtra',
          location: { type: 'Point', coordinates: [72.9982, 19.0771] }
        },
        departureTime: depIso,
        estimatedArrivalTime: arrIso,
        availableCapacityKg: Number(availableWeightKg),
        availableVolumeCbm: Number(availableVolumeCbm),
        totalPriceInr: Number(totalPriceInr),
        operatingCorridors: [corridor],
        isPublished: true
      });

      setSuccessMsg('Scheduled corridor trip published successfully! Matching engine is pairing shipments.');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to publish route');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Trip Schedule & Capacity Publisher</h1>
          <p className="text-xs text-navy-500 mt-1">
            Publish vehicle schedules and available payload space to receive consolidated freight matches from local farmers and FPOs.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={loadData}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      {errorMsg && (
        <Alert variant="error" title="Submission Error">
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success" title="Route Published">
          {successMsg}
        </Alert>
      )}

      {/* Publish Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy-800 mb-1">Select Registered Vehicle</label>
              <Select
                value={selectedVehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                options={vehicles.map((v) => ({
                  value: v._id || v.id,
                  label: `${v.makeAndModel} (${v.registrationNumber}) — ${v.payloadCapacityKg} kg limit`
                }))}
              />
            </div>

            <Input
              label="Primary Transit Highway Corridor"
              required
              value={corridor}
              onChange={(e) => setCorridor(e.target.value)}
              placeholder="e.g. Nashik-Mumbai (NH 160)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Departure Point / Aggregation Hub"
              required
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
            />
            <Input
              label="Destination Mandi / Delivery Hub"
              required
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Departure Date"
                type="date"
                required
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
              <Input
                label="Departure Time"
                type="time"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Arrival Date"
                type="date"
                required
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
              />
              <Input
                label="Target Arrival Time"
                type="time"
                required
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Available Payload (kg)"
              type="number"
              required
              min={100}
              value={availableWeightKg}
              onChange={(e) => setAvailableWeightKg(Number(e.target.value))}
            />
            <Input
              label="Available Volume (m³)"
              type="number"
              step="0.5"
              required
              min={1}
              value={availableVolumeCbm}
              onChange={(e) => setAvailableVolumeCbm(Number(e.target.value))}
            />
            <Input
              label="Base Target Earnings (₹)"
              type="number"
              required
              value={totalPriceInr}
              onChange={(e) => setTotalPriceInr(Number(e.target.value))}
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-navy-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-primary" />
              <span>Backhaul Protection: Automatically pair return shipments from mandi back to rural hubs</span>
            </div>
            <span className="font-bold text-forest-primary">+20% Fuel Recovery</span>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="bg-forest-primary hover:bg-forest-800"
            >
              {submitting ? 'Publishing Route...' : 'Publish Scheduled Corridor Trip'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Published Active Trips */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-navy-900">Your Active Scheduled Trips</h3>
        {publishedTrips.length === 0 ? (
          <p className="text-xs text-navy-500">No trips currently scheduled. Use the form above to publish your vehicle availability.</p>
        ) : (
          publishedTrips.map((t) => {
            const id = t._id || t.id;
            return (
              <Card key={id} className="p-4 hover:border-forest-300 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-forest-primary" />
                      <h4 className="font-bold text-sm text-navy-900">{t.routeSummary || 'Scheduled Corridor Trip'}</h4>
                      <Badge variant="success" size="xs">
                        {t.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-navy-600">
                      Remaining Capacity:{' '}
                      <strong className="text-forest-primary font-bold">{t.remainingCapacityKg} kg</strong> (Allocated: {t.allocatedWeightKg || 0} kg)
                    </p>
                    <div className="text-[11px] text-navy-500 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Departs: {new Date(t.departureTime).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-navy-400 uppercase block">Expected Earnings</span>
                    <span className="text-base font-extrabold text-navy-900">₹{(t.totalAgreedEarnings || 3500).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
