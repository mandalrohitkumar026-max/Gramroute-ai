import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Sprout, 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Zap, 
  Scale, 
  FileCheck, 
  PhoneCall, 
  ChevronDown, 
  ChevronUp,
  Award
} from 'lucide-react';
import { NetworkVisualizer } from '../../components/landing/NetworkVisualizer';
import { Button } from '../../components/ui/Button';
import { MOCK_PLATFORM_STATS } from '../../services/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/api';

export const LandingPage: React.FC = () => {
  const { switchRole } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handlePersonaJump = (role: Role) => {
    switchRole(role);
  };

  const faqs = [
    {
      q: 'How does GramRoute AI calculate fair transportation costs for farmers?',
      a: 'We use a transparent proportional ton-kilometer algorithm. Instead of paying for an entire private vehicle, farmers only pay for the exact weight (in quintals or tonnes) and distance transported. Consolidated trips unlock volume discounts up to 35% compared to spot market rates.'
    },
    {
      q: 'How do transporters benefit from shared loads?',
      a: 'Transporters eliminate empty return journeys (backhauls) and increase per-trip gross earnings by 40-50%. The platform clusters nearby produce pickups without causing significant route deviations, maximizing total payload capacity.'
    },
    {
      q: 'How are produce perishability and delivery time windows handled?',
      a: 'Our routing engine models perishability tiers (High, Moderate, Non-Perishable) and delivery time windows. For example, fresh strawberries or grapes are prioritized with rapid direct transit or refrigerated vehicle allocation.'
    },
    {
      q: 'How does the payment and proof of delivery (POD) escrow work?',
      a: 'Shippers deposit the transport fee into platform escrow upon booking confirmation. Upon pickup, an SMS OTP is verified at the farm. Upon delivery at the mandi or warehouse, consignee OTP confirmation automatically triggers instant payout to the transporter bank account.'
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
              <span>Intelligent Rural Freight Optimization</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.12]">
              Smarter Freight. <br />
              <span className="text-forest-primary">Fuller Vehicles.</span> <br />
              Stronger Rural Connections.
            </h1>

            <p className="text-base sm:text-lg text-navy-600 leading-relaxed max-w-2xl font-normal">
              Empowering farmers, FPOs, and independent transporters. We consolidate compatible agricultural produce, eliminate empty return backhauls, and guarantee fair, transparent ton-km pricing.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link to="/dashboard/farmer" onClick={() => handlePersonaJump('FARMER')}>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Ship Produce (Farmer)
                </Button>
              </Link>
              <Link to="/dashboard/transporter" onClick={() => handlePersonaJump('TRANSPORTER')}>
                <Button variant="secondary" size="lg" leftIcon={<Truck className="w-4 h-4" />}>
                  Offer Transport (Driver)
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="lg">
                  Explore Architecture
                </Button>
              </Link>
            </div>

            {/* Micro Trust Proofs */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-navy-500 font-medium border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Middlemen Extortion</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Google OR-Tools Route Solver</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Escrow Payment Security</span>
              </div>
            </div>
          </div>

          {/* Right Hero: Animated Logistics Network Simulation */}
          <div className="lg:col-span-5">
            <NetworkVisualizer />
          </div>
        </div>
      </section>

      {/* 2. Impact Metrics Section (Clearly labelled illustrative data) */}
      <section className="bg-neutral-surface border-y border-neutral-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-bold text-forest-700 uppercase tracking-widest block mb-1">
              *Illustrative Simulation Telemetry
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
              Rural Freight Transformation by the Numbers
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center">
              <div className="text-3xl font-extrabold text-forest-primary mb-1">
                {MOCK_PLATFORM_STATS.averageCostReductionPercentage}%
              </div>
              <div className="text-xs font-bold text-navy-800">Average Logistics Cost Reduction</div>
              <p className="text-[11px] text-navy-400 mt-0.5">Compared to unshared spot truck hiring</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center">
              <div className="text-3xl font-extrabold text-navy-900 mb-1">
                {(MOCK_PLATFORM_STATS.emptyBackhaulKmSaved / 1000).toFixed(0)}k km
              </div>
              <div className="text-xs font-bold text-navy-800">Empty Return Backhauls Saved</div>
              <p className="text-[11px] text-navy-400 mt-0.5">Matched return corridor freight</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center">
              <div className="text-3xl font-extrabold text-forest-primary mb-1">
                {(MOCK_PLATFORM_STATS.totalFreightMovedTons / 1000).toFixed(1)}k MT
              </div>
              <div className="text-xs font-bold text-navy-800">Produce Consolidated & Dispatched</div>
              <p className="text-[11px] text-navy-400 mt-0.5">Grapes, onions, vegetables, grains</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center">
              <div className="text-3xl font-extrabold text-emerald-600 mb-1">
                {MOCK_PLATFORM_STATS.onTimeMandiArrivalRate}%
              </div>
              <div className="text-xs font-bold text-navy-800">Mandi Window On-Time Rate</div>
              <p className="text-[11px] text-navy-400 mt-0.5">Arriving before auction opening hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem vs Solution Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider block mb-1">
            Systemic Rural Challenge & Innovation
          </span>
          <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Why Rural Freight In India Is Broken — And How We Fix It
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
              Traditional Fragmented Transport
            </div>
            <h3 className="text-xl font-bold text-rose-950">
              The Reality: 48% Empty Backhauls & Heavy Middlemen Tolls
            </h3>
            <ul className="space-y-3.5 text-xs text-rose-900 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold text-sm">✕</span>
                <span><strong>High Fixed Truck Costs:</strong> A farmer with 15 quintals of tomatoes must hire an entire 2-ton pickup truck or accept heavy distress discounts from village middlemen.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold text-sm">✕</span>
                <span><strong>Unpaid Return Backhauls:</strong> Transporters return empty from APMC mandis back to rural villages, doubling per-km fuel expenses.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold text-sm">✕</span>
                <span><strong>Zero In-Transit Visibility:</strong> Blind spots on road breakdowns, route delays, or spoiled perishable produce without OTP proof-of-delivery.</span>
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="bg-forest-50/50 rounded-2xl border border-forest-200 p-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-bold">
              The GramRoute AI Solution
            </div>
            <h3 className="text-xl font-bold text-forest-950">
              Shared Load Optimization & Multi-Stop Waypoint Consolidation
            </h3>
            <ul className="space-y-3.5 text-xs text-forest-900 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span><strong>Pay Only for What You Ship:</strong> Proportional ton-km billing allows farmers to share a truck and pay strictly for their load volume.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span><strong>Automatic Backhaul Opportunity Finder:</strong> Transporters receive automated matches for farm inputs (fertilizers, seeds) on their return journey.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span><strong>Guaranteed Escrow Payouts:</strong> Pickup OTP at farm and delivery OTP at mandi ensure instant payment disbursement without delayed debtor cycles.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. How It Works in 4 Steps */}
      <section className="bg-neutral-surface border-y border-neutral-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider block mb-1">
              End-To-End Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              How GramRoute AI Works in 4 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-primary font-extrabold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="font-bold text-sm text-navy-900 mb-1.5">List Produce Load</h4>
              <p className="text-xs text-navy-500 leading-relaxed">
                Farmer or FPO inputs crop type, bag count, weight, and preferred mandi delivery window via mobile.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-primary font-extrabold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="font-bold text-sm text-navy-900 mb-1.5">AI Consolidation & Match</h4>
              <p className="text-xs text-navy-500 leading-relaxed">
                Google OR-Tools solver clusters nearby shipments along active vehicle corridors, calculating instant fair rates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-primary font-extrabold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="font-bold text-sm text-navy-900 mb-1.5">Secure OTP Pickup</h4>
              <p className="text-xs text-navy-500 leading-relaxed">
                Transporter arrives at farm hub. Pickup OTP handshake confirms cargo loading and activates GPS tracking.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-primary font-extrabold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="font-bold text-sm text-navy-900 mb-1.5">Mandi Drop & Escrow Release</h4>
              <p className="text-xs text-navy-500 leading-relaxed">
                Produce is received at mandi trader stall. Delivery OTP verification triggers immediate fund settlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Key Platform Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider block mb-1">
            Core Technological Capabilities
          </span>
          <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Engineered For Rural Agricultural Reality
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="p-3 w-fit rounded-lg bg-forest-50 text-forest-primary">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-navy-900">Google OR-Tools Route Solver</h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Solves the complex Vehicle Routing Problem with time windows (VRPTW). Clusters multiple small farmers along a corridor without excessive driver detours.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="p-3 w-fit rounded-lg bg-blue-50 text-blue-700">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-navy-900">Proportional Ton-Km Pricing</h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Dynamic fair price allocation models base vehicle haulage, load density, consolidation savings, and platform fees transparently.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="p-3 w-fit rounded-lg bg-amber-50 text-amber-700">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-navy-900">Dual OTP Digital Proof of Delivery</h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Eliminates paper receipt disputes and transit fraud. Dedicated SMS fallback ensures OTP operation even on 2G feature phones.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Illustrative Optimization Comparison Widget */}
      <section className="bg-white rounded-2xl border border-neutral-border p-8 max-w-7xl mx-auto shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider block mb-1">
            Economics & Route Comparison
          </span>
          <h2 className="text-2xl font-bold text-navy-900">
            Nashik to Vashi APMC Corridor Comparison
          </h2>
          <p className="text-xs text-navy-500">184 km Transit • 3 Farmers Consolidating</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Without GramRoute */}
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-slate-500">Without Optimization</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Fragmented</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-navy-600">Trucks Deployed:</span>
                <span className="font-bold text-navy-900">3 Separate Pickups</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-navy-600">Average Capacity Fill:</span>
                <span className="font-bold text-rose-600">38% (Underloaded)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-navy-600">Total Combined Freight Cost:</span>
                <span className="font-bold text-navy-900">₹11,400</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-navy-600">Return Empty Backhaul:</span>
                <span className="font-bold text-rose-600">100% Empty (Zero Income)</span>
              </div>
            </div>
          </div>

          {/* With GramRoute AI */}
          <div className="p-6 rounded-xl bg-forest-50/70 border border-forest-300 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-forest-800">GramRoute AI Consolidated</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-forest-200 text-forest-900">34.5% Net Savings</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-forest-200">
                <span className="text-forest-950 font-medium">Trucks Deployed:</span>
                <span className="font-bold text-forest-900">1 Shared Vehicle (Multi-Stop)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest-200">
                <span className="text-forest-950 font-medium">Average Capacity Fill:</span>
                <span className="font-bold text-forest-700">92% (High Efficiency)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-forest-200">
                <span className="text-forest-950 font-medium">Total Combined Freight Cost:</span>
                <span className="font-bold text-forest-900">₹7,450 (Saved ₹3,950)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-forest-950 font-medium">Return Empty Backhaul:</span>
                <span className="font-bold text-emerald-700">Matched with Sangamner Seeds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider block mb-1">
            Questions & Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex justify-between items-center font-bold text-sm text-navy-900 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-forest-primary shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-navy-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-primary text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Transform Your Rural Freight Logistics?
            </h2>
            <p className="text-forest-100 text-sm sm:text-base leading-relaxed">
              Join hundreds of progressive farmers, FPOs, and transport operators across Maharashtra, Madhya Pradesh, and Andhra Pradesh.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 relative z-10 pt-2">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-white text-forest-900 hover:bg-slate-100">
                Create Free Account
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-forest-300 text-white hover:bg-forest-800">
                Talk to Logistics Specialist
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
