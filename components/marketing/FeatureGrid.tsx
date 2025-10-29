'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGsapRegister, useIsomorphicLayoutEffect } from '@/lib/gsap-client'
import { Brain, Zap, BarChart3, MessageSquare, BookOpen, Target } from 'lucide-react'

const FEATURES = [
  { 
    icon: Brain, 
    title: 'AI-Powered Learning', 
    desc: 'Personalized companions that adapt to your unique learning style and pace.',
    gradient: 'from-orange-500 to-pink-500'
  },
  { 
    icon: Zap, 
    title: 'Real-time Guidance', 
    desc: 'Get instant feedback and answers powered by Supabase Realtime technology.',
    gradient: 'from-pink-500 to-purple-500'
  },
  { 
    icon: BarChart3, 
    title: 'Progress Analytics', 
    desc: 'Track your growth with detailed insights, streaks, and mastery metrics.',
    gradient: 'from-purple-500 to-indigo-500'
  },
  { 
    icon: MessageSquare, 
    title: 'Interactive Sessions', 
    desc: 'Engage in conversations that feel natural and help you learn better.',
    gradient: 'from-indigo-500 to-blue-500'
  },
  { 
    icon: BookOpen, 
    title: 'Smart Recaps', 
    desc: 'Auto-generated summaries and spaced repetition to reinforce learning.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    icon: Target, 
    title: 'Goal Tracking', 
    desc: 'Set objectives, monitor progress, and celebrate achievements along the way.',
    gradient: 'from-cyan-500 to-teal-500'
  },
]

export default function FeatureGrid() {
  useGsapRegister()
  const root = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    
    const ctx = gsap.context(() => {
      // Title animation
      gsap.from('.feature-title', {
        y: 30, 
        opacity: 0, 
        duration: 0.8, 
        ease: 'power3.out',
        scrollTrigger: { 
          trigger: '.feature-title', 
          start: 'top 80%' 
        }
      })

      // Cards stagger animation
      gsap.from('.ft-card', {
        y: 50, 
        opacity: 0, 
        duration: 0.7, 
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: { 
          trigger: root.current, 
          start: 'top 70%' 
        }
      })

      // Hover effect for cards
      document.querySelectorAll('.ft-card').forEach((card) => {
        const icon = card.querySelector('.ft-icon')
        
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out' })
          gsap.to(icon, { scale: 1.1, rotate: 5, duration: 0.3, ease: 'back.out(1.7)' })
        })
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' })
          gsap.to(icon, { scale: 1, rotate: 0, duration: 0.3, ease: 'power2.out' })
        })
      })
    }, root)
    
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative bg-gradient-to-b from-transparent via-purple-500/10 to-transparent py-32 px-6 md:px-12 lg:px-16" id="features">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent -z-10" />
      
      <div className="w-full">
        <div className="text-center mb-16">
          <h2 className="feature-title text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Everything you need to excel
          </h2>
          <p className="feature-title mt-6 text-xl text-white/60 max-w-2xl mx-auto">
            Powerful features designed to accelerate your learning journey
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title}
                 className="ft-card group relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 hover:bg-white/[0.05] transition-colors cursor-pointer">
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`ft-icon inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/70 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
