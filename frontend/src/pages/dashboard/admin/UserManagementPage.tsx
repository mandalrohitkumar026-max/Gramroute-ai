import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, User, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { DEMO_USERS } from '../../../services/mockData';

export const UserManagementPage: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState('ALL');

  const usersList = Object.values(DEMO_USERS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Platform User Management</h1>
          <p className="text-xs text-navy-500 mt-1">Directory of verified farmers, commercial transporters, FPOs, and administrative staff.</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-navy-400 uppercase text-[10px]">
                <th className="pb-3">User</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Location Hub</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-bold text-navy-900">
                    <div className="flex items-center gap-2">
                      <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge variant={u.role === 'FARMER' ? 'forest' : u.role === 'TRANSPORTER' ? 'warning' : 'info'} size="sm">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 text-navy-600 font-mono text-[11px]">{u.phone}</td>
                  <td className="py-3 text-navy-600">{u.locationName.split(',')[0]}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button className="text-xs text-navy-600 hover:underline">Edit</button>
                    <button className="text-xs text-rose-600 hover:underline">Suspend</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
