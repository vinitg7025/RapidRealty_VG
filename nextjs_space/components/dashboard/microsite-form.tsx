'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Save, Eye, Building2, MapPin, IndianRupee, Wifi, TreePine, HelpCircle, FileText, ImageIcon, Info, QrCode, CheckCircle2, Sparkles, Upload } from 'lucide-react';
import FileUpload from './file-upload';
import { uploadFileToS3 } from '@/lib/upload-helper';

interface MicrositeFormProps {
  initialData?: any;
  isEdit?: boolean;
}

const AMENITY_OPTIONS = [
  'Swimming Pool', 'Gymnasium', 'Clubhouse', 'Children Play Area', 'Jogging Track',
  'Landscaped Gardens', 'Indoor Games', 'Multipurpose Hall', 'Power Backup',
  'CCTV Surveillance', 'Intercom', 'Lift', 'Car Parking', 'Visitor Parking',
  'Rain Water Harvesting', 'Sewage Treatment Plant', 'Fire Fighting System',
  'Badminton Court', 'Tennis Court', 'Basketball Court', 'Yoga Room', 'Library',
  'Meditation Zone', 'Party Lawn', 'Pet Park', 'Senior Citizen Area', 'Amphitheatre',
  'Co-Working Space', 'Cycling Track', 'Squash Court', 'Table Tennis', 'Skating Rink',
  'Mini Theatre', 'Convenience Store', 'Salon', 'Creche', 'Pharmacy',
];

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

