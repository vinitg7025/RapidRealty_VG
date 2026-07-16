'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Building2, MapPin, Calendar, IndianRupee, Phone, Mail, User, ChevronLeft, ChevronRight, 
  Download, Check, ArrowRight, HelpCircle, Shield, Star, Clock, Loader2, ChevronDown,
  Waves, Dumbbell, TreePine, Zap, Car, Eye, ShoppingBag, Gamepad2, Sparkles,
  ArrowUpDown, Flame, Droplet, PhoneCall, BookOpen, Tv, Scissors, Baby, Heart, ChevronRight as ChevronRightIcon,
  Percent, Handshake, Compass, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { generateImageAltText } from '@/lib/seo';

interface MicrositeViewProps {
  slug: string;
  projectName: string;
  sectionSlug?: string;
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

function toSentenceCase(str: string) {
  if (!str) return '';
  const clean = str.trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function toTitleCase(str: string) {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function getAmenityIcon(name: string) {
  const t = name.toLowerCase();
  if (t.includes('pool') || t.includes('swim')) return <Waves className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('gym') || t.includes('fitness') || t.includes('health') || t.includes('workout')) return <Dumbbell className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('club') || t.includes('lounge') || t.includes('house') || t.includes('community')) return <Building2 className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('kid') || t.includes('play') || t.includes('child')) return <Gamepad2 className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('jogging') || t.includes('track') || t.includes('cycle') || t.includes('cycling') || t.includes('court') || t.includes('rink') || t.includes('tennis') || t.includes('badminton') || t.includes('squash') || t.includes('game') || t.includes('table')) return <Gamepad2 className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('garden') || t.includes('lawn') || t.includes('park') || t.includes('tree') || t.includes('green') || t.includes('landscaped')) return <TreePine className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('cctv') || t.includes('security') || t.includes('surveillance')) return <Shield className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('power') || t.includes('backup') || t.includes('electricity') || t.includes('zap')) return <Zap className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('intercom') || t.includes('phone') || t.includes('call')) return <PhoneCall className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('lift') || t.includes('elevator')) return <ArrowUpDown className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('car') || t.includes('parking') || t.includes('visitor')) return <Car className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('water') || t.includes('rain') || t.includes('harvest')) return <Droplet className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('fire') || t.includes('fighting') || t.includes('extinguisher') || t.includes('system')) return <Flame className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('yoga') || t.includes('meditation') || t.includes('zen') || t.includes('wellness')) return <Heart className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('library') || t.includes('book') || t.includes('reading')) return <BookOpen className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('theatre') || t.includes('cinema') || t.includes('movie') || t.includes('screen')) return <Tv className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('salon') || t.includes('spa') || t.includes('hair') || t.includes('beauty')) return <Scissors className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('creche') || t.includes('daycare') || t.includes('nursery')) return <Baby className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  if (t.includes('store') || t.includes('retail') || t.includes('shop') || t.includes('pharmacy') || t.includes('convenience')) return <ShoppingBag className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
  
  return <Sparkles className="w-4 h-4 text-amber-500/60 group-hover:text-amber-500 transition-colors" />;
}

function formatStatNumber(val: string) {
  if (!val) return '0';
  const match = val.match(/^([0-9.+]+)\s*(.*)$/);
  if (match) {
    return (
      <>
        {match[1]}{match[2] && <span className="text-xs md:text-sm font-light text-amber-500/90 ml-1">{match[2]}</span>}
      </>
    );
  }
  return val;
}

