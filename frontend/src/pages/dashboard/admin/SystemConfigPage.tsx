import React, { useState } from 'react';
import { SlidersHorizontal, CheckCircle2, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const SystemConfigPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [baseRate, setBaseRate] = useState('1.85');
  const [platformFee, setPlatformFee] = useState('5.0');
  const [detourThreshold, setDetourThreshold] = useState('15');
  const [solverTimeout, setSolverTimeout] = useState('30');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">System Configuration & Solver Tuning</h1>
          <p className="text-xs text-navy-500 mt-1">Platform economic parameters, OR-Tools routing constraints, and geofence radii.</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-navy-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              1. Platform Pricing & Ton-Km Economics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Base Haulage Rate (₹ per Ton-Km)"
                type="number"
                step="0.05"
                value={baseRate}
                onChange={(e) => setBaseRate(e.target.value)}
                helperText="National benchmark baseline for mini-trucks"
              />
              <Input
                label="Platform Take-Rate Fee (%)"
                type="number"
                step="0.5"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                helperText="Escrow management and driver matching fee"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-navy-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              2. Google OR-Tools VRP Solver Thresholds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Maximum Corridor Detour (%)"
                type="number"
                value={detourThreshold}
                onChange={(e) => setDetourThreshold(e.target.value)}
                helperText="Limit max km driver deviates from main highway"
              />
              <Input
                label="Solver Branch & Bound Timeout (Seconds)"
                type="number"
                value={solverTimeout}
                onChange={(e) => setSolverTimeout(e.target.value)}
                helperText="Execution limit for heuristic optimization"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {saved ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Parameters Updated Successfully!
              </span>
            ) : <span />}

            <Button type="submit" variant="primary" size="md" className="bg-purple-700 hover:bg-purple-800" leftIcon={<Save className="w-4 h-4" />}>
              Save Configuration Parameters
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
