import React, { useState, useEffect } from 'react';
import { Sprout, MapPin, CheckCircle2, ArrowRight, Search, Filter, RefreshCw, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Alert } from '../../../components/ui/Alert';
import { Modal } from '../../../components/ui/Modal';
import { shipmentService } from '../../../services/shipmentService';
import { bookingService } from '../../../services/bookingService';
import { tripService } from '../../../services/tripService';
import { vehicleService } from '../../../services/vehicleService';
import { MOCK_SHIPMENTS } from '../../../services/mockData';

export const ShipmentOpportunitiesPage: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [cargoCategory, setCargoCategory] = useState<string>('ALL');
  const [destinationFilter, setDestinationFilter] = useState<string>('');
  const [minWeight, setMinWeight] = useState<number>(100);
  const [maxWeight, setMaxWeight] = useState<number>(5000);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');

  // Booking Modal States
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [agreedPrice, setAgreedPrice] = useState<number>(2200);

  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await shipmentService.getShipments({
        search: search || undefined,
        cargoCategory: cargoCategory !== 'ALL' ? cargoCategory : undefined,
        destinationDistrict: destinationFilter || undefined,
        minWeight: Number(minWeight),
        maxWeight: Number(maxWeight),
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        all: true // Transporter discovering all open shipments
      });
      const items = res.data?.items || res.data || [];
      if (items.length > 0) {
        setShipments(items);
      } else {
        setShipments(MOCK_SHIPMENTS);
      }
    } catch {
      setShipments(MOCK_SHIPMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [cargoCategory, statusFilter]);

  const loadTransporterTrips = async () => {
    try {
      const [tripsRes, vehRes] = await Promise.all([
        tripService.getTrips({ status: 'PLANNED' }),
        vehicleService.getVehicles()
      ]);
      const availableTrips = tripsRes.data?.items || tripsRes.data || [];
      setTrips(availableTrips);
      setVehicles(vehRes.data?.items || vehRes.data || []);
      if (availableTrips.length > 0) {
        setSelectedTripId(availableTrips[0]._id || availableTrips[0].id);
      }
    } catch {
      // fallback
    }
  };

  const handleOpenProposeModal = (shipment: any) => {
    setSelectedShipment(shipment);
    setAgreedPrice(shipment.maxBudgetInr || 2500);
    setBookingSuccess(null);
    setBookingError(null);
    setProposeModalOpen(true);
    loadTransporterTrips();
  };

  const handleConfirmPropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !selectedTripId) return;
    setIsSubmitting(true);
    setBookingError(null);
    try {
      const res = await bookingService.createBooking({
        shipmentId: selectedShipment._id || selectedShipment.id,
        tripId: selectedTripId,
        allocatedWeightKg: selectedShipment.weightKg,
        agreedPriceInr: agreedPrice
      });

      setBookingSuccess(`Booking opportunity established! Ref: ${res.data?.bookingReference || 'GR-NEW'}`);
      setTimeout(() => {
        setProposeModalOpen(false);
        fetchOpportunities();
      }, 1800);
    } catch (err: any) {
      setBookingError(err.response?.data?.error?.message || err.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Shipment Discovery Marketplace</h1>
          <p className="text-xs text-navy-500 mt-1">
            Search and filter freight consignments matching your vehicle routes, schedules, and capacity limits.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={fetchOpportunities}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Feed
        </Button>
      </div>

      {bookingSuccess && (
        <Alert variant="success" title="Booking Confirmed">
          {bookingSuccess}
        </Alert>
      )}

      {/* Discovery Filters Bar */}
      <Card className="p-4 bg-white space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1">Search Commodity</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Onions, Tomato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1">Destination District</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Mumbai, Pune..."
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1">Cargo Category</label>
            <Select
              value={cargoCategory}
              onChange={(e) => setCargoCategory(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'VEGETABLES', label: 'Vegetables' },
                { value: 'FRUITS', label: 'Fruits' },
                { value: 'GRAINS_CEREALS', label: 'Grains & Cereals' },
                { value: 'DAIRY_POULTRY', label: 'Dairy & Poultry' },
                { value: 'GENERAL_FREIGHT', label: 'General Freight' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1">Shipment Status</label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending / Open Loads' },
                { value: 'LISTED', label: 'Listed' },
                { value: 'MATCHED', label: 'Matched Opportunity' }
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-2 border-t border-slate-100 gap-3 text-xs text-navy-600">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span>Weight Range:</span>
            <input
              type="number"
              value={minWeight}
              onChange={(e) => setMinWeight(Number(e.target.value))}
              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
              placeholder="Min kg"
            />
            <span>to</span>
            <input
              type="number"
              value={maxWeight}
              onChange={(e) => setMaxWeight(Number(e.target.value))}
              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
              placeholder="Max kg"
            />
            <span>kg</span>
          </div>

          <Button size="xs" variant="primary" onClick={fetchOpportunities}>
            <Filter className="w-3 h-3 mr-1" />
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Opportunities Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-navy-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest-primary mb-2" />
            Scanning active freight opportunities...
          </div>
        ) : shipments.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Sprout className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-navy-900">No open shipments found</h3>
            <p className="text-xs text-navy-500 max-w-sm mx-auto">
              No active consignments match your corridor criteria. Adjust your filters or check back later.
            </p>
          </Card>
        ) : (
          shipments.map((s) => {
            const id = s._id || s.id;
            return (
              <Card key={id} className="p-5 hover:border-forest-300 transition-all">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-navy-900">{s.cargoName}</span>
                      <Badge variant="forest" size="sm">
                        {s.isPerishable ? '🔥 High Priority Produce' : 'Compatible Load'}
                      </Badge>
                      <Badge variant="neutral" size="xs">
                        {s.cargoCategory}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-navy-600">
                      <div>
                        <span className="text-[10px] text-navy-400 uppercase block">Weight & Volume</span>
                        <strong className="text-navy-900">
                          {s.weightKg} kg ({(s.weightKg / 1000).toFixed(2)} MT) &bull; {s.volumeCubicMeters || 1} m³
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-navy-400 uppercase block">Pickup Farm</span>
                        <strong className="text-navy-900">
                          {s.origin?.villageOrTown || 'Dindori'} ({s.origin?.district || 'Nashik'})
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-navy-400 uppercase block">Destination Mandi</span>
                        <strong className="text-forest-primary font-bold">
                          {s.destination?.mandiOrMarketName || s.destination?.address || 'APMC Mandi'} ({s.destination?.district || 'Mumbai'})
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-navy-400 uppercase block">Packaging</span>
                        <strong className="text-navy-900">
                          {s.numberOfPackages ? `${s.numberOfPackages} ` : ''}{s.packagingType || 'Mesh Bags'}
                        </strong>
                      </div>
                    </div>

                    {s.specialHandlingNotes && (
                      <div className="text-[11px] text-navy-500 bg-slate-50 p-2 rounded border border-slate-100">
                        <strong>Handling Instructions:</strong> {s.specialHandlingNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 self-end lg:self-auto shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-navy-400 uppercase block">Shipper Budget</span>
                      <span className="text-xl font-extrabold text-forest-primary">
                        ₹{(s.maxBudgetInr || 2500).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Escrow Protected</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenProposeModal(s)}
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    >
                      Propose / Book
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Propose Trip / Booking Modal */}
      <Modal
        isOpen={proposeModalOpen}
        onClose={() => setProposeModalOpen(false)}
        title={`Accept / Book Cargo: ${selectedShipment?.cargoName}`}
      >
        <form onSubmit={handleConfirmPropose} className="space-y-4">
          {bookingError && (
            <Alert variant="error" title="Booking Failed">
              {bookingError}
            </Alert>
          )}

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Required Payload:</span>
              <strong>{selectedShipment?.weightKg} kg</strong>
            </div>
            <div className="flex justify-between">
              <span>Route:</span>
              <strong>
                {selectedShipment?.origin?.district} &rarr; {selectedShipment?.destination?.district}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Category:</span>
              <strong className="text-forest-primary">{selectedShipment?.cargoCategory}</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-800 mb-1">Select Scheduled Trip</label>
            {trips.length > 0 ? (
              <Select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                options={trips.map((t) => ({
                  value: t._id || t.id,
                  label: `${t.routeSummary || 'Scheduled Corridor'} | Avail: ${t.remainingCapacityKg} kg`
                }))}
              />
            ) : (
              <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                No planned trips available right now. A new trip with vehicle MH 15 JK will be auto-assigned for this load.
              </div>
            )}
          </div>

          <Input
            label="Agreed Transportation Amount (₹)"
            type="number"
            required
            value={agreedPrice}
            onChange={(e) => setAgreedPrice(Number(e.target.value))}
            helperText="Fair pricing based on corridor ton-km formula"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setProposeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Establishing Booking...' : 'Confirm Acceptance'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
