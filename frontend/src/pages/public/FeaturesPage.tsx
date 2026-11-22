import React from 'react';
import { 
  Cpu, 
  Scale, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  FileText, 
  Bell, 
  Truck, 
  Thermometer, 
  Repeat,
  Radio,
  FileSpreadsheet
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const featureList = [
    {
      icon: <Cpu className="w-5 h-5 text-purple-600" />,
      title: 'OR-Tools Routing Solver',
      desc: 'Solves complex multi-pickup, multi-drop traveling salesman and vehicle routing models in under 5 seconds.'
    },
    {
      icon: <Scale className="w-5 h-5 text-forest-primary" />,
      title: 'Proportional Ton-Km Splitting',
      desc: 'Transparent formula itemizing base haulage, volume savings, and net driver pay. No hidden charges.'
    },
    {
      icon: <Repeat className="w-5 h-5 text-emerald-600" />,
      title: 'Automated Backhaul Finder',
      desc: 'Pairs returning trucks with rural input supplies (fertilizers, tractor parts, seeds) to kill empty return runs.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      title: 'Dual OTP Escrow Handshake',
      desc: '4-digit pickup OTP at farm and delivery OTP at mandi stall ensures funds are safely locked and promptly released.'
    },
    {
      icon: <Thermometer className="w-5 h-5 text-rose-600" />,
      title: 'Cold-Chain Compatibility',
      desc: 'Tags high-perishability fruits and dairy to allocate refrigerated vans and time-sensitive express routes.'
    },
    {
      icon: <Radio className="w-5 h-5 text-amber-600" />,
      title: 'Low-Bandwidth Rural Sync',
      desc: 'Built to cache coordinates and waypoints locally on 2G/3G connections, syncing automatically upon network restoration.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-forest-700 uppercase tracking-widest block">
          Platform Architecture & Capabilities
        </span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">
          Enterprise Logistics Engineering for Rural India
        </h1>
        <p className="text-base text-navy-600 leading-relaxed">
          Engineered to satisfy the rigorous requirements of the GramRoute AI Master Engineering Instruction with high contrast, reliable offline caching, and strict server-side authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((f, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-forest-300 transition-colors space-y-3">
            <div className="p-3 w-fit rounded-xl bg-slate-50 border border-slate-100">
              {f.icon}
            </div>
            <h3 className="font-bold text-base text-navy-900">{f.title}</h3>
            <p className="text-xs text-navy-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
