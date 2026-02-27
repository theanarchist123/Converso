'use client'
import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, Star, Zap } from 'lucide-react'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=85&auto=format&fit=crop'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

const imageVariants = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 } }
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden bg-[#050505]">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full bg-orange-600/8 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-pink-600/6 blur-[120px]" />
        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* LEFT: Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8"
          >
            {/* Announcement badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-orange-500/25 bg-orange-500/8">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-400 text-sm font-semibold tracking-wide">AI-Powered Learning Platform</span>
              </div>
            </motion.div>

            {/* Headline */}
            <div className="flex flex-col gap-3">
              <motion.h1
                variants={itemVariants}
                className="text-[56px] md:text-[68px] lg:text-[76px] font-extrabold leading-[1.05] tracking-tighter text-white"
              >
                <span className="block">Learn Anything.</span>
                <span className="block">
                  <span className="relative">
                    <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                      Master Everything.
                    </span>
                    {/* Underline accent */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 to-pink-500 rounded-full origin-left"
                    />
                  </span>
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-white/55 leading-relaxed max-w-lg mt-3"
              >
                Your personal AI companion adapts to your unique learning style — delivering real-time guidance, instant feedback, and smart progress tracking in every session.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 items-center">
              <Link
                href="/sign-up"
                className="group relative overflow-hidden flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold text-base shadow-xl shadow-orange-500/25 hover:shadow-orange-500/45 hover:scale-[1.03] transition-all duration-200"
              >
                <span>Start Learning Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>

              <Link
                href="#how-it-works"
                className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl border border-white/12 text-white/75 hover:text-white hover:border-white/25 hover:bg-white/[0.04] font-semibold text-base transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </Link>
            </motion.div>

            {/* Social proof - avatars + rating */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2.5">
                {[
                  'photo-1535713875002-d1d0cf377fde',
                  'photo-1494790108377-be9c29b29330',
                  'photo-1507003211169-0a1dd7228f2d',
                  'photo-1438761681033-6461ffad8d80',
                ].map((id, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#050505] overflow-hidden ring-1 ring-white/10">
                    <Image
                      src={`https://images.unsplash.com/${id}?w=80&q=80&auto=format&fit=crop&crop=face`}
                      alt="User"
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-[#050505] bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-white/10">
                  10K+
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/40 text-xs mt-0.5">
                  <span className="text-white/70 font-semibold">4.9/5</span> from 10,000+ learners
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: Image + Floating cards */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Main image container */}
            <div className="relative w-full max-w-[580px] aspect-[4/4.5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
              <Image
                src={HERO_IMAGE}
                alt="Students collaborating and learning together"
                fill
                className="object-cover scale-105"
                priority
                unoptimized
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#050505]/30 via-transparent to-transparent" />
            </div>

            {/* Floating card 1: Active Session */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -left-8 top-16 w-56 rounded-2xl border border-white/10 bg-white/[0.06] p-4"
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-xs font-semibold">Live Session</div>
                  <div className="text-white/40 text-[10px]">AI Companion Active</div>
                </div>
                <div className="ml-auto flex h-2 w-2">
                  <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative rounded-full h-2 w-2 bg-green-500" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-white/50 text-[10px] bg-white/5 rounded-lg px-3 py-2 leading-relaxed">
                  &quot;Great progress! Let&apos;s now explore quantum entanglement...&quot;
                </div>
                <div className="w-3/4 h-2 bg-orange-500/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '68%' }}
                    transition={{ delay: 1.2, duration: 1.4, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Floating card 2: Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -right-8 bottom-24 w-48 rounded-2xl border border-white/10 bg-white/[0.06] p-4"
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <div className="text-white/50 text-[10px] font-medium mb-2 uppercase tracking-wider">This Week</div>
              <div className="text-white text-2xl font-bold">+42%</div>
              <div className="text-white/40 text-[10px] mb-3">Learning speed</div>
              <div className="flex gap-1 items-end h-8">
                {[40, 55, 35, 70, 60, 85, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1.2 + i * 0.07, duration: 0.4 }}
                    className="flex-1 rounded-sm bg-gradient-to-t from-orange-500 to-pink-500 opacity-80"
                  />
                ))}
              </div>
            </motion.div>

            {/* Floating badge: streak */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.5, ease: 'backOut' }}
              className="absolute top-8 right-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10"
              style={{ backdropFilter: 'blur(16px)' }}
            >
              <span className="text-base">🔥</span>
              <div>
                <div className="text-amber-400 text-xs font-bold">14-day streak</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
          <span className="text-white/25 text-[10px] uppercase tracking-widest">Scroll</span>
        </motion.div>
      </div>
    </section>
  )
}
