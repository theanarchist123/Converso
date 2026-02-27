'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Menu, X } from 'lucide-react'

const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
]

export default function MarketingNav() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 transition-all duration-300`}
            >
                <div
                    className={`w-full max-w-6xl flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-500 ${scrolled
                            ? 'bg-black/80 border border-white/10 shadow-2xl shadow-black/40'
                            : 'bg-white/[0.04] border border-white/[0.06]'
                        }`}
                    style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
                >
                    {/* Logo */}
                    <Link href="/marketing" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-shadow">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight">Converso</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 font-medium"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/sign-in"
                            className="px-4 py-2 text-sm text-white/70 hover:text-white font-medium transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/sign-up"
                            className="relative overflow-hidden px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.03] transition-all duration-200 group"
                        >
                            <span className="relative z-10">Get Started Free</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 text-white/70 hover:text-white"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-4 top-24 z-40 rounded-2xl border border-white/10 bg-black/95 p-5 flex flex-col gap-3"
                        style={{ backdropFilter: 'blur(24px)' }}
                    >
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="py-2.5 px-4 text-white/70 hover:text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-all"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="border-t border-white/10 pt-3 mt-1 flex flex-col gap-2">
                            <Link href="/sign-in" className="py-2.5 px-4 text-white/70 text-sm font-medium text-center rounded-lg border border-white/10">
                                Sign In
                            </Link>
                            <Link href="/sign-up" className="py-2.5 px-4 text-white text-sm font-semibold text-center rounded-xl bg-gradient-to-r from-orange-500 to-pink-600">
                                Get Started Free
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
