import React, { useState, useEffect } from 'react';
import { Truck, PlusCircle, CheckCircle2, ShieldCheck, FileText, RefreshCw, Upload, Power, Trash2, MapPin } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Alert } from '../../../components/ui/Alert';
import { vehicleService } from '../../../services/vehicleService';
import { MOCK_VEHICLES } from '../../../services/mockData';

export const VehicleManagementPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  // Form States
  const [regNumber, setRegNumber] = useState('MH 15 JK 7890');
  const [vehicleType, setVehicleType] = useState('MINI_TRUCK');
  const [vehicleCategory, setVehicleCategory] = useState('TARPAULIN');
  const [makeAndModel, setMakeAndModel] = useState('Tata 407 LCV Turbo');
  const [yearOfManufacture, setYearOfManufacture] = useState(2023);
  const [payloadCapacityKg, setPayloadCapacityKg] = useState(2500);
  const [volumeCbm, setVolumeCbm] = useState(12);
  const [lengthM, setLengthM] = useState(4.2);
  const [widthM, setWidthM] = useState(2.1);
  const [heightM, setHeightM] = useState(2.0);
  const [hasRefrigeration, setHasRefrigeration] = useState(false);
  const [operatingAreas, setOperatingAreas] = useState('Nashik, Pune, Mumbai, Thane');

  // Document Upload Form
  const [docType, setDocType] = useState('RC');
  const [docNumber, setDocNumber] = useState('');
  const [docUrl, setDocUrl] = useState('https://gramroute.ai/docs/sample_rc.pdf');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleService.getVehicles();
      const items = res.data?.items || res.data || [];
      if (items.length > 0) {
        setVehicles(items);
      } else {
        setVehicles(MOCK_VEHICLES);
      }
    } catch {
      setVehicles(MOCK_VEHICLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await vehicleService.registerVehicle({
        registrationNumber: regNumber,
        vehicleType,
        vehicleCategory,
        makeAndModel,
        yearOfManufacture: Number(yearOfManufacture),
        payloadCapacityKg: Number(payloadCapacityKg),
        volumetricCapacityCubicMeters: Number(volumeCbm),
        dimensions: {
          lengthM: Number(lengthM),
          widthM: Number(widthM),
          heightM: Number(heightM)
        },
        hasRefrigeration,
        operatingAreas: operatingAreas.split(',').map((s) => s.trim())
      });

      setSuccessMsg('Vehicle registered successfully! Pending RTO document verification.');
      setAddModalOpen(false);
      await fetchVehicles();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to register vehicle');
    }
  };

  const handleToggleAvailability = async (v: any) => {
    const nextAvailable = !v.isAvailable;
    const nextStatus = nextAvailable ? 'AVAILABLE' : 'OFFLINE';
    try {
      await vehicleService.updateAvailability(v._id || v.id, nextAvailable, nextStatus);
      setVehicles((prev) =>
        prev.map((item) =>
          (item._id || item.id) === (v._id || v.id)
            ? { ...item, isAvailable: nextAvailable, availabilityStatus: nextStatus }
            : item
        )
      );
    } catch {
      // optimistic update
      setVehicles((prev) =>
        prev.map((item) =>
          (item._id || item.id) === (v._id || v.id)
            ? { ...item, isAvailable: nextAvailable, availabilityStatus: nextStatus }
            : item
        )
      );
    }
  };

  const handleUploadDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      await vehicleService.uploadDocument(
        selectedVehicle._id || selectedVehicle.id,
        docType,
        docUrl,
        docNumber
      );
      setSuccessMsg(`Document (${docType}) uploaded for vehicle ${selectedVehicle.registrationNumber}`);
      setDocModalOpen(false);
      await fetchVehicles();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to upload document');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Transporter Fleet Management</h1>
          <p className="text-xs text-navy-500 mt-1">
            Register vehicles, manage dimensions & payload capacities, upload compliance documents, and update readiness.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={fetchVehicles}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            className="bg-forest-primary hover:bg-forest-800"
            onClick={() => setAddModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Vehicle
          </Button>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="error" title="Error">
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success" title="Success">
          {successMsg}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-12 text-navy-500 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest-primary mb-2" />
          Loading vehicle fleet...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vehicles.map((v) => {
            const id = v._id || v.id;
            const isAvail = v.isAvailable !== false;
            return (
              <Card key={id} className="p-5 space-y-4 hover:border-forest-300 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-forest-100 text-forest-primary">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-navy-900">{v.makeAndModel}</h4>
                      <span className="font-mono text-xs text-navy-600 font-bold">{v.registrationNumber}</span>
                    </div>
                  </div>
                  <Badge variant={isAvail ? 'success' : 'neutral'} size="sm">
                    {v.availabilityStatus || (isAvail ? 'AVAILABLE' : 'OFFLINE')}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-navy-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span>Vehicle Type:</span>
                    <strong className="text-navy-900">{v.vehicleType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Category / Body:</span>
                    <strong className="text-navy-900">{v.vehicleCategory || 'TARPAULIN'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Payload:</span>
                    <strong className="text-forest-primary font-bold">
                      {v.payloadCapacityKg} kg ({(v.payloadCapacityKg / 1000).toFixed(1)} MT)
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume Capacity:</span>
                    <strong className="text-navy-900">{v.volumetricCapacityCubicMeters || 10} m³</strong>
                  </div>
                  {v.dimensions && (
                    <div className="flex justify-between text-[11px] text-navy-500">
                      <span>Dimensions (L×W×H):</span>
                      <span>
                        {v.dimensions.lengthM || 4}m × {v.dimensions.widthM || 2}m × {v.dimensions.heightM || 2}m
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Refrigeration:</span>
                    <span className="font-semibold">{v.hasRefrigeration ? '✅ Reefer Cold Chain' : '❌ Ambient'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span>Verification:</span>
                    <Badge variant={v.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} size="xs">
                      {v.verificationStatus || 'PENDING'}
                    </Badge>
                  </div>
                </div>

                {v.operatingAreas && v.operatingAreas.length > 0 && (
                  <div className="text-[11px] text-navy-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-forest-primary shrink-0" />
                    <span>Corridors: {Array.isArray(v.operatingAreas) ? v.operatingAreas.join(', ') : v.operatingAreas}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Button
                    size="xs"
                    variant={isAvail ? 'outline' : 'primary'}
                    className="flex-1"
                    onClick={() => handleToggleAvailability(v)}
                  >
                    <Power className="w-3 h-3 mr-1" />
                    {isAvail ? 'Set Offline' : 'Set Available'}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setSelectedVehicle(v);
                      setDocModalOpen(true);
                    }}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Upload Docs
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register Vehicle to Fleet">
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              required
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
              placeholder="e.g. MH 15 AB 1234"
            />
            <Select
              label="Vehicle Type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              options={[
                { value: 'PICKUP_TRUCK', label: 'Pickup Truck (Bolero / Dost - 1.5 MT)' },
                { value: 'MINI_TRUCK', label: 'Mini Truck (Tata 407 / Eicher - 2.5 MT)' },
                { value: 'TRACTOR_TROLLEY', label: 'Tractor Trolley (Rural - 3.0 MT)' },
                { value: 'HEAVY_TRUCK', label: 'Heavy Commercial Vehicle (10-16 MT)' },
                { value: 'REFRIGERATED_VAN', label: 'Refrigerated Cold Chain Van' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Make & Model"
              required
              value={makeAndModel}
              onChange={(e) => setMakeAndModel(e.target.value)}
              placeholder="e.g. Tata 407 LCV"
            />
            <Select
              label="Body Category"
              value={vehicleCategory}
              onChange={(e) => setVehicleCategory(e.target.value)}
              options={[
                { value: 'TARPAULIN', label: 'Tarpaulin Covered' },
                { value: 'CLOSED_CONTAINER', label: 'Closed Container' },
                { value: 'OPEN_BODY', label: 'Open Body' },
                { value: 'REEFER', label: 'Refrigerated Unit' },
                { value: 'TROLLEY', label: 'Agricultural Trolley' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Max Payload (kg)"
              type="number"
              required
              min={100}
              value={payloadCapacityKg}
              onChange={(e) => setPayloadCapacityKg(Number(e.target.value))}
            />
            <Input
              label="Volume Capacity (m³)"
              type="number"
              step="0.5"
              required
              min={1}
              value={volumeCbm}
              onChange={(e) => setVolumeCbm(Number(e.target.value))}
            />
            <Input
              label="Year of Manufacture"
              type="number"
              min={1995}
              max={2026}
              value={yearOfManufacture}
              onChange={(e) => setYearOfManufacture(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Length (m)"
              type="number"
              step="0.1"
              value={lengthM}
              onChange={(e) => setLengthM(Number(e.target.value))}
            />
            <Input
              label="Width (m)"
              type="number"
              step="0.1"
              value={widthM}
              onChange={(e) => setWidthM(Number(e.target.value))}
            />
            <Input
              label="Height (m)"
              type="number"
              step="0.1"
              value={heightM}
              onChange={(e) => setHeightM(Number(e.target.value))}
            />
          </div>

          <Input
            label="Operating Corridors (comma-separated districts)"
            value={operatingAreas}
            onChange={(e) => setOperatingAreas(e.target.value)}
            placeholder="e.g. Nashik, Pune, Mumbai, Thane"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="reefer"
              checked={hasRefrigeration}
              onChange={(e) => setHasRefrigeration(e.target.checked)}
              className="rounded text-forest-primary focus:ring-forest-primary h-4 w-4"
            />
            <label htmlFor="reefer" className="text-xs font-semibold text-navy-800 cursor-pointer">
              Equipped with Active Temperature Control / Cold Chain Unit
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        title={`Upload Vehicle Document - ${selectedVehicle?.registrationNumber}`}
      >
        <form onSubmit={handleUploadDocumentSubmit} className="space-y-4">
          <Select
            label="Document Type"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            options={[
              { value: 'RC', label: 'RC (Registration Certificate)' },
              { value: 'FITNESS', label: 'Vehicle Fitness Certificate' },
              { value: 'INSURANCE', label: 'Commercial Vehicle Insurance' },
              { value: 'PERMIT', label: 'State / National Goods Carriage Permit' },
              { value: 'POLLUTION', label: 'PUC (Pollution Certificate)' }
            ]}
          />

          <Input
            label="Document / Certificate Number"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder="e.g. MH1520230009871"
          />

          <Input
            label="Document URL / Cloud Link"
            required
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="https://..."
          />

          <p className="text-[11px] text-navy-500 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
            Uploaded compliance documents are audited by GramRoute transport administrators within 24 hours. Verified vehicles receive priority match status.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setDocModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
