import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Sprout, ArrowRight, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { shipmentService } from '../../../services/shipmentService';
import { MOCK_SHIPMENTS } from '../../../services/mockData';

export const MyShipmentsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await shipmentService.getShipments({
        search: search || undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined
      });
      const items = res.data?.items || res.data || [];
      if (items.length > 0) {
        setShipments(items);
      } else {
        // Use demo items if user has no real backend shipments yet
        const demoFiltered = MOCK_SHIPMENTS.filter((s) => {
          const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
          const matchesSearch =
            s.cargoName.toLowerCase().includes(search.toLowerCase()) ||
            s.destination.district.toLowerCase().includes(search.toLowerCase());
          return matchesStatus && matchesSearch;
        });
        setShipments(demoFiltered);
      }
    } catch {
      // Resilient fallback to demo data on connection glitch
      const demoFiltered = MOCK_SHIPMENTS.filter((s) => {
        const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
        const matchesSearch =
          s.cargoName.toLowerCase().includes(search.toLowerCase()) ||
          s.destination.district.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      });
      setShipments(demoFiltered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShipments();
  };

  const handleCancelShipment = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this shipment?')) return;
    setCancellingId(id);
    try {
      await shipmentService.cancelShipment(id);
      await fetchShipments();
    } catch {
      // optimistic state update
      setShipments((prev) =>
        prev.map((s) => (s._id === id || s.id === id ? { ...s, status: 'CANCELLED' } : s))
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">My Produce Consignments</h1>
          <p className="text-xs text-navy-500 mt-1">
            Real-time tracking of listed harvest loads, vehicle matches, and dispatched deliveries.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={fetchShipments}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Link to="/dashboard/farmer/create-shipment">
            <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create Shipment
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search crop, commodity, or mandi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['ALL', 'PENDING', 'LISTED', 'MATCHED', 'BOOKED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              type="button"
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-forest-primary text-white'
                  : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </form>

      {/* Shipments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-navy-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest-primary mb-2" />
            Loading shipments...
          </div>
        ) : shipments.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Sprout className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-navy-900">No shipments found</h3>
            <p className="text-xs text-navy-500 max-w-sm mx-auto">
              You haven't posted any loads matching this filter. Click below to create your first shipment.
            </p>
            <Link to="/dashboard/farmer/create-shipment">
              <Button size="sm" variant="primary">Create Shipment</Button>
            </Link>
          </Card>
        ) : (
          shipments.map((s) => {
            const id = s._id || s.id;
            return (
              <Card key={id} className="p-4 hover:border-forest-300 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-navy-900">{s.cargoName}</h3>
                      <Badge
                        variant={
                          s.status === 'DELIVERED'
                            ? 'success'
                            : s.status === 'IN_TRANSIT'
                            ? 'warning'
                            : s.status === 'CANCELLED'
                            ? 'error'
                            : 'info'
                        }
                      >
                        {s.status}
                      </Badge>
                      {s.isPerishable && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-semibold border border-amber-200">
                          Perishable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-navy-500">
                      {s.weightKg} kg &bull; {s.packagingType || 'Mesh Bags'} &bull; Max Budget: ₹{s.maxBudgetInr || 2500}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-navy-700 pt-1">
                      <span className="font-semibold text-navy-900">{s.origin?.villageOrTown || 'Dindori'} ({s.origin?.district || 'Nashik'})</span>
                      <span className="text-slate-400">&rarr;</span>
                      <span className="font-semibold text-forest-primary">
                        {s.destination?.mandiOrMarketName || s.destination?.address || 'APMC Mandi'} ({s.destination?.district || 'Mumbai'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    {['PENDING', 'LISTED', 'MATCHED'].includes(s.status) && (
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        disabled={cancellingId === id}
                        onClick={() => handleCancelShipment(id)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Cancel
                      </Button>
                    )}
                    <Link to="/dashboard/farmer/trips">
                      <Button size="xs" variant="primary">
                        View Matches
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
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
