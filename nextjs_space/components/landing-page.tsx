'use client';

import { Building2, ArrowRight, Globe, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-[#c8a45e]/30 rounded flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#c8a45e]" />
            </div>
            <span className="font-display text-xl tracking-wide">11 Estates</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition">
              Sign In
            </Link>
            <Link href="/auth/signup" className="text-sm px-5 py-2 border border-[#c8a45e] text-[#c8a45e] hover:bg-[#c8a45e] hover:text-black transition font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'https://i.pinimg.com/736x/e4/16/14/e41614fd6c2931c41d4bb70d1e4b98be.jpg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c8a45e\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="relative text-center max-w-4xl mx-auto px-6">
          <p className="text-[#c8a45e] text-sm tracking-[0.3em] uppercase mb-6 font-medium">Microsite Generator</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight mb-8">
            Create <em className="text-[#c8a45e]">Premium</em><br/>
            Real Estate Microsites
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Build beautiful, high-converting property websites in minutes. Capture leads, manage projects, and close deals faster.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c8a45e] text-black font-semibold text-sm hover:bg-[#d4b068] transition">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login" className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/20 text-white/80 text-sm hover:border-white/40 hover:text-white transition">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-[#c8a45e] text-xs tracking-[0.3em] uppercase mb-4">Built for Channel Partners</p>
            <h2 className="font-display text-3xl md:text-4xl">Everything You Need,<br/><em className="text-white/60">Nothing You Don&apos;t</em></h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: 'Instant Microsites', desc: 'Fill in project details and get a professional microsite live in minutes. No coding needed.' },
              { icon: Users, title: 'Lead Capture', desc: 'Every microsite captures visitor inquiries. Get real-time leads with phone, email, and project interest.' },
              { icon: BarChart3, title: 'Lead Reports', desc: 'Download lead reports, track performance across projects, and manage your team from one dashboard.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="p-8 border border-white/5 bg-white/[0.02] hover:border-[#c8a45e]/20 transition group">
                <f.icon className="w-8 h-8 text-[#c8a45e] mb-5" strokeWidth={1.5} />
                <h3 className="font-display text-xl mb-3">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#c8a45e]" />
            <span className="font-display text-sm">11 Estates</span>
          </div>
          <p className="text-xs text-white/30">Premium real estate advisory</p>
        </div>
      </footer>
    </div>
  );
}
