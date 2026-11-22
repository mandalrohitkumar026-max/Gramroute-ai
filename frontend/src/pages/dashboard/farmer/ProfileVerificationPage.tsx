import React, { useState } from 'react';
import { User, ShieldCheck, Upload, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useAuth } from '../../../contexts/AuthContext';
import { MOCK_VERIFICATION_DOCS } from '../../../services/mockData';

export const ProfileVerificationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Farmer Profile & KYC Verification</h1>
        <p className="text-xs text-navy-500 mt-1">Manage farm registration, FPO membership, and regulatory document verification.</p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-forest-primary" />
              Primary Farm Identity
            </span>
            <Badge variant="success" size="sm" dot>VERIFIED FARMER</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" defaultValue={currentUser.name} />
            <Input label="Registered Mobile Number" defaultValue={currentUser.phone} disabled />
            <Input label="Primary FPO Affiliation" defaultValue={currentUser.meta.fpoName || 'Sahyadri Farmers Producer Co.'} />
            <Input label="Village & District" defaultValue={currentUser.locationName} />
          </div>
        </CardContent>
      </Card>

      {/* KYC Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest-primary" />
            Verification Documents (KYC)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-navy-900 block">Aadhaar Card (UIDAI Verified)</span>
                <span className="text-navy-500 font-mono text-[11px]">XXXX-XXXX-8921</span>
              </div>
              <Badge variant="success" size="sm">APPROVED</Badge>
            </div>

            <div className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-navy-900 block">7/12 Land Record Extract / Lease Certificate</span>
                <span className="text-navy-500 font-mono text-[11px]">Gat No. 42 Dindori</span>
              </div>
              <Badge variant="success" size="sm">APPROVED</Badge>
            </div>

            <div className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-navy-900 block">APMC Mandi Seller Pass</span>
                <span className="text-navy-500 font-mono text-[11px]">APMC-NASHIK-FARM-9901</span>
              </div>
              {uploaded ? (
                <Badge variant="warning" size="sm">UNDER REVIEW</Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setUploaded(true)} leftIcon={<Upload className="w-3.5 h-3.5" />}>
                  Upload Renewed Pass
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
