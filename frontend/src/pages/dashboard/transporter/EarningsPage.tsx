import React from 'react';
import { DollarSign, Download, ArrowUpRight, CheckCircle2, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const EarningsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Earnings & Settlement Ledger</h1>
          <p className="text-xs text-navy-500 mt-1">Direct bank settlements, escrow status, and trip earnings breakdowns.</p>
        </div>

        <Button variant="primary" size="md" className="bg-forest-primary">
          Request Instant Payout to Bank
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <span className="text-xs font-bold uppercase text-navy-400">Available Balance</span>
          <div className="text-3xl font-extrabold text-emerald-700">₹24,850</div>
          <p className="text-[11px] text-navy-400">Ready for instant UPI / IMPS payout</p>
        </Card>

        <Card className="p-6 space-y-2">
          <span className="text-xs font-bold uppercase text-navy-400">Escrow Locked (In Transit)</span>
          <div className="text-3xl font-extrabold text-amber-700">₹5,900</div>
          <p className="text-[11px] text-navy-400">Releases upon delivery OTP confirmation</p>
        </Card>

        <Card className="p-6 space-y-2">
          <span className="text-xs font-bold uppercase text-navy-400">This Month's Gross</span>
          <div className="text-3xl font-extrabold text-navy-900">₹1,24,500</div>
          <p className="text-[11px] text-emerald-700 font-semibold">+₹28,200 from matched backhauls</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-sm text-navy-900 mb-4">Recent Settled Trips</h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-navy-400 uppercase text-[10px]">
                <th className="pb-3">Trip Date</th>
                <th className="pb-3">Corridor</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Gross Earnings</th>
                <th className="pb-3">Platform Fee (5%)</th>
                <th className="pb-3 text-right">Net Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 text-navy-600">19 Nov 2026</td>
                <td className="py-3 font-semibold text-navy-900">Nashik &rarr; Kalyan APMC</td>
                <td className="py-3 text-navy-600">MH 15 EF 4921</td>
                <td className="py-3 text-navy-900">₹3,800</td>
                <td className="py-3 text-rose-600">-₹190</td>
                <td className="py-3 text-right font-bold text-emerald-700">₹3,610 (Settled)</td>
              </tr>
              <tr>
                <td className="py-3 text-navy-600">17 Nov 2026</td>
                <td className="py-3 font-semibold text-navy-900">Nashik &rarr; Vashi APMC</td>
                <td className="py-3 text-navy-600">MH 15 GV 8820</td>
                <td className="py-3 text-navy-900">₹6,200</td>
                <td className="py-3 text-rose-600">-₹310</td>
                <td className="py-3 text-right font-bold text-emerald-700">₹5,890 (Settled)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
