'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGsapRegister, useIsomorphicLayoutEffect } from '@/lib/gsap-client'

export default function SmoothTransitions() {
  useGsapRegister()
  const root = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!root.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Get all marketing sections
      const sections = gsap.utils.toArray('.marketing-section')
      
      sections.forEach((section: any, index) => {
        if (index === 0) return // Skip first section (hero)

        // Simple fade-in animation for each section
        gsap.fromTo(section, 
          {
            opacity: 0,
            y: 50
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              end: 'top 70%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })

    }, root)

    return () => ctx.revert()
  }, [])

  return <div ref={root} className="fixed inset-0 pointer-events-none z-0" />
}