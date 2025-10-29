'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGsapRegister, useIsomorphicLayoutEffect } from '@/lib/gsap-client'
import { Sparkles, MessageSquare, BarChart3, BookOpen } from 'lucide-react'

const TOUR_STEPS = [
  {
    icon: MessageSquare,
    title: 'Start a Conversation',
    desc: 'Choose your AI companion and begin learning through natural dialogue.',
    image: '💬',
  },
  {
    icon: Sparkles,
    title: 'Get Real-time Guidance',
    desc: 'Receive instant feedback, explanations, and personalized recommendations.',
    image: '✨',
  },
  {
    icon: BarChart3,
    title: 'Track Your Progress',
    desc: 'Monitor your learning journey with detailed analytics and insights.',
    image: '📊',
  },
  {
    icon: BookOpen,
    title: 'Review & Reinforce',
    desc: 'Access auto-generated recaps and spaced repetition for lasting retention.',
    image: '📚',
  },
]

export default function ProductTour() {
  useGsapRegister()
  const root = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Title animation
      gsap.from('.tour-title', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: '.tour-title',
          start: 'top 85%',
        }
      })

      // Simple staggered reveal animation for steps
      gsap.from('.tour-step', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.2,
        scrollTrigger: {
          trigger: root.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      })

      // Add hover effects for each step
      document.querySelectorAll('.tour-step').forEach((step) => {
        const icon = step.querySelector('.step-icon')
        const emoji = step.querySelector('.step-emoji')
        
        step.addEventListener('mouseenter', () => {
          gsap.to(step, { scale: 1.02, duration: 0.3, ease: 'power2.out' })
          gsap.to(icon, { scale: 1.1, rotation: 5, duration: 0.3, ease: 'back.out(1.7)' })
          gsap.to(emoji, { scale: 1.1, rotation: -5, duration: 0.3, ease: 'back.out(1.7)' })
        })
        
        step.addEventListener('mouseleave', () => {
          gsap.to(step, { scale: 1, duration: 0.3, ease: 'power2.out' })
          gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' })
          gsap.to(emoji, { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' })
        })
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative bg-gradient-to-b from-gray-900 to-black py-32" id="tour">
      <div className="w-full px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="tour-title text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              How it works
            </h2>
            <p className="text-xl text-white/60">
              Your learning journey in four simple steps
            </p>
          </div>

          {/* Clean grid layout - no overlapping */}
          <div className="grid gap-16 lg:gap-24">
            {TOUR_STEPS.map((step, i) => (
              <div key={i} 
                   className={`tour-step flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-16 lg:gap-20`}>
                {/* Image/Icon */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-pink-500/20 blur-3xl scale-150 group-hover:scale-[1.7] transition-transform duration-300" />
                    <div className="step-emoji relative text-7xl md:text-8xl lg:text-9xl">
                      {step.image}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left space-y-6">
                  <div className="inline-flex items-center gap-3">
                    <div className="step-icon p-3 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/25">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-orange-400 uppercase tracking-wider">
                      Step {i + 1}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
