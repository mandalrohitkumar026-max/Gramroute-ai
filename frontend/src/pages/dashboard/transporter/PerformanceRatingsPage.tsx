import React from 'react';
import { Star, Award, ShieldCheck, ThumbsUp } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export const PerformanceRatingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Performance & Trust Score</h1>
        <p className="text-xs text-navy-500 mt-1">Review feedback from farmers, FPOs, and APMC consignees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center space-y-2">
          <span className="text-xs font-bold uppercase text-navy-400">Overall Rating</span>
          <div className="text-4xl font-black text-amber-500 flex items-center justify-center gap-2">
            4.8 <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <p className="text-[11px] text-navy-400">Based on 142 completed trips</p>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <span className="text-xs font-bold uppercase text-navy-400">Punctuality Score</span>
          <div className="text-4xl font-black text-forest-primary">99.1%</div>
          <p className="text-[11px] text-navy-400">Arrived before APMC auction opening</p>
        </Card>

        <Card className="p-6 text-center space-y-2">
          <span className="text-xs font-bold uppercase text-navy-400">Cargo Care Score</span>
          <div className="text-4xl font-black text-emerald-700">100%</div>
          <p className="text-[11px] text-navy-400">Zero produce damage claims filed</p>
        </Card>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-sm text-navy-900">Recent Shipper Feedback</h3>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-neutral-surface rounded-xl border border-slate-100 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-navy-900">Ramesh Patel (Dindori Grape Farmer)</span>
              <span className="text-amber-500 font-bold">5.0 ★</span>
            </div>
            <p className="text-navy-600">"Driver Balwinder reached my farm right on time at 8:45 AM and took extreme care with our delicate Thompson grape crates. Arrived at Pune mandi with zero damage."</p>
          </div>

          <div className="p-3 bg-neutral-surface rounded-xl border border-slate-100 space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-navy-900">Sahyadri Farmers Producer Co.</span>
              <span className="text-amber-500 font-bold">5.0 ★</span>
            </div>
            <p className="text-navy-600">"Consolidated multiple onion pickups along Pimpalgaon highway efficiently. Very professional driver and clean vehicle."</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
