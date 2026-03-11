import React from 'react'
import Link from "next/link";

const Cta = () => {
    return (
        <section className="home-cta-banner">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute -top-20 -right-20 size-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-orange-400/10 blur-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold tracking-wide">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse inline-block" />
                    START LEARNING YOUR WAY
                </div>

                <h2 className="text-3xl font-extrabold text-foreground leading-tight">
                    Build &amp; Personalize Your{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                        Learning Companion
                    </span>
                </h2>

                <p className="text-muted-foreground text-sm leading-relaxed">
                    Pick a name, subject, voice &amp; personality — and start learning through voice conversations that feel natural and fun.
                </p>

                {/* Floating subject icons */}
                <div className="relative w-full h-28 my-2">
                    <div className="cta-float-icon" style={{ left: '5%', top: '10%', animationDelay: '0s' }}>🧮</div>
                    <div className="cta-float-icon" style={{ left: '22%', top: '55%', animationDelay: '0.4s' }}>🔬</div>
                    <div className="cta-float-icon" style={{ left: '42%', top: '5%', animationDelay: '0.8s' }}>🎓</div>
                    <div className="cta-float-icon" style={{ left: '62%', top: '50%', animationDelay: '0.2s' }}>💻</div>
                    <div className="cta-float-icon" style={{ left: '80%', top: '10%', animationDelay: '0.6s' }}>🗣️</div>
                    <div className="cta-float-icon" style={{ left: '88%', top: '58%', animationDelay: '1s' }}>📖</div>
                </div>

                <Link href="/companions/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Build a New Companion
                </Link>
            </div>
        </section>
    )
}
export default Cta
