import React, { useState } from 'react';
import { Truck, Sprout, Building2, CheckCircle2, TrendingDown, ArrowRight, Zap } from 'lucide-react';

export const NetworkVisualizer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'optimized' | 'unoptimized'>('optimized');

  return (
    <div className="bg-white rounded-2xl border border-neutral-border p-6 sm:p-8 shadow-lg relative overflow-hidden">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-[11px] font-semibold mb-1">
            <Zap className="w-3.5 h-3.5 text-forest-600" />
            Interactive Rural Logistics Simulation
          </div>
          <h3 className="text-lg font-bold text-navy-900">
            {viewMode === 'optimized' ? 'GramRoute AI Consolidated Multi-Stop Corridor' : 'Traditional Unoptimized Fragmented Transport'}
          </h3>
          <p className="text-xs text-navy-500">
            {viewMode === 'optimized'
              ? 'Shared vehicle capacity with intelligent pickup sequencing and zero empty backhaul'
              : 'Independent partial loads, high diesel expense, and 45% empty return journeys'}
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold self-stretch sm:self-auto">
          <button
            onClick={() => setViewMode('unoptimized')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'unoptimized'
                ? 'bg-rose-100 text-rose-900 shadow-sm'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            Traditional (Fragmented)
          </button>
          <button
            onClick={() => setViewMode('optimized')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'optimized'
                ? 'bg-forest-primary text-white shadow-sm'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            GramRoute AI (Optimized)
          </button>
        </div>
      </div>

      {/* Visual Canvas Diagram */}
      <div className="relative h-64 sm:h-72 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-xl border border-slate-200 p-4 flex flex-col justify-between overflow-hidden">
        {/* Animated Connecting SVG Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="optGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E5631" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#22C55E" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="unoptGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {viewMode === 'optimized' ? (
            <>
              {/* Consolidated Primary Forward Route */}
              <path
                d="M 60 70 Q 180 40 320 120 T 580 180"
                fill="none"
                stroke="url(#optGrad)"
                strokeWidth="4"
                strokeDasharray="6 4"
                className="animate-[dash_15s_linear_infinite]"
              />
              {/* Return Backhaul Loop */}
              <path
                d="M 580 180 Q 360 250 60 70"
                fill="none"
                stroke="#22C55E"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
            </>
          ) : (
            <>
              {/* Fragmented Line 1 */}
              <path d="M 60 70 L 320 120" fill="none" stroke="url(#unoptGrad)" strokeWidth="2.5" strokeDasharray="3 3" />
              {/* Fragmented Line 2 (Empty return) */}
              <path d="M 320 120 L 60 70" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 5" opacity="0.6" />
              {/* Fragmented Line 3 */}
              <path d="M 120 200 L 580 180" fill="none" stroke="url(#unoptGrad)" strokeWidth="2.5" strokeDasharray="3 3" />
            </>
          )}
        </svg>

        {/* Nodes Layer */}
        <div className="relative z-10 flex justify-between items-start">
          {/* Origin Node 1 */}
          <div className="bg-white/95 backdrop-blur p-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 max-w-[170px]">
            <div className="p-1.5 rounded-md bg-forest-100 text-forest-800">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-navy-900 leading-tight">Dindori Farm Hub</p>
              <p className="text-[10px] text-navy-500">1.8 MT Onions</p>
            </div>
          </div>

          {/* Midpoint Consolidation Hub */}
          <div className="bg-white/95 backdrop-blur p-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 max-w-[190px]">
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-800">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-navy-900 leading-tight">Pimpalgaon FPO</p>
              <p className="text-[10px] text-navy-500">+1.2 MT Grapes added</p>
            </div>
          </div>

          {/* Destination Mandi Node */}
          <div className="bg-white/95 backdrop-blur p-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 max-w-[170px]">
            <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-navy-900 leading-tight">Vashi APMC Mandi</p>
              <p className="text-[10px] text-navy-500">Unload & Backhaul pickup</p>
            </div>
          </div>
        </div>

        {/* Moving Vehicle Indicator */}
        <div className="relative z-10 my-auto flex justify-center">
          {viewMode === 'optimized' ? (
            <div className="bg-forest-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2.5 border border-forest-400">
              <Truck className="w-5 h-5 text-forest-200" />
              <div className="text-left text-xs">
                <span className="font-bold">Truck MH 15 EF 4921</span>
                <span className="text-[10px] text-forest-100 ml-2">92% Capacity Utilized (3.0 / 3.2 MT)</span>
              </div>
            </div>
          ) : (
            <div className="bg-rose-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2.5 border border-rose-400">
              <Truck className="w-5 h-5 text-rose-200" />
              <div className="text-left text-xs">
                <span className="font-bold">2 Half-Empty Trucks</span>
                <span className="text-[10px] text-rose-100 ml-2">38% Capacity Utilized + 100% Empty Return</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Metrics Ribbon */}
        <div className="relative z-10 bg-white/90 backdrop-blur rounded-lg border border-slate-200 p-2.5 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-navy-400 block uppercase">Capacity Fill</span>
            <span className={`font-bold ${viewMode === 'optimized' ? 'text-forest-700' : 'text-rose-600'}`}>
              {viewMode === 'optimized' ? '92% Full' : '38% (Underutilized)'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-navy-400 block uppercase">Shipper Cost</span>
            <span className={`font-bold ${viewMode === 'optimized' ? 'text-forest-700' : 'text-rose-600'}`}>
              {viewMode === 'optimized' ? '₹1.80 / Ton-Km' : '₹2.85 / Ton-Km (+58%)'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-navy-400 block uppercase">Empty Backhaul</span>
            <span className={`font-bold ${viewMode === 'optimized' ? 'text-forest-700' : 'text-rose-600'}`}>
              {viewMode === 'optimized' ? '8% (Matched Return)' : '48% Unpaid Return Miles'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
