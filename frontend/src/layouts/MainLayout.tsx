import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Truck, 
  Sprout, 
  Building2, 
  ShieldCheck, 
  Activity, 
  Bell, 
  Menu, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'FARMER' | 'BUSINESS' | 'TRANSPORTER' | 'ADMIN'>('FARMER');
  const location = useLocation();

  const navItems = [
    { label: 'Foundation & Status', path: '/' },
    { label: 'Shipments', path: '/shipments' },
    { label: 'Vehicles & Trips', path: '/trips' },
    { label: 'AI Optimization', path: '/optimization' },
    { label: 'Architecture Docs', path: '/docs' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-surface">
      {/* Top Banner: Professional Environment & Role Context */}
      <div className="bg-navy-900 text-white text-xs px-4 py-1.5 flex justify-between items-center border-b border-navy-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-forest-500"></span>
          </span>
          <span className="font-medium tracking-wide">GramRoute AI — Phase 0 Foundation Live</span>
          <span className="hidden md:inline text-navy-400">|</span>
          <span className="hidden md:inline text-navy-300">Rural Freight Optimization & Shared Logistics Network</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-navy-300 text-[11px]">Active Persona View:</span>
          <div className="flex bg-navy-800 rounded p-0.5 border border-navy-700">
            {(['FARMER', 'BUSINESS', 'TRANSPORTER', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                  selectedRole === r
                    ? 'bg-forest-600 text-white shadow-sm'
                    : 'text-navy-300 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-forest-primary flex items-center justify-center text-white shadow-md shadow-forest-900/10 group-hover:bg-forest-800 transition-colors">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-navy-900">GramRoute</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 bg-forest-100 text-forest-800 rounded border border-forest-200">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-navy-500 font-medium">Smart Rural Freight Network</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-forest-50 text-forest-800 border-b-2 border-forest-primary'
                        : 'text-navy-600 hover:text-navy-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Quick Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                title="Notifications" 
                className="p-2 text-navy-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-forest-500 rounded-full"></span>
              </button>

              <div className="h-6 w-px bg-neutral-border"></div>

              <div className="flex items-center gap-2 pl-1">
                <div className="w-8 h-8 rounded-full bg-forest-100 border border-forest-300 text-forest-800 font-bold text-xs flex items-center justify-center">
                  {selectedRole[0]}
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-navy-900 leading-tight">Demo {selectedRole}</p>
                  <p className="text-[10px] text-navy-500">Verified Member</p>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-navy-700 hover:text-navy-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-border bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-navy-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        {children}
      </main>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-neutral-border text-navy-600 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-forest-primary text-white flex items-center justify-center">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-navy-900 text-sm">GramRoute AI</span>
            </div>
            <p className="text-navy-500 text-xs leading-relaxed">
              Intelligent Rural Freight Optimization & Shared Logistics Network empowering farmers, FPOs, businesses, and transporters.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-navy-900 text-xs uppercase tracking-wider mb-2">Key Stakeholders</h4>
            <ul className="space-y-1 text-navy-600">
              <li className="flex items-center gap-1.5"><Sprout className="w-3.5 h-3.5 text-forest-600" /> Farmers & Produce Aggregators</li>
              <li className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-navy-600" /> FPOs & Small Businesses</li>
              <li className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-forest-700" /> Independent Transporters</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Platform Administration</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-navy-900 text-xs uppercase tracking-wider mb-2">Core Tech Stack</h4>
            <p className="text-navy-500 leading-relaxed">
              React + TypeScript + Vite • Node/Express • MongoDB • Google OR-Tools • Leaflet OSM • Scikit-learn
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-navy-900 text-xs uppercase tracking-wider mb-2">System Telemetry</h4>
            <div className="flex items-center gap-2 text-forest-700 font-medium">
              <Activity className="w-4 h-4 text-forest-600 animate-pulse" />
              <span>Modular Monolith • Healthy</span>
            </div>
            <p className="text-navy-400 mt-1">Phase 0 Architecture Ready</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 mt-6 pt-4 flex flex-col sm:flex-row justify-between text-navy-400 text-[11px]">
          <p>© 2026 GramRoute AI. All rights reserved. Follows Master Engineering Instruction.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
