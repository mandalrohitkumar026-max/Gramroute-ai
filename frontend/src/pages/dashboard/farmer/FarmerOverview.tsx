import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  Truck, 
  PlusCircle, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  DollarSign, 
  CheckCircle2, 
  MapPin, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useAuth } from '../../../contexts/AuthContext';
import { MOCK_SHIPMENTS, MOCK_TRIPS, MOCK_BOOKINGS } from '../../../services/mockData';

export const FarmerOverview: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Farmer Portal</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-navy-500 font-medium">{currentUser.meta.fpoName}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Primary Farm Location: {currentUser.locationName}
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link to="/dashboard/farmer/create-shipment">
            <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              List New Produce Load
            </Button>
          </Link>
          <Link to="/dashboard/farmer/available-trips">
            <Button variant="outline" size="md" leftIcon={<Truck className="w-4 h-4" />}>
              Find Shared Trucks
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Shipments"
          value="2 Consignments"
          icon={<Sprout className="w-5 h-5 text-forest-primary" />}
          subtitle="1 Matched, 1 In Transit to Vashi"
        />
        <StatCard
          title="Total Freight Saved"
          value="₹14,250"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          trend={{ value: '34.5%', isPositive: true, label: 'vs spot truck' }}
        />
        <StatCard
          title="Produce Dispatched"
          value="4.95 MT"
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          subtitle="Red Onions & Table Grapes"
        />
        <StatCard
          title="Escrow Protected"
          value="₹2,950"
          icon={<CheckCircle2 className="w-5 h-5 text-purple-600" />}
          subtitle="Held until delivery OTP"
        />
      </div>

      {/* Live Active Shipment Tracker Widget */}
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block">Live Delivery in Progress</span>
            <h3 className="text-base font-bold text-navy-900">Nashik Grapes &rarr; Pune Gultekdi APMC</h3>
          </div>
          <Link to="/dashboard/farmer/tracking">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Live Telemetry
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-neutral-surface rounded-xl border border-slate-200">
            <span className="text-navy-400 block mb-1">Assigned Transporter</span>
            <p className="font-bold text-navy-900 text-sm">Balwinder Singh</p>
            <p className="text-navy-500 mt-0.5">Tata 407 Reefer Van (MH 04 KF 3311)</p>
          </div>

          <div className="p-3 bg-neutral-surface rounded-xl border border-slate-200">
            <span className="text-navy-400 block mb-1">Pickup Verification OTP</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-base tracking-widest text-forest-primary">4819</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">VERIFIED</span>
            </div>
            <p className="text-navy-500 mt-0.5">Cargo loaded at Pimpalgaon Baswant</p>
          </div>

          <div className="p-3 bg-neutral-surface rounded-xl border border-slate-200">
            <span className="text-navy-400 block mb-1">Estimated Arrival</span>
            <p className="font-bold text-navy-900 text-sm">Today, 2:45 PM</p>
            <p className="text-emerald-700 font-medium mt-0.5">Ahead of 4:00 PM Mandi Auction</p>
          </div>
        </div>
      </div>

      {/* Recent Shipments Table */}
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-navy-900">My Recent Produce Listings</h3>
          <Link to="/dashboard/farmer/shipments" className="text-xs text-forest-primary font-bold hover:underline">
            View All ({MOCK_SHIPMENTS.length})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-navy-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Produce & Weight</th>
                <th className="pb-3">Origin Village</th>
                <th className="pb-3">Destination Mandi</th>
                <th className="pb-3">Budget / Agreed</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_SHIPMENTS.map((ship) => (
                <tr key={ship._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 font-bold text-navy-900">
                    <div>{ship.cargoName}</div>
                    <div className="text-[11px] font-normal text-navy-500">{(ship.weightKg / 1000).toFixed(2)} MT • {ship.packagingType}</div>
                  </td>
                  <td className="py-3 text-navy-700">{ship.origin.villageOrTown}</td>
                  <td className="py-3 text-navy-700">{ship.destination.mandiOrMarketName || ship.destination.district}</td>
                  <td className="py-3 font-semibold text-navy-900">₹{ship.maxBudgetInr.toLocaleString('en-IN')}</td>
                  <td className="py-3">
                    <Badge
                      variant={
                        ship.status === 'MATCHED' ? 'forest' : ship.status === 'IN_TRANSIT' ? 'info' : 'success'
                      }
                      size="sm"
                      dot
                    >
                      {ship.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to="/dashboard/farmer/tracking"
                      className="text-xs font-semibold text-forest-primary hover:text-forest-800"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
