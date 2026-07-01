'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Building2, MapPin, Calendar, IndianRupee, Phone, Mail, User, ChevronLeft, ChevronRight, 
  Download, Check, ArrowRight, HelpCircle, Shield, Star, Clock, Loader2, ChevronDown,
  Waves, Dumbbell, TreePine, Zap, Car, Eye, ShoppingBag, Gamepad2, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface MicrositeViewProps {
  slug: string;
  projectName: string;
}

function getHighlightIcon(text: string) {
  const t = text.toLowerCase();
  if (t.includes('pool') || t.includes('swim') || t.includes('water')) return <Waves className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('gym') || t.includes('fitness') || t.includes('health') || t.includes('workout') || t.includes('sport')) return <Dumbbell className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('park') || t.includes('garden') || t.includes('lawn') || t.includes('green') || t.includes('landscape') || t.includes('tree') || t.includes('flora')) return <TreePine className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('security') || t.includes('cctv') || t.includes('safe') || t.includes('guard') || t.includes('shield')) return <Shield className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('power') || t.includes('backup') || t.includes('electricity') || t.includes('zap') || t.includes('generator')) return <Zap className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('car') || t.includes('parking') || t.includes('garage') || t.includes('vehicle')) return <Car className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('view') || t.includes('deck') || t.includes('terrace') || t.includes('balcony') || t.includes('skyline') || t.includes('eye')) return <Eye className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('shop') || t.includes('retail') || t.includes('store') || t.includes('mall') || t.includes('mart')) return <ShoppingBag className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('kid') || t.includes('play') || t.includes('child') || t.includes('game') || t.includes('sport') || t.includes('recreation')) return <Gamepad2 className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('club') || t.includes('lounge') || t.includes('hall') || t.includes('house') || t.includes('community')) return <Building2 className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('location') || t.includes('connect') || t.includes('transit') || t.includes('hub') || t.includes('road') || t.includes('metro') || t.includes('highway') || t.includes('station')) return <MapPin className="w-5 h-5 text-[#f59e0b]" />;
  if (t.includes('luxury') || t.includes('premium') || t.includes('grand') || t.includes('exquisite') || t.includes('star') || t.includes('quality') || t.includes('height') || t.includes('villa') || t.includes('exclusive')) return <Sparkles className="w-5 h-5 text-[#f59e0b]" />;
  return <Check className="w-5 h-5 text-[#f59e0b]" />;
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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
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
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="w-8 h-8 animate-spin text-[#f59e0b]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-[#a3a3a3]/20 mx-auto mb-4" />
          <h1 className="text-xl font-serif text-[#a3a3a3]/60">Project not found</h1>
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
    if (s.id === 'builder') {
      const hasBuilder = !!data?.builderDescription;
      const hasRera = reraQrCodes.length > 0 && reraQrCodes[0]?.qrImageUrl;
      return hasBuilder || hasRera;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#121212] font-sans antialiased text-[#a3a3a3]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-[#4a4a4a]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#f59e0b] to-[#b47b0e] rounded flex items-center justify-center">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-white">11 Estates</span>
          </div>
          <a href="tel:+918454989005" className="inline-flex items-center gap-2 group">
            <span className="hidden sm:inline font-mono text-[10px] tracking-wider text-[#a3a3a3]/50">SPEAK TO AN ADVISOR:</span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-[#f59e0b] text-black rounded text-xs font-mono font-bold tracking-wider hover:opacity-90 transition-all shadow-lg shadow-amber-500/10">
              <Phone className="w-3.5 h-3.5" />
              +91-8454989005
            </span>
          </a>
        </div>
      </header>

      {/* Section Navigation */}
      <nav className="sticky top-[69px] z-40 bg-[#1a1a1a]/95 backdrop-blur-md border-b border-[#4a4a4a]/10">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 py-3">
            {visibleSections.map((s: any) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`px-4 py-1.5 rounded text-xs font-mono tracking-widest uppercase transition-all duration-300 ${
                  activeSection === s.id
                    ? 'bg-[#f59e0b] text-black font-semibold'
                    : 'text-[#a3a3a3]/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-16">
            {/* Project Summary */}
            <div className="border-b border-[#4a4a4a]/10 pb-8">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                    <span>EXCLUSIVELY MARKETED BY 11 ESTATES</span>
                    <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                  </div>
                  <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight text-white leading-tight">
                    {data?.projectName ?? ''}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-light text-[#a3a3a3]/70">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#f59e0b]" /> {data?.location ?? ''}{data?.city ? `, ${data.city}` : ''}</span>
                    {data?.possessionDate && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#f59e0b]" /> Possession: {data.possessionDate}</span>}
                    {data?.priceRangeMin && (
                      <span className="flex items-center gap-1 font-semibold text-[#f59e0b]">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {data.priceRangeMin}{data?.priceRangeMax ? ` - ₹${data.priceRangeMax}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                {data?.builderLogoUrl && (
                  <img src={data.builderLogoUrl} alt={`${data?.builderName ?? ''} logo`} className="w-20 h-20 object-contain rounded bg-[#1a1a1a] border border-[#4a4a4a]/15 p-2 flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div className="space-y-3">
                <div className="relative rounded overflow-hidden bg-[#1a1a1a] aspect-[16/9] border border-[#4a4a4a]/10">
                  <img
                    src={allImages[heroIndex % allImages.length] ?? ''}
                    alt={`${data?.projectName ?? ''} image`}
                    className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition-opacity duration-300"
                    onClick={() => setLightboxImage(allImages[heroIndex % allImages.length])}
                  />
                  {allImages.length > 1 && (
                    <>
                      <button onClick={() => setHeroIndex((heroIndex - 1 + allImages.length) % allImages.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#121212]/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-black transition border border-white/10">
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button onClick={() => setHeroIndex((heroIndex + 1) % allImages.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#121212]/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-black transition border border-white/10">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {allImages.map((_: any, i: number) => (
                          <button key={i} onClick={() => setHeroIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === heroIndex % allImages.length ? 'bg-[#f59e0b] w-4' : 'bg-white/30'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                    {allImages.map((url: string, i: number) => (
                      <button key={i} onClick={() => setHeroIndex(i)}
                        className={`w-24 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
                          i === heroIndex % allImages.length ? 'border-[#f59e0b] opacity-100 scale-[0.98]' : 'border-transparent opacity-50 hover:opacity-80'
                        }`}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Overview Section */}
            <section ref={(el) => { sectionRefs.current['overview'] = el; }} id="overview" className="space-y-6 pt-4">
              <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                <span>PROJECT INTRO & HIGHLIGHTS</span>
                <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
              </div>
              <h2 className="text-3xl font-serif text-white tracking-tight leading-none">
                Exclusive Overview <br />
                <span className="italic block text-[#a3a3a3]/80 mt-1">and Highlights</span>
              </h2>
              {data?.projectDescription && (
                <p className="text-[#a3a3a3]/85 text-sm font-light leading-relaxed max-w-3xl whitespace-pre-line">
                  {data.projectDescription}
                </p>
              )}
              
              {/* Highlights using connectivity style rows */}
              {highlights.length > 0 && highlights[0] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-[#4a4a4a]/10 max-w-3xl">
                  {highlights.filter(Boolean).map((h: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4.5 bg-[#1a1a1a] border border-[#4a4a4a]/10 rounded hover:border-[#f59e0b]/20 transition-all duration-300 group">
                      <span className="font-serif italic text-base md:text-lg text-[#f59e0b]/60 group-hover:text-[#f59e0b] transition-colors duration-300 w-8 flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-medium text-white group-hover:text-[#f59e0b] transition-colors duration-300 leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Connectivity */}
            {connectivity.length > 0 && connectivity[0]?.place && (
              <section ref={(el) => { sectionRefs.current['connectivity'] = el; }} id="connectivity" className="space-y-6 pt-4">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>LOCATION ADVANTAGE</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-3xl font-serif text-white tracking-tight leading-none">
                  Seamless Connectivity <br />
                  <span className="italic block text-[#a3a3a3]/80 mt-1">& Transit Hubs</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                  {connectivity.filter((c: any) => c?.place).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#4a4a4a]/10 rounded hover:border-[#f59e0b]/20 transition-all duration-300 group">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-[#f59e0b]/60 group-hover:text-[#f59e0b] transition-colors duration-300" />
                        <span className="text-sm font-medium text-white group-hover:text-[#f59e0b] transition-colors duration-300">{c?.place ?? ''}</span>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className="text-white/80">{c?.distance ?? ''}</span>
                        {c?.time && <span className="text-[#f59e0b] ml-2">({c.time})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Master Plan */}
            <section ref={(el) => { sectionRefs.current['masterplan'] = el; }} id="masterplan" className="space-y-6 pt-4">
              {data?.masterPlanUrl && (
                <>
                  <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                    <span>DEVELOPMENT BLUEPRINT</span>
                    <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                  </div>
                  <h2 className="text-3xl font-serif text-white tracking-tight leading-none">
                    Project Master Plan <br />
                    <span className="italic block text-[#a3a3a3]/80 mt-1">& Layout</span>
                  </h2>
                  <div className="rounded overflow-hidden bg-[#1a1a1a] border border-[#4a4a4a]/10 p-4 max-w-3xl">
                    <img src={data.masterPlanUrl} alt="Master Plan" className="w-full object-contain max-h-[500px] rounded cursor-zoom-in hover:opacity-95 transition-opacity duration-300" onClick={() => setLightboxImage(data.masterPlanUrl)} />
                  </div>
                </>
              )}
            </section>

            {/* Amenities */}
            {amenities.length > 0 && (
              <section ref={(el) => { sectionRefs.current['amenities'] = el; }} id="amenities" className="space-y-6 pt-4">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>LUXURY AMENITIES</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-3xl font-serif text-white tracking-tight leading-none">
                  Curated Lifestyle <br />
                  <span className="italic block text-[#a3a3a3]/80 mt-1">& Conveniences</span>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl">
                  {amenities.map((a: string, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 p-3.5 bg-[#1a1a1a] border border-[#4a4a4a]/10 rounded hover:border-[#f59e0b]/20 transition-all duration-300">
                      <span className="text-lg flex-shrink-0">{AMENITY_ICONS[a] ?? '✓'}</span>
                      <span className="text-xs font-mono uppercase tracking-wider text-white/80">{a}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Floor Plans */}
            {pricing.length > 0 && pricing[0]?.config && (
              <section ref={(el) => { sectionRefs.current['pricing'] = el; }} id="pricing" className="space-y-6 pt-4">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>PRICING & CONFIGURATIONS</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-3xl font-serif text-white tracking-tight leading-none">
                  Architectural Floor Plans <br />
                  <span className="italic block text-[#a3a3a3]/80 mt-1">& Unit Sizes</span>
                </h2>
                <p className="text-xs text-[#a3a3a3]/60 max-w-2xl font-light leading-relaxed">
                  {data?.projectName ?? ''} offers configurations including {pricing.filter((p: any) => p?.config).map((p: any) => p.config).join(', ')}. Details are curated below.
                </p>

                {/* Config Tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {pricing.filter((p: any) => p?.config).map((p: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveFloorPlanTab(i)}
                      className={`px-5 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all duration-300 border ${
                        activeFloorPlanTab === i
                          ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]'
                          : 'bg-white/5 text-[#a3a3a3]/60 border-transparent hover:border-[#4a4a4a]/30'
                      }`}
                    >
                      {p.config}
                    </button>
                  ))}
                </div>

                {/* Active Config Card */}
                {(() => {
                  const validPricing = pricing.filter((p: any) => p?.config);
                  const activeConfig = validPricing[activeFloorPlanTab] ?? validPricing[0];
                  if (!activeConfig) return null;
                  const hasFloorPlanImg = !!activeConfig.floorPlanImageUrl;

                  return (
                    <div className="bg-[#1a1a1a] border border-[#4a4a4a]/10 rounded p-6 relative max-w-3xl">
                      {validPricing.length > 1 && (
                        <div className="absolute top-4 right-4 flex gap-1.5">
                          <button
                            onClick={() => setActiveFloorPlanTab((activeFloorPlanTab - 1 + validPricing.length) % validPricing.length)}
                            className="w-7 h-7 rounded border border-[#4a4a4a]/20 flex items-center justify-center text-[#a3a3a3]/40 hover:text-white hover:border-[#4a4a4a]/55 transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveFloorPlanTab((activeFloorPlanTab + 1) % validPricing.length)}
                            className="w-7 h-7 rounded border border-[#4a4a4a]/20 flex items-center justify-center text-[#a3a3a3]/40 hover:text-white hover:border-[#4a4a4a]/55 transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className={`flex flex-col ${hasFloorPlanImg ? 'md:flex-row' : ''} gap-6`}>
                        <div className={hasFloorPlanImg ? 'md:w-1/2 space-y-4' : 'w-full space-y-4'}>
                          <div>
                            <span className="text-xl font-serif text-white">{activeConfig.config}</span>
                            {activeConfig.price && (
                              <span className="text-xl font-serif text-[#f59e0b] ml-4">{activeConfig.price}</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-[#4a4a4a]/10 pt-4">
                            {activeConfig.area && (
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-[#a3a3a3]/40 mb-0.5">SBA / Area</p>
                                <p className="text-sm font-semibold text-white">{activeConfig.area} sq.ft.</p>
                              </div>
                            )}
                            {(activeConfig.customFields ?? []).filter((cf: any) => cf.key && cf.value).map((cf: any, idx: number) => (
                              <div key={idx}>
                                <p className="text-[10px] uppercase tracking-wider text-[#a3a3a3]/40 mb-0.5">{cf.key}</p>
                                <p className="text-sm font-semibold text-white">{cf.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {hasFloorPlanImg && (
                          <div className="md:w-1/2 flex items-center justify-center bg-black/20 rounded p-4 border border-[#4a4a4a]/10">
                            <img
                              src={activeConfig.floorPlanImageUrl}
                              alt={`${activeConfig.config} Floor Plan`}
                              className="w-full object-contain max-h-[300px] cursor-zoom-in hover:opacity-95 transition-opacity duration-300"
                              onClick={() => setLightboxImage(activeConfig.floorPlanImageUrl)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </section>
            )}

            {/* Legacy Floor Plans */}
            {!hasConfigFloorPlans && hasLegacyFloorPlans && (
              <section id="floorplans-legacy" className="space-y-6 pt-4">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>LAYOUT SCHEMATICS</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-3xl font-serif text-white tracking-tight leading-none">
                  Detailed Floor Plans <br />
                  <span className="italic block text-[#a3a3a3]/80 mt-1">& Blueprints</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                  {floorPlanUrls.filter(Boolean).map((url: string, i: number) => (
                    <div key={i} className="rounded overflow-hidden bg-[#1a1a1a] border border-[#4a4a4a]/10 p-4">
                      <img src={url} alt={`Floor Plan ${i + 1}`} className="w-full object-contain max-h-[350px] rounded cursor-zoom-in hover:opacity-95 transition-opacity duration-300" onClick={() => setLightboxImage(url)} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Builder & RERA Info */}
            {(data?.builderDescription || (reraQrCodes.length > 0 && reraQrCodes[0]?.qrImageUrl)) && (
              <section ref={(el) => { sectionRefs.current['builder'] = el; }} id="builder" className="space-y-6 pt-4">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>DEVELOPER PROFILE</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-3xl font-serif text-white tracking-tight leading-none">
                  Developer Profile <br />
                  <span className="italic block text-[#a3a3a3]/80 mt-1">About Builder</span>
                </h2>
                
                <div className="bg-[#1a1a1a] border border-[#4a4a4a]/10 rounded p-6 max-w-3xl space-y-6">
                  {data?.builderDescription && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 pb-4 border-b border-[#4a4a4a]/10">
                        {data?.builderLogoUrl && (
                          <img src={data.builderLogoUrl} alt="" className="w-16 h-16 object-contain rounded bg-[#121212] border border-[#4a4a4a]/10 p-1 flex-shrink-0 cursor-zoom-in hover:opacity-90 transition-opacity duration-300" onClick={() => setLightboxImage(data.builderLogoUrl)} />
                        )}
                        <div className="space-y-1">
                          <h3 className="font-serif text-xl text-white font-normal">{data?.builderName ?? ''}</h3>
                          
                          {/* High-End Statistic Grid */}
                          <div className="flex gap-6 mt-2">
                            {data?.builderExperience && (
                              <div className="flex flex-col">
                                <span className="text-xs font-serif text-white">{data.builderExperience}</span>
                                <span className="text-[8px] uppercase tracking-widest text-[#f59e0b] font-mono">EXPERIENCE</span>
                              </div>
                            )}
                            {data?.builderProjects && (
                              <div className="flex flex-col">
                                <span className="text-xs font-serif text-white">{data.builderProjects}</span>
                                <span className="text-[8px] uppercase tracking-widest text-[#f59e0b] font-mono">PROJECTS DELIVERED</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-[#a3a3a3]/80 text-sm font-light leading-relaxed whitespace-pre-line">
                        {data.builderDescription}
                      </p>
                    </div>
                  )}

                  {/* RERA QR Codes inside same block */}
                  {reraQrCodes.length > 0 && reraQrCodes[0]?.qrImageUrl && (
                    <div className={`pt-6 ${data?.builderDescription ? 'border-t border-[#4a4a4a]/10' : ''} space-y-4`}>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-[#f59e0b] mb-1">RERA COMPLIANCE STATUS</h4>
                      <div className={`grid gap-6 ${reraQrCodes.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                        {reraQrCodes.filter((r: any) => r?.qrImageUrl).map((r: any, i: number) => (
                          <div key={i} className="flex items-start gap-4">
                            <div className="w-24 h-24 flex-shrink-0 bg-white rounded p-1 border border-[#4a4a4a]/15">
                              <img src={r.qrImageUrl} alt={`RERA QR - ${r?.towerName ?? ''}`} className="w-full h-full object-contain cursor-zoom-in hover:opacity-95 transition-opacity duration-300" onClick={() => setLightboxImage(r.qrImageUrl)} />
                            </div>
                            <div className="space-y-1">
                              {r?.towerName && (
                                <p className="text-sm font-serif text-white font-medium">{r.towerName}</p>
                              )}
                              {r?.reraNumber && (
                                <p className="text-xs font-mono text-[#f59e0b] font-semibold">{r.reraNumber}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legal info / disclaimer */}
                  <div className={`pt-4 ${!(reraQrCodes.length > 0 && reraQrCodes[0]?.qrImageUrl) && data?.builderDescription ? 'pt-6 border-t border-[#4a4a4a]/10' : 'border-t border-[#4a4a4a]/5'}`}>
                    <p className="text-[10px] text-[#a3a3a3]/40 leading-relaxed font-light whitespace-pre-line">
                      {data?.legalInfo?.trim() || "The content is for information purposes only and does not constitute an offer to avail of any service. Prices mentioned are subject to change without notice. The images are for illustration purposes only. 11 Estates acts solely as a real estate advisory platform and not as a developer."}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* FAQ */}
            <section ref={(el) => { sectionRefs.current['faq'] = el; }} id="faq" className="space-y-6 pt-4">
              <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                <span>ADVISORY CLARIFICATIONS</span>
                <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
              </div>
              <h2 className="text-3xl font-serif text-white tracking-tight leading-none">
                Frequently Asked <br />
                <span className="italic block text-[#a3a3a3]/80 mt-1">Questions</span>
              </h2>
              
              <div className="space-y-2.5 max-w-3xl">
                {ELEVEN_ESTATES_FAQS.map((f: any, i: number) => (
                  <FaqItem key={i} question={f.question} answer={f.answer} />
                ))}
              </div>
            </section>

            {/* Brochure Download */}
            {data?.brochureUrl && (
              <div className="max-w-3xl p-6 bg-[#1a1a1a] border border-[#4a4a4a]/10 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-white font-normal">Project Brochure</h3>
                  <p className="text-xs text-[#a3a3a3]/50">Download the comprehensive PDF for project highlights, specifications, and details.</p>
                </div>
                <a href={data.brochureUrl} download className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b] hover:text-white transition-colors flex items-center gap-2 group border-b border-[#f59e0b]/30 pb-0.5 mt-2 sm:mt-0">
                  <span>Download Document</span>
                  <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-300" />
                </a>
              </div>
            )}
          </div>

          {/* Sticky Inquiry Form */}
          <div className="lg:w-[360px] flex-shrink-0">
            <div className="lg:sticky lg:top-[120px]">
              <div className="bg-[#1a1a1a] rounded border border-[#4a4a4a]/10 p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-3 font-mono text-[8px] tracking-[0.2em] text-[#f59e0b] uppercase mb-2">
                    <span>PORTFOLIO ADVISORY</span>
                  </div>
                  <h3 className="font-serif text-2xl text-white font-normal leading-tight">Work With 11 Estates</h3>
                  <p className="text-xs text-[#a3a3a3]/50 mt-1">Zero fees. Buyer-aligned advisory backed by 40+ years experience.</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#4a4a4a]/10">
                  {[
                    'Zero Brokerage, Complete Transparency',
                    'Best Negotiated Pricing Evaluated',
                    'Expert Representation from Search to Signing',
                  ].map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-[#a3a3a3]/80">
                      <Check className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#4a4a4a]/10 pt-4 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono tracking-widest uppercase text-[#a3a3a3]/40">INTEGRATION DIRECT LINE</p>
                    <a href="tel:+918454989005" className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded hover:bg-emerald-500/10 transition group">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-mono font-semibold text-emerald-400 group-hover:text-emerald-300">+91-8454989005</span>
                    </a>
                  </div>

                  {submitted ? (
                    <div className="text-center py-6 bg-emerald-500/5 rounded border border-emerald-500/10">
                      <div className="w-10 h-10 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </div>
                      <p className="font-serif text-sm text-white">Advisory Brief Requested</p>
                      <p className="text-[10px] text-[#a3a3a3]/50 mt-0.5">We will reach out to you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="space-y-3 pt-2">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]/30" />
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#4a4a4a]/15 rounded text-xs text-white placeholder:text-white/20 focus:ring-1 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b]/50 outline-none transition"
                          placeholder="Name *" required />
                      </div>
                      
                      <div className="flex gap-1.5">
                        <select
                          value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                          className="w-[130px] px-2 py-2.5 bg-[#121212] border border-[#4a4a4a]/15 rounded text-xs text-white focus:ring-1 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b]/50 outline-none flex-shrink-0 transition"
                        >
                          {COUNTRY_CODES.map(cc => (
                            <option key={cc.code} value={cc.code}>{cc.label}</option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <input type="tel" value={formData.phone}
                            onChange={(e) => {
                              setFormData({ ...formData, phone: e.target.value });
                              setPhoneError('');
                            }}
                            className={`w-full px-3 py-2.5 bg-[#121212] border rounded text-xs text-white placeholder:text-white/20 focus:ring-1 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b]/50 outline-none transition ${
                              phoneError ? 'border-red-400/50' : 'border-[#4a4a4a]/15'
                            }`}
                            placeholder="Mobile Number *" required />
                        </div>
                      </div>
                      {phoneError && <p className="text-[10px] text-red-400 mt-1 font-mono">{phoneError}</p>}
                      
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]/30" />
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#4a4a4a]/15 rounded text-xs text-white placeholder:text-white/20 focus:ring-1 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b]/50 outline-none transition"
                          placeholder="Email (optional)" />
                      </div>
                      
                      <button type="submit" disabled={submitting}
                        className="w-full py-3 bg-[#f59e0b] hover:bg-[#d4890a] text-black font-semibold rounded text-xs tracking-wider uppercase transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        {submitting ? 'Connecting...' : 'Request Advisory Brief'}
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
      <footer className="bg-[#1a1a1a] border-t border-[#4a4a4a]/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#4a4a4a]/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f59e0b]/10 rounded flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <span className="font-serif text-lg font-bold text-white">11 Estates</span>
            </div>
            <p className="text-xs font-mono tracking-widest text-[#a3a3a3]/45 uppercase">YOUR TRUSTED REAL ESTATE ADVISORY PARTNER</p>
          </div>
          <p className="text-[10px] text-[#a3a3a3]/30 leading-relaxed whitespace-pre-line">
            {data?.legalInfo?.trim() || "Disclaimer: The content provided on this page is for information purposes only. This website is a private initiative managed by 11 Estates, a real estate advisory company, and does not represent the official platform of the developer. All visuals, specifications, and prices are subject to developer amendments."}
          </p>
        </div>
      </footer>

      {/* Lightbox Modal Overlay */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 transition-all rounded-full flex items-center justify-center text-white text-lg font-mono"
          >
            ✕
          </button>
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Zoomed Preview"
              className="w-full h-auto max-h-[85vh] object-contain select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#4a4a4a]/10 rounded bg-[#1a1a1a] overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4.5 text-left hover:bg-white/5 transition duration-300">
        <span className="text-sm font-serif text-white font-normal pr-4">{question}</span>
        <ChevronDown className={`w-4 h-4 text-[#a3a3a3]/40 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4.5 pb-4.5 border-t border-[#4a4a4a]/10 pt-3">
          <p className="text-xs text-[#a3a3a3]/75 leading-relaxed font-light">{answer}</p>
        </div>
      )}
    </div>
  );
}