function slugify(text: string): string {
  return (text ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function MicrositeForm({ initialData, isEdit }: MicrositeFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [micrositeId, setMicrositeId] = useState<string | null>(initialData?.id ?? null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [extracting, setExtracting] = useState(false);
  const brochureInputRef = useRef<HTMLInputElement>(null);

  const parseJson = (val: any, fallback: any = []) => {
    if (!val) return fallback;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return fallback; }
    }
    return val;
  };

  const [form, setForm] = useState({
    slug: initialData?.slug ?? '',
    projectName: initialData?.projectName ?? '',
    builderName: initialData?.builderName ?? '',
    location: initialData?.location ?? '',
    city: initialData?.city ?? '',
    possessionDate: initialData?.possessionDate ?? '',
    projectDescription: initialData?.projectDescription ?? '',
    reraNumber: initialData?.reraNumber ?? '',
    projectType: initialData?.projectType ?? 'Residential',
    priceRangeMin: initialData?.priceRangeMin ?? '',
    priceRangeMax: initialData?.priceRangeMax ?? '',
    projectHighlights: (() => {
      const parsed = parseJson(initialData?.projectHighlights, []);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => {
          if (typeof item === 'string') {
            return { headline: item, support: '' };
          }
          return { headline: item?.headline ?? '', support: item?.support ?? '' };
        });
      }
      return [{ headline: '', support: '' }];
    })(),
    builderDescription: initialData?.builderDescription ?? '',
    builderExperience: initialData?.builderExperience ?? '',
    builderProjects: initialData?.builderProjects ?? '',
    builderTagline: initialData?.builderTagline ?? '',
    builderArea: initialData?.builderArea ?? '',
    builderOngoing: initialData?.builderOngoing ?? '',
    builderPerspective: initialData?.builderPerspective ?? '',
    heroImages: parseJson(initialData?.heroImages, []),
    galleryImages: parseJson(initialData?.galleryImages, []),
    masterPlanImage: initialData?.masterPlanImage ?? '',
    builderLogoPath: initialData?.builderLogoPath ?? '',
    brochurePath: initialData?.brochurePath ?? '',
    pricingData: parseJson(initialData?.pricingData, [{ config: '', area: '', price: '', floorPlanImage: '', customFields: [] }]).map((p: any) => ({
      ...p,
      customFields: p.customFields ?? []
    })),
    connectivityData: parseJson(initialData?.connectivityData, [{ place: '', distance: '', time: '' }]),
    amenities: parseJson(initialData?.amenities, []),
    floorPlans: parseJson(initialData?.floorPlans, []),
    faqs: parseJson(initialData?.faqs, [{ question: '', answer: '' }]),
    legalInfo: initialData?.legalInfo ?? '',
    reraQrCodes: parseJson(initialData?.reraQrCodes, []),
  });

  // Auto-save logic
  const performAutoSave = useCallback(async (currentForm: any, currentId: string | null) => {
    if (!(currentForm?.projectName ?? '').trim() || !(currentForm?.slug ?? '').trim()) return;
    setAutoSaving(true);
    try {
      const payload = { ...currentForm, id: currentId };
      const res = await fetch('/api/microsites/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.isNew && data.microsite?.id) {
          setMicrositeId(data.microsite.id);
        }
        const now = new Date();
        setLastSaved(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }));
      }
    } catch {
    } finally {
      setAutoSaving(false);
    }
  }, []);

  const formRef = useRef(form);
  const micrositeIdRef = useRef(micrositeId);
  formRef.current = form;
  micrositeIdRef.current = micrositeId;

  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      performAutoSave(formRef.current, micrositeIdRef.current);
    }, 5000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [form, performAutoSave]);

  const handleManualSave = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!(form?.projectName ?? '').trim()) { toast.error('Project name is required to save'); return; }
    if (!(form?.slug ?? '').trim()) { toast.error('URL slug is required to save'); return; }
    setSaving(true);
    try {
      const payload = { ...form, id: micrositeId };
      const res = await fetch('/api/microsites/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.isNew && data.microsite?.id) {
          setMicrositeId(data.microsite.id);
        }
        const now = new Date();
        setLastSaved(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }));
        toast.success('Progress saved!');
      } else {
        toast.error(data?.error ?? 'Save failed');
      }
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setForm((prev: any) => {
      const updated = { ...(prev ?? {}), [field]: value };
      if ((field === 'projectName' || field === 'builderName') && !isEdit) {
        const builder = field === 'builderName' ? value : (prev?.builderName ?? '');
        const project = field === 'projectName' ? value : (prev?.projectName ?? '');
        if (builder && project) {
          updated.slug = slugify(builder) + '/' + slugify(project);
        } else if (project) {
          updated.slug = slugify(project);
        }
      }
      return updated;
    });
  };

  // Brochure upload + AI extraction
  const handleBrochureExtract = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF brochure');
      return;
    }
    setExtracting(true);
    toast.info('Uploading brochure and extracting details with AI...');
    try {
      // Upload to S3 first
      const cloudPath = await uploadFileToS3(file, true);
      updateField('brochurePath', cloudPath);

      // Convert to base64 for LLM extraction
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const res = await fetch('/api/brochure/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, fileName: file.name }),
      });

      if (!res.ok) {
        toast.error('Extraction failed. Brochure uploaded, but fields not auto-filled.');
        return;
      }

      const extracted = await res.json();
      
      // Auto-fill form fields from extraction
      setForm((prev: any) => {
        const updated = { ...prev, brochurePath: cloudPath };
        if (extracted.projectName && !prev.projectName) updated.projectName = extracted.projectName;
        if (extracted.builderName && !prev.builderName) updated.builderName = extracted.builderName;
        if (extracted.location && !prev.location) updated.location = extracted.location;
        if (extracted.city && !prev.city) updated.city = extracted.city;
        if (extracted.possessionDate && !prev.possessionDate) updated.possessionDate = extracted.possessionDate;
        if (extracted.projectDescription && !prev.projectDescription) updated.projectDescription = extracted.projectDescription;
        if (extracted.reraNumber && !prev.reraNumber) updated.reraNumber = extracted.reraNumber;
        if (extracted.projectType && prev.projectType === 'Residential') updated.projectType = extracted.projectType;
        if (extracted.priceRangeMin && !prev.priceRangeMin) updated.priceRangeMin = extracted.priceRangeMin;
        if (extracted.priceRangeMax && !prev.priceRangeMax) updated.priceRangeMax = extracted.priceRangeMax;
        if (extracted.builderDescription && !prev.builderDescription) updated.builderDescription = extracted.builderDescription;
        if (extracted.builderExperience && !prev.builderExperience) updated.builderExperience = extracted.builderExperience;
        if (extracted.builderProjects && !prev.builderProjects) updated.builderProjects = extracted.builderProjects;
        
        if (extracted.projectHighlights?.length > 0 && (!prev.projectHighlights || prev.projectHighlights.length === 0 || (prev.projectHighlights.length === 1 && !prev.projectHighlights[0]?.headline))) {
          updated.projectHighlights = extracted.projectHighlights.map((item: any) => {
            if (typeof item === 'string') {
              return { headline: item, support: '' };
            }
            return { headline: item?.headline ?? '', support: item?.support ?? '' };
          });
        }
        if (extracted.pricingData?.length > 0 && (!prev.pricingData || prev.pricingData.length === 0 || (prev.pricingData.length === 1 && !prev.pricingData[0]?.config))) {
          updated.pricingData = extracted.pricingData.map((p: any) => ({ config: p.config ?? '', area: p.area ?? '', price: p.price ?? '', floorPlanImage: '' }));
        }
        if (extracted.connectivityData?.length > 0 && (!prev.connectivityData || prev.connectivityData.length === 0 || (prev.connectivityData.length === 1 && !prev.connectivityData[0]?.place))) {
          updated.connectivityData = extracted.connectivityData;
        }
        if (extracted.amenities?.length > 0 && (!prev.amenities || prev.amenities.length === 0)) {
          // Match against known amenities
          const matched = extracted.amenities.filter((a: string) => AMENITY_OPTIONS.includes(a));
          if (matched.length > 0) updated.amenities = matched;
        }

        // Auto-generate slug
        if (updated.builderName && updated.projectName && !isEdit && !prev.slug) {
          updated.slug = slugify(updated.builderName) + '/' + slugify(updated.projectName);
        }

        return updated;
      });

      toast.success('Brochure details extracted and auto-filled!');
    } catch (err: any) {
      console.error(err);
      toast.error('Something went wrong during extraction');
    } finally {
      setExtracting(false);
      if (brochureInputRef.current) brochureInputRef.current.value = '';
    }
  };

  const handleSubmit = async (status: string) => {
    if (!(form?.projectName ?? '').trim()) { toast.error('Project name is required'); return; }
    if (!(form?.builderName ?? '').trim()) { toast.error('Builder name is required'); return; }
    if (!(form?.slug ?? '').trim()) { toast.error('URL slug is required'); return; }

    setSaving(true);
    try {
      const payload = { ...form, status };
      const url = (isEdit || micrositeId) ? `/api/microsites/${initialData?.id ?? micrositeId}` : '/api/microsites';
      const method = (isEdit || micrositeId) ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to save');
        return;
      }

      toast.success(status === 'PUBLISHED' ? 'Microsite published!' : 'Microsite saved as draft');
      router.push('/dashboard/microsites');
    } catch (err: any) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { label: 'Basic Info', icon: Building2 },
    { label: 'Pricing', icon: IndianRupee },
    { label: 'Connectivity', icon: MapPin },
    { label: 'Amenities', icon: TreePine },
    { label: 'Uploads', icon: ImageIcon },
    { label: 'Builder', icon: Info },
    { label: 'RERA Compliance', icon: QrCode },
  ];

  const addListItem = (field: string, template: any) => {
    const list = [...(form as any)[field], template];
    updateField(field, list);
  };

  const removeListItem = (field: string, index: number) => {
    const list = [...(form as any)[field]];
    list.splice(index, 1);
    updateField(field, list);
  };

  const updateListItem = (field: string, index: number, key: string, value: string) => {
    const list = [...(form as any)[field]];
    list[index] = { ...(list[index] ?? {}), [key]: value };
    updateField(field, list);
  };

  // Input class for dark theme
  const inputClass = 'w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#c8a45e]/50 focus:border-[#c8a45e]/50 outline-none';
  const labelClass = 'block text-sm font-medium text-white/70 mb-1.5';
  const smallInputClass = 'w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#c8a45e]/50';

  return (
    <div>
      {/* Brochure AI Extract Banner */}
      <div className="mb-6 p-5 bg-gradient-to-r from-[#c8a45e]/10 to-[#c8a45e]/5 border border-[#c8a45e]/20 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#c8a45e]/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#c8a45e]" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">Auto-fill from Brochure</h3>
            <p className="text-xs text-white/50 mb-3">Upload a project brochure PDF and our AI will extract details to auto-fill the form fields.</p>
            <button
              onClick={() => !extracting && brochureInputRef.current?.click()}
              disabled={extracting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#c8a45e] text-black rounded-lg text-sm font-semibold hover:bg-[#d4b06a] transition disabled:opacity-50"
            >
              {extracting ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</> : <><Upload className="w-4 h-4" /> Upload Brochure PDF</>}
            </button>
            <input
              ref={brochureInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => handleBrochureExtract(e.target.files)}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab: any, i: number) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === i ? 'bg-[#c8a45e] text-black shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Auto-save indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-white/30">
          {autoSaving && (
            <><Loader2 className="w-3 h-3 animate-spin" /> Auto-saving...</>
          )}
          {!autoSaving && lastSaved && (
            <><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Last saved at {lastSaved}</>
          )}
        </div>
        <button onClick={handleManualSave} disabled={saving || autoSaving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 transition disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Progress
        </button>
      </div>

      <div className="bg-[#141414] border border-white/10 rounded-xl p-6">
        {/* Tab 0: Basic Info */}
        {activeTab === 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Project Name *</label>
                <input type="text" value={form?.projectName ?? ''} onChange={(e) => updateField('projectName', e.target.value)}
                  className={inputClass} placeholder="e.g. Lodha Marquis" />
              </div>
              <div>
                <label className={labelClass}>Builder Name *</label>
                <input type="text" value={form?.builderName ?? ''} onChange={(e) => updateField('builderName', e.target.value)}
                  className={inputClass} placeholder="e.g. Lodha Group" />
              </div>
            </div>

            <div>
              <label className={labelClass}>URL Slug *</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/30 whitespace-nowrap">yoursite.com/{form?.builderName ? slugify(form.builderName) + '/' : ''}</span>
                <input type="text" value={(form?.slug ?? '').replace(form?.builderName ? slugify(form.builderName) + '/' : '', '')}
                  onChange={(e) => {
                    const prefix = form?.builderName ? slugify(form.builderName) + '/' : '';
                    updateField('slug', prefix + slugify(e.target.value));
                  }}
                  className={`flex-1 ${inputClass}`} placeholder="project-name" />
              </div>
              <p className="text-xs text-white/25 mt-1">Full URL: yoursite.com/{form?.slug ?? ''}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Location</label>
                <input type="text" value={form?.location ?? ''} onChange={(e) => updateField('location', e.target.value)}
                  className={inputClass} placeholder="e.g. Worli" />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input type="text" value={form?.city ?? ''} onChange={(e) => updateField('city', e.target.value)}
                  className={inputClass} placeholder="e.g. Mumbai" />
              </div>
              <div>
                <label className={labelClass}>Possession Date</label>
                <input type="text" value={form?.possessionDate ?? ''} onChange={(e) => updateField('possessionDate', e.target.value)}
                  className={inputClass} placeholder="e.g. Dec 2027" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Project Type</label>
                <select value={form?.projectType ?? ''} onChange={(e) => updateField('projectType', e.target.value)}
                  className={inputClass + ' bg-[#1a1a1a]'}>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Mixed Use">Mixed Use</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Price From</label>
                <input type="text" value={form?.priceRangeMin ?? ''} onChange={(e) => updateField('priceRangeMin', e.target.value)}
                  className={inputClass} placeholder="e.g. 1.5 Cr" />
              </div>
              <div>
                <label className={labelClass}>Price To</label>
                <input type="text" value={form?.priceRangeMax ?? ''} onChange={(e) => updateField('priceRangeMax', e.target.value)}
                  className={inputClass} placeholder="e.g. 3.5 Cr" />
              </div>
            </div>

            <div>
              <label className={labelClass}>RERA Number</label>
              <input type="text" value={form?.reraNumber ?? ''} onChange={(e) => updateField('reraNumber', e.target.value)}
                className={inputClass} placeholder="e.g. P52100028762" />
            </div>

            <div>
              <label className={labelClass}>Project Description</label>
              <textarea value={form?.projectDescription ?? ''} onChange={(e) => updateField('projectDescription', e.target.value)}
                rows={4}
                className={inputClass + ' resize-none'} placeholder="Describe the project..." />
            </div>

            <div>
              <label className={labelClass}>Project Highlights</label>
              {(form?.projectHighlights ?? [{ headline: '', support: '' }]).map((h: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 mb-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={h?.headline ?? ''}
                      onChange={(e) => {
                        const list = [...(form?.projectHighlights ?? [])];
                        list[i] = { ...list[i], headline: e.target.value };
                        updateField('projectHighlights', list);
                      }}
                      className={`w-full ${smallInputClass}`}
                      placeholder="Headline (e.g. 1.6 Acre Expanse)"
                    />
                    <textarea
                      value={h?.support ?? ''}
                      onChange={(e) => {
                        const list = [...(form?.projectHighlights ?? [])];
                        list[i] = { ...list[i], support: e.target.value };
                        updateField('projectHighlights', list);
                      }}
                      rows={2}
                      className={`w-full ${smallInputClass} resize-none`}
                      placeholder="Supporting text (e.g. Spread across a premium, expansive land parcel)"
                    />
                  </div>
                  <div className="flex items-center justify-end sm:justify-start">
                    <button
                      onClick={() => {
                        const list = [...(form?.projectHighlights ?? [])];
                        list.splice(i, 1);
                        updateField('projectHighlights', list.length > 0 ? list : [{ headline: '', support: '' }]);
                      }}
                      className="p-2 text-white/30 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => updateField('projectHighlights', [...(form?.projectHighlights ?? []), { headline: '', support: '' }])}
                className="text-sm text-[#c8a45e] hover:text-[#d4b06a] flex items-center gap-1 mt-1"
              >
                <Plus className="w-3 h-3" /> Add Highlight
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Pricing with floor plan per config */}
        {activeTab === 1 && (
          <div>
            <h3 className="font-semibold text-white mb-4">Pricing Configuration</h3>
            {(form?.pricingData ?? []).map((p: any, i: number) => (
              <div key={i} className="mb-5 p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-white/40">Configuration #{i + 1}</span>
                  <button onClick={() => removeListItem('pricingData', i)} className="text-white/30 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Configuration</label>
                    <input type="text" value={p?.config ?? ''} onChange={(e) => updateListItem('pricingData', i, 'config', e.target.value)}
                      className={smallInputClass} placeholder="e.g. 2 BHK" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Area (sq.ft.)</label>
                    <input type="text" value={p?.area ?? ''} onChange={(e) => updateListItem('pricingData', i, 'area', e.target.value)}
                      className={smallInputClass} placeholder="e.g. 850" />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Price</label>
                    <input type="text" value={p?.price ?? ''} onChange={(e) => updateListItem('pricingData', i, 'price', e.target.value)}
                      className={smallInputClass} placeholder="e.g. ₹85 Lakh" />
                  </div>
                </div>
                <div>
                  <FileUpload
                    label="Floor Plan Image"
                    accept="image/*"
                    value={p?.floorPlanImage ?? ''}
                    onChange={(v) => updateListItem('pricingData', i, 'floorPlanImage', v as string)}
                    hint={`Upload floor plan for ${p?.config || 'this configuration'}`}
                  />
                </div>

                {/* Custom Specifications Key-Value List */}
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  <span className="text-xs font-semibold text-white/60">Custom Specifications (e.g. Saleable Area, Bathrooms, Balconies)</span>
                  
                  <div className="space-y-2">
                    {(p.customFields ?? []).map((cf: any, cfIndex: number) => (
                      <div key={cfIndex} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={cf.key ?? ''}
                          onChange={(e) => {
                            const list = [...(form?.pricingData ?? [])];
                            const cfs = [...(list[i].customFields ?? [])];
                            cfs[cfIndex] = { ...cfs[cfIndex], key: e.target.value };
                            list[i] = { ...list[i], customFields: cfs };
                            updateField('pricingData', list);
                          }}
                          className={smallInputClass + ' flex-1'}
                          placeholder="Specification Key (e.g. Bathrooms)"
                        />
                        <input
                          type="text"
                          value={cf.value ?? ''}
                          onChange={(e) => {
                            const list = [...(form?.pricingData ?? [])];
                            const cfs = [...(list[i].customFields ?? [])];
                            cfs[cfIndex] = { ...cfs[cfIndex], value: e.target.value };
                            list[i] = { ...list[i], customFields: cfs };
                            updateField('pricingData', list);
                          }}
                          className={smallInputClass + ' flex-1'}
                          placeholder="Specification Value (e.g. 3)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...(form?.pricingData ?? [])];
                            const cfs = [...(list[i].customFields ?? [])];
                            cfs.splice(cfIndex, 1);
                            list[i] = { ...list[i], customFields: cfs };
                            updateField('pricingData', list);
                          }}
                          className="text-white/30 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const list = [...(form?.pricingData ?? [])];
                      const cfs = [...(list[i].customFields ?? []), { key: '', value: '' }];
                      list[i] = { ...list[i], customFields: cfs };
                      updateField('pricingData', list);
                    }}
                    className="text-xs text-[#c8a45e] hover:text-[#d4b06a] flex items-center gap-1 mt-1"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add custom field
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => addListItem('pricingData', { config: '', area: '', price: '', floorPlanImage: '', customFields: [] })}
              className="text-sm text-[#c8a45e] hover:text-[#d4b06a] flex items-center gap-1 mt-2">
              <Plus className="w-3 h-3" /> Add Configuration
            </button>
          </div>
        )}

        {/* Tab 2: Connectivity */}
        {activeTab === 2 && (
          <div>
            <h3 className="font-semibold text-white mb-4">Connectivity Points</h3>
            {(form?.connectivityData ?? []).map((c: any, i: number) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 items-end">
                <div>
                  <label className="block text-xs text-white/40 mb-1">Place / Landmark</label>
                  <input type="text" value={c?.place ?? ''} onChange={(e) => updateListItem('connectivityData', i, 'place', e.target.value)}
                    className={smallInputClass} placeholder="e.g. Airport" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Distance</label>
                  <input type="text" value={c?.distance ?? ''} onChange={(e) => updateListItem('connectivityData', i, 'distance', e.target.value)}
                    className={smallInputClass} placeholder="e.g. 15 km" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Travel Time</label>
                  <input type="text" value={c?.time ?? ''} onChange={(e) => updateListItem('connectivityData', i, 'time', e.target.value)}
                    className={smallInputClass} placeholder="e.g. 25 mins" />
                </div>
                <button onClick={() => removeListItem('connectivityData', i)} className="p-2 text-white/30 hover:text-red-400 self-end"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => addListItem('connectivityData', { place: '', distance: '', time: '' })}
              className="text-sm text-[#c8a45e] hover:text-[#d4b06a] flex items-center gap-1 mt-2">
              <Plus className="w-3 h-3" /> Add Connectivity Point
            </button>
          </div>
        )}

        {/* Tab 3: Amenities */}
        {activeTab === 3 && (
          <div>
            <h3 className="font-semibold text-white mb-4">Select Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {AMENITY_OPTIONS.map((a: string) => {
                const selected = (form?.amenities ?? []).includes(a);
                const icon = AMENITY_ICONS[a] ?? '✓';
                return (
                  <button key={a} onClick={() => {
                    const current = form?.amenities ?? [];
                    updateField('amenities', selected ? current.filter((x: string) => x !== a) : [...current, a]);
                  }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition border ${
                      selected ? 'bg-[#c8a45e]/15 border-[#c8a45e]/40 text-[#c8a45e]' : 'bg-white/5 border-white/10 text-white/60 hover:border-[#c8a45e]/30'
                    }`}
                  >
                    <span className="text-base">{icon}</span>
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Uploads */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <FileUpload label="Hero Images" accept="image/*" multiple value={form?.heroImages ?? []} onChange={(v) => updateField('heroImages', v)} hint="Main banner images for the project" />
            <FileUpload label="Gallery Images" accept="image/*" multiple value={form?.galleryImages ?? []} onChange={(v) => updateField('galleryImages', v)} hint="Additional project images" />
            <FileUpload label="Master Plan" accept="image/*" value={form?.masterPlanImage ?? ''} onChange={(v) => updateField('masterPlanImage', v)} />
            <FileUpload label="Builder Logo" accept="image/*" value={form?.builderLogoPath ?? ''} onChange={(v) => updateField('builderLogoPath', v)} />
            <FileUpload label="Brochure (PDF)" accept=".pdf" value={form?.brochurePath ?? ''} onChange={(v) => updateField('brochurePath', v)} />
          </div>
        )}

        {/* Tab 5: Builder */}
        {activeTab === 5 && (
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Builder Tagline</label>
              <input type="text" value={form?.builderTagline ?? ''} onChange={(e) => updateField('builderTagline', e.target.value)}
                className={inputClass} placeholder="e.g. Built on trust. Delivering excellence since 1969." />
            </div>
            <div>
              <label className={labelClass}>Builder Description</label>
              <textarea value={form?.builderDescription ?? ''} onChange={(e) => updateField('builderDescription', e.target.value)}
                rows={4} className={inputClass + ' resize-none'} placeholder="About the builder..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className={labelClass}>Years of Experience</label>
                <input type="text" value={form?.builderExperience ?? ''} onChange={(e) => updateField('builderExperience', e.target.value)}
                  className={inputClass} placeholder="e.g. 57" />
              </div>
              <div>
                <label className={labelClass}>Total Projects Delivered</label>
                <input type="text" value={form?.builderProjects ?? ''} onChange={(e) => updateField('builderProjects', e.target.value)}
                  className={inputClass} placeholder="e.g. 100+" />
              </div>
              <div>
                <label className={labelClass}>Area Delivered (Sq.ft.)</label>
                <input type="text" value={form?.builderArea ?? ''} onChange={(e) => updateField('builderArea', e.target.value)}
                  className={inputClass} placeholder="e.g. 7.4 Mn" />
              </div>
              <div>
                <label className={labelClass}>Ongoing Developments</label>
                <input type="text" value={form?.builderOngoing ?? ''} onChange={(e) => updateField('builderOngoing', e.target.value)}
                  className={inputClass} placeholder="e.g. 28" />
              </div>
            </div>
            <div>
              <label className={labelClass}>11 Estates Perspective</label>
              <textarea value={form?.builderPerspective ?? ''} onChange={(e) => updateField('builderPerspective', e.target.value)}
                rows={3} className={inputClass + ' resize-none'} placeholder="Write advisor perspective..." />
            </div>
          </div>
        )}

        {/* Tab 6: RERA Compliance (QR Codes) */}
        {activeTab === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">RERA QR Codes</h3>
              <p className="text-sm text-white/40 mb-4">Upload RERA QR codes for each tower / phase. These will be displayed on the microsite for compliance.</p>
              {(form?.reraQrCodes ?? []).map((item: any, i: number) => (
                <div key={i} className="mb-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-medium text-white/40">RERA Entry #{i + 1}</span>
                    <button onClick={() => {
                      const list = [...(form?.reraQrCodes ?? [])];
                      list.splice(i, 1);
                      updateField('reraQrCodes', list);
                    }} className="text-white/30 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Tower / Phase Name</label>
                      <input type="text" value={item?.towerName ?? ''}
                        onChange={(e) => {
                          const list = [...(form?.reraQrCodes ?? [])];
                          list[i] = { ...list[i], towerName: e.target.value };
                          updateField('reraQrCodes', list);
                        }}
                        className={smallInputClass} placeholder="e.g. Tower A" />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">RERA Number</label>
                      <input type="text" value={item?.reraNumber ?? ''}
                        onChange={(e) => {
                          const list = [...(form?.reraQrCodes ?? [])];
                          list[i] = { ...list[i], reraNumber: e.target.value };
                          updateField('reraQrCodes', list);
                        }}
                        className={smallInputClass} placeholder="e.g. P52100028762" />
                    </div>
                  </div>
                  <FileUpload
                    label="QR Code Image"
                    accept="image/*"
                    value={item?.qrImagePath ?? ''}
                    onChange={(v) => {
                      const list = [...(form?.reraQrCodes ?? [])];
                      list[i] = { ...list[i], qrImagePath: v };
                      updateField('reraQrCodes', list);
                    }}
                    hint="Upload the RERA QR code image"
                  />
                </div>
              ))}
              <button onClick={() => updateField('reraQrCodes', [...(form?.reraQrCodes ?? []), { towerName: '', reraNumber: '', qrImagePath: '' }])}
                className="text-sm text-[#c8a45e] hover:text-[#d4b06a] flex items-center gap-1 mb-6">
                <Plus className="w-3 h-3" /> Add RERA QR Code
              </button>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6">
              <label className={labelClass}>Custom Legal Info / Disclaimer</label>
              <p className="text-xs text-white/40 mb-2">Provide a custom legal disclaimer to be displayed on the microsite. If left empty, the default 11 Estates disclaimer will be used.</p>
              <textarea value={form?.legalInfo ?? ''} onChange={(e) => updateField('legalInfo', e.target.value)}
                rows={4} className={inputClass + ' resize-none'} placeholder="e.g. The content is for information purposes only and does not constitute an offer to avail of any service..." />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2">
          {activeTab > 0 && (
            <button onClick={() => setActiveTab(activeTab - 1)} className="px-5 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 transition">
              Previous
            </button>
          )}
          {activeTab < tabs.length - 1 && (
            <button onClick={() => setActiveTab(activeTab + 1)} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 transition">
              Next
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSubmit('DRAFT')} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 transition disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button onClick={() => handleSubmit('PUBLISHED')} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
