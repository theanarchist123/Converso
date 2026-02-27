'use client'
import { useRef, useEffect } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { Users, Star, Globe, BookOpen } from 'lucide-react'

const STATS = [
  { icon: Users, label: 'Active Learners', value: 12800, suffix: '+', color: 'from-orange-500 to-pink-500' },
  { icon: Star, label: 'Average Rating', value: 4.9, suffix: '/5', decimals: 1, color: 'from-amber-400 to-orange-500' },
  { icon: BookOpen, label: 'AI Companions', value: 50, suffix: '+', color: 'from-purple-500 to-indigo-500' },
  { icon: Globe, label: 'Countries', value: 42, suffix: '+', color: 'from-cyan-500 to-blue-500' },
]

function CountUp({ end, decimals = 0, suffix }: { end: number; decimals?: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { damping: 30, stiffness: 100 })

  useEffect(() => {
    if (inView) motionVal.set(end)
  }, [inView, end, motionVal])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = (decimals ? v.toFixed(decimals) : Math.floor(v).toString())
      }
    })
    return unsubscribe
  }, [spring, decimals])

  return <span ref={ref}>0</span>
}

export default function StatsStrip() {
  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden">
      {/* top/bottom dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Textured panel */}
      <div className="absolute inset-4 md:inset-8 rounded-3xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
        {/* grain */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }} />
        {/* center glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-pink-500/5 to-purple-500/5" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-white/8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center lg:px-10 py-4"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-5 shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-0.5 mb-2">
                <span className={`text-5xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent tracking-tight`}>
                  <CountUp end={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                </span>
                <span className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.suffix}
                </span>
              </div>
              <div className="text-white/40 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
