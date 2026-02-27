'use client'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
    {
        name: 'Priya Sharma',
        role: 'Engineering Student, IIT Bombay',
        quote: 'Converso transformed how I prep for exams. My AI tutor explains concepts in ways my professors never did. My GPA jumped from 7.4 to 9.1 in one semester.',
        rating: 5,
        photo: 'photo-1494790108377-be9c29b29330',
        highlight: '9.1 GPA',
    },
    {
        name: 'James Okonkwo',
        role: 'MBA Candidate, LBS',
        quote: 'I used to spend hours watching YouTube videos to learn. Now I have a conversation and actually retain things. The analytics show me exactly where I\'m weak.',
        rating: 5,
        photo: 'photo-1507003211169-0a1dd7228f2d',
        highlight: '3x faster',
    },
    {
        name: 'Sofia Chen',
        role: 'High School Senior',
        quote: 'I passed my AP Physics exam with a 5 after just 3 weeks with my Converso companion. It never made me feel dumb for asking the same question twice.',
        rating: 5,
        photo: 'photo-1438761681033-6461ffad8d80',
        highlight: 'AP Score: 5',
    },
    {
        name: 'Marcus Webb',
        role: 'Self-taught Developer',
        quote: 'Learning to code felt impossible until Converso. My AI companion caught every mistake in real time and explained the "why" behind every concept. Landed my first dev job in 6 months.',
        rating: 5,
        photo: 'photo-1472099645785-5658abf4ff4e',
        highlight: 'Job in 6 months',
    },
    {
        name: 'Aisha Al-Rashidi',
        role: 'Medical Student, UCL',
        quote: 'Medical school is brutal but my Converso tutor helps me process 10x more content daily. The spaced repetition is actually scientifically calibrated.',
        rating: 5,
        photo: 'photo-1534528741775-53994a69daeb',
        highlight: '10x content',
    },
    {
        name: 'Lena Fischer',
        role: 'Language Learner',
        quote: 'I became conversational in Japanese in 4 months. My companion corrected my grammar in real time during practice conversations. Absolutely unmatched experience.',
        rating: 5,
        photo: 'photo-1544005313-94ddf0286df2',
        highlight: 'Fluent in 4 months',
    },
]



export default function TestimonialsSection() {
    return (
        <section className="relative py-28 bg-[#050505] overflow-hidden" id="testimonials">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

            {/* background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-orange-500/4 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center max-w-2xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/8 mb-5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Loved by 10,000+ learners</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
                        Real results from{' '}
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            real learners.
                        </span>
                    </h2>
                    <p className="mt-5 text-lg text-white/45 leading-relaxed">
                        Don&apos;t take our word for it. Here&apos;s what students, professionals, and lifelong learners say.
                    </p>
                </motion.div>

                {/* Testimonial grid - masonry-like layout */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            whileHover={{ y: -4, scale: 1.01 }}
                            className="break-inside-avoid relative rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 group hover:border-white/15 transition-all duration-300 cursor-default"
                        >
                            {/* Hover glow */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                            <div className="relative">
                                {/* Quote icon */}
                                <Quote className="w-8 h-8 text-orange-500/25 mb-4" />

                                {/* Stars */}
                                <div className="flex gap-0.5 mb-3">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-white/65 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>

                                {/* Highlight badge */}
                                <div className="mb-4">
                                    <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 to-pink-500/15 border border-orange-500/20 text-orange-400 text-xs font-bold">
                                        ✦ {t.highlight}
                                    </span>
                                </div>

                                {/* User info */}
                                <div className="flex items-center gap-3 pt-3 border-t border-white/6">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                        <Image
                                            src={`https://images.unsplash.com/${t.photo}?w=80&q=80&auto=format&fit=crop&crop=face`}
                                            alt={t.name}
                                            width={40}
                                            height={40}
                                            className="object-cover w-full h-full"
                                            unoptimized
                                        />
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-semibold">{t.name}</div>
                                        <div className="text-white/35 text-xs">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
