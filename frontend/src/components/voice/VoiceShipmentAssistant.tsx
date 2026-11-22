import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Volume2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface ExtractedVoiceShipment {
  cargoCategory: string;
  cargoDescription: string;
  weightKg: number;
  pickupAddress: string;
  destinationAddress: string;
  deliveryDate: string;
  perishable: boolean;
  confidenceScore: number;
}

interface VoiceShipmentAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ExtractedVoiceShipment) => void;
}

export const VoiceShipmentAssistant: React.FC<VoiceShipmentAssistantProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t, language, speechLocale } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<ExtractedVoiceShipment | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLocale;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setTranscript(currentTranscript);
            parseDictation(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          // eslint-disable-next-line no-console
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setMicError(t.voiceAssistant.micDenied);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setMicError('Web Speech API is not supported in this browser. You can type or use simulated dictation.');
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, [speechLocale, t.voiceAssistant.micDenied]);

  const toggleListening = () => {
    setMicError(null);
    if (!recognitionRef.current) {
      // Provide an illustrative sample simulation for environments without WebSpeech API
      simulateRuralDictation();
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      setIsListening(false);
    } else {
      setTranscript('');
      setParsedData(null);
      try {
        recognitionRef.current.lang = speechLocale;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        simulateRuralDictation();
      }
    }
  };

  /**
   * Conversational rural language entity extractor for English, Hindi, and Gujarati
   */
  const parseDictation = (text: string) => {
    const lower = text.toLowerCase();
    let category = 'AGRICULTURE';
    let description = 'Farm Fresh Produce';
    let weightKg = 1000;
    let pickup = 'Pimpalgaon Baswant, Nashik';
    let destination = 'Vashi APMC Mandi, Navi Mumbai';
    let deliveryDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    let perishable = true;
    let confidence = 85;

    // Detect Cargo produce
    if (lower.includes('onion') || lower.includes('pyaaz') || lower.includes('pyaj') || lower.includes('ડુંગળી') || lower.includes('કાંદા') || lower.includes('प्याज')) {
      description = 'Fresh Red Onions (नाशिक प्याज)';
      category = 'AGRICULTURE';
      perishable = true;
      confidence += 5;
    } else if (lower.includes('tomato') || lower.includes('tamatar') || lower.includes('ટમેટા') || lower.includes('टमाटर')) {
      description = 'Hybrid Vine Tomatoes';
      category = 'PERISHABLE';
      perishable = true;
      confidence += 5;
    } else if (lower.includes('grape') || lower.includes('angoor') || lower.includes('દ્રાક્ષ') || lower.includes('अंगूर')) {
      description = 'Export Quality Table Grapes';
      category = 'PERISHABLE';
      perishable = true;
      confidence += 5;
    } else if (lower.includes('potato') || lower.includes('aloo') || lower.includes('બટાકા') || lower.includes('आलू')) {
      description = 'Storage Table Potatoes';
      category = 'AGRICULTURE';
      perishable = false;
      confidence += 5;
    } else if (lower.includes('wheat') || lower.includes('gehun') || lower.includes('ઘઉં') || lower.includes('गेहूं')) {
      description = 'Sharbati Wheat Grains';
      category = 'DRY_GOODS';
      perishable = false;
      confidence += 5;
    }

    // Weight extraction (kg, quintal, ton, bori)
    const quintalMatch = lower.match(/(\d+)\s*(quintal|quintel|क्विंटल|ક્વિન્ટલ)/);
    const tonMatch = lower.match(/(\d+)\s*(ton|tonne|टन|ટન)/);
    const kgMatch = lower.match(/(\d+)\s*(kg|kilo|kilogram|किलो|કિલો)/);
    const boriMatch = lower.match(/(\d+)\s*(bori|bag|bora|बोरी|બોરી)/);

    if (quintalMatch) {
      weightKg = parseInt(quintalMatch[1], 10) * 100;
    } else if (tonMatch) {
      weightKg = parseInt(tonMatch[1], 10) * 1000;
    } else if (kgMatch) {
      weightKg = parseInt(kgMatch[1], 10);
    } else if (boriMatch) {
      weightKg = parseInt(boriMatch[1], 10) * 50; // Standard 50kg bags
    }

    // Origin/Pickup location
    const corridorMatch = lower.match(/([a-zA-Z\u0900-\u097F\u0A80-\u0AFF]+)\s+(?:se|थी|from)\s+([a-zA-Z\u0900-\u097F\u0A80-\u0AFF]+)/);
    if (corridorMatch) {
      const p = corridorMatch[1].trim();
      const d = corridorMatch[2].trim();
      pickup = p.charAt(0).toUpperCase() + p.slice(1);
      destination = d.charAt(0).toUpperCase() + d.slice(1);
      confidence += 10;
    }

    if (lower.includes('ashta') || lower.includes('आष्टा') || lower.includes('આષ્ટા')) {
      pickup = 'Ashta Rural Depot, Madhya Pradesh';
      confidence += 5;
    } else if (lower.includes('pimpalgaon') || lower.includes('पिंपलगांव') || lower.includes('પીપળગાવ')) {
      pickup = 'Pimpalgaon Baswant, Nashik, Maharashtra';
      confidence += 5;
    } else if (lower.includes('nashik') || lower.includes('नासिक') || lower.includes('નાસિક')) {
      pickup = 'Nashik Rural Hub, Maharashtra';
      confidence += 5;
    } else if (lower.includes('sangamner') || lower.includes('संगमनेर')) {
      pickup = 'Sangamner Agriculture Depot, Ahmednagar';
      confidence += 5;
    } else if (lower.includes('anand') || lower.includes('આણંદ')) {
      pickup = 'Anand Agro Cluster, Gujarat';
      confidence += 5;
    }

    // Destination
    if (lower.includes('sehore') || lower.includes('सीहोर') || lower.includes('સીહોર')) {
      destination = 'Sehore Krishi Upaj Mandi, Madhya Pradesh';
      confidence += 5;
    } else if (lower.includes('vashi') || lower.includes('वाशी') || lower.includes('વાશી')) {
      destination = 'Vashi APMC Market, Sector 19, Navi Mumbai';
      confidence += 5;
    } else if (lower.includes('pune') || lower.includes('पुणे') || lower.includes('પુણે')) {
      destination = 'Gultekdi APMC Market, Pune';
      confidence += 5;
    } else if (lower.includes('surat') || lower.includes('सूरत') || lower.includes('સુરત')) {
      destination = 'Surat Sardar Market Yard, Gujarat';
      confidence += 5;
    } else if (lower.includes('mumbai') || lower.includes('मुंबई')) {
      destination = 'Kalyan Wholesale APMC Depot, Mumbai MMR';
      confidence += 5;
    }

    // Delivery date
    if (lower.includes('kal') || lower.includes('tomorrow') || lower.includes('કાલે')) {
      const tomorrow = new Date(Date.now() + 86400000);
      deliveryDate = tomorrow.toISOString().split('T')[0];
    } else if (lower.includes('today') || lower.includes('aaj') || lower.includes('આજે')) {
      deliveryDate = new Date().toISOString().split('T')[0];
    }

    setParsedData({
      cargoCategory: category,
      cargoDescription: description,
      weightKg,
      pickupAddress: pickup,
      destinationAddress: destination,
      deliveryDate,
      perishable,
      confidenceScore: Math.min(confidence, 98)
    });
  };

  const simulateRuralDictation = () => {
    setIsListening(true);
    let sample = '';
    if (language === 'hi') {
      sample = 'मेरे पास पिंपलगांव से वाशी नवी मुंबई मंडी के लिए कल सुबह 50 बोरी प्याज है जिसका वजन 2500 किलो है';
    } else if (language === 'gu') {
      sample = 'મારી પાસે પીપળગાવ ગામથી વાશી નવી મુંબઈ મંડી માટે કાલે સવારે ૨૫૦૦ કિલો ડુંગળી છે';
    } else {
      sample = 'I have 50 bags of onions weighing 2500 kg from Pimpalgaon village to Vashi Navi Mumbai mandi tomorrow morning';
    }

    setTimeout(() => {
      setTranscript(sample);
      parseDictation(sample);
      setIsListening(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-neutral-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-forest-900 text-white p-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-700/80 flex items-center justify-center text-forest-200 border border-forest-600">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t.voiceAssistant.title}</h3>
              <p className="text-xs text-forest-200">{t.voiceAssistant.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-forest-300 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Voice Interaction Body */}
        <div className="p-6 space-y-6">
          {/* Microphone Central CTA */}
          <div className="text-center space-y-4">
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all shadow-lg ${
                isListening
                  ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse'
                  : 'bg-forest-primary text-white hover:bg-forest-800 hover:scale-105'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>

            <div>
              <p className="text-sm font-bold text-navy-900">
                {isListening ? t.voiceAssistant.listening : t.voiceAssistant.startListening}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{t.voiceAssistant.tips}</p>
            </div>

            {micError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{micError}</span>
              </div>
            )}

            {/* Text-Based Fallback Input */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5 text-left">
                Type Sentence Fallback (बिना माइक के लिखकर दर्ज करें)
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder='e.g. "Mujhe 500 kilo tamatar Ashta se Sehore bhejne hain"'
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value);
                    if (e.target.value.trim().length > 3) {
                      parseDictation(e.target.value);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded-lg text-navy-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
                <button
                  type="button"
                  onClick={() => parseDictation(transcript)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-forest-primary text-white hover:bg-forest-800"
                >
                  Extract
                </button>
              </div>
            </div>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                {t.voiceAssistant.dictatedText}
              </span>
              <p className="text-sm italic text-navy-800">"{transcript}"</p>
            </div>
          )}

          {/* Parsed Extracted Entities */}
          {parsedData && (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.voiceAssistant.extractedData}</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {t.voiceAssistant.confidenceScore}: {parsedData.confidenceScore}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">{t.voiceAssistant.cargoCategory}:</span>
                  <span className="font-semibold text-navy-900">{parsedData.cargoDescription}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">{t.voiceAssistant.weight}:</span>
                  <span className="font-semibold text-navy-900">{parsedData.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">{t.voiceAssistant.pickupLocation}:</span>
                  <span className="font-semibold text-navy-900 truncate block">{parsedData.pickupAddress}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">{t.voiceAssistant.destination}:</span>
                  <span className="font-semibold text-navy-900 truncate block">{parsedData.destinationAddress}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">{t.voiceAssistant.deliveryDate}:</span>
                  <span className="font-semibold text-navy-900">{parsedData.deliveryDate}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Perishable Cargo:</span>
                  <span className="font-semibold text-navy-900">{parsedData.perishable ? 'Yes (Ventilated)' : 'Standard Dry'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex items-center justify-between">
          <button
            type="button"
            onClick={toggleListening}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 px-3 py-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.voiceAssistant.reRecord}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              disabled={!parsedData}
              onClick={() => {
                if (parsedData) {
                  onConfirm(parsedData);
                  onClose();
                }
              }}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-forest-primary text-white hover:bg-forest-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
            >
              <span>{t.voiceAssistant.confirmAndPopulate}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
