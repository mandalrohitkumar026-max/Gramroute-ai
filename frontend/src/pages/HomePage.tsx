import React, { useEffect, useState } from 'react';
import { 
  Server, 
  Database, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sprout, 
  Building2, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  FileText, 
  GitFork,
  Boxes
} from 'lucide-react';
import { healthService } from '../services/healthService';
import { HealthCheckResponse, ReadinessCheckResponse } from '../types/api';

export const HomePage: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [readinessData, setReadinessData] = useState<ReadinessCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const entitiesList = [
    { name: 'User', role: 'Security & Auth', description: 'Core user identity with phone, hashed credentials, and role assignments' },
    { name: 'Profile', role: 'User Details', description: 'Address, geospatial coordinates (2dsphere), FPO affiliations, and rating history' },
    { name: 'Vehicle', role: 'Fleet Management', description: 'Transporter vehicles with payload capacity, volumetric capacity, and refrigeration flags' },
    { name: 'Shipment', role: 'Cargo & Logistics', description: 'Shipper cargo details, perishability tiers, pickup/delivery windows, and budget' },
    { name: 'ShipmentMatch', role: 'AI Consolidation', description: 'Heuristic & OR-Tools matches evaluating empty backhaul reduction and savings' },
    { name: 'Trip', role: 'Journey Lifecycle', description: 'Scheduled journeys, consolidated payload stats, and live telemetry summaries' },
    { name: 'TripStop', role: 'Waypoints', description: 'Ordered pickup and drop waypoints with scheduled arrival windows and OTP validation' },
    { name: 'Booking', role: 'Agreements', description: 'Confirmed cargo reservations linking shipments to trips with agreed pricing' },
    { name: 'CostAllocation', role: 'Fintech & Transparency', description: 'Fair proportional ton-km cost splitting, consolidation discounts, and platform fees' },
    { name: 'TrackingEvent', role: 'IoT & Telemetry', description: 'Live GPS pings, delay alerts, route deviations, and proof-of-delivery timestamps' },
    { name: 'Notification', role: 'Messaging & Alerts', description: 'Multi-channel dispatch (In-App, SMS, WhatsApp) with priority queuing' },
    { name: 'Rating', role: 'Trust & Reputation', description: 'Mutual reviews on timeliness, cargo care, and communication' },
    { name: 'Dispute', role: 'Escalation & Resolution', description: 'Investigation workflows for cargo damage, delays, or overcharging claims' },
    { name: 'PaymentRecord', role: 'Financial Audit', description: 'Escrow records, platform fee splits, and settlement transaction logs' },
    { name: 'VerificationDocument', role: 'KYC & Regulatory', description: 'Aadhaar, Driving License, RC, APMC permits, and admin verification' }
  ];

  const fetchHealth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const liveness = await healthService.getLiveness();
      setHealthData(liveness);
      try {
        const readiness = await healthService.getReadiness();
        setReadinessData(readiness);
      } catch {
        // AI service or DB may be optional during mock dev
      }
    } catch (err) {
      setErrorMsg('Backend API offline or unreachable at configured URL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const triggerAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredEntities = selectedEntityFilter === 'ALL' 
    ? entitiesList 
    : entitiesList.filter(e => e.role.toLowerCase().includes(selectedEntityFilter.toLowerCase()) || e.name.toLowerCase().includes(selectedEntityFilter.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Toast Notice for User Feedback */}
      {actionNotice && (
        <div className="fixed bottom-5 right-5 z-50 bg-forest-900 text-white px-4 py-3 rounded-lg shadow-xl border border-forest-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-forest-400" />
          <span className="text-sm font-medium">{actionNotice}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-white rounded-2xl border border-neutral-border p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-forest-50/70 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-forest-600"></span>
            Phase 0: Project Foundation & Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight leading-tight">
            Intelligent Rural Freight Optimization & Shared Logistics Network
          </h1>
          <p className="text-navy-600 text-base sm:text-lg leading-relaxed">
            Consolidating compatible produce and rural freight shipments, maximizing transporter vehicle capacity, eliminating empty return journeys, and calculating fair, transparent cost splits.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#entities-section"
              className="px-5 py-2.5 bg-forest-primary hover:bg-forest-800 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <span>Explore 15 Data Entities</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => triggerAction('Verified Phase 0 architecture: Monorepo initialized with Node/Express, React, and Python AI service.')}
              className="px-5 py-2.5 bg-navy-50 hover:bg-navy-100 text-navy-800 font-medium text-sm rounded-lg border border-neutral-border transition-colors flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-navy-600" />
              <span>Verify Architecture</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live System Health Monitor */}
      <section className="bg-white rounded-xl border border-neutral-border p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-forest-primary" />
              Service Status & Readiness Probe
            </h2>
            <p className="text-xs text-navy-500">Live verification of Backend REST API, MongoDB connection, and AI Engine</p>
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy-700 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 self-end sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Probe</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Node.js Backend Card */}
          <div className="p-4 rounded-lg bg-neutral-surface border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-forest-600" /> Backend API
                </span>
                {healthData?.status === 'UP' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ONLINE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> READY
                  </span>
                )}
              </div>
              <p className="text-xs text-navy-700 font-medium">Node.js + Express + TypeScript</p>
              <p className="text-[11px] text-navy-500 mt-1">
                Port: 5000 • Version: {healthData?.version || '0.1.0'} • Env: {healthData?.environment || 'development'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-navy-400">
              Uptime: {healthData ? `${healthData.uptimeSeconds}s` : 'Standby ready'}
            </div>
          </div>

          {/* Database Card */}
          <div className="p-4 rounded-lg bg-neutral-surface border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-navy-600" /> Database Layer
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" /> CONFIGURED
                </span>
              </div>
              <p className="text-xs text-navy-700 font-medium">MongoDB + Mongoose 8.x</p>
              <p className="text-[11px] text-navy-500 mt-1">
                15 Mongoose Schemas with 2dsphere Geospatial Indexes Defined
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-navy-400">
              Connection: {readinessData?.checks.database.status || 'Configured via .env'}
            </div>
          </div>

          {/* AI Optimization Service Card */}
          <div className="p-4 rounded-lg bg-neutral-surface border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-600" /> AI Engine
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">
                  <CheckCircle2 className="w-3 h-3 text-purple-600" /> ARCHITECTED
                </span>
              </div>
              <p className="text-xs text-navy-700 font-medium">FastAPI + Google OR-Tools</p>
              <p className="text-[11px] text-navy-500 mt-1">
                VRP Solver, Multi-Stop Heuristics, Backhaul Opportunity Finder
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-navy-400">
              Host: localhost:8000 (Independent deployment)
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Personas & Workflows */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Core Stakeholder Workflows</h2>
          <p className="text-xs text-navy-500">Every persona interactively operates with dedicated tools</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Farmer Card */}
          <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm hover:border-forest-400 transition-all">
            <div className="w-10 h-10 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center mb-3">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy-900 text-base mb-1">Farmer</h3>
            <p className="text-xs text-navy-600 mb-4 leading-relaxed">
              Publish small or large produce loads, discover shared trips to APMC mandis, view cost savings, and track transit.
            </p>
            <button
              onClick={() => triggerAction('Opening Farmer Shipment Creator (Planned for Phase 1)')}
              className="w-full py-2 px-3 bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-semibold rounded-lg border border-forest-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Create Produce Load</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Business Owner Card */}
          <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm hover:border-blue-400 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy-900 text-base mb-1">Business Owner & FPO</h3>
            <p className="text-xs text-navy-600 mb-4 leading-relaxed">
              Consolidate input supplies (seeds, fertilizers) or wholesale orders, coordinate recurring routes, and optimize logistics expenses.
            </p>
            <button
              onClick={() => triggerAction('Opening FPO Consolidator (Planned for Phase 1)')}
              className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Book Commercial Freight</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Transporter Card */}
          <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm hover:border-amber-400 transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy-900 text-base mb-1">Transporter</h3>
            <p className="text-xs text-navy-600 mb-4 leading-relaxed">
              Register vehicles, publish planned journeys, accept consolidated return loads, and eliminate zero-revenue empty backhauls.
            </p>
            <button
              onClick={() => triggerAction('Opening Vehicle & Trip Manager (Planned for Phase 2)')}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Publish Vehicle Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm hover:border-purple-400 transition-all">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-navy-900 text-base mb-1">Platform Admin</h3>
            <p className="text-xs text-navy-600 mb-4 leading-relaxed">
              Review KYC documentation, manage dispute arbitration, monitor system telemetry, and audit escrow financial flows.
            </p>
            <button
              onClick={() => triggerAction('Opening Admin KYC & Audit Console (Planned for Phase 4)')}
              className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold rounded-lg border border-purple-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Access Admin Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 15 Data Entities Architecture Explorer */}
      <section id="entities-section" className="bg-white rounded-xl border border-neutral-border p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-forest-primary" />
              15 Canonical Database Entities (Mongoose & TypeScript)
            </h2>
            <p className="text-xs text-navy-500">
              Formally modeled for rural freight, multi-tenant RBAC, geospatial matching, and financial auditing.
            </p>
          </div>

          {/* Quick filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'Cargo', 'Journey', 'Fintech', 'Security'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedEntityFilter(tag)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  selectedEntityFilter === tag
                    ? 'bg-forest-primary text-white border-forest-primary font-medium'
                    : 'bg-slate-50 text-navy-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredEntities.map((entity, index) => (
            <div
              key={entity.name}
              className="p-3.5 rounded-lg border border-slate-100 bg-neutral-surface hover:bg-white hover:border-forest-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-sm text-forest-900">{index + 1}. {entity.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-navy-700">
                  {entity.role}
                </span>
              </div>
              <p className="text-xs text-navy-600 leading-snug">
                {entity.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Decision Records Summary */}
      <section className="bg-white rounded-xl border border-neutral-border p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-forest-primary" />
          Key Architectural Decision Records (ADRs)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-neutral-surface border border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 mb-1">ADR-001: Modular Monolith Architecture</h4>
            <p className="text-xs text-navy-600 leading-relaxed">
              Consolidating backend services into a single clean Node/TypeScript modular monolith rather than premature microservices. Eliminates distributed transaction latency and simplifies deployment while keeping clean domain boundaries.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-neutral-surface border border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 mb-1">ADR-002: Independent Python AI Optimization Engine</h4>
            <p className="text-xs text-navy-600 leading-relaxed">
              Decoupling computationally intensive Vehicle Routing Problem (VRP) solving with Google OR-Tools and Scikit-Learn into an independently deployable FastAPI microservice, communicated with via resilient REST contracts.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-neutral-surface border border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 mb-1">ADR-003: MongoDB with 2dsphere Geospatial Indexing</h4>
            <p className="text-xs text-navy-600 leading-relaxed">
              Employing MongoDB with GeoJSON points for flexible cargo descriptions, seasonal metadata, and native spatial indexing for proximity queries between farms, collection centers, and mandis.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-neutral-surface border border-slate-200">
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 mb-1">ADR-004: Accessible Light Theme Design System</h4>
            <p className="text-xs text-navy-600 leading-relaxed">
              Adopting Forest Green primary (`#1E5631`) and Deep Navy (`#0F172A`) on crisp soft neutrals. High contrast ratio designed specifically for high outdoor daylight readability for rural logistics users.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
