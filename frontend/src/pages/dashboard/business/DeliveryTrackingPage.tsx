import React from 'react';
import { TrackingPage } from '../farmer/TrackingPage';

export const DeliveryTrackingPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Enterprise Fleet Telemetry Radar</h1>
        <p className="text-xs text-navy-500 mt-0.5">Real-time GPS positioning, arrival estimates, and multi-drop corridor progression.</p>
      </div>
      <TrackingPage />
    </div>
  );
};
