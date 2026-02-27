'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Sparkles, BarChart3, BookOpen, ChevronRight } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Choose Your AI Companion',
    desc: 'Browse 50+ specialized AI tutors — from quantum physics to creative writing. Each companion is uniquely crafted with a distinct personality and teaching style that matches your vibe.',
    tags: ['50+ Companions', 'Any Subject', 'Any Level'],
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=700&q=85&auto=format&fit=crop',
    color: 'from-orange-500 to-pink-500',
    glow: 'rgba(249,115,22,0.15)',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Start a Personalized Session',
    desc: 'Jump into a conversation that adapts in real time. Your companion reads your pace, detects confusion, adjusts explanations — and keeps things engaging with examples that click.',
    tags: ['Adaptive AI', 'Real-time Feedback', 'Natural Dialogue'],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&q=85&auto=format&fit=crop',
    color: 'from-purple-500 to-violet-500',
    glow: 'rgba(168,85,247,0.15)',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Track Your Growth',
    desc: 'After every session, see exactly what you learned — mastery scores, time breakdowns, topic coverage maps, and streak momentum. Watch your knowledge compound over weeks.',
    tags: ['Live Analytics', 'Mastery Maps', 'Streak Tracking'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=85&auto=format&fit=crop',
    color: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.15)',
  },
  {
    number: '04',
    icon: BookOpen,
    title: 'Review & Reinforce',
    desc: 'Converso auto-generates smart recaps, flashcard decks, and spaced repetition reminders. Learning doesn\'t end when the session does — it just gets smarter.',
    tags: ['Smart Recaps', 'Spaced Repetition', 'Auto Flashcards'],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&q=85&auto=format&fit=crop',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.15)',
  },
]

export default function ProductTour() {
  const [active, setActive] = useState(0)
  const step = STEPS[active]

  return (
    <section className="relative py-28 bg-[#050505] overflow-hidden" id="how-it-works">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* ambient glow follows active step */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-all duration-700"
        style={{ background: step.glow }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/25 bg-orange-500/8 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-400 text-xs font-semibold uppercase tracking-wider">How it works</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Four steps to{' '}
            <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              accelerated learning.
            </span>
          </h2>
        </motion.div>

        {/* Interactive panel */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Step selector tabs */}
          <div className="flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <motion.button
                key={i}
                onClick={() => setActive(i)}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left rounded-2xl border p-5 transition-all duration-300 group ${active === i
                    ? 'border-white/15 bg-white/[0.06] shadow-lg'
                    : 'border-white/6 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
                  }`}
              >
                <div className="flex items-start gap-4">
                  {/* Number pill */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${active === i
                      ? `bg-gradient-to-br ${s.color} text-white shadow-lg`
                      : 'bg-white/5 text-white/30'
                    }`}>
                    {s.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold text-base transition-colors duration-200 ${active === i ? 'text-white' : 'text-white/50 group-hover:text-white/70'}`}>
                        {s.title}
                      </h3>
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${active === i ? 'text-white/70 rotate-90' : 'text-white/20 group-hover:text-white/40'}`} />
                    </div>
                    <AnimatePresence initial={false}>
                      {active === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="text-white/50 text-sm leading-relaxed mt-2 mb-3">{s.desc}</p>
                          <div className="flex flex-wrap gap-2">
                            {s.tags.map((tag) => (
                              <span key={tag} className={`px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}
                                style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Image panel */}
          <div className="relative lg:sticky lg:top-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60"
              >
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Bottom overlay content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r ${step.color} shadow-lg`}>
                    <step.icon className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-semibold">{step.title}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Step progress dots */}
            <div className="flex justify-center gap-2 mt-5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${active === i ? 'w-8 bg-orange-500' : 'w-3 bg-white/20 hover:bg-white/30'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
