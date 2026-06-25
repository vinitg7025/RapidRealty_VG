'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PlusCircle, ExternalLink, Edit, Trash2, Eye, EyeOff, Search, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function MicrositesPage() {
  const { data: session } = useSession() || {};
  const [microsites, setMicrosites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMicrosites = () => {
    fetch('/api/microsites')
      .then((r) => r.json())
      .then((d) => setMicrosites(d?.microsites ?? []))
      .catch(() => toast.error('Failed to load microsites'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMicrosites(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this microsite?')) return;
    const res = await fetch(`/api/microsites/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Microsite deleted');
      fetchMicrosites();
    } else {
      toast.error('Failed to delete');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const res = await fetch(`/api/microsites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(newStatus === 'PUBLISHED' ? 'Microsite published!' : 'Microsite unpublished');
      fetchMicrosites();
    }
  };

  const filtered = (microsites ?? []).filter((m: any) =>
    (m?.projectName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (m?.builderName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Microsites</h1>
          <p className="text-white/50 mt-1">Manage all your project microsites</p>
        </div>
        <Link href="/dashboard/microsites/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c8a45e] text-black rounded-lg text-sm font-semibold hover:bg-[#d4b06a] transition shadow-sm">
          <PlusCircle className="w-4 h-4" /> New Microsite
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search microsites..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#c8a45e]/50 focus:border-[#c8a45e]/50 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#c8a45e]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#141414] border border-white/10 rounded-xl">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/60 mb-2">No microsites yet</h3>
          <p className="text-white/30 mb-4">Create your first project microsite to get started</p>
          <Link href="/dashboard/microsites/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c8a45e] text-black rounded-lg text-sm font-semibold hover:bg-[#d4b06a] transition">
            <PlusCircle className="w-4 h-4" /> Create Microsite
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((m: any, i: number) => (
            <motion.div
              key={m?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[#141414] border border-white/10 rounded-xl p-5 hover:border-white/20 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-semibold text-white truncate">{m?.projectName ?? 'Untitled'}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      m?.status === 'PUBLISHED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {m?.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-white/40 mb-2">{m?.builderName ?? ''} • {m?.location ?? ''}{m?.city ? `, ${m.city}` : ''}</p>
                  <div className="flex items-center gap-4 text-xs text-white/25">
                    <span>/{m?.slug ?? ''}</span>
                    <span>{m?._count?.leads ?? 0} leads</span>
                    <span>by {m?.createdBy?.name ?? 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {m?.status === 'PUBLISHED' && (
                    <Link href={`/${m.slug}`} target="_blank" className="p-2 text-white/30 hover:text-[#c8a45e] hover:bg-[#c8a45e]/10 rounded-lg transition" title="View live">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <button onClick={() => toggleStatus(m?.id, m?.status)} className="p-2 text-white/30 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition" title={m?.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}>
                    {m?.status === 'PUBLISHED' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Link href={`/dashboard/microsites/${m?.id}/edit`} className="p-2 text-white/30 hover:text-[#c8a45e] hover:bg-[#c8a45e]/10 rounded-lg transition" title="Edit">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(m?.id)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
