'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGsapRegister, useIsomorphicLayoutEffect } from '@/lib/gsap-client'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTASection() {
  useGsapRegister()
  const root = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.from('.cta-content', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: root.current,
          start: 'top 70%',
        }
      })

      // Floating sparkles
      gsap.to('.cta-sparkle', {
        y: -20,
        opacity: 0.7,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.3
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative bg-black py-32 px-6 md:px-12 lg:px-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10" />
      {/* CSS Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Floating elements */}
      <Sparkles className="cta-sparkle absolute top-20 left-20 w-8 h-8 text-orange-400 opacity-50" />
      <Sparkles className="cta-sparkle absolute top-40 right-32 w-6 h-6 text-pink-400 opacity-50" />
      <Sparkles className="cta-sparkle absolute bottom-32 left-40 w-10 h-10 text-purple-400 opacity-50" />

      <div className="cta-content relative mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-orange-500 font-medium text-sm">Start Learning Today</span>
        </div>

        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
          Ready to transform your{' '}
          <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            learning journey?
          </span>
        </h2>

        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto">
          Join thousands of learners who are already accelerating their growth with AI-powered companions.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/sign-up"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300">
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href="/sign-in"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold text-lg hover:border-white/40 hover:bg-white/5 transition-all duration-300">
            <span>Sign In</span>
          </Link>
        </div>

        <p className="mt-8 text-white/50 text-sm">
          No credit card required • Free forever plan available
        </p>
      </div>
    </section>
  )
}
