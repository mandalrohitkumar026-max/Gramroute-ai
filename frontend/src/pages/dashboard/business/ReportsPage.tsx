import React from 'react';
import { TrendingUp, Download, DollarSign, Leaf, Truck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Logistics Reports & ESG Impact</h1>
          <p className="text-xs text-navy-500 mt-1">Audit trail of freight cost savings, ton-kilometer efficiencies, and reduced fuel emissions.</p>
        </div>

        <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
          Download Annual Audit (PDF)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase text-navy-400">Total Net Freight Savings</span>
          <div className="text-3xl font-extrabold text-navy-900">₹8,42,100</div>
          <p className="text-xs text-emerald-700 font-semibold">28.4% lower than spot truck quotes</p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-forest-50 text-forest-primary">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase text-navy-400">CO2 Emissions Avoided</span>
          <div className="text-3xl font-extrabold text-forest-primary">42.8 MT</div>
          <p className="text-xs text-navy-500">Achieved via backhaul matching & load packing</p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-700">
            <Truck className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase text-navy-400">Empty Km Eliminated</span>
          <div className="text-3xl font-extrabold text-blue-800">18,400 km</div>
          <p className="text-xs text-navy-500">Unpaid deadhead mileage converted to active freight</p>
        </Card>
      </div>
    </div>
  );
};
