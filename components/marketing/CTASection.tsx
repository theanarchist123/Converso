'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Sparkles, Users } from 'lucide-react'

const CTA_IMAGE = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=85&auto=format&fit=crop'

export default function CTASection() {
  return (
    <section className="relative py-12 px-6 md:px-10 lg:px-16 bg-[#050505] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="relative max-w-[1400px] mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">

          {/* Background split */}
          <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2">
            {/* Left: dark gradient */}
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111]" />
            {/* Right: Unsplash image */}
            <div className="relative hidden lg:block">
              <Image
                src={CTA_IMAGE}
                alt="Team celebrating success together"
                fill
                className="object-cover"
                unoptimized
              />
              {/* Overlay so left content has enough contrast border */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          </div>

          {/* Grid pattern on left half */}
          <div className="absolute inset-0 lg:w-1/2 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Orange glow blob in corner */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 grid lg:grid-cols-2">
            {/* LEFT: Main CTA content */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-center p-10 md:p-14 lg:p-16 gap-8"
            >
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2.5 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-400 text-sm font-semibold">Start Learning Today — It&apos;s Free</span>
              </div>

              <div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
                  Ready to become unstoppable?
                </h2>
                <p className="mt-5 text-lg text-white/50 leading-relaxed max-w-md">
                  Join 10,000+ learners already accelerating their growth. No credit card required. Cancel anytime. Get your first session FREE.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className="group relative overflow-hidden flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold text-base shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.03] transition-all duration-200"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>
                <Link
                  href="/sign-in"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/12 text-white/70 hover:text-white hover:border-white/25 hover:bg-white/5 font-semibold text-base transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>

              {/* Social proof row */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-white/8">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d'].map((id, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] overflow-hidden">
                        <Image
                          src={`https://images.unsplash.com/photo-${id}?w=60&q=80&auto=format&fit=crop&crop=face`}
                          alt="User"
                          width={28}
                          height={28}
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                    </div>
                    <div className="text-white/35 text-[11px]">10K+ happy learners</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-white/30" />
                  <span className="text-white/40 text-sm">No credit card required</span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Floating social proof cards (visible on top of image on lg) */}
            <div className="hidden lg:flex items-center justify-center p-16 relative">
              {/* Floating achievement card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute top-12 right-8 w-52 rounded-2xl border border-white/15 bg-[#0a0a0a]/70 p-4 shadow-xl"
                style={{ backdropFilter: 'blur(20px)' }}
              >
                <div className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-2">Achievement Unlocked</div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-base flex-shrink-0">🏆</div>
                  <div>
                    <div className="text-white text-xs font-bold">Physics Master</div>
                    <div className="text-white/40 text-[10px]">Top 1% this month</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating review card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute bottom-16 left-4 w-60 rounded-2xl border border-white/15 bg-[#0a0a0a]/70 p-4 shadow-xl"
                style={{ backdropFilter: 'blur(20px)' }}
              >
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-white/60 text-[11px] leading-relaxed italic">&ldquo;The best learning app I&apos;ve ever used. Period.&rdquo;</p>
                <div className="mt-2 text-white/35 text-[10px]">— Lena F., Cambridge</div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom fine print */}
        <p className="mt-6 text-center text-white/20 text-xs">
          Free forever plan available · No credit card required · GDPR compliant
        </p>
      </div>
    </section>
  )
}
