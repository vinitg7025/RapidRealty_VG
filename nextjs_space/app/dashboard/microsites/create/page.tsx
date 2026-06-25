'use client';

import MicrositeForm from '@/components/dashboard/microsite-form';

export default function CreateMicrositePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Create New Microsite</h1>
        <p className="text-white/50 mt-1">Fill in the project details to generate a microsite</p>
      </div>
      <MicrositeForm />
    </div>
  );
}
