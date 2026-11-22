import React from 'react';
import { Target, Users, Shield, Award, Sprout, Truck, Building2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-forest-700 uppercase tracking-widest block">
          Our Mission & Agricultural Roots
        </span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">
          Eliminating Waste in Rural Indian Logistics
        </h1>
        <p className="text-base text-navy-600 leading-relaxed">
          GramRoute AI was engineered to bridge the fundamental disconnect between smallholder farmers struggling with prohibitive transport freight and rural vehicle drivers running empty return miles.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-neutral-surface border border-slate-200 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-forest-100 text-forest-800">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">The Problem We Solve</h3>
          <p className="text-xs text-navy-600 leading-relaxed">
            Over 86% of Indian farmers are smallholders producing less than 2 metric tonnes of marketable surplus per harvest. Hiring an entire 3-tonne truck is economically impossible, forcing distress sales to village intermediaries at 20-30% below mandi prices.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-neutral-surface border border-slate-200 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-blue-100 text-blue-800">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">Our Architectural Solution</h3>
          <p className="text-xs text-navy-600 leading-relaxed">
            We deploy Google OR-Tools routing solvers and geospatial clustering to aggregate small produce lots into consolidated vehicle journeys, distributing transportation costs fairly via proportional ton-km formulas.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-neutral-surface border border-slate-200 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-amber-100 text-amber-800">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">Impact & Sustainability</h3>
          <p className="text-xs text-navy-600 leading-relaxed">
            By eliminating empty return backhauls, we reduce agricultural diesel consumption by 24%, cut carbon emissions, and increase independent driver net monthly income by upwards of ₹18,000.
          </p>
        </div>
      </div>

      {/* Leadership & Advisory Banner */}
      <div className="bg-white rounded-2xl border border-neutral-border p-8 sm:p-12 shadow-sm space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-navy-900">Built by Agritech & Logistics Practitioners</h2>
          <p className="text-xs text-navy-500 mt-2 leading-relaxed">
            Our engineering team combines mathematical optimization specialists from DeepMind with rural logistics field operators in Nashik and Indore. We operate with strict adherence to the GramRoute AI Master Engineering Instruction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div>
            <span className="text-2xl font-extrabold text-forest-primary block">14+ APMC</span>
            <span className="text-xs font-semibold text-navy-800">Mandis Integrated</span>
            <p className="text-[11px] text-navy-400 mt-0.5">Nashik, Pune, Mumbai, Indore, Guntur</p>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-navy-900 block">45+ FPOs</span>
            <span className="text-xs font-semibold text-navy-800">Farmer Producer Companies</span>
            <p className="text-[11px] text-navy-400 mt-0.5">Aggregating fruits, vegetables, pulses</p>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-600 block">100% Escrow</span>
            <span className="text-xs font-semibold text-navy-800">Payment Protection</span>
            <p className="text-[11px] text-navy-400 mt-0.5">Dual OTP verified settlement</p>
          </div>
        </div>
      </div>
    </div>
  );
};
