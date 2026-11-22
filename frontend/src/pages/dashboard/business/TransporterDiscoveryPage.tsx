import React from 'react';
import { Truck, Star, ShieldCheck, MapPin, Phone, MessageSquare } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { MOCK_VEHICLES } from '../../../services/mockData';

export const TransporterDiscoveryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Verified Commercial Transporter Directory</h1>
        <p className="text-xs text-navy-500 mt-1">Discover vetted rural logistics operators with verified vehicle permits and insurance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_VEHICLES.map((v) => (
          <Card key={v._id} className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-navy-900">{v.makeAndModel}</h4>
                  <span className="font-mono text-xs text-navy-500">{v.registrationNumber}</span>
                </div>
              </div>
              <Badge variant="success" size="sm">RC VERIFIED</Badge>
            </div>

            <div className="space-y-1.5 text-xs text-navy-600 bg-neutral-surface p-3 rounded-lg border border-slate-100">
              <div className="flex justify-between">
                <span>Payload Capacity:</span>
                <strong className="text-navy-900">{v.payloadCapacityKg} kg ({(v.payloadCapacityKg/1000).toFixed(1)} MT)</strong>
              </div>
              <div className="flex justify-between">
                <span>Volumetric Space:</span>
                <strong className="text-navy-900">{v.volumetricCapacityCubicMeters} m³</strong>
              </div>
              <div className="flex justify-between">
                <span>Refrigerated / Reefer:</span>
                <strong className={v.hasRefrigeration ? 'text-forest-700' : 'text-navy-400'}>
                  {v.hasRefrigeration ? 'Yes (Cold Van)' : 'No (Covered Dry)'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Driver Rating:</span>
                <strong className="text-amber-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4.8 / 5.0 (142 Trips)
                </strong>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1" leftIcon={<Phone className="w-3.5 h-3.5" />}>
                Contact
              </Button>
              <Button variant="primary" size="sm" className="flex-1 bg-blue-700 hover:bg-blue-800">
                Book Dedicated
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
