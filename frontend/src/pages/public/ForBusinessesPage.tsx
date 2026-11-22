import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, FileSpreadsheet, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const ForBusinessesPage: React.FC = () => {
  const { switchRole } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>FPOs & Commercial Agribusinesses</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-900 tracking-tight leading-tight">
            Predictable Rural Freight. <br />
            <span className="text-blue-700">Enterprise SLA & Bulk Consignments.</span>
          </h1>
          <p className="text-base text-navy-600 leading-relaxed font-normal">
            Distribute agricultural inputs (seeds, organic fertilizers, pesticides) or aggregate member farm produce with reliable multi-truck schedules and automated invoicing.
          </p>
          <div className="flex gap-4 pt-2">
            <Link to="/dashboard/business/bulk-create" onClick={() => switchRole('BUSINESS')}>
              <Button variant="primary" size="lg" className="bg-blue-700 hover:bg-blue-800" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Bulk Consignment
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Request FPO Partnership
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-blue-950">Enterprise Features for FPOs</h3>
          <ul className="space-y-4 text-xs text-blue-900 leading-relaxed">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>CSV & Excel Batch Uploads:</strong> Ingest hundreds of dispatch orders across district collection centers with a single click.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>GST Invoicing & Compliance:</strong> Complete financial paper trail, automated E-way bill generation compatibility, and monthly freight statements.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Dedicated Fleet SLA:</strong> Guaranteed vehicle dispatch windows during peak agricultural harvest cycles.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Multi-Drop Route Optimization:</strong> Optimize complex warehouse-to-farm dealer deliveries with automated stop sequencing.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
