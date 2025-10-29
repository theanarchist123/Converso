'use client'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGsapRegister, useIsomorphicLayoutEffect } from '@/lib/gsap-client'

export default function ProgressBar() {
  useGsapRegister()
  const bar = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!bar.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.to(bar.current, {
        scaleX: 1,
        transformOrigin: 'left',
        ease: 'none',
        scrollTrigger: {
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3
        }
      })
    }, bar)

    return () => ctx.revert()
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
      <div ref={bar} 
           className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 origin-left scale-x-0" />
    </div>
  )
}
