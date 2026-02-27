'use client'
import { motion } from 'framer-motion'
import { Brain, Zap, BarChart3, MessageSquare, BookOpen, Target, Globe, Mic } from 'lucide-react'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}

const card = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

// Animated bar chart for progress card
function MiniBarChart() {
  const bars = [55, 70, 45, 80, 65, 90, 78, 95]
  return (
    <div className="flex gap-1.5 items-end h-14 mt-4">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
          className="flex-1 rounded-sm bg-gradient-to-t from-orange-500/60 to-pink-500/40"
        />
      ))}
    </div>
  )
}

// Animated chat bubble for AI card
function ChatBubbles() {
  return (
    <div className="mt-4 space-y-2">
      {[
        { text: 'Explain quantum superposition', align: 'right', color: 'from-orange-500/20 to-pink-500/20' },
        { text: 'Imagine a coin spinning — it\'s both heads and tails until observed!', align: 'left', color: 'from-white/5 to-white/3' },
        { text: 'That\'s brilliant, can we explore Schrödinger\'s cat?', align: 'right', color: 'from-orange-500/20 to-pink-500/20' },
      ].map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: msg.align === 'right' ? 16 : -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.18, duration: 0.5 }}
          className={`flex ${msg.align === 'right' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[85%] px-3 py-2 rounded-xl bg-gradient-to-br ${msg.color} border border-white/8 text-white/65 text-[11px] leading-relaxed`}>
            {msg.text}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

const SMALL_FEATURES = [
  {
    icon: Target,
    title: 'Goal Tracking',
    desc: 'Set milestones and celebrate every achievement on your path.',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'from-cyan-500 to-blue-500',
  },
  {
    icon: BookOpen,
    title: 'Smart Recaps',
    desc: 'Auto-generated summaries with spaced repetition for lasting retention.',
    gradient: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'from-violet-500 to-purple-500',
  },
  {
    icon: Mic,
    title: 'Voice Learning',
    desc: 'Speak naturally with your AI companion during every session.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Globe,
    title: '42 Languages',
    desc: 'Learn in your native language or practice a new one.',
    gradient: 'from-rose-500/20 to-orange-500/20',
    iconColor: 'from-rose-500 to-orange-500',
  },
]

export default function FeatureGrid() {
  return (
    <section className="relative py-28 bg-[#050505] overflow-hidden" id="features">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/8 mb-5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Everything you need</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Features built for{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              real learning.
            </span>
          </h2>
          <p className="mt-5 text-lg text-white/45 leading-relaxed">
            Not just another flashcard app. Converso is an intelligent companion that understands how you think.
          </p>
        </motion.div>

        {/* BENTO GRID */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* LARGE CARD 1: AI Companion Chat — spans 1 col, 2 rows */}
          <motion.div
            variants={card}
            className="md:row-span-2 relative rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-7 overflow-hidden group hover:border-white/15 transition-all duration-300"
            whileHover={{ y: -4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center mb-5 shadow-lg shadow-orange-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Learning</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Personalized companions that adapt moment-to-moment, guiding you through complex topics with clarity.
              </p>
              <ChatBubbles />
            </div>
          </motion.div>

          {/* LARGE CARD 2: Progress Analytics — spans 1 col, 2 rows */}
          <motion.div
            variants={card}
            className="md:row-span-2 relative rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-7 overflow-hidden group hover:border-white/15 transition-all duration-300"
            whileHover={{ y: -4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-500/20">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Deep Progress Analytics</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Track streaks, mastery scores, time invested, and topic coverage — visualized in real time.
              </p>
              <MiniBarChart />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Mastery', value: '87%' },
                  { label: 'Sessions', value: '142' },
                  { label: 'Streak', value: '14d' },
                  { label: 'Rating', value: '4.9★' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/[0.04] border border-white/6 p-3">
                    <div className="text-white/35 text-[10px] uppercase tracking-wider">{s.label}</div>
                    <div className="text-white font-bold text-base mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* SMALL CARDS: 4 across the right column */}
          {SMALL_FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={card}
              className={`relative rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 overflow-hidden group hover:border-white/15 transition-all duration-300`}
              whileHover={{ y: -3, scale: 1.01 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.iconColor} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.icon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* Wide card: Real-time Guidance */}
          <motion.div
            variants={card}
            className="lg:col-span-3 md:col-span-2 relative rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-7 overflow-hidden group hover:border-white/15 transition-all duration-300 flex flex-col md:flex-row gap-8 items-center"
            whileHover={{ y: -3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/6 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex-1">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-time Guidance & Feedback</h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-md">
                Get instant, contextual answers powered by cutting-edge AI. Your companion knows when you&apos;re stuck before you even ask.
              </p>
            </div>
            <div className="relative flex-1 flex justify-end items-center gap-3">
              {['Instant Answers', 'Adaptive Difficulty', 'Context-Aware', 'Multilingual'].map((tag, i) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                  className="px-4 py-2 rounded-full border border-white/8 bg-white/[0.04] text-white/55 text-xs font-medium whitespace-nowrap"
                >
                  {tag}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
