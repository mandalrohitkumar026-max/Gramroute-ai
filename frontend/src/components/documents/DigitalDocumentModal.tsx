import React, { useState } from 'react';
import { FileText, Printer, Download, CheckCircle2, ShieldCheck, QrCode, Truck, Building2, User, Calendar, MapPin, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export type DocumentType = 'E_BILTY' | 'TRIP_MANIFEST' | 'COST_RECEIPT' | 'POD_CERTIFICATE';

interface DigitalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType?: DocumentType;
  data?: {
    documentNumber?: string;
    consignorName?: string;
    consignorPhone?: string;
    originAddress?: string;
    consigneeName?: string;
    destinationAddress?: string;
    cargoDescription?: string;
    weightKg?: number;
    packagesCount?: number;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    pickupDate?: string;
    deliveryDate?: string;
    totalFreightInr?: number;
    sharedSavingsInr?: number;
    gstAmountInr?: number;
    otpCode?: string;
  };
}

export const DigitalDocumentModal: React.FC<DigitalDocumentModalProps> = ({
  isOpen,
  onClose,
  documentType = 'E_BILTY',
  data = {}
}) => {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState<DocumentType>(documentType);

  if (!isOpen) return null;

  const docNumber = data.documentNumber || `GR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const consignor = data.consignorName || 'Kisan Ramesh Patil (Farmer Producer Member)';
  const origin = data.originAddress || 'Farm Gate, Dindori Tehsil, Nashik Rural, MH 422202';
  const consignee = data.consigneeName || 'Vashi APMC Wholesale Commission Agent #84';
  const destination = data.destinationAddress || 'Sector 19 Onion-Potato Yard, Vashi Navi Mumbai 400703';
  const cargo = data.cargoDescription || 'Nashik Red Onions (Grade A)';
  const weight = data.weightKg || 2500;
  const packages = data.packagesCount || 50;
  const vehicle = data.vehicleNumber || 'MH-15-EG-4421 (Eicher Pro 2049)';
  const driver = data.driverName || 'Ganesh B. Shinde (Verified Rural Transporter)';
  const driverPhone = data.driverPhone || '+91 98231 44550';
  const freight = data.totalFreightInr || 2450;
  const savings = data.sharedSavingsInr || 1350;
  const pickupDate = data.pickupDate || '22 Nov 2026, 06:30 AM';
  const deliveryDate = data.deliveryDate || '22 Nov 2026, 01:15 PM';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-neutral-300 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Modal Controls Header */}
        <div className="bg-navy-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-forest-300" />
            <span className="font-bold text-sm">GramRoute AI Official Digital Document Generator</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Document Selector Pills */}
            <div className="inline-flex rounded-lg bg-navy-800 p-0.5 border border-navy-700 text-xs">
              <button
                type="button"
                onClick={() => setSelectedType('E_BILTY')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  selectedType === 'E_BILTY' ? 'bg-forest-primary text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                e-Bilty
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('TRIP_MANIFEST')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  selectedType === 'TRIP_MANIFEST' ? 'bg-forest-primary text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Manifest
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('COST_RECEIPT')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  selectedType === 'COST_RECEIPT' ? 'bg-forest-primary text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Bill Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('POD_CERTIFICATE')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  selectedType === 'POD_CERTIFICATE' ? 'bg-forest-primary text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                POD
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 flex items-center gap-1.5 text-xs font-semibold border border-navy-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 space-y-6 text-navy-950 bg-white" id="printable-document">
          {/* Header Seal & Meta */}
          <div className="flex items-start justify-between border-b-2 border-forest-900 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-forest-primary tracking-tight">GramRoute AI</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-forest-100 text-forest-800 border border-forest-300 uppercase">
                  Govt Compliant Rural Freight
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">
                National Rural Freight Exchange & Shared Consolidation Network
              </p>
              <p className="text-[11px] text-neutral-400">
                GSTIN: 27AABCG1234F1Z8 | Transporter APMC Code: MH-NSK-2026-99
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs font-black uppercase text-navy-900 tracking-wider block">
                {selectedType === 'E_BILTY' && 'Electronic Consignment Note (e-Bilty)'}
                {selectedType === 'TRIP_MANIFEST' && 'Multi-Stop Vehicle Trip Manifest'}
                {selectedType === 'COST_RECEIPT' && 'Freight Cost Allocation & Shared Savings Receipt'}
                {selectedType === 'POD_CERTIFICATE' && 'Proof of Delivery (POD) Electronic Certificate'}
              </span>
              <p className="text-xs font-mono font-bold text-forest-primary">DOC #: {docNumber}</p>
              <p className="text-[10px] text-neutral-500">Issued: {new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-2 gap-4 border border-neutral-200 rounded-xl p-4 bg-neutral-50/50 text-xs">
            <div className="space-y-1 border-r border-neutral-200 pr-4">
              <span className="font-bold text-neutral-500 uppercase tracking-wider block">1. Consignor (Shipper)</span>
              <p className="font-bold text-navy-900">{consignor}</p>
              <p className="text-neutral-600">{origin}</p>
              <p className="text-neutral-500">Pickup Window: {pickupDate}</p>
            </div>

            <div className="space-y-1 pl-2">
              <span className="font-bold text-neutral-500 uppercase tracking-wider block">2. Consignee (Destination)</span>
              <p className="font-bold text-navy-900">{consignee}</p>
              <p className="text-neutral-600">{destination}</p>
              <p className="text-neutral-500">Delivery Deadline: {deliveryDate}</p>
            </div>
          </div>

          {/* Vehicle & Transporter Details */}
          <div className="grid grid-cols-3 gap-3 border border-neutral-200 rounded-xl p-3 bg-neutral-50/30 text-xs">
            <div>
              <span className="text-neutral-500 block">Vehicle Number:</span>
              <span className="font-bold font-mono text-navy-900">{vehicle}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Assigned Driver:</span>
              <span className="font-bold text-navy-900">{driver}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Driver Contact:</span>
              <span className="font-mono text-navy-900">{driverPhone}</span>
            </div>
          </div>

          {/* Cargo Particulars Table */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-neutral-100 text-neutral-700 border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Packages</th>
                  <th className="py-2.5 px-3 text-right">Net Weight</th>
                  <th className="py-2.5 px-3 text-right">Handling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <td className="py-3 px-3 font-semibold text-navy-900">{cargo}</td>
                  <td className="py-3 px-3 text-neutral-600">Fresh Produce / Agriculture</td>
                  <td className="py-3 px-3 text-right font-mono">{packages} Mesh Bags</td>
                  <td className="py-3 px-3 text-right font-mono font-bold">{weight} kg</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[11px]">
                      Ventilated
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown / Savings (for e-Bilty and Cost Receipt) */}
          <div className="border border-neutral-200 rounded-xl p-4 bg-emerald-50/30 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Standard Individual Truck Rental Cost:</span>
              <span className="line-through font-mono">₹{freight + savings}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-800">
              <span>GramRoute Shared Consolidation Discount:</span>
              <span className="font-mono">- ₹{savings} (35% Cost Reduction)</span>
            </div>
            <div className="flex justify-between border-t border-emerald-200 pt-2 text-sm font-black text-navy-900">
              <span>Final Payable Freight (Taxes Included):</span>
              <span className="font-mono text-emerald-700">₹{freight}</span>
            </div>
          </div>

          {/* Verification & Security Footer */}
          <div className="border-t border-neutral-200 pt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-neutral-100 rounded-lg border border-neutral-300 flex items-center justify-center p-1">
                <QrCode className="w-12 h-12 text-navy-800" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-navy-900 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-forest-primary" />
                  <span>GramRoute AI Tamper-Evident Waybill</span>
                </p>
                <p className="text-[11px] text-neutral-500 font-mono">SHA-256: 7f8a3c...e42b81</p>
                <p className="text-[10px] text-neutral-400">Scan QR code at APMC gate for contactless clearance</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="h-8 border-b border-dashed border-neutral-400 w-36 ml-auto" />
              <span className="text-[10px] text-neutral-500 uppercase block">Authorized Signatory / Driver Sign</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-neutral-100 px-6 py-3 border-t border-neutral-200 flex items-center justify-between text-xs print:hidden">
          <span className="text-neutral-500">Official legal consignment note under Indian Carriage by Road Act, 2007</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 font-semibold text-neutral-700 hover:bg-neutral-200 rounded-lg"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 font-bold bg-forest-primary text-white hover:bg-forest-800 rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download / Print Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
