import React from 'react';
import { TrendingUp, BarChart2, PieChart, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { MOCK_PLATFORM_STATS } from '../../../services/mockData';

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Macro Corridor Analytics & Utilization</h1>
        <p className="text-xs text-navy-500 mt-1">Telemetry analytics regarding route consolidation efficiency and vehicle utilization rates.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vehicle Load Factor"
          value="92.4%"
          icon={<TrendingUp className="w-5 h-5 text-forest-primary" />}
          trend={{ value: '+44%', isPositive: true, label: 'above baseline' }}
        />
        <StatCard
          title="Corridor Match Ratio"
          value="88.7%"
          icon={<BarChart2 className="w-5 h-5 text-blue-600" />}
          subtitle="Pickup requests fulfilled"
        />
        <StatCard
          title="Return Deadhead Avoided"
          value="462,000 km"
          icon={<Activity className="w-5 h-5 text-emerald-600" />}
          subtitle="Total empty backhauls killed"
        />
        <StatCard
          title="Carbon Abatement"
          value="184.6 MT CO2"
          icon={<PieChart className="w-5 h-5 text-purple-600" />}
          subtitle="Calculated fuel savings"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <h3 className="font-bold text-sm text-navy-900">Top Agricultural Transit Corridors</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-neutral-surface rounded-lg">
              <span className="font-semibold text-navy-900">Nashik &rarr; Vashi APMC (Onions/Grapes)</span>
              <span className="font-bold text-forest-primary">1,420 MT Moved</span>
            </div>
            <div className="flex justify-between p-2.5 bg-neutral-surface rounded-lg">
              <span className="font-semibold text-navy-900">Indore &rarr; Choithram Mandi (Soybean/Wheat)</span>
              <span className="font-bold text-forest-primary">980 MT Moved</span>
            </div>
            <div className="flex justify-between p-2.5 bg-neutral-surface rounded-lg">
              <span className="font-semibold text-navy-900">Guntur &rarr; Hyderabad APMC (Chilies/Tobacco)</span>
              <span className="font-bold text-forest-primary">840 MT Moved</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <h3 className="font-bold text-sm text-navy-900">Corridor Freight Balance Ratio</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-neutral-surface rounded-lg">
              <span className="font-semibold text-navy-900">Forward Produce Inflow</span>
              <span className="font-bold text-navy-900">76% of capacity</span>
            </div>
            <div className="flex justify-between p-2.5 bg-neutral-surface rounded-lg">
              <span className="font-semibold text-navy-900">Return Backhaul Fertilizers / Inputs</span>
              <span className="font-bold text-emerald-700">68% of capacity matched</span>
            </div>
            <div className="flex justify-between p-2.5 bg-neutral-surface rounded-lg">
              <span className="font-semibold text-navy-900">Net Unpaid Miles</span>
              <span className="font-bold text-forest-primary">Dropped to 8.2%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
