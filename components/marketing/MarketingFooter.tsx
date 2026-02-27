'use client'
import Link from 'next/link'
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react'

const FOOTER_LINKS = {
    Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Resources: ['Documentation', 'Help Center', 'Privacy', 'Terms'],
}

export default function MarketingFooter() {
    return (
        <footer className="relative bg-[#050505] border-t border-white/6 pt-16 pb-10 px-6 md:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-bold text-lg tracking-tight">Converso</span>
                        </div>
                        <p className="text-white/35 text-sm leading-relaxed mb-5 max-w-[220px]">
                            AI-powered learning companions that adapt to every learner.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { icon: Twitter, label: 'Twitter' },
                                { icon: Github, label: 'GitHub' },
                                { icon: Linkedin, label: 'LinkedIn' },
                            ].map(({ icon: Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="w-8 h-8 rounded-lg border border-white/8 bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200"
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                        <div key={group}>
                            <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">{group}</div>
                            <div className="flex flex-col gap-3">
                                {links.map((link) => (
                                    <a
                                        key={link}
                                        href="#"
                                        className="text-white/35 hover:text-white/70 text-sm transition-colors duration-150"
                                    >
                                        {link}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/6">
                    <p className="text-white/20 text-xs">
                        © {new Date().getFullYear()} Converso AI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-white/25 text-xs">All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
