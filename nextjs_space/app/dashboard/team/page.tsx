'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Shield, UserMinus, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function TeamPage() {
  const { data: session } = useSession() || {};
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    fetch('/api/team')
      .then((r) => r.json())
      .then((d) => setUsers(d?.users ?? []))
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'TEAM_MEMBER' : 'ADMIN';
    const res = await fetch(`/api/team/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success('Role updated');
      fetchUsers();
    } else {
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return;
    const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Team member removed');
      fetchUsers();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data?.error ?? 'Failed to remove');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Team Members</h1>
        <p className="text-white/50 mt-1">Manage team access and roles</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#c8a45e]" /></div>
      ) : (
        <div className="grid gap-4">
          {(users ?? []).map((u: any, i: number) => (
            <motion.div
              key={u?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[#141414] border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#c8a45e]/15 rounded-full flex items-center justify-center text-sm font-semibold text-[#c8a45e]">
                    {(u?.name ?? 'U')[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{u?.name ?? 'Unknown'}</p>
                      {u?.role === 'ADMIN' && (
                        <span className="px-2 py-0.5 bg-[#c8a45e]/15 text-[#c8a45e] text-xs rounded-full font-medium flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/40">{u?.email ?? ''}</p>
                    <p className="text-xs text-white/25 mt-1">{u?._count?.microsites ?? 0} microsites</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleRole(u?.id, u?.role)}
                    className="p-2 text-white/30 hover:text-[#c8a45e] hover:bg-[#c8a45e]/10 rounded-lg transition" title="Toggle role">
                    <Shield className="w-4 h-4" />
                  </button>
                  {(session?.user as any)?.id !== u?.id && (
                    <button onClick={() => handleRemove(u?.id, u?.name ?? '')}
                      className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition" title="Remove">
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
