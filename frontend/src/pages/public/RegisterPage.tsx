import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Sprout, Building2, User, Phone, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('FARMER');
  const [district, setDistrict] = useState('Nashik');
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await register(name || 'New Member', phone || '+91 99999 88888', role);
    setLoading(false);

    const targetMap: Record<Role, string> = {
      FARMER: '/dashboard/farmer',
      TRANSPORTER: '/dashboard/transporter',
      BUSINESS: '/dashboard/business',
      ADMIN: '/dashboard/admin'
    };
    navigate(targetMap[role]);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-forest-primary text-white flex items-center justify-center shadow-md">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Join the GramRoute AI Network
          </h1>
          <p className="text-xs text-navy-500">
            Create an account to consolidate shipments or offer transporter capacity
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-border p-6 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Role Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-navy-800">I am joining as a:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRole('FARMER')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    role === 'FARMER'
                      ? 'border-forest-primary bg-forest-50 text-forest-900 font-bold ring-2 ring-forest-500'
                      : 'border-slate-200 bg-white text-navy-700 hover:bg-slate-50'
                  }`}
                >
                  <Sprout className="w-5 h-5 mx-auto mb-1 text-forest-600" />
                  <span>Farmer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('TRANSPORTER')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    role === 'TRANSPORTER'
                      ? 'border-amber-primary bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-500'
                      : 'border-slate-200 bg-white text-navy-700 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <span>Transporter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('BUSINESS')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    role === 'BUSINESS'
                      ? 'border-blue-primary bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500'
                      : 'border-slate-200 bg-white text-navy-700 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span>Business / FPO</span>
                </button>
              </div>
            </div>

            <Input
              label="Full Name or Business Name"
              required
              placeholder="e.g. Ramesh V. Patel"
              leftIcon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Mobile Number (for SMS & OTP)"
              type="tel"
              required
              placeholder="e.g. 9823045678"
              leftIcon={<Phone className="w-4 h-4" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-navy-800">Primary Agricultural District</label>
              <select
                className="block w-full rounded-lg border border-slate-300 text-sm text-navy-900 bg-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-forest-500"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="Nashik">Nashik (Onions, Grapes, Tomatoes)</option>
                <option value="Pune">Pune (Vegetables, Flowers, Dairy)</option>
                <option value="Ahmednagar">Ahmednagar (Sugar, Pomegranate)</option>
                <option value="Indore">Indore (Soybean, Wheat, Pulses)</option>
                <option value="Guntur">Guntur (Chilies, Cotton, Tobacco)</option>
              </select>
            </div>

            <p className="text-[11px] text-navy-500 leading-relaxed">
              By registering, you agree to GramRoute AI's Terms of Service and escrow delivery verification protocol.
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration & Access Portal
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-navy-600">
            Already registered on GramRoute?{' '}
            <Link to="/login" className="font-bold text-forest-primary hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
