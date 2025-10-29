'use client'
import Hero from '@/components/marketing/Hero'
import FeatureGrid from '@/components/marketing/FeatureGrid'
import LogosMarquee from '@/components/marketing/LogosMarquee'
import StatsStrip from '@/components/marketing/StatsStrip'
import ProductTour from '@/components/marketing/ProductTour'
import CTASection from '@/components/marketing/CTASection'
import ProgressBar from '@/components/marketing/ProgressBar'
import SmoothTransitions from '@/components/marketing/SmoothTransitions'

import { useRef } from 'react'
import { ScrollTrigger, useGsapRegister, useIsomorphicLayoutEffect } from '@/lib/gsap-client'

export default function LandingPage() {
  useGsapRegister()
  const pageRef = useRef<HTMLElement>(null)

  useIsomorphicLayoutEffect(() => {
    // Refresh ScrollTrigger after all components mount
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main ref={pageRef} className="marketing-page relative w-full min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white overflow-x-hidden">
      <SmoothTransitions />
      <ProgressBar />
      <div className="marketing-section relative z-10" data-section="hero">
        <Hero />
      </div>
      <div className="marketing-section relative z-10" data-section="logos">
        <LogosMarquee />
      </div>
      <div className="marketing-section relative z-10" data-section="features">
        <FeatureGrid />
      </div>
      <div className="marketing-section relative z-10" data-section="stats">
        <StatsStrip />
      </div>
      <div className="marketing-section relative z-10" data-section="tour">
        <ProductTour />
      </div>
      <div className="marketing-section relative z-10" data-section="cta">
        <CTASection />
      </div>
    </main>
  )
}