const ELEVEN_ESTATES_FAQS = [
  {
    question: 'Why should I work with 11 Estates?',
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
  { id: 'faq', label: 'FAQs' },
];

const slugToSectionId: Record<string, string> = {
  'pricing': 'pricing',
  'floor-plans': 'pricing',
  'master-plan': 'masterplan',
  'connectivity': 'connectivity',
  'amenities': 'amenities',
  'builder': 'builder',
  'faq': 'faq'
};

export default function MicrositeView({ slug, projectName, sectionSlug }: MicrositeViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    if (sectionSlug && slugToSectionId[sectionSlug]) {
      return slugToSectionId[sectionSlug];
    }
    return 'overview';
  });
  const [heroIndex, setHeroIndex] = useState(0);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', countryCode: '+91' });
  const [phoneError, setPhoneError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFloorPlanTab, setActiveFloorPlanTab] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (pdfViewerUrl) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [pdfViewerUrl]);

  useEffect(() => {
    fetch(`/api/microsites/public/${slug}`)
      .then((r) => r.json())
      .then((d) => { if (!d?.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!loading && data) {
      if (sectionSlug) {
        const targetId = slugToSectionId[sectionSlug];
        if (targetId) {
          const timer = setTimeout(() => {
            const el = sectionRefs.current[targetId];
            if (el) {
              window.scrollTo({ top: Math.max(0, el.offsetTop - 350), behavior: 'auto' });
              setIsReady(true);
              const smoothTimer = setTimeout(() => {
                window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' });
              }, 100);
              return () => clearTimeout(smoothTimer);
            } else {
              setIsReady(true);
            }
          }, 50);
          return () => clearTimeout(timer);
        }
      }
      setIsReady(true);
    }
  }, [loading, data, sectionSlug]);

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

  if (loading || !isReady) {
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
    <div className="min-h-screen bg-[#121212] font-sans antialiased text-[#a3a3a3] pb-20 md:pb-0">
      {/* Sticky Header & Nav Wrapper */}
      <div className="sticky top-0 z-50 bg-[#121212]">
        {/* Header */}
        <header className="bg-[#121212]/95 backdrop-blur-md border-b border-[#4a4a4a]/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="https://www.11estates.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 group select-none">
              <div className="w-8 h-8 border border-white flex items-center justify-center font-serif text-xl text-white group-hover:bg-white group-hover:text-[#121212] transition-colors">11</div>
              <span className="font-serif text-2xl tracking-tight uppercase text-white">Estates</span>
            </a>
          </div>
        </header>

        {/* Section Navigation */}
        <nav className="bg-[#1a1a1a]/95 backdrop-blur-md border-b border-[#4a4a4a]/10 py-3.5">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
            <div className="overflow-x-auto scrollbar-none flex-1">
              <div className="flex gap-8 items-center">
                {visibleSections.map((s: any) => (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={`relative py-1 text-sm tracking-wide uppercase transition-all duration-300 whitespace-nowrap outline-none ${
                      activeSection === s.id
                        ? 'text-white font-semibold brightness-105'
                        : 'text-[#a3a3a3]/75 font-medium hover:text-white/90'
                    }`}
                  >
                    <span className="relative z-10">{s.label}</span>
                    {activeSection === s.id && (
                      <motion.div
                        layoutId="activeUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-amber-500"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <a
              href="tel:+918454989005"
              className="hidden md:flex items-center gap-2 bg-white text-[#121212] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-[#a3a3a3] transition-colors flex-shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call: +91-8454989005</span>
            </a>
          </div>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* Project Summary */}
            <div className="border-b border-[#4a4a4a]/10 pb-8">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4">

                  <h1 className="font-serif text-4xl md:text-5.5xl font-normal tracking-tight text-white leading-tight">
                    {data?.projectName ?? ''}
                    {data?.builderName && (
                      <>
                        <span className="text-[#8A8A8A] font-sans italic font-light text-[0.55em] lowercase mx-2 select-none">by</span>
                        <span className="text-amber-500 font-serif italic font-normal text-[0.75em] md:text-[0.8em]">{data.builderName}</span>
                      </>
                    )}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm md:text-base font-light text-brand-silver/90">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-500" /> {data?.location ?? ''}{data?.city ? `, ${data.city}` : ''}</span>
                    {data?.possessionDate && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-amber-500" /> Possession: {data.possessionDate}</span>}
                    {data?.priceRangeMin && (
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                        <IndianRupee className="w-4 h-4" />
                        {data.priceRangeMin}{data?.priceRangeMax ? ` - ₹${data.priceRangeMax}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div className="space-y-3">
                <div className="relative rounded overflow-hidden bg-[#1a1a1a] aspect-[16/9] border border-[#4a4a4a]/10">
                  <Image
                    src={allImages[heroIndex % allImages.length] ?? ''}
                    alt={generateImageAltText(data?.projectName ?? '', heroImages.includes(allImages[heroIndex % allImages.length]) ? 'hero' : 'gallery', allImages[heroIndex % allImages.length])}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover cursor-zoom-in hover:opacity-95 transition-opacity duration-300"
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
                        <Image src={url} alt={generateImageAltText(data?.projectName ?? '', heroImages.includes(url) ? 'hero' : 'gallery', url)} width={96} height={64} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Overview Section */}
            <section ref={(el) => { sectionRefs.current['overview'] = el; }} id="overview" className="space-y-6 pt-4">
              <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                <span>{data?.projectName || projectName}</span>
                <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
              </div>
              <h2 className="text-4xl md:text-5.5xl font-serif text-white tracking-tight leading-none">
                Overview & <span className="italic text-[#a3a3a3]/90">Highlights</span>
              </h2>
              {data?.projectDescription && (
                <p className="text-[#a3a3a3]/85 text-sm font-light leading-relaxed max-w-3xl whitespace-pre-line">
                  {data.projectDescription}
                </p>
              )}
              
              {/* Highlights using premium editorial callouts */}
              {highlights.length > 0 && highlights[0] && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-[#4a4a4a]/10 max-w-4xl">
                  {highlights.filter(Boolean).map((h: any, i: number) => {
                    const isObject = typeof h === 'object' && h !== null;
                    const headline = isObject ? h.headline : h;
                    const support = isObject ? h.support : '';
                    
                    return (
                      <div key={i} className="flex flex-col items-start space-y-3 group">
                        <span className="font-serif italic text-3xl md:text-4xl text-[#f59e0b]/70 group-hover:text-[#f59e0b] transition-colors duration-300 select-none">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="w-8 h-[1px] bg-[#f59e0b]/30 group-hover:w-12 group-hover:bg-[#f59e0b] transition-all duration-300"></div>
                        <div className="space-y-1.5">
                          <h3 className="font-serif text-base md:text-[17px] text-white font-normal leading-snug tracking-tight group-hover:text-[#f59e0b]/90 transition-colors duration-300">
                            {headline}
                          </h3>
                          {support && (
                            <p className="text-xs text-[#a3a3a3]/85 font-light leading-relaxed">
                              {support}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Connectivity */}
            {connectivity.length > 0 && connectivity[0]?.place && (
              <section ref={(el) => { sectionRefs.current['connectivity'] = el; }} id="connectivity" className="space-y-6 pt-4">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>{data?.projectName || projectName}</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-4xl md:text-5.5xl font-serif text-white tracking-tight leading-none">
                  Seamless <span className="italic text-[#a3a3a3]/90">Connectivity</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                  {connectivity.filter((c: any) => c?.place).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-[#4a4a4a]/10 rounded hover:border-[#f59e0b]/20 transition-all duration-300 group">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-[#f59e0b]/60 group-hover:text-[#f59e0b] transition-colors duration-300" />
                        <span className="text-sm font-medium text-white group-hover:text-[#f59e0b] transition-colors duration-300">{c?.place ?? ''}</span>
                      </div>
                      <div className="text-right font-mono text-xs flex items-center gap-1.5 select-none">
                        {c?.time && <span className="text-[#f59e0b]">{c.time}</span>}
                        {c?.time && c?.distance && <span className="text-[#a3a3a3]/30">|</span>}
                        {c?.distance && <span className="text-[#8A8A8A]">{c.distance}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Master Plan */}
            {data?.masterPlanUrl && (
              <section ref={(el) => { sectionRefs.current['masterplan'] = el; }} id="masterplan" className="space-y-6 pt-4">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>{data?.projectName || projectName}</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-4xl md:text-5.5xl font-serif text-white tracking-tight leading-none">
                  Project <span className="italic text-[#a3a3a3]/90">Master Plan</span>
                </h2>
                <div className="rounded overflow-hidden bg-[#1a1a1a] border border-[#4a4a4a]/10 p-4 max-w-3xl flex flex-col items-center gap-2">
                  <Image src={data.masterPlanUrl} alt={generateImageAltText(data?.projectName ?? '', 'masterPlan')} width={1600} height={1000} sizes="(max-width: 768px) 100vw, 768px" className="w-full h-auto object-contain max-h-[500px] rounded cursor-zoom-in hover:opacity-95 transition-opacity duration-300" onClick={() => setLightboxImage(data.masterPlanUrl)} />
                  <p className="text-[10px] text-amber-500 font-mono tracking-wider uppercase select-none mt-1">Click to enlarge</p>
                </div>
              </section>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <section ref={(el) => { sectionRefs.current['amenities'] = el; }} id="amenities" className="space-y-6 pt-4">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>{data?.projectName || projectName}</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-4xl md:text-5.5xl font-serif text-white tracking-tight leading-none">
                  Curated <span className="italic text-[#a3a3a3]/90">Amenities</span>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl">
                  {amenities.map((a: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#4a4a4a]/10 rounded hover:border-[#f59e0b]/20 transition-all duration-300 group">
                      <div className="text-[#f59e0b]/60 group-hover:text-[#f59e0b] transition-colors duration-300 flex-shrink-0">
                        {getAmenityIcon(a)}
                      </div>
                      <span className="text-sm font-medium text-white group-hover:text-[#f59e0b] transition-colors duration-300">
                        {toSentenceCase(a)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Floor Plans */}
            {pricing.length > 0 && pricing[0]?.config && (
              <section ref={(el) => { sectionRefs.current['pricing'] = el; }} id="pricing" className="space-y-6 pt-4">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>{data?.projectName || projectName}</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-4xl md:text-5.5xl font-serif text-white tracking-tight leading-none">
                  Architectural <span className="italic text-[#a3a3a3]/90">Floor Plans</span>
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
                      className={`px-5 py-2 rounded text-sm font-mono font-semibold uppercase tracking-normal transition-all duration-300 border ${
                        activeFloorPlanTab === i
                          ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]'
                          : 'bg-white/5 text-zinc-300 border-transparent hover:border-[#4a4a4a]/30'
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
                                <p className="text-[15px] font-medium text-[#A0A0A0] mb-0.5">SBA / Area</p>
                                <p className="text-sm font-semibold text-white">{activeConfig.area} sq.ft.</p>
                              </div>
                            )}
                            {(activeConfig.customFields ?? []).filter((cf: any) => cf.key && cf.value).map((cf: any, idx: number) => (
                              <div key={idx}>
                                <p className="text-[15px] font-medium text-[#A0A0A0] mb-0.5">{toTitleCase(cf.key)}</p>
                                <p className="text-sm font-semibold text-white">{cf.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {hasFloorPlanImg && (
                          <div className="md:w-1/2 flex flex-col items-center justify-center bg-black/20 rounded p-4 border border-[#4a4a4a]/10 gap-2">
                            <Image
                              src={activeConfig.floorPlanImageUrl}
                              alt={generateImageAltText(data?.projectName ?? '', 'floorPlan', activeConfig.config)}
                              width={1200}
                              height={900}
                              sizes="(max-width: 768px) 100vw, 384px"
                              className="w-full h-auto object-contain max-h-[300px] cursor-zoom-in hover:opacity-95 transition-opacity duration-300"
                              onClick={() => setLightboxImage(activeConfig.floorPlanImageUrl)}
                            />
                            <p className="text-[10px] text-amber-500 font-mono tracking-wider uppercase select-none mt-1">Click to enlarge</p>
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
                    <div key={i} className="rounded overflow-hidden bg-[#1a1a1a] border border-[#4a4a4a]/10 p-4 flex flex-col items-center gap-2">
                      <Image src={url} alt={generateImageAltText(data?.projectName ?? '', 'floorPlan', `Layout ${i + 1}`)} width={1200} height={900} sizes="(max-width: 768px) 100vw, 384px" className="w-full h-auto object-contain max-h-[350px] rounded cursor-zoom-in hover:opacity-95 transition-opacity duration-300" onClick={() => setLightboxImage(url)} />
                      <p className="text-[10px] text-amber-500 font-mono tracking-wider uppercase select-none mt-1">Click to enlarge</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Builder & RERA Info */}
            {(data?.builderDescription || (reraQrCodes.length > 0 && reraQrCodes[0]?.qrImageUrl)) && (
              <section ref={(el) => { sectionRefs.current['builder'] = el; }} id="builder" className="space-y-6 pt-4">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>{data?.projectName || projectName}</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-4xl md:text-5.5xl font-serif text-white tracking-tight leading-none">
                  About <span className="italic text-[#a3a3a3]/90">Builder</span>
                </h2>
                
                <div className="bg-[#1a1a1a] border border-[#4a4a4a]/10 rounded p-6 max-w-3xl space-y-6">
                  {data?.builderDescription && (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 pb-3 border-b border-[#4a4a4a]/10">
                        {data?.builderLogoUrl && (
                          <Image src={data.builderLogoUrl} alt={generateImageAltText(data?.projectName ?? '', 'logo')} width={64} height={64} className="w-16 h-16 object-contain rounded bg-[#121212] p-1 flex-shrink-0 cursor-zoom-in hover:opacity-90 transition-opacity duration-300" onClick={() => setLightboxImage(data.builderLogoUrl)} />
                        )}
                        <div className="space-y-1.5 flex-1 pt-1">
                          <h3 className="font-serif text-2xl text-white font-normal leading-none">{data?.builderName ?? ''}</h3>
                          {data?.builderTagline && (
                            <p className="text-xs text-white/90 font-sans tracking-wide font-light">{data.builderTagline}</p>
                          )}
                        </div>
                      </div>

                      {/* High-End Statistic Grid */}
                      {(data?.builderExperience || data?.builderProjects || data?.builderArea || data?.builderOngoing) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-0 py-3 border-b border-[#4a4a4a]/10 select-none">
                          {/* Stat 1: Experience */}
                          {data?.builderExperience && (
                            <div className="flex flex-col items-center text-center border-r border-[#4a4a4a]/10">
                              <span className="text-3xl md:text-4xl font-serif text-[#f59e0b] font-semibold tracking-tight">
                                {formatStatNumber(data.builderExperience)}
                              </span>
                              <span className="text-sm font-medium text-white mt-1">Years</span>
                              <span className="text-[10px] text-[#a3a3a3]/55 font-light uppercase tracking-wider">Experience</span>
                            </div>
                          )}
                          {/* Stat 2: Projects */}
                          {data?.builderProjects && (
                            <div className="flex flex-col items-center text-center md:border-r border-[#4a4a4a]/10">
                              <span className="text-3xl md:text-4xl font-serif text-[#f59e0b] font-semibold tracking-tight">
                                {formatStatNumber(data.builderProjects)}
                              </span>
                              <span className="text-sm font-medium text-white mt-1">Projects</span>
                              <span className="text-[10px] text-[#a3a3a3]/55 font-light uppercase tracking-wider">Delivered</span>
                            </div>
                          )}
                          {/* Stat 3: Area */}
                          {data?.builderArea && (
                            <div className="flex flex-col items-center text-center border-r border-[#4a4a4a]/10">
                              <span className="text-3xl md:text-4xl font-serif text-[#f59e0b] font-semibold tracking-tight">
                                {formatStatNumber(data.builderArea)}
                              </span>
                              <span className="text-sm font-medium text-white mt-1">Sq.ft.</span>
                              <span className="text-[10px] text-[#a3a3a3]/55 font-light uppercase tracking-wider">Delivered</span>
                            </div>
                          )}
                          {/* Stat 4: Ongoing */}
                          {data?.builderOngoing && (
                            <div className="flex flex-col items-center text-center">
                              <span className="text-3xl md:text-4xl font-serif text-[#f59e0b] font-semibold tracking-tight">
                                {formatStatNumber(data.builderOngoing)}
                              </span>
                              <span className="text-sm font-medium text-white mt-1">Ongoing</span>
                              <span className="text-[10px] text-[#a3a3a3]/55 font-light uppercase tracking-wider">Developments</span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-[#a3a3a3]/80 text-sm font-light leading-relaxed whitespace-pre-line pt-2">
                        {data.builderDescription}
                      </p>

                      {/* 11 Estates Perspective Block */}
                      {data?.builderPerspective && (
                        <div className="flex gap-4 p-5 bg-[#121212]/40 border border-[#f59e0b]/10 rounded-lg mt-6">
                          <div className="text-[#f59e0b] select-none flex-shrink-0 pt-0.5">
                            <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.434.914-4.01 3.636-4.01 5.846h4v10h-9.986z"/>
                            </svg>
                          </div>
                          <div className="space-y-1 flex-1">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-[#f59e0b]">11 Estates Perspective</h4>
                            <p className="text-sm text-white/95 font-light leading-relaxed">
                              {data.builderPerspective}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* RERA QR Codes inside same block */}
                  {reraQrCodes.length > 0 && reraQrCodes[0]?.qrImageUrl && (
                    <div className={`pt-6 ${data?.builderDescription ? 'border-t border-[#4a4a4a]/10' : ''} space-y-4`}>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-[#f59e0b] mb-1">RERA Status</h4>
                      <div className={`grid gap-6 ${reraQrCodes.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                        {reraQrCodes.filter((r: any) => r?.qrImageUrl).map((r: any, i: number) => (
                          <div key={i} className="flex items-center gap-4 bg-[#121212]/40 border border-[#4a4a4a]/10 rounded-lg p-4">
                            <div className="w-20 h-20 flex-shrink-0 bg-white rounded p-1">
                              <Image src={r.qrImageUrl} alt={`${data?.projectName ?? ''} ${r.towerName ? r.towerName + ' ' : ''}RERA QR Code`} width={80} height={80} className="w-full h-full object-contain cursor-zoom-in hover:opacity-95 transition-opacity duration-300" onClick={() => setLightboxImage(r.qrImageUrl)} />
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
                <span>11 ESTATES ADVISORY CLARIFICATIONS</span>
                <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
              </div>
              <h2 className="text-4xl md:text-5.5xl font-serif text-white tracking-tight leading-none">
                Frequently Asked <span className="italic text-[#a3a3a3]/90">Questions</span>
              </h2>
              
              <div className="space-y-2.5 max-w-3xl">
                {ELEVEN_ESTATES_FAQS.map((f: any, i: number) => (
                  <FaqItem
                    key={i}
                    question={f.question}
                    answer={f.answer}
                    isOpen={activeFaqIndex === i}
                    onToggle={() => setActiveFaqIndex(activeFaqIndex === i ? null : i)}
                  />
                ))}
              </div>
            </section>

            {/* Project Dossier */}
            {data?.brochureUrl && (
              <section id="dossier" className="space-y-6 pt-4 border-t border-[#4a4a4a]/10">
                <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-[#f59e0b] uppercase">
                  <span>{data?.projectName || projectName}</span>
                  <span className="w-8 h-[1px] bg-[#4a4a4a]/30"></span>
                </div>
                <h2 className="text-4xl md:text-5.5xl font-serif text-white tracking-tight leading-none">
                  Project <span className="italic text-[#a3a3a3]/90">Dossier</span>
                </h2>
                
                <div className="bg-[#1a1a1a] border border-[#4a4a4a]/10 rounded p-6 max-w-3xl space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl text-white font-normal">Need more information?</h3>
                    <p className="text-sm text-[#a3a3a3]/85 font-light">
                      Explore the official project presentation
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#4a4a4a]/10 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      onClick={() => {
                        const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
                        if (isMobile) {
                          window.open(data.brochureUrl, '_blank');
                        } else {
                          setPdfViewerUrl(data.brochureUrl);
                        }
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#d4890a] text-black px-6 py-3 rounded text-xs font-mono font-bold tracking-widest uppercase transition duration-300 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Brochure</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* Sticky Inquiry Form */}
          <div id="enquire" className="w-full lg:w-[360px] max-w-[640px] lg:max-w-none mx-auto lg:mx-0 flex-shrink-0 scroll-mt-24">
            <div className="lg:sticky lg:top-[148px] transition-all duration-300">
              <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] border border-amber-500/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-5 space-y-4 transition-all duration-300">
                <div className="text-center">
                  <h3 className="font-serif text-2xl font-semibold text-amber-500 leading-[1.25]">
                    Work With <span className="text-[1.15em] leading-none">11</span> Estates
                  </h3>
                  <p className="text-xs text-[#E6E6E6]/90 font-normal leading-relaxed mt-2">
                    You pay nothing. We represent your interests and negotiate with builders on your behalf.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    { text: 'No Brokerage, No Service Fees', icon: Percent },
                    { text: 'Best Negotiated Price', icon: Handshake },
                    { text: 'Expert Guidance Throughout The Purchase', icon: Compass },
                  ].map((item: any, i: number) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 group select-none">
                        <div className="w-7 h-7 rounded-full border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-500 bg-[#1A1A1A] group-hover:border-amber-500/50 transition-colors duration-200">
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="text-xs text-[#E6E6E6] font-light leading-snug">{item.text}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#333333]/30 pt-4 space-y-3">
                  <div className="text-center">
                    <p className="text-xs text-[#A0A0A0] leading-normal">
                      Speak with an advisor before you commit to a unit.
                    </p>
                  </div>

                  {submitted ? (
                    <div className="text-center py-5 bg-emerald-500/5 rounded-[10px] border border-emerald-500/10">
                      <div className="w-8 h-8 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="font-serif text-sm text-white">Enquiry Submitted</p>
                      <p className="text-[10px] text-brand-silver/50 mt-0.5">An advisor will reach out to you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="space-y-2.5 pt-1">
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9A9A9A] group-focus-within:text-amber-500 transition-colors duration-200" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-[#1A1A1A] border border-[#333333] rounded-[10px] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#9A9A9A] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:shadow-[0_0_8px_rgba(245,158,11,0.15)] outline-none transition-all duration-200"
                          placeholder="Full Name"
                          required
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <select
                          value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                          className="w-[80px] bg-[#1A1A1A] border border-[#333333] rounded-[10px] px-2.5 py-2.5 text-xs text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all duration-200 cursor-pointer"
                        >
                          {COUNTRY_CODES.map(cc => (
                            <option key={cc.code} value={cc.code} className="bg-[#1A1A1A] text-white text-xs">{cc.label}</option>
                          ))}
                        </select>
                        <div className="relative flex-1 group">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9A9A9A] group-focus-within:text-amber-500 transition-colors duration-200" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => {
                              setFormData({ ...formData, phone: e.target.value });
                              setPhoneError('');
                            }}
                            className={`w-full bg-[#1A1A1A] border rounded-[10px] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#9A9A9A] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:shadow-[0_0_8px_rgba(245,158,11,0.15)] outline-none transition-all duration-200 ${
                              phoneError ? 'border-red-400/50' : 'border-[#333333]'
                            }`}
                            placeholder="Mobile Number"
                            required
                          />
                        </div>
                      </div>
                      {phoneError && <p className="text-[10px] text-red-400 mt-0.5 font-mono">{phoneError}</p>}
                      
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9A9A9A] group-focus-within:text-amber-500 transition-colors duration-200" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#1A1A1A] border border-[#333333] rounded-[10px] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#9A9A9A] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 focus:shadow-[0_0_8px_rgba(245,158,11,0.15)] outline-none transition-all duration-200"
                          placeholder="Email Address"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-[#0A0A0A] font-semibold rounded-xl text-sm tracking-wider uppercase transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] hover:shadow-[0_10px_20px_rgba(245,158,11,0.25)] cursor-pointer"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Get Best Offer</span>}
                        {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
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
      <footer className="bg-brand-graphite border-t border-brand-stone/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border-b border-brand-stone/10 pb-8">
            <div className="space-y-4">
              <a href="https://www.11estates.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                <div className="w-7 h-7 bg-white text-brand-charcoal rounded flex items-center justify-center font-serif text-sm font-semibold tracking-tighter select-none group-hover:bg-brand-silver transition-colors">
                  11
                </div>
                <span className="font-serif text-2xl tracking-tight uppercase text-white">Estates</span>
              </a>
              <p className="text-sm font-light text-brand-silver/80 leading-relaxed max-w-md">
                A premium national commercial real estate advisory firm built for enterprises, investors, and developers across India.
              </p>
              <div className="space-y-1 font-mono text-[9px] tracking-widest text-brand-silver/45 uppercase leading-normal">
                <p>Unit 127, The Summit Business Bay</p>
                <p>Gundavali, Andheri East, Mumbai,</p>
                <p>Maharashtra 400093</p>
              </div>
              <p className="text-xs text-brand-silver/70">
                <a href="mailto:priyanka@11estates.in" className="hover:text-white transition-colors">priyanka@11estates.in</a>
              </p>
              <div className="flex gap-6 font-mono text-[9px] tracking-widest uppercase text-brand-silver/60 pt-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Linkedin</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
              </div>
            </div>

            {/* Middle Columns Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:justify-end">
              {/* Advisory Hubs */}
              <div className="space-y-4">
                <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-white font-semibold">Advisory Hubs</h4>
                <ul className="space-y-2.5 text-xs text-brand-silver/75 font-light">
                  <li><a href="https://www.11estates.in/commercial" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Commercial Leasing</a></li>
                  <li><a href="https://www.11estates.in/commercial" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Enterprise Expansion</a></li>
                  <li><a href="https://www.11estates.in/commercial" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Commercial Investments</a></li>
                  <li><a href="https://www.11estates.in/commercial" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Industrial & Logistics</a></li>
                  <li><a href="https://www.11estates.in/residential" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Curated Residential</a></li>
                </ul>
              </div>

              {/* Corporate */}
              <div className="space-y-4">
                <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-white font-semibold">Corporate</h4>
                <ul className="space-y-2.5 text-xs text-brand-silver/75 font-light">
                  <li><a href="https://www.11estates.in/#insights" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Insights & Intelligence</a></li>
                  <li><a href="https://www.11estates.in/#contact" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact Advisory</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-brand-stone/10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[9px] font-mono tracking-widest text-brand-silver/45 uppercase">
            <p>© 2026 11 Estates Private Limited. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="https://www.11estates.in/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="https://www.11estates.in/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <p className="text-[10px] text-brand-silver/30 leading-relaxed font-light whitespace-pre-line border-t border-brand-stone/5 pt-4">
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

      {/* PDF Document Viewer Overlay */}
      {pdfViewerUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-in"
          onClick={() => setPdfViewerUrl(null)}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-[#0b0b0b] border-b border-white/5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <a href="https://www.11estates.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 group select-none">
                <div className="w-4 h-4 border border-white flex items-center justify-center font-serif text-[9px] text-white group-hover:bg-white group-hover:text-[#121212] transition-colors">11</div>
                <span className="font-serif text-[10px] tracking-wider uppercase text-white font-semibold">Estates</span>
              </a>
              <span className="text-[9px] text-white/50 border-l border-white/10 pl-3 select-none uppercase tracking-wider font-mono">
                Viewing on 11 Estates
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={pdfViewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 transition rounded text-white text-[10px] font-mono select-none"
              >
                <ExternalLink className="w-3 h-3" /> Open in New Tab
              </a>
              <button
                onClick={() => setPdfViewerUrl(null)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 transition-all rounded-full flex items-center justify-center text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>
          </div>
          {/* PDF Viewer Frame */}
          <div className="flex-1 w-full h-full bg-[#121212]" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`${pdfViewerUrl}#toolbar=1`}
              className="w-full h-full border-0"
              title="Brochure PDF Viewer"
            />
          </div>
        </div>
      )}

      {/* Mobile sticky action bar (Call + Enquire) — hidden on desktop */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-[90] flex items-stretch gap-2 p-3 bg-[#121212]/95 backdrop-blur border-t border-white/10">
        <a
          href="tel:+918454989005"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-amber-500/40 text-amber-500 text-xs font-semibold uppercase tracking-widest"
        >
          <Phone className="w-4 h-4" /> Call
        </a>
        <a
          href="#enquire"
          className="flex-[1.4] flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-[#0A0A0A] text-xs font-bold uppercase tracking-widest"
        >
          Enquire Now
        </a>
      </div>
    </div>
  );
}

function FaqItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`border rounded-sm transition-all duration-300 ${isOpen
        ? 'bg-[#242424] border-[#f59e0b] shadow-lg shadow-black/10'
        : 'bg-[#1a1a1a] border-[#4a4a4a]/10 hover:border-[#4a4a4a]/20'
      }`}>
      <button
        onClick={onToggle}
        className="w-full text-left p-6 md:p-8 flex justify-between items-center gap-6 focus:outline-none group select-none"
        aria-expanded={isOpen}
      >
        <span className="font-serif text-lg md:text-xl text-white group-hover:text-[#f59e0b] transition-colors duration-300">
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'border-[#f59e0b]/50' : 'border-[#4a4a4a]/25 group-hover:border-[#f59e0b]/50'
          }`}>
          <ChevronRight className={`w-4 h-4 transition-all duration-300 ${isOpen ? 'rotate-90 text-[#f59e0b]' : 'text-[#a3a3a3] group-hover:text-[#f59e0b]'
            }`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: isOpen ? 0.25 : 0.18, ease: isOpen ? 'easeOut' : 'easeIn' },
              opacity: { duration: 0.18, ease: 'linear' }
            }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8 md:px-8 md:pb-10 pt-0 text-[#a3a3a3]/90 text-sm font-light leading-relaxed border-t border-[#4a4a4a]/5">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
