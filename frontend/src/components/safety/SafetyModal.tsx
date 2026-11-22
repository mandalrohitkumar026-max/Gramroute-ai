import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, Share2, AlertTriangle, Info, Check, Copy, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
  vehicleNumber?: string;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  isOpen,
  onClose,
  tripId = 'TRIP-2026-8841',
  vehicleNumber = 'MH-15-EG-4421'
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'CONTACTS' | 'SHARE' | 'REPORT' | 'HANDLING'>('CONTACTS');
  const [copied, setCopied] = useState(false);
  const [incidentType, setIncidentType] = useState('ROAD_BREAKDOWN');
  const [incidentNotes, setIncidentNotes] = useState('');
  const [incidentReported, setIncidentReported] = useState(false);

  if (!isOpen) return null;

  const shareableUrl = `${window.location.origin}/tracking/${tripId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = `Live Tracking for GramRoute Shared Cargo Trip [${tripId}] (Vehicle: ${vehicleNumber}): ${shareableUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIncidentReported(true);
    setTimeout(() => {
      setIncidentReported(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-300 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-rose-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-700/80 flex items-center justify-center text-rose-100 border border-rose-600">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">{t.safety.title}</h3>
              <p className="text-xs text-rose-200">24/7 Rural Freight Security & Transit Assistance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-rose-200 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CONTACTS')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'CONTACTS' ? 'border-rose-600 text-rose-700 font-bold' : 'border-transparent text-neutral-600'
            }`}
          >
            SOS Helplines
          </button>
          <button
            onClick={() => setActiveTab('SHARE')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'SHARE' ? 'border-rose-600 text-rose-700 font-bold' : 'border-transparent text-neutral-600'
            }`}
          >
            Share Live Trip
          </button>
          <button
            onClick={() => setActiveTab('REPORT')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'REPORT' ? 'border-rose-600 text-rose-700 font-bold' : 'border-transparent text-neutral-600'
            }`}
          >
            Report Incident
          </button>
          <button
            onClick={() => setActiveTab('HANDLING')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'HANDLING' ? 'border-rose-600 text-rose-700 font-bold' : 'border-transparent text-neutral-600'
            }`}
          >
            Cargo Rules
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {activeTab === 'CONTACTS' && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-900 block">{t.safety.policeHelpline}</span>
                  <span className="text-[11px] text-rose-700">Immediate emergency assistance across India</span>
                </div>
                <a
                  href="tel:112"
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 112</span>
                </a>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">{t.safety.highwayHelpline}</span>
                  <span className="text-[11px] text-amber-700">NHAI Ambulance, Crane & Highway Patrol</span>
                </div>
                <a
                  href="tel:1033"
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 1033</span>
                </a>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">{t.safety.gramRouteControl}</span>
                  <span className="text-[11px] text-emerald-700">Toll-free rural logistics coordination desk</span>
                </div>
                <a
                  href="tel:18002004726"
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Desk</span>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'SHARE' && (
            <div className="space-y-4 text-xs">
              <p className="text-neutral-600">
                Share this secure live tracking link with consignees, buyers, or family members. Recipients do not need to install an app to view live truck progress.
              </p>

              <div className="p-3 bg-neutral-100 rounded-lg flex items-center justify-between font-mono text-[11px] text-navy-800 break-all">
                <span>{shareableUrl}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="ml-2 px-2.5 py-1 rounded bg-white border border-neutral-300 font-sans font-bold flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.safety.shareViaWhatsApp}</span>
              </button>
            </div>
          )}

          {activeTab === 'REPORT' && (
            <div>
              {incidentReported ? (
                <div className="p-6 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-navy-900">Incident Reported to Control Room</h4>
                  <p className="text-xs text-neutral-500">
                    Operations officers and consignees have been notified of transit status.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleIncidentSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-navy-900 block mb-1">Incident Type</label>
                    <select
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                    >
                      <option value="ROAD_BREAKDOWN">Vehicle Mechanical Breakdown / Puncture</option>
                      <option value="ROAD_BLOCKAGE">Road Landslide / Ghat Blockage / Traffic Gridlock</option>
                      <option value="ACCIDENT">Road Collision / Accident</option>
                      <option value="WEATHER_DELAY">Heavy Rain / Flash Flood Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-navy-900 block mb-1">Incident Details & Landmark</label>
                    <textarea
                      rows={3}
                      value={incidentNotes}
                      onChange={(e) => setIncidentNotes(e.target.value)}
                      placeholder="e.g. Broken leaf spring near Igatpuri toll plaza, waiting for mobile mechanic..."
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    Broadcast Incident Alert
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'HANDLING' && (
            <div className="space-y-3 text-xs text-navy-900">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <span className="font-bold text-forest-primary block">1. Onion & Potato Ventilation Rule</span>
                <p className="text-neutral-600">
                  Must never be covered with air-tight plastic tarpaulins in humid weather. Use breathable jute covers with a 4-inch side gap to prevent internal sweating and rotting.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <span className="font-bold text-forest-primary block">2. Incompatible Cargo Physical Separation</span>
                <p className="text-neutral-600">
                  Fertilizers, pesticides, or diesel containers must NEVER share vehicle deck space with edible produce, grains, or milk cans.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <span className="font-bold text-forest-primary block">3. Tomato & Grapes Tier Stacking</span>
                <p className="text-neutral-600">
                  Plastic crate stacks cannot exceed 6 vertical tiers without wooden support dividers to prevent bottom-crate crushing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-100 p-3 text-center border-t border-neutral-200">
          <button
            onClick={onClose}
            className="text-xs font-bold text-neutral-600 hover:text-navy-900"
          >
            Close Safety Panel
          </button>
        </div>
      </div>
    </div>
  );
};
