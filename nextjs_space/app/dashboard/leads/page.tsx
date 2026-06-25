'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Phone, Mail, Download, Search, Loader2, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function LeadsPage() {
  const { data: session } = useSession() || {};
  const role = (session?.user as any)?.role ?? 'TEAM_MEMBER';
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [microsites, setMicrosites] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    const params = selectedProject ? `?micrositeId=${selectedProject}` : '';
    fetch(`/api/leads${params}`)
      .then((r) => r.json())
      .then((d) => setLeads(d?.leads ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedProject]);

  useEffect(() => {
    fetch('/api/microsites')
      .then((r) => r.json())
      .then((d) => setMicrosites(d?.microsites ?? []))
      .catch(() => {});
  }, []);

  const handleExport = () => {
    const params = selectedProject ? `?micrositeId=${selectedProject}` : '';
    const a = document.createElement('a');
    a.href = `/api/leads/export${params}`;
    a.download = 'leads.csv';
    a.click();
  };

  const filtered = (leads ?? []).filter((l: any) =>
    (l?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (l?.phone ?? '').includes(search) ||
    (l?.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (l?.microsite?.projectName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Leads</h1>
          <p className="text-white/50 mt-1">All inquiry submissions from your microsites</p>
        </div>
        {role === 'ADMIN' && (
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#c8a45e]/50 focus:border-[#c8a45e]/50 outline-none" />
        </div>
        <select value={selectedProject} onChange={(e) => { setSelectedProject(e.target.value); setLoading(true); }}
          className="px-4 py-2.5 bg-[#141414] border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-[#c8a45e]/50 outline-none">
          <option value="">All Projects</option>
          {(microsites ?? []).map((m: any) => (
            <option key={m?.id} value={m?.id}>{m?.projectName ?? ''}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#c8a45e]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#141414] border border-white/10 rounded-xl">
          <Phone className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/60">No leads yet</h3>
          <p className="text-white/30">Leads will appear here when visitors submit inquiry forms</p>
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-5 py-3 font-medium text-white/50">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-white/50">Phone</th>
                  <th className="text-left px-5 py-3 font-medium text-white/50">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-white/50">Project</th>
                  <th className="text-left px-5 py-3 font-medium text-white/50">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((l: any, i: number) => (
                  <motion.tr key={l?.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-white/5">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#c8a45e]/15 rounded-full flex items-center justify-center text-xs font-semibold text-[#c8a45e]">
                          {(l?.name ?? 'U')[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{l?.name ?? ''}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/60">{l?.phone ?? ''}</td>
                    <td className="px-5 py-3.5 text-white/60">{l?.email ?? '-'}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-1 bg-[#c8a45e]/15 text-[#c8a45e] text-xs rounded-md font-medium">{l?.microsite?.projectName ?? ''}</span>
                    </td>
                    <td className="px-5 py-3.5 text-white/30 text-xs">{l?.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
