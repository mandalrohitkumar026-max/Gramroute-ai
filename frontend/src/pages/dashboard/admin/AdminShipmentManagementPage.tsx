import React from 'react';
import { ShipmentManagementPage } from '../business/ShipmentManagementPage';

export const AdminShipmentManagementPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Platform-Wide Shipment Registry</h1>
        <p className="text-xs text-navy-500 mt-0.5">Global audit table of every produce load posted across all regional mandis.</p>
      </div>
      <ShipmentManagementPage />
    </div>
  );
};
