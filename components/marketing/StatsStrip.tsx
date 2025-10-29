'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGsapRegister, useIsomorphicLayoutEffect } from '@/lib/gsap-client'
import { Users, Star, Globe } from 'lucide-react'

const STATS = [
  { icon: Users, label: 'Active learners', value: 12800, suffix: '+' },
  { icon: Star, label: 'Average rating', value: 4.9, suffix: '/5', decimals: 1 },
  { icon: Globe, label: 'Countries', value: 42, suffix: '+' },
]

export default function StatsStrip() {
  useGsapRegister()
  const root = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>('.stat-val').forEach((el) => {
        const end = Number(el.dataset.value)
        const decimals = Number(el.dataset.decimals) || 0
        
        gsap.fromTo(el, 
          { textContent: 0 }, 
          {
            textContent: end,
            snap: { textContent: decimals === 0 ? 1 : 0.1 },
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: { 
              trigger: el, 
              start: 'top 85%',
              once: true
            },
            onUpdate: function() {
              const val = Number(this.targets()[0].textContent)
              el.textContent = decimals === 0 ? Math.floor(val).toString() : val.toFixed(decimals)
            }
          }
        )
      })

      // Icon float animation
      gsap.from('.stat-icon', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: root.current,
          start: 'top 80%',
          once: true
        }
      })
    }, root)
    
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative bg-gradient-to-b from-black to-gray-900 py-20 border-y border-white/10">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="relative w-full px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {STATS.map((stat) => (
            <div key={stat.label} className="group">
              <div className="stat-icon inline-flex p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-8 h-8 text-orange-400" />
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <div className="stat-val text-5xl font-bold text-white" 
                     data-value={stat.value}
                     data-decimals={stat.decimals || 0}>
                  0
                </div>
                <span className="text-3xl font-bold text-white/80">{stat.suffix}</span>
              </div>
              <div className="mt-3 text-lg text-white/60 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
