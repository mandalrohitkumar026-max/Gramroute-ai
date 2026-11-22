import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle2, DollarSign, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const ForTransportersPage: React.FC = () => {
  const { switchRole } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>Dedicated Transporter Solutions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-900 tracking-tight leading-tight">
            Fill Empty Backhauls. <br />
            <span className="text-amber-700">Earn Up to ₹25,000 Extra Per Month.</span>
          </h1>
          <p className="text-base text-navy-600 leading-relaxed font-normal">
            Turn unpaid return miles from mandis into profitable payload runs. Pick up return agricultural inputs, fertilizers, or consolidated produce along your natural corridor.
          </p>
          <div className="flex gap-4 pt-2">
            <Link to="/dashboard/transporter/calendar" onClick={() => switchRole('TRANSPORTER')}>
              <Button variant="primary" size="lg" className="bg-amber-700 hover:bg-amber-800" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Publish Planned Trip
              </Button>
            </Link>
            <Link to="/dashboard/transporter/vehicles" onClick={() => switchRole('TRANSPORTER')}>
              <Button variant="outline" size="lg">
                Register Fleet
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-amber-950">Transporter Advantages</h3>
          <ul className="space-y-4 text-xs text-amber-900 leading-relaxed">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Zero Empty Return Deadhead:</strong> Instant matching with returning loads along your corridor.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Same-Day Escrow Payout:</strong> Money is held securely in platform escrow and disbursed directly to your UPI/bank upon delivery OTP confirmation.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Low Detour Routing:</strong> Our algorithm limits pickup waypoints to within 10-15% of your main highway path.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Zero Commission Onboarding:</strong> Register your Bolero, Tata Ace, or 407 with zero upfront fees.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
