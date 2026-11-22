import React from 'react';
import { DeliveryTrackingPage } from '../business/DeliveryTrackingPage';

export const TripMonitoringPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Active Nationwide Trip Radar</h1>
        <p className="text-xs text-navy-500 mt-0.5">Real-time corridor telemetry, transit milestones, and automated delay flag detection.</p>
      </div>
      <DeliveryTrackingPage />
    </div>
  );
};
