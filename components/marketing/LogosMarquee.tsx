'use client'
import { useRef } from 'react'
import { gsap, useGsapRegister, useIsomorphicLayoutEffect } from '@/lib/gsap-client'

const PARTNERS = [
  { name: 'OpenAI', logo: '🤖' },
  { name: 'Google Gemini', logo: '✨' },
  { name: 'Supabase', logo: '⚡' },
  { name: 'MongoDB', logo: '🍃' },
  { name: 'Vercel', logo: '▲' },
  { name: 'Clerk', logo: '🔐' },
]

export default function LogosMarquee() {
  useGsapRegister()
  const track = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!track.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.marquee-item')
      const tween = gsap.to(items, {
        xPercent: -100,
        repeat: -1,
        duration: 25,
        ease: 'none',
        modifiers: {
          xPercent: gsap.utils.wrap(-100, 0)
        }
      })
      
      const el = track.current!
      el.addEventListener('mouseenter', () => gsap.to(tween, { timeScale: 0.3, duration: 0.5 }))
      el.addEventListener('mouseleave', () => gsap.to(tween, { timeScale: 1, duration: 0.5 }))
    }, track)
    
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative bg-gradient-to-b from-transparent via-white/[0.02] to-transparent py-16 border-y border-white/5">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-white/50 uppercase tracking-wider">Powered by industry leaders</p>
      </div>
      
      <div ref={track} className="overflow-hidden">
        <div className="flex gap-16 will-change-transform">
          {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, i) => (
            <div key={i} 
                 className="marquee-item shrink-0 flex items-center gap-3 px-6 py-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
              <span className="text-3xl">{partner.logo}</span>
              <span className="text-white/70 font-medium whitespace-nowrap">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
