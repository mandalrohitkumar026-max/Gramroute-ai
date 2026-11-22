import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Sprout, Building2, ShieldCheck, Phone, ArrowRight, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('9823045678');
  const [role, setRole] = useState<Role>('FARMER');
  const [otpMode, setOtpMode] = useState(true);
  const [otp, setOtp] = useState('4819');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(phone, role);
    setLoading(false);

    const targetMap: Record<Role, string> = {
      FARMER: '/dashboard/farmer',
      TRANSPORTER: '/dashboard/transporter',
      BUSINESS: '/dashboard/business',
      ADMIN: '/dashboard/admin'
    };
    navigate(targetMap[role]);
  };

  const handleDemoQuickLogin = (demoRole: Role) => {
    switchRole(demoRole);
    const targetMap: Record<Role, string> = {
      FARMER: '/dashboard/farmer',
      TRANSPORTER: '/dashboard/transporter',
      BUSINESS: '/dashboard/business',
      ADMIN: '/dashboard/admin'
    };
    navigate(targetMap[demoRole]);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-forest-primary text-white flex items-center justify-center shadow-md">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Sign In to GramRoute AI
          </h1>
          <p className="text-xs text-navy-500">
            Secure rural logistics platform for farmers, transporters & agribusinesses
          </p>
        </div>

        {/* 1-Click Demo Login Pills */}
        <div className="p-4 bg-forest-50/70 border border-forest-200 rounded-xl space-y-2.5">
          <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
            Instant 1-Click Demo Persona Login:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoQuickLogin('FARMER')}
              className="p-2 rounded-lg bg-white border border-forest-300 text-left hover:bg-forest-100/50 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-forest-900">
                <Sprout className="w-3.5 h-3.5 text-forest-600" />
                <span>Farmer</span>
              </div>
              <p className="text-[10px] text-navy-500 mt-0.5 truncate">Ramesh Patel (Nashik)</p>
            </button>

            <button
              onClick={() => handleDemoQuickLogin('TRANSPORTER')}
              className="p-2 rounded-lg bg-white border border-amber-300 text-left hover:bg-amber-100/50 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Truck className="w-3.5 h-3.5 text-amber-600" />
                <span>Transporter</span>
              </div>
              <p className="text-[10px] text-navy-500 mt-0.5 truncate">Balwinder Singh (Fleet)</p>
            </button>

            <button
              onClick={() => handleDemoQuickLogin('BUSINESS')}
              className="p-2 rounded-lg bg-white border border-blue-300 text-left hover:bg-blue-100/50 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Business / FPO</span>
              </div>
              <p className="text-[10px] text-navy-500 mt-0.5 truncate">Meera Agrotech</p>
            </button>

            <button
              onClick={() => handleDemoQuickLogin('ADMIN')}
              className="p-2 rounded-lg bg-white border border-purple-300 text-left hover:bg-purple-100/50 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-purple-900">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin</span>
              </div>
              <p className="text-[10px] text-navy-500 mt-0.5 truncate">Platform Operations</p>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-white rounded-2xl border border-neutral-border p-6 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-navy-800">Select Role</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['FARMER', 'TRANSPORTER', 'BUSINESS', 'ADMIN'] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-1.5 px-2 rounded-md font-semibold text-center transition-colors ${
                      role === r
                        ? 'bg-forest-primary text-white'
                        : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Registered Mobile Number"
              type="tel"
              required
              leftIcon={<Phone className="w-4 h-4" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9823045678"
            />

            {otpMode ? (
              <Input
                label="4-Digit SMS OTP"
                type="text"
                required
                leftIcon={<KeyRound className="w-4 h-4" />}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                helperText="Demo test OTP: 4819"
              />
            ) : (
              <Input
                label="Account Password"
                type="password"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="••••••••"
              />
            )}

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setOtpMode(!otpMode)}
                className="text-forest-primary font-semibold hover:underline"
              >
                {otpMode ? 'Use Password Instead' : 'Use SMS OTP Instead'}
              </button>
              <span className="text-slate-400">Forgot PIN?</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to {role} Portal
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-navy-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-forest-primary hover:underline">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
