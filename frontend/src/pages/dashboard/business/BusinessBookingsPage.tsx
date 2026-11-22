import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Download, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import { bookingService } from '../../../services/bookingService';
import { MOCK_BOOKINGS, MOCK_SHIPMENTS } from '../../../services/mockData';

export const BusinessBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getBookings();
      const items = res.data?.items || res.data || [];
      if (items.length > 0) {
        setBookings(items);
      } else {
        setBookings(MOCK_BOOKINGS);
      }
    } catch {
      setBookings(MOCK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Commercial Bookings & Escrow Contracts</h1>
          <p className="text-xs text-navy-500 mt-1">
            Enterprise shared freight agreements, OTP handoff tracking, and automated driver settlements.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBookings}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-navy-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest-primary mb-2" />
            Loading commercial contracts...
          </div>
        ) : (
          bookings.map((b) => {
            const id = b._id || b.id;
            const ref = b.bookingReference || `GR-CORP-${id.substring(id.length - 6).toUpperCase()}`;
            const s = b.shipmentId || MOCK_SHIPMENTS[0];
            const status = b.bookingStatus || 'CONFIRMED';

            return (
              <Card key={id} className="p-5 hover:border-forest-300 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-navy-900">{ref}</span>
                      <Badge
                        variant={
                          status === 'COMPLETED'
                            ? 'success'
                            : status === 'CANCELLED'
                            ? 'error'
                            : 'forest'
                        }
                        size="sm"
                      >
                        {status}
                      </Badge>
                      <span className="text-[10px] bg-slate-100 text-navy-700 px-2 py-0.5 rounded font-mono font-bold">
                        OTP: {b.pickupOtp || '4192'} / {b.deliveryOtp || '8835'}
                      </span>
                    </div>
                    <p className="font-semibold text-navy-900">{s.cargoName || 'Bulk Agricultural Commodity'}</p>
                    <p className="text-navy-500">
                      Corridor: {s.origin?.villageOrTown || 'Dindori'} &rarr; {s.destination?.district || 'Mumbai Wholesale Mandi'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-navy-400 block uppercase">Escrow Settlement</span>
                      <span className="font-extrabold text-navy-900 text-sm">
                        ₹{(b.totalAgreedAmountInr || 2400).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                      Contract PDF
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
