import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, PlusCircle, RefreshCw } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { shipmentService } from '../../../services/shipmentService';
import { MOCK_SHIPMENTS } from '../../../services/mockData';

export const ShipmentManagementPage: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await shipmentService.getShipments({ all: true });
      const items = res.data?.items || res.data || [];
      if (items.length > 0) {
        setShipments(items);
      } else {
        setShipments(MOCK_SHIPMENTS);
      }
    } catch {
      setShipments(MOCK_SHIPMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Enterprise Consignments</h1>
          <p className="text-xs text-navy-500 mt-1">Full consignment audit log across all FPO collection centers and retail distribution depots.</p>
        </div>

        <div className="flex gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchShipments}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-navy-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Consignment ID</th>
                <th className="pb-3">Commodity / Material</th>
                <th className="pb-3">Weight (MT)</th>
                <th className="pb-3">Origin &rarr; Destination</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">E-Way Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipments.map((s) => {
                const id = s._id || s.id;
                return (
                  <tr key={id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono text-navy-500">{id.substring(id.length - 8).toUpperCase()}</td>
                    <td className="py-3 font-bold text-navy-900">{s.cargoName}</td>
                    <td className="py-3 font-semibold text-navy-900">{(s.weightKg / 1000).toFixed(2)} MT</td>
                    <td className="py-3 text-navy-600">
                      {s.origin?.villageOrTown || 'Dindori'} &rarr; {s.destination?.district || 'Mumbai'}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          s.status === 'DELIVERED'
                            ? 'success'
                            : s.status === 'IN_TRANSIT'
                            ? 'warning'
                            : s.status === 'CANCELLED'
                            ? 'error'
                            : 'info'
                        }
                        size="sm"
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-mono text-[11px] text-blue-700">
                      EWB-{id.substring(id.length - 4)}-2026
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
