import React from 'react';
import { NetworkVisualizer } from '../../components/landing/NetworkVisualizer';
import { 
  Sprout, 
  Truck, 
  Scale, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone,
  Cpu
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-forest-700 uppercase tracking-widest block">
          Algorithmic Architecture Explained
        </span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">
          How GramRoute AI Optimizes Rural Freight
        </h1>
        <p className="text-base text-navy-600 leading-relaxed">
          From produce listing at the farm gate to auction delivery at the APMC mandi, discover how our matching engine and OR-Tools algorithms coordinate shared logistics.
        </p>
      </div>

      <NetworkVisualizer />

      {/* Step-by-Step Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="font-bold text-lg text-navy-900">1. Spatial Corridor Aggregation</h3>
          <p className="text-xs text-navy-600 leading-relaxed">
            When farmers post produce loads, MongoDB <code>2dsphere</code> geospatial queries match origins against active truck paths. Vehicles within 8-12 km corridor detour thresholds are evaluated for spare weight and cubic meter capacity.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="font-bold text-lg text-navy-900">2. Google OR-Tools VRP Solver</h3>
          <p className="text-xs text-navy-600 leading-relaxed">
            Our Python AI engine solves the Vehicle Routing Problem with Time Windows (VRPTW). Pickups are chronologically locked before drops, and arrival at the APMC mandi is guaranteed before morning auction trading opens.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="font-bold text-lg text-navy-900">3. Proportional Ton-Km Settlement</h3>
          <p className="text-xs text-navy-600 leading-relaxed">
            Every shipper pays only for their individual weight multiplied by distance:
            <code className="block my-2 p-2 bg-slate-50 text-[11px] rounded border border-slate-200 font-mono text-navy-800">
              ShipperCost = (Weight × Dist × BaseRate) - ConsolidationDiscount + Fee
            </code>
            Transporters receive the aggregated earnings with 0% unpaid dead mileage.
          </p>
        </div>
      </div>
    </div>
  );
};
