import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Farmer',
    corridor: 'Nashik -> Vashi APMC',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-forest-700 uppercase tracking-widest block">
          Get in Touch With Us
        </span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">
          Connect With Our Rural Logistics Field Team
        </h1>
        <p className="text-base text-navy-600 leading-relaxed">
          Have questions about produce aggregation, transporter registration, or FPO corporate agreements? Our field support operates in Hindi, Marathi, and English.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-neutral-surface border border-slate-200 rounded-2xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-navy-900">Regional Field Support Hubs</h3>

            <div className="space-y-4 text-xs text-navy-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-forest-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy-900">Nashik Agricultural Innovation Center</strong>
                  <span>Panchavati Hub, Near APMC Market Yard, Nashik, MH 422003</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-forest-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy-900">Indore Soybean & Grain Corridor Hub</strong>
                  <span>Choithram Mandi Road, Indore, MP 452014</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneCall className="w-4 h-4 text-forest-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy-900">Farmer Toll-Free Helpline</strong>
                  <span>1800 209 8811 (Open 6:00 AM – 9:00 PM Daily)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-forest-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy-900">Direct Email Desk</strong>
                  <span>support@gramroute.in / fpo-partnerships@gramroute.in</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-neutral-border rounded-2xl p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-forest-100 text-forest-primary flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-navy-900">Inquiry Received</h3>
                <p className="text-xs text-navy-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. A GramRoute logistics specialist will call you at <strong>{formData.phone}</strong> within 2 business hours.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-navy-900 mb-2">Send an Inquiry or Schedule Demo</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Full Name"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    label="Mobile Phone Number"
                    required
                    placeholder="e.g. +91 98230 45678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-navy-800">Your Primary Role</label>
                    <select
                      className="block w-full rounded-lg border border-slate-300 text-sm text-navy-900 bg-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-forest-500"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Farmer">Individual Farmer</option>
                      <option value="FPO">Farmer Producer Organization (FPO)</option>
                      <option value="Transporter">Commercial Transporter / Driver</option>
                      <option value="Agribusiness">Agribusiness / Trader</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-navy-800">Primary Transit Corridor</label>
                    <input
                      className="block w-full rounded-lg border border-slate-300 text-sm text-navy-900 bg-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-forest-500"
                      value={formData.corridor}
                      onChange={(e) => setFormData({ ...formData, corridor: e.target.value })}
                      placeholder="e.g. Nashik to Mumbai"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-navy-800">Message or Requirements</label>
                  <textarea
                    rows={4}
                    className="block w-full rounded-lg border border-slate-300 text-sm text-navy-900 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-forest-500"
                    placeholder="Tell us about your produce volume, weekly trips, or vehicle types..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full" rightIcon={<Send className="w-4 h-4" />}>
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
