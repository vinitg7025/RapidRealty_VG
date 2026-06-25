'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Signup failed');
        setLoading(false);
        return;
      }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.ok) {
        router.replace('/dashboard');
      } else {
        setError('Account created. Please log in.');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 border border-[#c8a45e]/30 rounded flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#c8a45e]" />
            </div>
            <span className="font-display text-2xl tracking-wide text-white">11 Estates</span>
          </Link>
          <h1 className="font-display text-2xl text-white">Create your account</h1>
          <p className="text-white/40 mt-1 text-sm">Join 11 Estates to start creating microsites</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#141414] border border-white/5 rounded-lg p-8 space-y-5">
          {error && <div className="p-3 bg-red-900/30 border border-red-800/30 text-red-400 text-sm rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/25 focus:ring-1 focus:ring-[#c8a45e] focus:border-[#c8a45e] outline-none"
                placeholder="Your name" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/25 focus:ring-1 focus:ring-[#c8a45e] focus:border-[#c8a45e] outline-none"
                placeholder="your@email.com" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/25 focus:ring-1 focus:ring-[#c8a45e] focus:border-[#c8a45e] outline-none"
                placeholder="Min 6 characters" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#c8a45e] text-black rounded-lg font-semibold text-sm hover:bg-[#d4b068] transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
          </button>

          <p className="text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#c8a45e] hover:text-[#d4b068] font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
