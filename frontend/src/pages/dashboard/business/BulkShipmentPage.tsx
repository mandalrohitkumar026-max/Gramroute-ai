import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Plus, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface BulkRow {
  id: number;
  cargo: string;
  weightKg: number;
  origin: string;
  destination: string;
}

export const BulkShipmentPage: React.FC = () => {
  const [rows, setRows] = useState<BulkRow[]>([
    { id: 1, cargo: 'Bio-Fertilizer Sacks (50kg)', weightKg: 2500, origin: 'Ambad MIDC', destination: 'Sangamner Agro Hub' },
    { id: 2, cargo: 'Certified Hybrid Cotton Seeds', weightKg: 1200, origin: 'Ambad MIDC', destination: 'Jalna Collection Yard' },
    { id: 3, cargo: 'Drip Irrigation Pipe Bundles', weightKg: 1800, origin: 'Ambad MIDC', destination: 'Sinnar Farmer Hub' }
  ]);
  const [submitted, setSubmitted] = useState(false);

  const addRow = () => {
    setRows([
      ...rows,
      { id: Date.now(), cargo: 'Organic Compost Bags', weightKg: 1000, origin: 'Ambad MIDC', destination: 'Nashik APMC' }
    ]);
  };

  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const totalTons = (rows.reduce((sum, r) => sum + r.weightKg, 0) / 1000).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Bulk Consignment Creator</h1>
          <p className="text-xs text-navy-500 mt-1">Upload CSV or batch-enter multi-drop consignments for FPOs and input distributors.</p>
        </div>

        <div className="flex gap-2.5">
          <Button variant="outline" size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />}>
            Upload CSV Manifest
          </Button>
          <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}>
            Download Template
          </Button>
        </div>
      </div>

      {submitted ? (
        <Card className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-navy-900">Bulk Consignment Dispatched for Optimization!</h2>
          <p className="text-xs text-navy-600 max-w-md mx-auto leading-relaxed">
            Ingested <strong>{rows.length} consignments totaling {totalTons} MT</strong>. The OR-Tools vehicle routing solver is generating consolidated multi-drop itineraries.
          </p>
        </Card>
      ) : (
        <Card className="p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-navy-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 w-1/4">Commodity / Material</th>
                  <th className="pb-3 w-1/6">Weight (kg)</th>
                  <th className="pb-3 w-1/4">Origin Warehouse</th>
                  <th className="pb-3 w-1/4">Destination Hub</th>
                  <th className="pb-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-2">
                      <input
                        type="text"
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        defaultValue={r.cargo}
                      />
                    </td>
                    <td className="py-2.5 pr-2">
                      <input
                        type="number"
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        defaultValue={r.weightKg}
                      />
                    </td>
                    <td className="py-2.5 pr-2">
                      <input
                        type="text"
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        defaultValue={r.origin}
                      />
                    </td>
                    <td className="py-2.5 pr-2">
                      <input
                        type="text"
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        defaultValue={r.destination}
                      />
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => removeRow(r.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={addRow} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Another Row
            </Button>

            <div className="flex items-center gap-6">
              <span className="text-xs text-navy-600">
                Total Load: <strong className="text-navy-900 text-sm">{totalTons} MT</strong>
              </span>

              <Button
                variant="primary"
                size="md"
                className="bg-blue-700 hover:bg-blue-800"
                onClick={() => setSubmitted(true)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Submit Batch for Route Solver
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
