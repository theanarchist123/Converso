'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGsapRegister, useIsomorphicLayoutEffect } from '@/lib/gsap-client'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function Hero() {
  useGsapRegister()
  const root = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } })
      tl.from('.hero-kicker', { y: 20, opacity: 0 })
        .from('.hero-line', { yPercent: 100, opacity: 0, stagger: 0.08 }, '-=0.3')
        .from('.hero-subtitle', { y: 20, opacity: 0 }, '-=0.4')
        .from('.hero-cta', { y: 20, opacity: 0, stagger: 0.1 }, '-=0.2')

      // Parallax background blob
      gsap.to('.hero-blob', {
        yPercent: 30,
        xPercent: -10,
        scale: 1.1,
        rotate: 5,
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      })

      // Floating animation for decorative elements
      gsap.to('.float-elem', {
        y: -20,
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
    <section ref={root} className="relative bg-black pt-32 pb-24 min-h-screen flex items-center">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="hero-blob absolute top-0 right-0 w-[600px] h-[600px] opacity-30"
             style={{
               background: 'radial-gradient(circle, #ff7a18 0%, #ff0076 50%, transparent 70%)',
               filter: 'blur(80px)'
             }} />
        <div className="hero-blob absolute bottom-0 left-0 w-[500px] h-[500px] opacity-20"
             style={{
               background: 'radial-gradient(circle, #6366f1 0%, #8b5cf6 50%, transparent 70%)',
               filter: 'blur(80px)'
             }} />
      </div>

      {/* Floating decorative elements */}
      <div className="float-elem absolute top-40 right-20 w-20 h-20 rounded-full bg-orange-500/10 blur-xl" />
      <div className="float-elem absolute bottom-40 left-20 w-32 h-32 rounded-full bg-purple-500/10 blur-xl" />

      <div className="w-full px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between mb-8">
          <div className="hero-kicker inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-orange-500 font-medium text-sm">Converso AI Learning Platform</span>
          </div>
          
          {/* Sign In Button - Always visible */}
          <Link href="/sign-in" 
                className="hero-cta px-6 py-2.5 rounded-lg border border-white/20 text-white/90 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300 font-medium">
            Sign In
          </Link>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] tracking-tight overflow-hidden">
            <div className="overflow-hidden">
              <span className="hero-line inline-block bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Learn faster,
              </span>
            </div>
            <div className="overflow-hidden">
              <span className="hero-line inline-block text-white mt-2">
                smarter, better.
              </span>
            </div>
          </h1>
          
          <p className="hero-subtitle mt-8 max-w-2xl text-xl md:text-2xl text-white/70 leading-relaxed">
            Your personal AI companion that adapts to your learning style. Real-time guidance, 
            instant feedback, and progress tracking—all in one place.
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/sign-up" 
                  className="hero-cta group relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-4 font-semibold text-white shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 flex items-center gap-2">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href="#features" 
                  className="hero-cta group rounded-xl border-2 border-white/20 px-8 py-4 font-semibold text-white/90 hover:border-white/40 hover:bg-white/5 transition-all duration-300 flex items-center gap-2">
              <span>Explore Features</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-subtitle mt-16 flex flex-wrap gap-8 text-sm">
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-white/60 mt-1">Active Learners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4.9/5</div>
              <div className="text-white/60 mt-1">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-white/60 mt-1">AI Companions</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
