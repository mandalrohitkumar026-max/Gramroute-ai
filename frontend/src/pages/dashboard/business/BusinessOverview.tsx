import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, PlusCircle, TrendingUp, DollarSign, Truck, FileText, CheckCircle2 } from 'lucide-react';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { MOCK_SHIPMENTS } from '../../../services/mockData';

export const BusinessOverview: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Enterprise & FPO Hub</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-navy-500 font-medium">GST: {currentUser.meta.gstNumber}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">{currentUser.name}</h1>
          <p className="text-xs text-navy-500 mt-1">{currentUser.meta.businessType}</p>
        </div>

        <div className="flex gap-2.5">
          <Link to="/dashboard/business/bulk-create">
            <Button variant="primary" size="md" className="bg-blue-700 hover:bg-blue-800" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Create Bulk Consignment
            </Button>
          </Link>
          <Link to="/dashboard/business/transporters">
            <Button variant="outline" size="md" leftIcon={<Truck className="w-4 h-4" />}>
              Transporter Network
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Dispatched Volume"
          value="240 MT"
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
          subtitle="Monthly input & produce freight"
        />
        <StatCard
          title="Consignment Spend"
          value="₹3,48,200"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
          trend={{ value: '28.4%', isPositive: true, label: 'saved via corridor matches' }}
        />
        <StatCard
          title="Active Contract Routes"
          value="8 Scheduled"
          icon={<Truck className="w-5 h-5 text-forest-primary" />}
          subtitle="Nashik, Pune & Sangamner hubs"
        />
        <StatCard
          title="Delivery On-Time SLA"
          value="99.2%"
          icon={<CheckCircle2 className="w-5 h-5 text-purple-600" />}
          subtitle="Within 2-hr APMC gate windows"
        />
      </div>

      {/* Corporate Freight In Transit */}
      <div className="bg-white rounded-2xl border border-neutral-border p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-navy-900">Current Freight Dispatches</h3>
          <Link to="/dashboard/business/shipments" className="text-xs text-blue-700 font-bold hover:underline">
            Manage All Consignments
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-navy-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Consignment Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Weight</th>
                <th className="pb-3">Origin &rarr; Destination</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 font-bold text-navy-900">Organic Neem Fertilizer (Batch 41)</td>
                <td className="py-3 text-navy-600">Agricultural Inputs</td>
                <td className="py-3 font-semibold text-navy-900">2.50 MT</td>
                <td className="py-3 text-navy-600">Ambad MIDC &rarr; Sangamner Hub</td>
                <td className="py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">LISTED</span></td>
                <td className="py-3 text-right">
                  <Link to="/dashboard/business/tracking" className="text-xs font-semibold text-blue-700 hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
