'use client';

import { useState, useEffect, useRef } from 'react';
import { Building2, MapPin, Calendar, IndianRupee, Phone, Mail, User, ChevronLeft, ChevronRight, Download, Check, ArrowRight, HelpCircle, Shield, Star, Clock, Loader2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface MicrositeViewProps {
  slug: string;
  projectName: string;
}

const AMENITY_ICONS: Record<string, string> = {
  'Swimming Pool': '🏊', 'Gymnasium': '🏋️', 'Clubhouse': '🏠', 'Children Play Area': '🧒',
  'Jogging Track': '🏃', 'Landscaped Gardens': '🌳', 'Indoor Games': '🎮', 'Multipurpose Hall': '🏛️',
  'Power Backup': '⚡', 'CCTV Surveillance': '📹', 'Intercom': '📞', 'Lift': '🛗',
  'Car Parking': '🅿️', 'Visitor Parking': '🚗', 'Rain Water Harvesting': '💧',
  'Sewage Treatment Plant': '♻️', 'Fire Fighting System': '🧯', 'Badminton Court': '🏸',
  'Tennis Court': '🎾', 'Basketball Court': '🏀', 'Yoga Room': '🧘', 'Library': '📚',
  'Meditation Zone': '🧘‍♂️', 'Party Lawn': '🎉', 'Pet Park': '🐕', 'Senior Citizen Area': '👴',
  'Amphitheatre': '🎭', 'Co-Working Space': '💻', 'Cycling Track': '🚴', 'Squash Court': '🏓',
  'Table Tennis': '🏓', 'Skating Rink': '⛸️', 'Mini Theatre': '🎬', 'Convenience Store': '🏪',
  'Salon': '💇', 'Creche': '👶', 'Pharmacy': '💊',
};

const ELEVEN_ESTATES_FAQS = [
  {
    question: 'Why should I work with 11 Estates instead of approaching the builder directly?',
    answer: 'Buying a home is one of the most important financial decisions you will make. 11 Estates helps simplify the process by providing expert guidance, market insights, project comparisons and negotiation support throughout your purchase journey. From identifying the right property to evaluating options, securing the best commercial terms and coordinating the transaction, our team works to ensure you make an informed decision with confidence.',
  },
  {
    question: 'Do I have to pay any brokerage or service fees?',
    answer: 'No. 11 Estates does not charge brokerage, advisory fees or hidden service charges to homebuyers. Our objective is to help buyers secure the right property and the best possible commercial terms without any additional cost.',
  },
  {
    question: 'Can 11 Estates help me get a better price?',
    answer: 'Yes. We negotiate directly with developers on behalf of our clients. Beyond pricing, we also help evaluate inventory options, payment plans and other commercial terms to help buyers maximize value from their purchase.',
  },
  {
    question: 'Why should I trust 11 Estates with such an important decision?',
    answer: '11 Estates is backed by over 40 years of experience in the real estate industry. Our team has worked across residential projects, developer relationships and property transactions, helping homebuyers navigate one of the largest financial decisions of their lives with greater confidence.',
  },
  {
    question: 'How is 11 Estates different from a traditional broker?',
    answer: 'Traditional brokers are often focused on selling specific projects. 11 Estates takes a buyer-first approach. We help clients understand their options, compare alternatives, evaluate suitability and negotiate with developers to ensure they make a well-informed purchase decision.',
  },
];

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'US (+1)' },
  { code: '+44', country: 'GB', label: 'UK (+44)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
  { code: '+49', country: 'DE', label: 'Germany (+49)' },
  { code: '+33', country: 'FR', label: 'France (+33)' },
  { code: '+81', country: 'JP', label: 'Japan (+81)' },
  { code: '+86', country: 'CN', label: 'China (+86)' },
  { code: '+966', country: 'SA', label: 'Saudi (+966)' },
  { code: '+974', country: 'QA', label: 'Qatar (+974)' },
  { code: '+968', country: 'OM', label: 'Oman (+968)' },
  { code: '+60', country: 'MY', label: 'Malaysia (+60)' },
  { code: '+64', country: 'NZ', label: 'New Zealand (+64)' },
];

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'connectivity', label: 'Connectivity' },
  { id: 'masterplan', label: 'Master Plan' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'pricing', label: 'Floor Plans' },
  { id: 'builder', label: 'Builder' },
  { id: 'rera', label: 'RERA' },
  { id: 'faq', label: 'FAQ' },
];

