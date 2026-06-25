'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import MicrositeForm from '@/components/dashboard/microsite-form';

export default function EditMicrositePage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/microsites/${params.id}`)
        .then((r) => r.json())
        .then((d) => setData(d?.microsite))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params?.id]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#c8a45e]" /></div>;
  if (!data) return <div className="text-center py-20 text-white/40">Microsite not found</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Edit Microsite</h1>
        <p className="text-white/50 mt-1">Update {data?.projectName ?? 'project'} details</p>
      </div>
      <MicrositeForm initialData={data} isEdit />
    </div>
  );
}
