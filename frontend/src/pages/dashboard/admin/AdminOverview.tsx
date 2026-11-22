import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Truck, AlertTriangle, DollarSign, Activity, FileCheck, ArrowRight } from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { MOCK_PLATFORM_STATS, MOCK_DISPUTES, MOCK_VERIFICATION_DOCS } from '../../../services/mockData';

export const AdminOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Super Admin Console</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-navy-500 font-medium">Platform Trust & Corridors</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">System Telemetry & Moderation</h1>
          <p className="text-xs text-navy-500 mt-1">Platform-wide health, KYC queue, active transit radar, and escrow ledger.</p>
        </div>

        <div className="flex gap-2.5">
          <Link to="/dashboard/admin/verifications">
            <Button variant="primary" size="md" className="bg-purple-700 hover:bg-purple-800" leftIcon={<FileCheck className="w-4 h-4" />}>
              Review KYC Queue (3)
            </Button>
          </Link>
          <Link to="/dashboard/admin/disputes">
            <Button variant="outline" size="md" leftIcon={<AlertTriangle className="w-4 h-4" />}>
              Active Disputes (1)
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value="7,130"
          icon={<Users className="w-5 h-5 text-purple-600" />}
          subtitle="5,890 Farmers • 1,240 Transporters"
        />
        <StatCard
          title="Active Freight Moved"
          value="14,850 MT"
          icon={<Truck className="w-5 h-5 text-forest-primary" />}
          subtitle="3,820 Completed multi-stop trips"
        />
        <StatCard
          title="Escrow Volume Held"
          value="₹18,42,000"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          subtitle="100% Locked in dual-OTP contracts"
        />
        <StatCard
          title="System Health"
          value="99.98% Up"
          icon={<Activity className="w-5 h-5 text-blue-600" />}
          subtitle="OR-Tools Solver Latency: 1.2s"
        />
      </div>

      {/* Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Queue */}
        <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-600" />
              Pending Document Verifications
            </h3>
            <Link to="/dashboard/admin/verifications" className="text-xs text-purple-700 font-bold hover:underline">
              Inspect All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-navy-900">Balwinder Singh (Transporter)</p>
                <p className="text-navy-500 text-[11px]">Tata 407 Reefer Van (MH 04 KF 3311) • Commercial RC</p>
              </div>
              <Badge variant="warning" size="sm">PENDING REVIEW</Badge>
            </div>
            <div className="py-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-navy-900">Ramesh Patel (Farmer)</p>
                <p className="text-navy-500 text-[11px]">Dindori APMC Seller License • Renewed Pass</p>
              </div>
              <Badge variant="warning" size="sm">PENDING REVIEW</Badge>
            </div>
          </div>
        </div>

        {/* Disputes Queue */}
        <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Active Shipper & Transporter Disputes
            </h3>
            <Link to="/dashboard/admin/disputes" className="text-xs text-rose-700 font-bold hover:underline">
              Arbitrate (1)
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {MOCK_DISPUTES.map((d) => (
              <div key={d._id} className="py-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-navy-900">{d.disputeNumber}</span>
                  <Badge variant="error" size="sm">{d.status}</Badge>
                </div>
                <p className="text-navy-700 text-[11px] leading-snug">{d.description}</p>
                <p className="text-[10px] text-slate-400">Claim Amount: ₹{d.claimAmountInr} • Escrow Paused</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fraud Detection & System Risk Audit Radar (Phase 8) */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-sm text-navy-900">Fraud Prevention Radar & Pattern Anomalies</h3>
              <p className="text-[11px] text-neutral-500">
                Automated velocity checks, cancellation abuse alerts, and duplicate credential flags
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
            2 High-Priority Alerts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Repeated Cancellation Spike
              </span>
              <Badge variant="warning" size="sm">FLAGGED</Badge>
            </div>
            <p className="text-neutral-700 leading-snug">
              User <strong>+91 94220 18833</strong> recorded 4 cancelled bookings within 48 hours. Potential speculative slot hoarding.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="xs" variant="outline" className="text-amber-800 border-amber-300">Issue Warning</Button>
              <Button size="xs" variant="danger">Restrict Booking</Button>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                Abnormal Payload Discrepancy
              </span>
              <Badge variant="error" size="sm">CRITICAL</Badge>
            </div>
            <p className="text-neutral-700 leading-snug">
              Shipment <strong>#SHP-7718</strong> declared 32,000 kg for an LCV mini-truck class. Exceeds permissible axle load limit.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button size="xs" variant="outline">Inspect Consignment</Button>
              <Button size="xs" variant="danger">Quarantine Load</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
