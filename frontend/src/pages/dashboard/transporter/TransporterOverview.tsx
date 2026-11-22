import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, PlusCircle, DollarSign, Calendar, TrendingUp, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useAuth } from '../../../contexts/AuthContext';
import { MOCK_TRIPS, MOCK_VEHICLES, MOCK_SHIPMENTS } from '../../../services/mockData';

export const TransporterOverview: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Transporter Portal</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-navy-500 font-medium">Fleet: 4 Registered Trucks</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-navy-500 mt-1">Operating Corridor: {currentUser.meta.operatingCorridor}</p>
        </div>

        <div className="flex gap-2.5">
          <Link to="/dashboard/transporter/calendar">
            <Button variant="primary" size="md" className="bg-amber-700 hover:bg-amber-800" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Publish Planned Route
            </Button>
          </Link>
          <Link to="/dashboard/transporter/opportunities">
            <Button variant="outline" size="md" leftIcon={<Truck className="w-4 h-4" />}>
              Find Return Loads
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Fleet Capacity Fill"
          value="92.4%"
          icon={<Truck className="w-5 h-5 text-amber-600" />}
          trend={{ value: '+44%', isPositive: true, label: 'vs unshared runs' }}
        />
        <StatCard
          title="Monthly Gross Earnings"
          value="₹1,24,500"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          subtitle="All trips settled via escrow"
        />
        <StatCard
          title="Empty Backhaul Saved"
          value="1,420 km"
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          subtitle="This calendar month"
        />
        <StatCard
          title="Driver Rating"
          value="4.8 ★"
          icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
          subtitle="142 Verified trips"
        />
      </div>

      {/* Live Trip Execution Status */}
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Trip in Transit</span>
            <h3 className="text-base font-bold text-navy-900">Trip #GR-TRIP-2026-08 (Tata Bolero MH 15 EF 4921)</h3>
          </div>
          <Link to="/dashboard/transporter/trips">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Manage Waypoints
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-neutral-surface rounded-xl border border-slate-200">
            <span className="text-navy-400 block mb-1">Payload Weight</span>
            <p className="font-bold text-navy-900 text-sm">1.8 MT / 2.0 MT (90% Loaded)</p>
            <p className="text-navy-500 mt-0.5">2 Pickups Consolidated</p>
          </div>

          <div className="p-3.5 bg-neutral-surface rounded-xl border border-slate-200">
            <span className="text-navy-400 block mb-1">Upcoming Waypoint</span>
            <p className="font-bold text-navy-900 text-sm">Vashi APMC Mandi, Sector 19</p>
            <p className="text-emerald-700 font-medium mt-0.5">Expected Unload: 2:45 PM</p>
          </div>

          <div className="p-3.5 bg-neutral-surface rounded-xl border border-slate-200">
            <span className="text-navy-400 block mb-1">Trip Earnings (Escrow Locked)</span>
            <p className="font-bold text-forest-primary text-base">₹5,900</p>
            <p className="text-navy-500 mt-0.5">Auto-releases on Delivery OTP</p>
          </div>
        </div>
      </div>
    </div>
  );
};
