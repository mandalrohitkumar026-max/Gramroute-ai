import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItem, setOpenItem] = useState<number | null>(0);

  const faqItems = [
    {
      category: 'Pricing',
      q: 'How does the ton-km price comparison work against traditional spot trucks?',
      a: 'Traditional transporters charge fixed full-truck hiring fees (e.g. ₹4,500 for a Bolero pickup from Dindori to Vashi APMC) regardless of whether you have 10 quintals or 20 quintals. GramRoute AI breaks the journey down by ton-kilometers and shares the base haulage cost across all matched shippers. For 12 quintals, you pay only around ₹2,950, pocketing ₹1,550 in pure profit.'
    },
    {
      category: 'Farmers',
      q: 'What happens if my produce is perishable and requires urgent delivery?',
      a: 'When posting a shipment, mark the perishability tier as "HIGHLY_PERISHABLE". The matching algorithm will restrict matches to direct corridors, prioritize refrigerated van allocation if available, and lock a tight 4-to-6 hour transit window before APMC mandi auctions begin.'
    },
    {
      category: 'Transporters',
      q: 'How do I get paid, and how quickly are funds settled into my bank account?',
      a: 'The shipper pays into platform escrow at the time of booking. When you arrive at the delivery mandi and the consignee enters their 4-digit Delivery OTP, the escrow immediately releases the full freight amount into your linked UPI or IMPS bank account on the same day.'
    },
    {
      category: 'Technology',
      q: 'Does GramRoute AI work in rural areas with poor 2G/3G mobile connectivity?',
      a: 'Yes! The GramRoute mobile web application uses aggressive local storage caching. Drivers can record pickup OTPs, view waypoint directions, and log arrival events offline; coordinates are queued and synchronized automatically once network coverage is restored.'
    },
    {
      category: 'Safety',
      q: 'What happens if cargo is damaged during transport?',
      a: 'GramRoute AI features a formal Dispute Resolution procedure. If produce is damaged due to negligent driving or rain exposure, the consignee logs a claim before OTP release. The admin team arbitrates with photographic evidence, holding the escrow payment until resolution.'
    }
  ];

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-forest-700 uppercase tracking-widest block">
          Knowledge Base & Help Center
        </span>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-navy-600 leading-relaxed">
          Everything you need to know about rural produce aggregation, empty backhauls, and ton-km billing.
        </p>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions (e.g. ton-km, perishability, payout, OTP)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:bg-white text-navy-900"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'Pricing', 'Farmers', 'Transporters', 'Technology', 'Safety'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-forest-primary text-white shadow-xs'
                  : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => (
          <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <button
              onClick={() => setOpenItem(openItem === idx ? null : idx)}
              className="w-full p-5 text-left flex justify-between items-center font-bold text-sm text-navy-900 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {faq.category}
                </span>
                <span>{faq.q}</span>
              </div>
              {openItem === idx ? (
                <ChevronUp className="w-4 h-4 text-forest-primary shrink-0 ml-2" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              )}
            </button>
            {openItem === idx && (
              <div className="px-5 pb-5 text-xs text-navy-600 leading-relaxed border-t border-slate-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
