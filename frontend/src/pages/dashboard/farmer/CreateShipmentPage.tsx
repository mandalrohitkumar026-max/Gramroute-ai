import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, MapPin, Calendar, Clock, DollarSign, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Truck, Mic, WifiOff, Save } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Alert } from '../../../components/ui/Alert';
import { shipmentService } from '../../../services/shipmentService';
import { VoiceShipmentAssistant, ExtractedVoiceShipment } from '../../../components/voice/VoiceShipmentAssistant';
import { offlineQueue } from '../../../services/offlineQueueService';
import { useLanguage } from '../../../contexts/LanguageContext';

export const CreateShipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);
  const [offlineDraftSaved, setOfflineDraftSaved] = useState(false);

  // Form States
  const [cargoName, setCargoName] = useState('Nashik Red Onions (Rabi Season)');
  const [cargoCategory, setCargoCategory] = useState('VEGETABLES');
  const [cargoDescription, setCargoDescription] = useState('Graded medium-sized onions packed in 50kg ventilated mesh bags');
  const [weightKg, setWeightKg] = useState(1500);
  const [volumeCbm, setVolumeCbm] = useState(6);
  const [numberOfPackages, setNumberOfPackages] = useState(30);
  const [packagingType, setPackagingType] = useState('Jute Mesh Bags');
  const [isPerishable, setIsPerishable] = useState(true);
  const [preferredTransportType, setPreferredTransportType] = useState('MINI_TRUCK');
  const [specialInstructions, setSpecialInstructions] = useState('Handle with care, avoid moisture and rain exposure');

  // Handling Requirements Multi-select
  const [handlingReqs, setHandlingReqs] = useState<string[]>(['VENTILATED_TARPAULIN']);

  // Origin & Destination
  const [originAddress, setOriginAddress] = useState('Farm Gate, Near Gram Panchayat');
  const [village, setVillage] = useState('Dindori');
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');

  const [destinationAddress, setDestinationAddress] = useState('Sector 19, APMC Wholesale Market');
  const [destinationMandi, setDestinationMandi] = useState('Vashi APMC Mandi, Navi Mumbai');
  const [destDistrict, setDestDistrict] = useState('Mumbai Suburban');
  const [destState, setDestState] = useState('Maharashtra');

  // Dates
  const [pickupDate, setPickupDate] = useState('2026-11-22');
  const [deliveryDeadline, setDeliveryDeadline] = useState('2026-11-23');

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Dynamic estimate calculation
  const weightTons = weightKg / 1000;
  const estimatedDistKm = 184; // e.g. Nashik to Vashi
  const baseTonKmRate = 1.85;
  const estimatedCost = Math.round(weightTons * estimatedDistKm * baseTonKmRate);
  const traditionalTruckCost = 4500;
  const estimatedSavings = traditionalTruckCost - estimatedCost;

  const toggleHandlingReq = (req: string) => {
    setHandlingReqs((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    );
  };

  const handleVoicePopulate = (voiceData: ExtractedVoiceShipment) => {
    setCargoName(voiceData.cargoDescription);
    setCargoDescription(`${voiceData.cargoDescription} dictated via GramRoute Voice Assistant`);
    setWeightKg(voiceData.weightKg);
    setNumberOfPackages(Math.max(1, Math.round(voiceData.weightKg / 50)));
    setIsPerishable(voiceData.perishable);
    setOriginAddress(voiceData.pickupAddress);
    setDestinationMandi(voiceData.destinationAddress);
    setPickupDate(voiceData.deliveryDate);
    setDeliveryDeadline(voiceData.deliveryDate);
  };

  const handleSaveOfflineDraft = () => {
    offlineQueue.saveDraft({
      cargoCategory,
      cargoDescription: `${cargoName} - ${cargoDescription}`,
      weightKg,
      volumeM3: volumeCbm,
      packagesCount: numberOfPackages,
      pickupAddress: `${originAddress}, ${village}, ${district}`,
      pickupCoordinates: { latitude: 20.0063, longitude: 73.8344 },
      destinationAddress: `${destinationAddress}, ${destinationMandi}`,
      destinationCoordinates: { latitude: 19.0771, longitude: 72.9982 },
      preferredPickupDate: pickupDate,
      deliveryDeadline,
      perishable: isPerishable,
      specialInstructions
    });
    setOfflineDraftSaved(true);
    setTimeout(() => {
      navigate('/dashboard/farmer/shipments');
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await shipmentService.createShipment({
        cargoName,
        cargoDescription,
        cargoCategory,
        weightKg,
        volumeCubicMeters: volumeCbm,
        numberOfPackages,
        packagingType,
        isPerishable,
        handlingRequirements: handlingReqs,
        specialInstructions,
        preferredTransportType,
        origin: {
          address: originAddress,
          villageOrTown: village,
          district,
          state,
          pincode: '422001',
          location: { type: 'Point', coordinates: [73.8344, 20.0063] }
        },
        destination: {
          address: destinationAddress,
          mandiOrMarketName: destinationMandi,
          villageOrTown: 'Vashi',
          district: destDistrict,
          state: destState,
          pincode: '400703',
          location: { type: 'Point', coordinates: [72.9982, 19.0771] }
        },
        preferredPickupDate: new Date(pickupDate).toISOString(),
        deliveryDeadline: new Date(deliveryDeadline).toISOString(),
        maxBudgetInr: estimatedCost + 500
      });

      setSubmitted(true);
      setTimeout(() => {
        navigate('/dashboard/farmer/shipments');
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to list shipment';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">Create & Consolidate Shipment</h1>
        <p className="text-xs text-navy-500 mt-1">
          Post your agricultural produce or commercial freight to discover shared vehicle trips and optimize logistics costs.
        </p>
      </div>

      {/* Voice Assistant Banner CTA */}
      <div className="p-4 bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-forest-700">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-forest-700 flex items-center justify-center shrink-0 text-amber-300 shadow-inner">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-bold block">{t.voiceAssistant.title}</span>
            <span className="text-xs text-forest-200">
              Speak in Hindi, Gujarati, or English to auto-populate your load details
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setVoiceAssistantOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-400 text-forest-950 hover:bg-amber-300 transition-colors shadow-sm flex items-center gap-2 shrink-0"
        >
          <Mic className="w-4 h-4 text-forest-950" />
          <span>Launch Voice Dictation (बोलकर भरें)</span>
        </button>
      </div>

      {offlineDraftSaved && (
        <Alert variant="success" title="Offline Draft Saved">
          {t.shipment.savedOfflineNotice}
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="error" title="Submission Failed">
          {errorMsg}
        </Alert>
      )}

      {submitted ? (
        <Card className="p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-forest-100 text-forest-primary flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-navy-900">Shipment Created & Published!</h2>
          <p className="text-xs text-navy-600 max-w-md mx-auto leading-relaxed">
            Your consignment of <strong>{weightKg} kg {cargoName}</strong> has been published to the GramRoute rural freight matching engine. Redirecting to your active shipments...
          </p>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 cols: Input Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Card 1: Produce Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-forest-primary" />
                    1. Cargo Specifications & Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Commodity / Cargo Title"
                      required
                      value={cargoName}
                      onChange={(e) => setCargoName(e.target.value)}
                      placeholder="e.g. Nashik Red Onions"
                    />
                    <Select
                      label="Cargo Category"
                      value={cargoCategory}
                      onChange={(e) => setCargoCategory(e.target.value)}
                      options={[
                        { value: 'VEGETABLES', label: 'Vegetables (Onion, Tomato, Potato)' },
                        { value: 'FRUITS', label: 'Fruits (Grapes, Pomegranate, Banana)' },
                        { value: 'GRAINS_CEREALS', label: 'Grains & Pulses (Wheat, Soybean)' },
                        { value: 'DAIRY_POULTRY', label: 'Dairy & Poultry (Milk, Eggs)' },
                        { value: 'PROCESSED_FOOD', label: 'Packaged / Processed Food' },
                        { value: 'CHEMICAL_FERTILIZERS', label: 'Agro Chemicals & Fertilizers' },
                        { value: 'GENERAL_FREIGHT', label: 'General Freight / Equipment' }
                      ]}
                    />
                  </div>

                  <Input
                    label="Detailed Cargo Description"
                    value={cargoDescription}
                    onChange={(e) => setCargoDescription(e.target.value)}
                    placeholder="Provide details about grading, moisture, packaging, and varieties"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Weight (kg)"
                      type="number"
                      required
                      min={1}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      helperText={`${(weightKg / 100).toFixed(1)} Quintals / ${(weightKg / 1000).toFixed(2)} MT`}
                    />
                    <Input
                      label="Volume (m³)"
                      type="number"
                      step="0.1"
                      min={0.1}
                      value={volumeCbm}
                      onChange={(e) => setVolumeCbm(Number(e.target.value))}
                      helperText="Approximate cubic metres"
                    />
                    <Input
                      label="Number of Packages"
                      type="number"
                      min={1}
                      value={numberOfPackages}
                      onChange={(e) => setNumberOfPackages(Number(e.target.value))}
                      helperText="Bags / Crates / Boxes"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Packaging Type"
                      value={packagingType}
                      onChange={(e) => setPackagingType(e.target.value)}
                      options={[
                        { value: 'Jute Mesh Bags', label: 'Jute Mesh Bags (50kg)' },
                        { value: 'Plastic Crates', label: 'Plastic Crates (10-20kg)' },
                        { value: 'Corrugated Boxes', label: 'Corrugated Boxes' },
                        { value: 'Wooden Hampers', label: 'Wooden Hampers' },
                        { value: 'Loose Bulk', label: 'Loose Bulk' }
                      ]}
                    />
                    <Select
                      label="Preferred Vehicle Type"
                      value={preferredTransportType}
                      onChange={(e) => setPreferredTransportType(e.target.value)}
                      options={[
                        { value: 'ANY', label: 'Any Compatible Vehicle' },
                        { value: 'PICKUP_TRUCK', label: 'Pickup Truck (Bolero Maxi / Dost)' },
                        { value: 'MINI_TRUCK', label: 'Mini Truck (Tata 407 / Eicher)' },
                        { value: 'TRACTOR_TROLLEY', label: 'Tractor Trolley (Short Haul)' },
                        { value: 'REFRIGERATED_VAN', label: 'Refrigerated Cold Chain Van' }
                      ]}
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-navy-800">
                      <input
                        type="checkbox"
                        checked={isPerishable}
                        onChange={(e) => setIsPerishable(e.target.checked)}
                        className="rounded text-forest-primary focus:ring-forest-primary h-4 w-4"
                      />
                      Perishable Produce (Requires Fast Dispatch)
                    </label>
                  </div>

                  {/* Handling Requirements */}
                  <div>
                    <label className="block text-xs font-semibold text-navy-800 mb-2">
                      Cargo Handling Requirements
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'FRAGILE', label: 'Fragile / Delicate' },
                        { id: 'DO_NOT_STACK', label: 'Do Not Stack' },
                        { id: 'KEEP_UPRIGHT', label: 'Keep Upright' },
                        { id: 'VENTILATED_TARPAULIN', label: 'Ventilated Cover' },
                        { id: 'TEMPERATURE_CONTROL', label: 'Cold Storage / Reefer' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleHandlingReq(item.id)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            handlingReqs.includes(item.id)
                              ? 'bg-forest-50 border-forest-500 text-forest-700 font-bold'
                              : 'bg-white border-navy-200 text-navy-600 hover:border-navy-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Origin and Destination */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-forest-primary" />
                    2. Origin Farm & Destination Market
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Pickup Village or Aggregation Hub"
                      required
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                    />
                    <Input
                      label="Pickup District"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Farm / Aggregation Address"
                    required
                    value={originAddress}
                    onChange={(e) => setOriginAddress(e.target.value)}
                  />

                  <div className="border-t border-navy-100 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Destination Mandi / Market Name"
                        required
                        value={destinationMandi}
                        onChange={(e) => setDestinationMandi(e.target.value)}
                      />
                      <Input
                        label="Destination District"
                        required
                        value={destDistrict}
                        onChange={(e) => setDestDistrict(e.target.value)}
                      />
                    </div>
                    <div className="mt-3">
                      <Input
                        label="Destination Address / Shed No."
                        required
                        value={destinationAddress}
                        onChange={(e) => setDestinationAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Schedule and Special Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-forest-primary" />
                    3. Schedule & Special Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Preferred Pickup Date"
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                    />
                    <Input
                      label="Delivery Deadline Date"
                      type="date"
                      required
                      value={deliveryDeadline}
                      onChange={(e) => setDeliveryDeadline(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Special Instructions for Transporter"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Call 1 hour prior to farm arrival, gate on east side"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right 1 col: Live Cost & Route Summary */}
            <div className="space-y-6">
              <Card className="sticky top-20 border-forest-200 bg-forest-50/30">
                <CardHeader className="bg-forest-100/40 pb-3">
                  <CardTitle className="text-sm font-bold text-forest-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-forest-primary" />
                    Freight Consolidation Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-navy-600">
                      <span>Corridor Distance</span>
                      <span className="font-semibold text-navy-900">{estimatedDistKm} km</span>
                    </div>
                    <div className="flex justify-between text-navy-600">
                      <span>Consignment Weight</span>
                      <span className="font-semibold text-navy-900">{weightKg} kg ({weightTons.toFixed(2)} MT)</span>
                    </div>
                    <div className="flex justify-between text-navy-600">
                      <span>Shared Ton-Km Base Rate</span>
                      <span className="font-semibold text-navy-900">₹{baseTonKmRate} / ton-km</span>
                    </div>
                    <div className="border-t border-navy-200 pt-2 flex justify-between font-bold text-sm">
                      <span className="text-navy-900">GramRoute Shared Price</span>
                      <span className="text-forest-primary font-extrabold text-base">₹{estimatedCost}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-forest-200 space-y-1">
                    <div className="text-[11px] font-bold text-navy-500 uppercase tracking-wider">Traditional Solitary Truck</div>
                    <div className="text-xs text-navy-400 line-through">₹{traditionalTruckCost}</div>
                    <div className="text-xs font-bold text-forest-700 flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-forest-primary" />
                      Estimated Savings: ₹{estimatedSavings} (36%)
                    </div>
                  </div>

                  <div className="text-[11px] text-navy-500 space-y-1 bg-navy-50 p-3 rounded-lg border border-navy-100">
                    <div className="font-semibold text-navy-800 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-forest-primary" />
                      Cargo Compatibility Guarantee
                    </div>
                    <p className="leading-relaxed">
                      Our engine automatically prevents consolidation of agricultural food produce with toxic fertilizers or chemical inputs.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Publishing Load...'
                    ) : (
                      <>
                        Publish Shipment
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  {/* Offline Save Draft Action */}
                  <button
                    type="button"
                    onClick={handleSaveOfflineDraft}
                    className="w-full py-2.5 px-3 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{t.shipment.saveDraftOffline}</span>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      )}

      {/* Voice Dictation Assistant Modal */}
      <VoiceShipmentAssistant
        isOpen={voiceAssistantOpen}
        onClose={() => setVoiceAssistantOpen(false)}
        onConfirm={handleVoicePopulate}
      />
    </div>
  );
};
