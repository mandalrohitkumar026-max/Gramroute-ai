import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Sprout, 
  Building2, 
  ShieldCheck, 
  Menu, 
  X, 
  Bell, 
  Search, 
  LogOut, 
  PlusCircle, 
  ChevronRight,
  User,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Star,
  AlertTriangle,
  Settings,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Role } from '../types/api';
import { MOCK_NOTIFICATIONS } from '../services/mockData';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { NetworkStatusIndicator } from '../components/common/NetworkStatusIndicator';
import { SafetyModal } from '../components/safety/SafetyModal';
import { DigitalDocumentModal } from '../components/documents/DigitalDocumentModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { currentUser, activeRole, switchRole, logout } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Role-specific navigation configurations
  const navigationByRole: Record<Role, Array<{ label: string; path: string; icon: React.ReactNode }>> = {
    FARMER: [
      { label: 'Overview', path: '/dashboard/farmer', icon: <Layers className="w-4 h-4" /> },
      { label: 'Create Shipment', path: '/dashboard/farmer/create-shipment', icon: <PlusCircle className="w-4 h-4" /> },
      { label: 'My Shipments', path: '/dashboard/farmer/shipments', icon: <FileText className="w-4 h-4" /> },
      { label: 'Available Shared Trips', path: '/dashboard/farmer/available-trips', icon: <Truck className="w-4 h-4" /> },
      { label: 'Booking History', path: '/dashboard/farmer/bookings', icon: <CheckCircle2 className="w-4 h-4" /> },
      { label: 'Live Tracking', path: '/dashboard/farmer/tracking', icon: <MapPin className="w-4 h-4" /> },
      { label: 'Notifications', path: '/dashboard/farmer/notifications', icon: <Bell className="w-4 h-4" /> },
      { label: 'Profile & KYC', path: '/dashboard/farmer/profile', icon: <User className="w-4 h-4" /> }
    ],
    BUSINESS: [
      { label: 'Overview', path: '/dashboard/business', icon: <Layers className="w-4 h-4" /> },
      { label: 'Shipment Management', path: '/dashboard/business/shipments', icon: <FileText className="w-4 h-4" /> },
      { label: 'Bulk Shipment Creation', path: '/dashboard/business/bulk-create', icon: <PlusCircle className="w-4 h-4" /> },
      { label: 'Bookings', path: '/dashboard/business/bookings', icon: <CheckCircle2 className="w-4 h-4" /> },
      { label: 'Transporter Discovery', path: '/dashboard/business/transporters', icon: <Truck className="w-4 h-4" /> },
      { label: 'Delivery Tracking', path: '/dashboard/business/tracking', icon: <MapPin className="w-4 h-4" /> },
      { label: 'Reports & Analytics', path: '/dashboard/business/reports', icon: <TrendingUp className="w-4 h-4" /> }
    ],
    TRANSPORTER: [
      { label: 'Overview', path: '/dashboard/transporter', icon: <Layers className="w-4 h-4" /> },
      { label: 'Vehicle Fleet', path: '/dashboard/transporter/vehicles', icon: <Truck className="w-4 h-4" /> },
      { label: 'Availability Calendar', path: '/dashboard/transporter/calendar', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Shipment Opportunities', path: '/dashboard/transporter/opportunities', icon: <PlusCircle className="w-4 h-4" /> },
      { label: 'Trip Management', path: '/dashboard/transporter/trips', icon: <MapPin className="w-4 h-4" /> },
      { label: 'Earnings & Escrow', path: '/dashboard/transporter/earnings', icon: <DollarSign className="w-4 h-4" /> },
      { label: 'Performance & Ratings', path: '/dashboard/transporter/ratings', icon: <Star className="w-4 h-4" /> }
    ],
    ADMIN: [
      { label: 'Platform Overview', path: '/dashboard/admin', icon: <Layers className="w-4 h-4" /> },
      { label: 'User Directory', path: '/dashboard/admin/users', icon: <User className="w-4 h-4" /> },
      { label: 'Shipment Registry', path: '/dashboard/admin/shipments', icon: <FileText className="w-4 h-4" /> },
      { label: 'Vehicle Verification', path: '/dashboard/admin/verifications', icon: <CheckCircle2 className="w-4 h-4" /> },
      { label: 'Trip Monitoring', path: '/dashboard/admin/monitoring', icon: <Truck className="w-4 h-4" /> },
      { label: 'Disputes & Claims', path: '/dashboard/admin/disputes', icon: <AlertTriangle className="w-4 h-4" /> },
      { label: 'Corridor Analytics', path: '/dashboard/admin/analytics', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'System Configuration', path: '/dashboard/admin/config', icon: <SlidersHorizontal className="w-4 h-4" /> }
    ]
  };

  const navItems = navigationByRole[activeRole] || navigationByRole.FARMER;

  const roleConfig = {
    FARMER: { label: 'Farmer Dashboard', badgeColor: 'bg-forest-100 text-forest-800 border-forest-300', icon: <Sprout className="w-4 h-4" /> },
    TRANSPORTER: { label: 'Transporter Portal', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300', icon: <Truck className="w-4 h-4" /> },
    BUSINESS: { label: 'Business / FPO Dashboard', badgeColor: 'bg-blue-100 text-blue-900 border-blue-300', icon: <Building2 className="w-4 h-4" /> },
    ADMIN: { label: 'Platform Administrator', badgeColor: 'bg-purple-100 text-purple-900 border-purple-300', icon: <ShieldCheck className="w-4 h-4" /> }
  }[activeRole];

  const handleRoleChange = (newRole: Role) => {
    switchRole(newRole);
    const targetMap: Record<Role, string> = {
      FARMER: '/dashboard/farmer',
      BUSINESS: '/dashboard/business',
      TRANSPORTER: '/dashboard/transporter',
      ADMIN: '/dashboard/admin'
    };
    navigate(targetMap[newRole]);
  };

  return (
    <div className="min-h-screen flex bg-neutral-surface text-navy-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-border flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Branding */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-forest-primary text-white flex items-center justify-center shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-lg tracking-tight text-navy-900">GramRoute</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-forest-100 text-forest-800 rounded">
                  AI
                </span>
              </div>
            </Link>

            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-navy-400 hover:text-navy-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Persona Banner */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs" 
              />
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-navy-900 truncate">{currentUser.name}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-full border ${roleConfig.badgeColor}`}>
                    {roleConfig.icon}
                    <span>{activeRole}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Persona Switcher for Evaluation */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-navy-400 tracking-wider block mb-1.5">
                Switch Role Sandbox:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {(['FARMER', 'TRANSPORTER', 'BUSINESS', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`py-1 px-1.5 rounded font-medium text-left truncate transition-colors ${
                      activeRole === r
                        ? 'bg-forest-primary text-white font-bold'
                        : 'bg-white border border-slate-200 text-navy-700 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-forest-50 text-forest-primary font-bold border-l-3 border-forest-primary shadow-xs'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-forest-primary' : 'text-navy-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Action */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-navy-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-navy-400" />
            <span>Public Home</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-neutral-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Left: Mobile hamburger & search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-navy-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Search Bar */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search shipments, trucks, mandis..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:bg-white transition-all text-navy-900"
              />
            </div>
          </div>

          {/* Right: Actions, Notifications, Language, Safety & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Low-Connectivity / Offline Network Indicator */}
            <NetworkStatusIndicator />

            {/* Language Selector (English / Hindi / Gujarati) */}
            <LanguageSelector />

            {/* Emergency SOS Quick Button */}
            <button
              onClick={() => setSafetyModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs"
              title="24/7 Rural Freight SOS & Helpline"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">SOS</span>
            </button>

            {/* Digital Documents Generator Quick Button */}
            <button
              onClick={() => setDocModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 text-navy-700 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
              title="View Electronic Bilty, Waybill, or Proof of Delivery"
            >
              <FileText className="w-3.5 h-3.5 text-forest-600" />
              <span>Waybills</span>
            </button>

            {/* Contextual primary action button */}
            {activeRole === 'FARMER' && (
              <Link
                to="/dashboard/farmer/create-shipment"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-forest-primary text-white hover:bg-forest-800 transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>List Produce Load</span>
              </Link>
            )}

            {activeRole === 'TRANSPORTER' && (
              <Link
                to="/dashboard/transporter/calendar"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-forest-primary text-white hover:bg-forest-800 transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Publish Route</span>
              </Link>
            )}

            {activeRole === 'BUSINESS' && (
              <Link
                to="/dashboard/business/bulk-create"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-forest-primary text-white hover:bg-forest-800 transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Bulk Consignment</span>
              </Link>
            )}

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
              className="p-2 text-navy-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-forest-500 absolute top-2 right-2 animate-pulse" />
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* User Mini Avatar & Status */}
            <div className="flex items-center gap-2 pl-1">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-navy-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-navy-500">{currentUser.locationName.split(',')[0]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Notifications Slide-Over Drawer */}
        {notifDrawerOpen && (
          <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-white shadow-2xl border-l border-slate-200 p-5 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-forest-primary" />
                  <h3 className="font-bold text-sm text-navy-900">Notifications & Alerts</h3>
                </div>
                <button
                  onClick={() => setNotifDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-2 space-y-2">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <div key={n._id} className="pt-2 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-navy-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                    </div>
                    <p className="text-navy-600 mt-1 leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setNotifDrawerOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-navy-800 transition-colors"
              >
                Mark All as Read
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Body Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Safety & Emergency SOS Modal */}
      <SafetyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
      />

      {/* Official Digital Document Modal (e-Bilty / Manifest / Receipt) */}
      <DigitalDocumentModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
      />
    </div>
  );
};
