import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, CheckCircle2, TrendingDown, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const ForFarmersPage: React.FC = () => {
  const { switchRole } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
            <Sprout className="w-4 h-4 text-forest-600" />
            <span>Dedicated Farmer Solutions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-900 tracking-tight leading-tight">
            Stop Paying for Empty Trucks. <br />
            <span className="text-forest-primary">Share the Journey, Keep the Profits.</span>
          </h1>
          <p className="text-base text-navy-600 leading-relaxed font-normal">
            Whether you have 10 crates of tomatoes or 50 bags of onions, GramRoute AI matches you with reliable passing trucks going to major APMC mandis.
          </p>
          <div className="flex gap-4 pt-2">
            <Link to="/dashboard/farmer/create-shipment" onClick={() => switchRole('FARMER')}>
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                List Produce Load
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" size="lg">
                View Price Formula
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-forest-50/70 border border-forest-200 rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-forest-950">Farmer Benefits at a Glance</h3>
          <ul className="space-y-4 text-xs text-forest-900 leading-relaxed">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
              <div>
                <strong>35% Lower Transport Costs:</strong> Pay strictly for your bags or crates, not the entire truck rental fee.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
              <div>
                <strong>Farm Gate Pickup:</strong> Verified drivers come directly to your village aggregation point or farm gate.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
              <div>
                <strong>Direct APMC Mandi Access:</strong> Avoid forced distress sales to village moneylenders; sell directly at high-rate urban mandis.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
              <div>
                <strong>Live SMS Updates:</strong> Receive alerts when the truck is 30 minutes away, when loaded, and when delivered at the mandi.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