export default function MicrositeView({ slug, projectName }: MicrositeViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [heroIndex, setHeroIndex] = useState(0);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', countryCode: '+91' });
  const [phoneError, setPhoneError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFloorPlanTab, setActiveFloorPlanTab] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    fetch(`/api/microsites/public/${slug}`)
      .then((r) => r.json())
      .then((d) => { if (!d?.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = sectionRefs.current[section.id];
        if (el) {
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (scrollTop >= top && scrollTop < bottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' });
    }
  };

  const validatePhone = (phone: string, code: string): boolean => {
    const digits = phone.replace(/[^0-9]/g, '');
    if (code === '+91') {
      return /^[6-9]\d{9}$/.test(digits);
    }
    return digits.length >= 7 && digits.length <= 15;
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      toast.error('Name and phone number are required');
      return;
    }
    if (!validatePhone(formData.phone, formData.countryCode)) {
      if (formData.countryCode === '+91') {
        setPhoneError('Enter a valid 10-digit Indian mobile number');
      } else {
        setPhoneError('Enter a valid phone number');
      }
      return;
    }
    setPhoneError('');
    setSubmitting(true);
    try {
      const fullPhone = `${formData.countryCode} ${formData.phone}`;
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, phone: fullPhone, email: formData.email, micrositeId: data?.id }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success('Thank you! Our advisor will contact you shortly.');
      } else {
        toast.error('Failed to submit. Please try again.');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8a45e]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white/60">Project not found</h1>
        </div>
      </div>
    );
  }

  const heroImages = data?.heroImageUrls ?? [];
  const galleryImages = data?.galleryImageUrls ?? [];
  const pricing = data?.pricingData ?? [];
  const connectivity = data?.connectivityData ?? [];
  const amenities = data?.amenities ?? [];
  const highlights = data?.projectHighlights ?? [];
  const floorPlanUrls = data?.floorPlanUrls ?? [];
  const reraQrCodes = data?.reraQrCodes ?? [];

  const allImages = [...heroImages, ...galleryImages].filter(Boolean);

  // Floor plans from pricing configs (new) + standalone floor plans (legacy)
  const configFloorPlans = pricing.filter((p: any) => p?.floorPlanImageUrl).map((p: any) => ({
    config: p.config,
    url: p.floorPlanImageUrl,
  }));
  const hasConfigFloorPlans = configFloorPlans.length > 0;
  const hasLegacyFloorPlans = floorPlanUrls.length > 0;

  const visibleSections = SECTIONS.filter(s => {
    if (s.id === 'rera') return reraQrCodes.length > 0 && reraQrCodes[0]?.qrImageUrl;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#c8a45e] to-[#a68540] rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-black" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">11 Estates</span>
          </div>
          <a href="tel:+918454989005" className="inline-flex items-center gap-2 group">
            <span className="hidden sm:inline text-sm text-white/40">Call us:</span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20 animate-pulse hover:animate-none">
              <Phone className="w-4 h-4" />
              +91-8454989005
            </span>
          </a>
        </div>
      </header>

      {/* Section Navigation */}
      <nav className="sticky top-[52px] z-40 bg-[#111]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <div className="flex gap-1 py-2">
            {visibleSections.map((s: any) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  activeSection === s.id
                    ? 'bg-[#c8a45e] text-black'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Project Summary */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                    {data?.projectName ?? ''}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-white/60 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-[#c8a45e]" /> {data?.location ?? ''}{data?.city ? `, ${data.city}` : ''}</span>
                    {data?.possessionDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-[#c8a45e]" /> Possession: {data.possessionDate}</span>}
                    {data?.priceRangeMin && (
                      <span className="flex items-center gap-1 font-semibold text-[#c8a45e]">
                        <IndianRupee className="w-4 h-4" />
                        {data.priceRangeMin}{data?.priceRangeMax ? ` - ₹${data.priceRangeMax}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                {data?.builderLogoUrl && (
                  <img src={data.builderLogoUrl} alt={`${data?.builderName ?? ''} logo`} className="w-16 h-16 object-contain rounded-lg bg-white/5 p-1" />
                )}
              </div>
            </div>

            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div className="mb-8">
                <div className="relative rounded-xl overflow-hidden bg-[#141414] aspect-[16/9]">
                  <img
                    src={allImages[heroIndex % allImages.length] ?? ''}
                    alt={`${data?.projectName ?? ''} image`}
                    className="w-full h-full object-cover"
                  />
                  {allImages.length > 1 && (
                    <>
                      <button onClick={() => setHeroIndex((heroIndex - 1 + allImages.length) % allImages.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/80 transition">
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button onClick={() => setHeroIndex((heroIndex + 1) % allImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/80 transition">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_: any, i: number) => (
                          <button key={i} onClick={() => setHeroIndex(i)}
                            className={`w-2 h-2 rounded-full transition ${i === heroIndex % allImages.length ? 'bg-[#c8a45e]' : 'bg-white/30'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">
                    {allImages.slice(0, 6).map((url: string, i: number) => (
                      <button key={i} onClick={() => setHeroIndex(i)}
                        className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                          i === heroIndex % allImages.length ? 'border-[#c8a45e]' : 'border-transparent'
                        }`}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Overview Section */}
            <section ref={(el) => { sectionRefs.current['overview'] = el; }} id="overview" className="mb-10">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#c8a45e] rounded-full" /> Overview
              </h2>
              {data?.projectDescription && (
                <p className="text-white/60 leading-relaxed mb-6 whitespace-pre-line">{data.projectDescription}</p>
              )}
              {/* Project Highlights in Square Boxes */}
              {highlights.length > 0 && highlights[0] && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {highlights.filter(Boolean).map((h: string, i: number) => (
                    <div key={i} className="aspect-square bg-[#141414] border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-[#c8a45e]/30 transition">
                      <div className="w-10 h-10 bg-[#c8a45e]/15 rounded-lg flex items-center justify-center mb-3">
                        <Check className="w-5 h-5 text-[#c8a45e]" />
                      </div>
                      <span className="text-sm text-white/80 font-medium leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Connectivity */}
            {connectivity.length > 0 && connectivity[0]?.place && (
              <section ref={(el) => { sectionRefs.current['connectivity'] = el; }} id="connectivity" className="mb-10">
                <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#c8a45e] rounded-full" /> Connectivity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {connectivity.filter((c: any) => c?.place).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#141414] border border-white/10 rounded-lg hover:border-[#c8a45e]/20 transition">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-[#c8a45e]" />
                        <span className="text-sm font-medium text-white/80">{c?.place ?? ''}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-white/50">{c?.distance ?? ''}</span>
                        {c?.time && <span className="text-xs text-white/30 ml-2">({c.time})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Master Plan */}
            <section ref={(el) => { sectionRefs.current['masterplan'] = el; }} id="masterplan" className="mb-10">
              {data?.masterPlanUrl && (
                <>
                  <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#c8a45e] rounded-full" /> Master Plan
                  </h2>
                  <div className="rounded-xl overflow-hidden bg-[#141414] border border-white/10">
                    <img src={data.masterPlanUrl} alt="Master Plan" className="w-full object-contain max-h-[600px]" />
                  </div>
                </>
              )}
            </section>

            {/* Amenities */}
            {amenities.length > 0 && (
              <section ref={(el) => { sectionRefs.current['amenities'] = el; }} id="amenities" className="mb-10">
                <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#c8a45e] rounded-full" /> Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenities.map((a: string, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 bg-[#141414] border border-white/10 rounded-lg">
                      <span className="text-xl flex-shrink-0">{AMENITY_ICONS[a] ?? '✓'}</span>
                      <span className="text-sm text-white/70">{a}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Floor Plans (Propsoch-style) - Combined pricing + floor plan per config */}
            {pricing.length > 0 && pricing[0]?.config && (
              <section ref={(el) => { sectionRefs.current['pricing'] = el; sectionRefs.current['floorplans'] = el; }} id="pricing" className="mb-10">
                <h2 className="font-display text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#c8a45e] rounded-full" /> Floor Plans
                </h2>
                <p className="text-sm text-white/40 mb-5">
                  {data?.projectName ?? ''} has {pricing.filter((p: any) => p?.config).map((p: any) => p.config).join(', ')}.
                  {pricing.filter((p: any) => p?.config && p?.area).length > 0 &&
                    ` ${pricing.filter((p: any) => p?.config && p?.area).map((p: any) => `${p.config}: ${p.area} sq.ft.`).join('. ')}.`
                  }
                </p>

                {/* Config Tabs */}
                <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
                  {pricing.filter((p: any) => p?.config).map((p: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveFloorPlanTab(i)}
                      className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                        activeFloorPlanTab === i
                          ? 'bg-[#c8a45e]/15 text-[#c8a45e] border-[#c8a45e]'
                          : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {p.config}
                    </button>
                  ))}
                </div>

                {/* Active Config Card - Propsoch style */}
                {(() => {
                  const validPricing = pricing.filter((p: any) => p?.config);
                  const activeConfig = validPricing[activeFloorPlanTab] ?? validPricing[0];
                  if (!activeConfig) return null;
                  const hasFloorPlanImg = !!activeConfig.floorPlanImageUrl;

                  return (
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-6 relative">
                      {/* Nav arrows */}
                      {validPricing.length > 1 && (
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button
                            onClick={() => setActiveFloorPlanTab((activeFloorPlanTab - 1 + validPricing.length) % validPricing.length)}
                            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveFloorPlanTab((activeFloorPlanTab + 1) % validPricing.length)}
                            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className={`flex flex-col ${hasFloorPlanImg ? 'md:flex-row' : ''} gap-6`}>
                        {/* Left: Config details */}
                        <div className={hasFloorPlanImg ? 'md:w-1/2' : 'w-full'}>
                          <div className="mb-4">
                            <span className="text-xl font-bold text-white">{activeConfig.config}</span>
                            {activeConfig.price && (
                              <span className="text-xl font-bold text-[#c8a45e] ml-4">{activeConfig.price}</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {activeConfig.area && (
                              <div>
                                <p className="text-xs text-white/40 mb-1">Area</p>
                                <p className="text-sm font-semibold text-white">{activeConfig.area} sq.ft.</p>
                              </div>
                            )}
                            {activeConfig.price && (
                              <div>
                                <p className="text-xs text-white/40 mb-1">Price</p>
                                <p className="text-sm font-semibold text-[#c8a45e]">{activeConfig.price}</p>
                              </div>
                            )}
                          </div>

                          {/* All configs summary table */}
                          {validPricing.length > 1 && (
                            <div className="mt-6 pt-4 border-t border-white/10">
                              <p className="text-xs text-white/30 mb-3 uppercase tracking-wider">All Configurations</p>
                              <div className="space-y-2">
                                {validPricing.map((p: any, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => setActiveFloorPlanTab(idx)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                                      idx === activeFloorPlanTab
                                        ? 'bg-[#c8a45e]/10 border border-[#c8a45e]/30'
                                        : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                  >
                                    <span className={idx === activeFloorPlanTab ? 'text-[#c8a45e] font-medium' : 'text-white/60'}>{p.config}</span>
                                    <div className="flex items-center gap-3">
                                      {p.area && <span className="text-white/40 text-xs">{p.area} sq.ft.</span>}
                                      {p.price && <span className={idx === activeFloorPlanTab ? 'text-[#c8a45e] font-medium' : 'text-white/60'}>{p.price}</span>}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right: Floor plan image */}
                        {hasFloorPlanImg && (
                          <div className="md:w-1/2 flex items-center justify-center bg-white/5 rounded-lg p-4">
                            <img
                              src={activeConfig.floorPlanImageUrl}
                              alt={`${activeConfig.config} Floor Plan`}
                              className="w-full object-contain max-h-[400px]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </section>
            )}

            {/* Legacy Floor Plans (standalone, no config) */}
            {!hasConfigFloorPlans && hasLegacyFloorPlans && (
              <section ref={(el) => { if (!sectionRefs.current['floorplans']) sectionRefs.current['floorplans'] = el; }} id="floorplans-legacy" className="mb-10">
                <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#c8a45e] rounded-full" /> Floor Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {floorPlanUrls.filter(Boolean).map((url: string, i: number) => (
                    <div key={i} className="rounded-xl overflow-hidden bg-[#141414] border border-white/10 p-4">
                      <img src={url} alt={`Floor Plan ${i + 1}`} className="w-full object-contain max-h-[400px]" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Builder Info */}
            {data?.builderDescription && (
              <section ref={(el) => { sectionRefs.current['builder'] = el; }} id="builder" className="mb-10">
                <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#c8a45e] rounded-full" /> About {data?.builderName ?? 'Builder'}
                </h2>
                <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {data?.builderLogoUrl && (
                      <img src={data.builderLogoUrl} alt="" className="w-14 h-14 object-contain rounded-lg bg-white/5 p-1" />
                    )}
                    <div>
                      <h3 className="font-semibold text-white text-lg">{data?.builderName ?? ''}</h3>
                      <div className="flex gap-4 mt-1 text-sm text-white/40">
                        {data?.builderExperience && <span>{data.builderExperience} Experience</span>}
                        {data?.builderProjects && <span>{data.builderProjects} Projects</span>}
                      </div>
                    </div>
                  </div>
                  <p className="text-white/60 leading-relaxed whitespace-pre-line">{data.builderDescription}</p>
                </div>
              </section>
            )}

            {/* RERA QR Codes - Styled like Rustomjee */}
            {reraQrCodes.length > 0 && reraQrCodes[0]?.qrImageUrl && (
              <section ref={(el) => { sectionRefs.current['rera'] = el; }} id="rera" className="mb-10">
                <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#c8a45e] rounded-full" /> RERA Compliance
                </h2>
                <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
                  <div className={`grid gap-6 ${reraQrCodes.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {reraQrCodes.filter((r: any) => r?.qrImageUrl).map((r: any, i: number) => (
                      <div key={i} className="flex items-start gap-5">
                        {/* QR Code Image */}
                        <div className="w-28 h-28 flex-shrink-0 bg-white rounded-lg p-2">
                          <img src={r.qrImageUrl} alt={`RERA QR - ${r?.towerName ?? ''}`} className="w-full h-full object-contain" />
                        </div>
                        {/* RERA Details */}
                        <div className="flex-1">
                          {r?.towerName && (
                            <p className="text-base font-semibold text-white mb-1">{r.towerName}</p>
                          )}
                          {r?.reraNumber && (
                            <p className="text-sm font-mono text-[#c8a45e] mb-2">{r.reraNumber}</p>
                          )}
                          <p className="text-xs text-white/40 leading-relaxed">
                            MahaRERA Registration Number{r?.reraNumber ? `: ${r.reraNumber}` : ''}.
                            Available on the website <span className="text-[#c8a45e]">maharera.mahaonline.gov.in</span>
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-white/30">• This project has been registered under MahaRERA</p>
                            <p className="text-xs text-white/30">• Disclaimer: This is not the official website of the developer</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* General RERA disclaimer */}
                  <div className="mt-5 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/25 leading-relaxed">
                      The content is for information purposes only and does not constitute an offer to avail of any service. Prices mentioned are subject to change without notice. The images are for illustration purposes only. Please read all scheme related documents carefully before investing. 11 Estates acts solely as a real estate advisory platform and not as a developer.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* FAQ */}
            <section ref={(el) => { sectionRefs.current['faq'] = el; }} id="faq" className="mb-10">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#c8a45e] rounded-full" /> Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {ELEVEN_ESTATES_FAQS.map((f: any, i: number) => (
                  <FaqItem key={i} question={f.question} answer={f.answer} />
                ))}
              </div>
            </section>

            {/* Brochure Download */}
            {data?.brochureUrl && (
              <div className="mb-10 p-6 bg-[#c8a45e]/10 border border-[#c8a45e]/20 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">Download Brochure</h3>
                  <p className="text-sm text-white/40">Get the detailed project brochure</p>
                </div>
                <a href={data.brochureUrl} download className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c8a45e] text-black rounded-lg text-sm font-semibold hover:bg-[#d4b06a] transition">
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              </div>
            )}
          </div>

          {/* Sticky Inquiry Form */}
          <div className="lg:w-[350px] flex-shrink-0">
            <div className="lg:sticky lg:top-[120px]">
              <div className="bg-[#141414] rounded-xl border border-white/10 p-6">
                <h3 className="font-display text-lg font-bold text-white mb-1">Work With 11 Estates</h3>
                <p className="text-sm text-white/40 mb-4">You pay nothing. We represent your interests.</p>

                <div className="space-y-2 mb-5">
                  {[
                    'No Brokerage, No Service Fees',
                    'Best negotiated price',
                    'Expert Guidance from Search to Purchase',
                  ].map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[#c8a45e] flex-shrink-0" />
                      <span className="text-white/70">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm font-medium text-white mb-2">Speak with an advisor before you commit</p>
                  <a href="tel:+918454989005" className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition group">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <span className="text-base font-bold text-emerald-400 group-hover:text-emerald-300">+91-8454989005</span>
                  </a>

                  {submitted ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="font-semibold text-white">Thank you!</p>
                      <p className="text-sm text-white/40">Our advisor will contact you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="space-y-3">
                      <div>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#c8a45e]/50 focus:border-[#c8a45e]/50 outline-none"
                            placeholder="Name *" required />
                        </div>
                      </div>
                      <div>
                        <div className="flex gap-1.5">
                          <select
                            value={formData.countryCode}
                            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                            className="w-[90px] px-2 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-[#c8a45e]/50 focus:border-[#c8a45e]/50 outline-none flex-shrink-0"
                          >
                            {COUNTRY_CODES.map(cc => (
                              <option key={cc.code} value={cc.code}>{cc.code}</option>
                            ))}
                          </select>
                          <div className="relative flex-1">
                            <input type="tel" value={formData.phone}
                              onChange={(e) => {
                                setFormData({ ...formData, phone: e.target.value });
                                setPhoneError('');
                              }}
                              className={`w-full px-3 py-2.5 bg-[#1a1a1a] border rounded-lg text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#c8a45e]/50 focus:border-[#c8a45e]/50 outline-none ${
                                phoneError ? 'border-red-400/50' : 'border-white/10'
                              }`}
                              placeholder="Mobile Number *" required />
                          </div>
                        </div>
                        {phoneError && <p className="text-xs text-red-400 mt-1">{phoneError}</p>}
                      </div>
                      <div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#c8a45e]/50 focus:border-[#c8a45e]/50 outline-none"
                            placeholder="Email (optional)" />
                        </div>
                      </div>
                      <button type="submit" disabled={submitting}
                        className="w-full py-3 bg-[#c8a45e] text-black rounded-lg font-semibold hover:bg-[#d4b06a] transition disabled:opacity-50 flex items-center justify-center gap-2">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        {submitting ? 'Submitting...' : 'Get Expert Advice'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#111] border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#c8a45e]/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#c8a45e]" />
              </div>
              <span className="font-display font-bold text-white">11 Estates</span>
            </div>
            <p className="text-sm text-white/30">Your trusted real estate advisory partner</p>
          </div>
          <p className="text-xs text-white/20 mt-4">Disclaimer: The content is for information purposes only. This is not an official site of the builder. This is a private initiative by 11 Estates.</p>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition">
        <span className="text-sm font-medium text-white pr-4">{question}</span>
        <ChevronDown className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-white/50 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
