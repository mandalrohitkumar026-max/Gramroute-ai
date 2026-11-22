import React from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { MOCK_NOTIFICATIONS } from '../../../services/mockData';

export const FarmerNotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-navy-500 mt-1">Real-time alerts regarding matches, truck arrival, and escrow disbursements.</p>
        </div>
        <Button variant="outline" size="sm">
          Mark All Read
        </Button>
      </div>

      <div className="space-y-3">
        {MOCK_NOTIFICATIONS.map((n) => (
          <Card key={n._id} className={`p-5 ${!n.isRead ? 'border-l-4 border-l-forest-primary bg-forest-50/20' : ''}`}>
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-navy-900">{n.title}</h4>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-forest-500"></span>
                  )}
                </div>
                <p className="text-xs text-navy-600 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 block pt-1">{n.createdAt} • Channel: {n.channel}</span>
              </div>

              <Button variant="ghost" size="sm">
                Dismiss
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
