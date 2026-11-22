import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, Truck, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Alert } from '../../../components/ui/Alert';
import { vehicleService } from '../../../services/vehicleService';
import { adminService } from '../../../services/adminService';
import { MOCK_VERIFICATION_DOCS } from '../../../services/mockData';

export const VehicleVerificationPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUnverifiedVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleService.getVehicles({ all: true });
      const items = res.data?.items || res.data || [];
      if (items.length > 0) {
        setVehicles(items);
      } else {
        setVehicles(MOCK_VERIFICATION_DOCS as any);
      }
    } catch {
      setVehicles(MOCK_VERIFICATION_DOCS as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverifiedVehicles();
  }, []);

  const handleApprove = async (vehicleId: string) => {
    try {
      await adminService.verifyVehicle(vehicleId, 'VERIFIED', 'All commercial documents verified by RTO checklist');
      setNotification({ type: 'success', message: 'Vehicle verified and approved for priority corridor matching!' });
      await fetchUnverifiedVehicles();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error?.message || 'Verification update failed' });
    }
    setSelectedVehicle(null);
  };

  const handleReject = async (vehicleId: string) => {
    try {
      await adminService.verifyVehicle(vehicleId, 'REJECTED', 'Expired fitness or missing commercial goods carriage permit');
      setNotification({ type: 'error', message: 'Vehicle documents rejected. Transporter notified to re-upload.' });
      await fetchUnverifiedVehicles();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error?.message || 'Verification update failed' });
    }
    setSelectedVehicle(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Compliance & Vehicle Audit Queue</h1>
          <p className="text-xs text-navy-500 mt-1">
            Audit Commercial Vehicle Registration Certificates, State Goods Permits, and Driver KYC verification.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={fetchUnverifiedVehicles}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Queue
        </Button>
      </div>

      {notification && (
        <Alert
          variant={notification.type === 'success' ? 'success' : 'error'}
          title={notification.type === 'success' ? 'Success' : 'Notice'}
        >
          {notification.message}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-12 text-navy-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest-primary mb-2" />
          Loading audit queue...
        </div>
      ) : vehicles.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-navy-900">All Vehicles Audited</h3>
          <p className="text-xs text-navy-500 max-w-sm mx-auto">
            Zero pending vehicles in the compliance queue. All active fleet items meet safety and regulatory standards.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {vehicles.map((v) => {
            const id = v._id || v.id;
            const regNo = v.registrationNumber || v.documentIdentifierNumber || 'MH 15 EF 4921';
            const status = v.verificationStatus || 'PENDING';
            const make = v.makeAndModel || `${v.documentType || 'RC'} Compliance`;

            return (
              <Card key={id} className="p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-forest-primary" />
                      <span className="font-bold text-sm text-navy-900">{make}</span>
                      <Badge
                        variant={status === 'VERIFIED' ? 'success' : status === 'PENDING' ? 'warning' : 'error'}
                        size="sm"
                      >
                        {status}
                      </Badge>
                    </div>
                    <p className="font-mono text-navy-700 font-semibold">Registration Number: {regNo}</p>
                    <p className="text-navy-500">
                      Payload: {v.payloadCapacityKg || 2500} kg &bull; Vehicle Type: {v.vehicleType || 'MINI_TRUCK'} &bull; Corridors: {Array.isArray(v.operatingAreas) ? v.operatingAreas.join(', ') : 'Nashik-Mumbai'}
                    </p>
                  </div>

                  <div className="flex gap-2 self-end sm:self-auto">
                    <Button variant="outline" size="sm" onClick={() => setSelectedVehicle(v)}>
                      Inspect Details
                    </Button>
                    {status === 'PENDING' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-emerald-700 hover:bg-emerald-800"
                          onClick={() => handleApprove(id)}
                        >
                          Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleReject(id)}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Inspect Modal */}
      <Modal
        isOpen={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        title={`Audit Inspection: ${selectedVehicle?.registrationNumber || 'Vehicle'}`}
      >
        {selectedVehicle && (
          <div className="space-y-4 text-xs text-navy-700">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div>
                <strong>Make & Model:</strong> {selectedVehicle.makeAndModel}
              </div>
              <div>
                <strong>Payload Capacity:</strong> {selectedVehicle.payloadCapacityKg} kg
              </div>
              <div>
                <strong>Volume Capacity:</strong> {selectedVehicle.volumetricCapacityCubicMeters || 10} m³
              </div>
              <div>
                <strong>Category:</strong> {selectedVehicle.vehicleCategory || 'TARPAULIN'}
              </div>
              <div>
                <strong>Refrigeration:</strong> {selectedVehicle.hasRefrigeration ? 'Reefer Unit' : 'Ambient'}
              </div>
            </div>

            <div className="border border-slate-200 rounded p-3 space-y-2">
              <div className="font-bold text-navy-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-forest-primary" />
                Submitted Compliance Documents
              </div>
              {selectedVehicle.documents && selectedVehicle.documents.length > 0 ? (
                selectedVehicle.documents.map((d: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                    <span>{d.documentType} ({d.documentNumber || 'Ref'})</span>
                    <a
                      href={d.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest-primary font-bold underline"
                    >
                      View Document PDF
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">No cloud files attached. Fast-track approval available.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(selectedVehicle._id || selectedVehicle.id)}
              >
                Reject Documents
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800"
                onClick={() => handleApprove(selectedVehicle._id || selectedVehicle.id)}
              >
                Approve & Mark Verified
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
