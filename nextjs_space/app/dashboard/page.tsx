'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Building2, FileText, Phone, TrendingUp, PlusCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { data: session } = useSession() || {};
  const [stats, setStats] = useState<any>({ microsites: 0, leads: 0, published: 0, drafts: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d ?? {}); })
      .catch(() => {});
    fetch('/api/leads?limit=5')
      .then((r) => r.json())
      .then((d) => { setRecentLeads(d?.leads ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Microsites', value: stats?.microsites ?? 0, icon: FileText, color: 'gold' },
    { label: 'Published', value: stats?.published ?? 0, icon: Eye, color: 'green' },
    { label: 'Draft', value: stats?.drafts ?? 0, icon: Building2, color: 'amber' },
    { label: 'Total Leads', value: stats?.leads ?? 0, icon: Phone, color: 'purple' },
  ];

  const colorMap: any = {
    gold: 'bg-[#c8a45e]/15 text-[#c8a45e]',
    green: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    purple: 'bg-purple-500/15 text-purple-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-white/50 mt-1">Welcome back, {session?.user?.name ?? 'User'}</p>
        </div>
        <Link href="/dashboard/microsites/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c8a45e] text-black rounded-lg text-sm font-semibold hover:bg-[#d4b06a] transition shadow-sm">
          <PlusCircle className="w-4 h-4" /> New Microsite
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#141414] border border-white/10 rounded-xl p-5"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[s.color]}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-white/50 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#141414] border border-white/10 rounded-xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display font-semibold text-white">Recent Leads</h2>
          <Link href="/dashboard/leads" className="text-sm text-[#c8a45e] hover:text-[#d4b06a] font-medium">View all</Link>
        </div>
        {(recentLeads?.length ?? 0) === 0 ? (
          <div className="p-8 text-center text-white/30">No leads yet. Publish a microsite to start capturing leads.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {(recentLeads ?? []).map((lead: any) => (
              <div key={lead?.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{lead?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-white/40">{lead?.phone ?? ''} • {lead?.email ?? ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-[#c8a45e]">{lead?.microsite?.projectName ?? ''}</p>
                  <p className="text-xs text-white/30">{lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
