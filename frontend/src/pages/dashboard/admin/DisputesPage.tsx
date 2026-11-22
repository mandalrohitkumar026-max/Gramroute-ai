import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, DollarSign, ShieldAlert } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { MOCK_DISPUTES } from '../../../services/mockData';

export const DisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);

  const handleResolve = (id: string) => {
    setDisputes(disputes.map(d => d._id === id ? { ...d, status: 'RESOLVED', refundedAmountInr: 1200 } : d));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Dispute Arbitration Center</h1>
        <p className="text-xs text-navy-500 mt-1">Investigate transit claims, damaged produce reports, and release escrow refund settlements.</p>
      </div>

      <div className="space-y-4">
        {disputes.map((d) => (
          <Card key={d._id} className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-navy-900 text-sm">{d.disputeNumber}</span>
                  <Badge variant={d.status === 'RESOLVED' ? 'success' : 'error'} size="sm">
                    {d.status}
                  </Badge>
                  <span className="text-xs text-rose-700 font-bold uppercase">{d.category}</span>
                </div>
                <p className="text-xs text-navy-700 max-w-2xl leading-relaxed">{d.description}</p>
                <p className="text-[11px] text-navy-400 mt-1">
                  Claimed Refund Amount: <strong>₹{d.claimAmountInr}</strong> • Escrow Booking: {d.bookingId}
                </p>
              </div>

              {d.status !== 'RESOLVED' ? (
                <div className="flex gap-2 self-end sm:self-auto">
                  <Button variant="danger" size="sm" onClick={() => handleResolve(d._id)}>
                    Approve ₹1,200 Refund & Close
                  </Button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Refund Settled via Escrow
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
