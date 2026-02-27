'use client'
import { motion } from 'framer-motion'

const ROW1 = [
  { name: 'OpenAI', icon: '⬛', color: '#fff' },
  { name: 'Google Gemini', icon: '✦', color: '#4285F4' },
  { name: 'Supabase', icon: '⚡', color: '#3ECF8E' },
  { name: 'Vercel', icon: '▲', color: '#fff' },
  { name: 'MongoDB', icon: '🍃', color: '#47A248' },
  { name: 'Clerk', icon: '🔐', color: '#6C47FF' },
  { name: 'Anthropic', icon: '◆', color: '#CC785C' },
  { name: 'Next.js', icon: 'N', color: '#fff' },
]

const ROW2 = [
  { name: 'MIT', icon: '🎓' },
  { name: 'Stanford', icon: '🌲' },
  { name: 'Harvard', icon: '📚' },
  { name: 'Oxford', icon: '🏛️' },
  { name: 'Cambridge', icon: '🎯' },
  { name: 'IIT Bombay', icon: '🚀' },
  { name: 'NUS Singapore', icon: '🦁' },
  { name: 'Columbia', icon: '🏙️' },
]

function MarqueeTrack({ items, direction = 'left', speed = 40 }: { items: typeof ROW1; direction?: 'left' | 'right'; speed?: number }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden mask-x">
      <div
        className="flex gap-4 w-max"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border border-white/8 bg-white/[0.03] whitespace-nowrap hover:bg-white/[0.06] hover:border-white/15 transition-all cursor-default"
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-white/55 text-sm font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LogosMarquee() {
  return (
    <section className="relative py-20 bg-[#050505] overflow-hidden">
      {/* Divider line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 mb-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-white/35 text-sm font-medium uppercase tracking-[0.2em]"
        >
          Powered by industry leaders · Trusted at top institutions
        </motion.p>
      </div>

      <div className="flex flex-col gap-4">
        <MarqueeTrack items={ROW1} direction="left" speed={45} />
        <MarqueeTrack items={ROW2} direction="right" speed={38} />
      </div>

      {/* fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none z-10" />

      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
