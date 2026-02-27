'use client'
import MarketingNav from '@/components/marketing/MarketingNav'
import Hero from '@/components/marketing/Hero'
import LogosMarquee from '@/components/marketing/LogosMarquee'
import FeatureGrid from '@/components/marketing/FeatureGrid'
import StatsStrip from '@/components/marketing/StatsStrip'
import ProductTour from '@/components/marketing/ProductTour'
import TestimonialsSection from '@/components/marketing/TestimonialsSection'
import CTASection from '@/components/marketing/CTASection'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export default function LandingPage() {
  return (
    <main className="marketing-page relative w-full min-h-screen bg-[#050505] text-white overflow-x-hidden">
      <MarketingNav />
      <Hero />
      <LogosMarquee />
      <FeatureGrid />
      <StatsStrip />
      <ProductTour />
      <TestimonialsSection />
      <CTASection />
      <MarketingFooter />
    </main>
  )
}
