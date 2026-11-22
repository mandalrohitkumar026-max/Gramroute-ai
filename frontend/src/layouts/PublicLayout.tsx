import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Truck, 
  Menu, 
  X, 
  ChevronDown, 
  Sprout, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Globe,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types/api';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const location = useLocation();
  const { switchRole } = useAuth();

  const handleRoleJump = (role: Role) => {
    switchRole(role);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-navy-900">
      {/* Top Utility Announcement Ribbon */}
      <div className="bg-navy-900 text-white text-xs py-1.5 px-4 sm:px-6 border-b border-navy-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-forest-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">
            GramRoute Rural Logistics Network Live: Nashik, Indore & Guntur Mandi Corridors Active
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-slate-300 text-[11px]">
          <span>Direct Access:</span>
          <Link to="/dashboard/farmer" onClick={() => handleRoleJump('FARMER')} className="hover:text-forest-400 font-semibold underline">
            Farmer Portal
          </Link>
          <span>•</span>
          <Link to="/dashboard/transporter" onClick={() => handleRoleJump('TRANSPORTER')} className="hover:text-forest-400 font-semibold underline">
            Transporter Portal
          </Link>
          <span>•</span>
          <Link to="/dashboard/business" onClick={() => handleRoleJump('BUSINESS')} className="hover:text-forest-400 font-semibold underline">
            Business/FPO
          </Link>
          <span>•</span>
          <Link to="/dashboard/admin" onClick={() => handleRoleJump('ADMIN')} className="hover:text-forest-400 font-semibold underline">
            Admin
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-forest-primary flex items-center justify-center text-white shadow-md shadow-forest-900/15 group-hover:bg-forest-800 transition-colors">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-extrabold tracking-tight text-navy-900">GramRoute</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 bg-forest-100 text-forest-800 rounded border border-forest-300">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-navy-500 font-medium">Rural Freight Optimization & Shared Logistics</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-navy-700">
              <Link to="/" className={`hover:text-forest-primary transition-colors ${location.pathname === '/' ? 'text-forest-primary font-bold' : ''}`}>
                Home
              </Link>

              {/* Solutions Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setSolutionsDropdownOpen(true)}
                onMouseLeave={() => setSolutionsDropdownOpen(false)}
              >
                <button className="flex items-center gap-1 hover:text-forest-primary py-2 transition-colors">
                  <span>Solutions</span>
                  <ChevronDown className="w-4 h-4 text-navy-400" />
                </button>

                {solutionsDropdownOpen && (
                  <div className="absolute top-full -left-4 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                    <Link
                      to="/for-farmers"
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-forest-50/60 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-forest-100 text-forest-800 mt-0.5">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-900">For Farmers</p>
                        <p className="text-[11px] text-navy-500">Aggregate produce loads & save 35% on mandi transport</p>
                      </div>
                    </Link>

                    <Link
                      to="/for-transporters"
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-amber-50/60 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-800 mt-0.5">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-900">For Transporters</p>
                        <p className="text-[11px] text-navy-500">Fill empty return backhauls & maximize truck earnings</p>
                      </div>
                    </Link>

                    <Link
                      to="/for-businesses"
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-blue-50/60 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-800 mt-0.5">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-900">For Businesses & FPOs</p>
                        <p className="text-[11px] text-navy-500">Bulk agricultural inputs, scheduled corridor contracts</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/how-it-works" className={`hover:text-forest-primary transition-colors ${location.pathname === '/how-it-works' ? 'text-forest-primary font-bold' : ''}`}>
                How It Works
              </Link>
              <Link to="/features" className={`hover:text-forest-primary transition-colors ${location.pathname === '/features' ? 'text-forest-primary font-bold' : ''}`}>
                Features
              </Link>
              <Link to="/about" className={`hover:text-forest-primary transition-colors ${location.pathname === '/about' ? 'text-forest-primary font-bold' : ''}`}>
                About
              </Link>
              <Link to="/faq" className={`hover:text-forest-primary transition-colors ${location.pathname === '/faq' ? 'text-forest-primary font-bold' : ''}`}>
                FAQ
              </Link>
              <Link to="/contact" className={`hover:text-forest-primary transition-colors ${location.pathname === '/contact' ? 'text-forest-primary font-bold' : ''}`}>
                Contact
              </Link>
            </nav>

            {/* Auth Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-navy-800 hover:text-forest-primary transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-forest-primary hover:bg-forest-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-navy-700 hover:text-navy-900 rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-navy-800">
              Home
            </Link>
            <div className="py-2 border-t border-b border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block">Solutions</span>
              <Link to="/for-farmers" onClick={() => setMobileMenuOpen(false)} className="block pl-2 text-sm text-forest-700 font-medium">
                • For Farmers
              </Link>
              <Link to="/for-transporters" onClick={() => setMobileMenuOpen(false)} className="block pl-2 text-sm text-amber-700 font-medium">
                • For Transporters
              </Link>
              <Link to="/for-businesses" onClick={() => setMobileMenuOpen(false)} className="block pl-2 text-sm text-blue-700 font-medium">
                • For Businesses & FPOs
              </Link>
            </div>
            <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-navy-800">
              How It Works
            </Link>
            <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-navy-800">
              Features
            </Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-navy-800">
              About Us
            </Link>
            <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-navy-800">
              FAQ
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-navy-800">
              Contact
            </Link>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-bold text-navy-800 border border-slate-200 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-bold text-white bg-forest-primary rounded-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Public Page Viewport */}
      <main className="flex-1">
        {children}
      </main>

      {/* Comprehensive Public Footer */}
      <footer className="bg-navy-900 text-slate-300 text-xs pt-16 pb-12 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-primary text-white flex items-center justify-center font-bold">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">GramRoute AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The intelligent rural freight optimization and load-consolidation infrastructure. Reducing transportation waste, maximizing transporter profits, and ensuring fair ton-kilometer pricing for Indian agriculture.
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              <p className="font-semibold text-slate-200">Regional Headquarters:</p>
              <p>GramRoute Rural Innovation Labs, Panchavati, Nashik, Maharashtra 422003</p>
              <p>Helpline: +91 1800 209 8811 (Toll-Free Hindi/Marathi/English)</p>
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Solutions</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/for-farmers" className="hover:text-white transition-colors">Produce Aggregation for Farmers</Link></li>
              <li><Link to="/for-transporters" className="hover:text-white transition-colors">Transporter Backhaul Monetization</Link></li>
              <li><Link to="/for-businesses" className="hover:text-white transition-colors">FPO Bulk Freight Logistics</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Google OR-Tools VRP Solver</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Fair Ton-Km Cost Splitting</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About GramRoute AI</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">Corridor Matching Engine</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Role Login Portal</Link></li>
            </ul>
          </div>

          {/* Column 4: Quick Role Dashboards */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Live Dashboards</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/dashboard/farmer" onClick={() => handleRoleJump('FARMER')} className="hover:text-forest-400 transition-colors font-medium">Farmer Dashboard</Link></li>
              <li><Link to="/dashboard/transporter" onClick={() => handleRoleJump('TRANSPORTER')} className="hover:text-amber-400 transition-colors font-medium">Transporter Dashboard</Link></li>
              <li><Link to="/dashboard/business" onClick={() => handleRoleJump('BUSINESS')} className="hover:text-blue-400 transition-colors font-medium">Business / FPO Dashboard</Link></li>
              <li><Link to="/dashboard/admin" onClick={() => handleRoleJump('ADMIN')} className="hover:text-purple-400 transition-colors font-medium">Admin & Audit Console</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-navy-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-[11px] gap-3">
          <p>© 2026 GramRoute AI Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Carriage</span>
            <span className="hover:text-slate-300 cursor-pointer">Security & Escrow Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
