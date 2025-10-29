import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false
export function useGsapRegister() {
  if (typeof window !== 'undefined' && !registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
}

export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : (() => {}) as any

export { gsap, ScrollTrigger }
