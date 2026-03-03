'use client';

import { useEffect, useRef, useState } from 'react';
import { cn, configureAssistant } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { saveSessionTranscript, generateSessionRecap } from "@/lib/actions/session.actions";
import type { SavedMessage, SessionRecap } from '@/types/messages';
import SessionRecapModal from './SessionRecapModal';

interface CompanionComponentProps {
    companionId: string;
    subject: string;
    topic: string;
    name: string;
    userName: string;
    userImage: string;
    style: string;
    voice: string;
    duration: number;
    continueFromSession?: boolean;
}

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

// ═══════════════════════════════════════════════════════
// Per-subject immersive theme config
// ═══════════════════════════════════════════════════════
const subjectThemes: Record<string, {
    bg: string;
    accent: string;
    particles: string[];
    gradient: string;
}> = {
    science: {
        bg: 'from-[#0a0015] via-[#110a2e] to-[#0d0020]',
        accent: '#7c3aed',
        particles: ['⚛', '🔬', '⚗', '🧬', '💫', '✦', '◎', '○'],
        gradient: 'from-purple-900/40 via-violet-900/20 to-indigo-900/30',
    },
    maths: {
        bg: 'from-[#0f0a00] via-[#1a1200] to-[#0f0c00]',
        accent: '#f59e0b',
        particles: ['∑', 'π', '∞', '∂', '√', '∫', '≈', 'Δ'],
        gradient: 'from-amber-900/40 via-yellow-900/20 to-orange-900/20',
    },
    coding: {
        bg: 'from-[#000d00] via-[#001500] to-[#000f00]',
        accent: '#22c55e',
        particles: ['</', '{}', '=>', '&&', '[]', '01', '10', '//'],
        gradient: 'from-green-900/40 via-emerald-900/20 to-teal-900/20',
    },
    history: {
        bg: 'from-[#120500] via-[#1a0900] to-[#0f0500]',
        accent: '#f97316',
        particles: ['📜', '⚔', '🏛', '🗺', '👑', '⚓', '🎭', '🗿'],
        gradient: 'from-orange-900/40 via-amber-900/20 to-red-900/20',
    },
    language: {
        bg: 'from-[#000a1a] via-[#000f25] to-[#000814]',
        accent: '#38bdf8',
        particles: ['Aa', '文', 'αβ', '日', '语', '✍', 'ABC', '∴'],
        gradient: 'from-sky-900/40 via-blue-900/20 to-cyan-900/20',
    },
    economics: {
        bg: 'from-[#001008] via-[#001a0f] to-[#000f08]',
        accent: '#10b981',
        particles: ['$', '📈', '💹', '€', '£', '¥', '%', '∝'],
        gradient: 'from-emerald-900/40 via-green-900/20 to-teal-900/20',
    },
};

function getTheme(subject: string) {
    return subjectThemes[subject?.toLowerCase()] ?? subjectThemes['science'];
}

// Extracts up to 3 key words from AI message text
function extractKeywords(text: string): string[] {
    const stop = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do',
        'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'this', 'that',
        'these', 'those', 'it', 'its', 'we', 'you', 'i', 'he', 'she', 'they', 'so', 'let', 'just',
        'very', 'what', 'how', 'when', 'where', 'why', 'about', 'from', 'into', 'your', 'our',
        'their', 'now', 'then', 'also', 'as', 'if', 'here', 'there', 'think', 'know', 'see',
        'get', 'make', 'like', 'use', 'which', 'some', 'more', 'than', 'up', 'out', 'all']);
    const words = text.replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/).filter(w => w.length > 4 && !stop.has(w.toLowerCase()));
    const seen = new Set<string>();
    const result: string[] = [];
    for (const w of words) {
        const lower = w.toLowerCase();
        if (!seen.has(lower)) { seen.add(lower); result.push(w); }
        if (result.length >= 3) break;
    }
    return result;
}

// ═══════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════

function SubjectBackground({ subject }: { subject: string }) {
    const theme = getTheme(subject);
    const particles = Array.from({ length: 20 }, (_, i) => ({
        symbol: theme.particles[i % theme.particles.length],
        left: `${(i * 37 + 11) % 95}%`,
        animDuration: `${10 + (i * 3.7) % 14}s`,
        animDelay: `${(i * 1.3) % 8}s`,
        size: `${0.7 + (i % 4) * 0.3}rem`,
        opacity: 0.08 + (i % 5) * 0.04,
    }));

    return (
        <div className={cn('absolute inset-0 bg-gradient-to-br overflow-hidden', theme.bg)}>
            {/* Central radial glow */}
            <div className="absolute inset-0 opacity-20" style={{
                background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${theme.accent}33 0%, transparent 70%)`
            }} />
            {/* Subject gradient tint */}
            <div className={cn('absolute inset-0 bg-gradient-to-b opacity-50', theme.gradient)} />

            {/* Rising particles */}
            {particles.map((p, i) => (
                <div key={i} className="absolute bottom-0 select-none pointer-events-none font-mono"
                    style={{
                        left: p.left,
                        fontSize: p.size,
                        color: theme.accent,
                        opacity: p.opacity,
                        animationName: 'particle-rise',
                        animationDuration: p.animDuration,
                        animationDelay: p.animDelay,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                    }}>
                    {p.symbol}
                </div>
            ))}

            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 40px,${theme.accent}44 40px,${theme.accent}44 41px),
                                   repeating-linear-gradient(90deg,transparent,transparent 40px,${theme.accent}44 40px,${theme.accent}44 41px)`,
            }} />
        </div>
    );
}

function OrbitalAvatar({ subject, isSpeaking, callStatus }: {
    subject: string; isSpeaking: boolean; callStatus: CallStatus;
}) {
    const theme = getTheme(subject);
    const isActive = callStatus === CallStatus.ACTIVE;

    return (
        <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
            {/* Outer slow dotted ring with orbiting dot */}
            {isActive && (
                <div className="absolute rounded-full border border-dashed" style={{
                    width: 228, height: 228,
                    borderColor: `${theme.accent}33`,
                    animationName: 'orbit-cw',
                    animationDuration: '12s',
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                }}>
                    <div className="absolute rounded-full" style={{
                        width: 8, height: 8,
                        background: theme.accent,
                        top: -4, left: '50%', marginLeft: -4,
                        boxShadow: `0 0 12px ${theme.accent}`,
                    }} />
                </div>
            )}

            {/* Inner ring — speeds up when speaking */}
            {isActive && (
                <div className="absolute rounded-full border" style={{
                    width: 188, height: 188,
                    borderColor: isSpeaking ? `${theme.accent}55` : `${theme.accent}22`,
                    animationName: 'orbit-ccw',
                    animationDuration: isSpeaking ? '3s' : '10s',
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    transition: 'animation-duration 0.5s',
                }}>
                    <div className="absolute rounded-full" style={{
                        width: 10, height: 10,
                        background: `linear-gradient(135deg, ${theme.accent}, white)`,
                        bottom: -5, left: '50%', marginLeft: -5,
                        boxShadow: `0 0 16px ${theme.accent}, 0 0 32px ${theme.accent}88`,
                    }} />
                </div>
            )}

            {/* Core orb */}
            <div className="relative z-10 rounded-full flex items-center justify-center overflow-hidden" style={{
                width: 152, height: 152,
                background: `radial-gradient(circle at 35% 35%, ${theme.accent}44, ${theme.accent}11 60%, #00000088)`,
                border: `2px solid ${theme.accent}66`,
                ['--session-color' as string]: theme.accent,
                animationName: isSpeaking ? 'speaking-glow' : (isActive ? 'breathe' : 'none'),
                animationDuration: isSpeaking ? '0.8s' : '3s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
            }}>
                <div className="absolute inset-0 rounded-full" style={{
                    background: `radial-gradient(circle at 50% 50%, ${theme.accent}22 0%, transparent 70%)`
                }} />
                <div className="relative z-10">
                    <Image src={`/icons/${subject}.svg`} alt={subject} width={80} height={80}
                        style={{ filter: `drop-shadow(0 0 12px ${theme.accent})` }} />
                </div>
            </div>

            {/* Connecting pulse rings */}
            {callStatus === CallStatus.CONNECTING && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute rounded-full border-2 animate-ping" style={{
                        width: 170, height: 170, borderColor: theme.accent, opacity: 0.4
                    }} />
                </div>
            )}
        </div>
    );
}

function LiveCaption({ text, accentColor }: { text: string; accentColor: string }) {
    if (!text) {
        return (
            <p className="text-white/30 text-lg font-light tracking-widest uppercase text-center">
                Listening...
            </p>
        );
    }

    const words = text.split(' ').filter(Boolean);

    return (
        <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 leading-snug">
                {words.map((word, i) => (
                    <span
                        key={i}
                        className="inline-block text-white font-semibold transition-opacity duration-150"
                        style={{
                            fontSize: 'clamp(1rem, 2.2vw, 1.5rem)',
                            textShadow: `0 0 20px ${accentColor}88, 0 2px 8px rgba(0,0,0,0.8)`,
                        }}>
                        {word}
                    </span>
                ))}
            </div>
        </div>
    );
}

interface Bubble { id: string; text: string; x: number; }

function FloatingKeywords({ bubbles, accentColor }: { bubbles: Bubble[]; accentColor: string }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {bubbles.map(bubble => (
                <div key={bubble.id} className="absolute animate-float-up-fade"
                    style={{ left: `${bubble.x}%`, bottom: '40%' }}>
                    <div className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap" style={{
                        background: `${accentColor}22`,
                        border: `1px solid ${accentColor}66`,
                        color: accentColor,
                        boxShadow: `0 0 12px ${accentColor}33`,
                    }}>
                        {bubble.text}
                    </div>
                </div>
            ))}
        </div>
    );
}

function WaveformVisualizer({ active, accentColor }: { active: boolean; accentColor: string }) {
    return (
        <div className="flex items-center gap-[3px] h-6">
            {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="w-[3px] rounded-full origin-bottom" style={{
                    height: '100%',
                    background: accentColor,
                    opacity: active ? 0.9 : 0.25,
                    animationName: active ? 'wave-bar' : 'none',
                    animationDuration: `${0.4 + i * 0.1}s`,
                    animationDelay: `${i * 0.07}s`,
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    transform: active ? 'scaleY(1)' : 'scaleY(0.3)',
                    transition: 'transform 0.3s, opacity 0.3s',
                }} />
            ))}
        </div>
    );
}

function TimerPill({ timeRemaining, duration, accentColor }: { timeRemaining: number; duration: number; accentColor: string }) {
    const pct = duration > 0 ? ((duration * 60 - timeRemaining) / (duration * 60)) * 100 : 0;
    const isLow = timeRemaining < 60;
    const mins = Math.floor(timeRemaining / 60);
    const secs = String(timeRemaining % 60).padStart(2, '0');
    const r = 9;
    const circumference = 2 * Math.PI * r;
    return (
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full frosted-glass flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90">
                <circle cx="11" cy="11" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                <circle cx="11" cy="11" r={r} fill="none" stroke={isLow ? '#ef4444' : accentColor}
                    strokeWidth="2" strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct / 100)} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <span className="text-sm font-bold tabular-nums" style={{ color: isLow ? '#ef4444' : 'white' }}>
                {mins}:{secs}
            </span>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════
const CompanionComponent = ({
    companionId, subject, topic, name, userName, userImage,
    style, voice, duration, continueFromSession = false
}: CompanionComponentProps) => {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [showRecapModal, setShowRecapModal] = useState(false);
    const [currentRecap, setCurrentRecap] = useState<SessionRecap | null>(null);
    const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);
    const [loadingPreviousSession, setLoadingPreviousSession] = useState(false);
    const [hasPreviousSession, setHasPreviousSession] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(duration * 60);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [transcriptOpen, setTranscriptOpen] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState<string>('');

    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const transcriptRef = useRef<HTMLDivElement>(null);
    const bubbleCleanupRef = useRef<NodeJS.Timeout | null>(null);

    const theme = getTheme(subject);
    const router = useRouter();

    // Load previous session
    useEffect(() => {
        if (!continueFromSession) return;
        setLoadingPreviousSession(true);
        fetch(`/api/session/last?companionId=${companionId}`)
            .then(r => r.json())
            .then(data => {
                if (data.hasHistory && data.messages?.length > 0) {
                    setMessages(data.messages);
                    setHasPreviousSession(true);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingPreviousSession(false));
    }, [companionId, continueFromSession]);

    // Auto-scroll transcript
    useEffect(() => {
        setTimeout(() => {
            transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
    }, [messages]);

    // Session timer
    useEffect(() => {
        if (callStatus === CallStatus.ACTIVE) {
            if (sessionStartTime === null) setSessionStartTime(Date.now());
            timerIntervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                        handleDisconnect();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
            if (callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE) {
                setTimeRemaining(duration * 60);
                setSessionStartTime(null);
            }
        }
        return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
    }, [callStatus, duration]);

    // VAPI event handlers
    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);

        const onCallEnd = async () => {
            setCallStatus(CallStatus.FINISHED);
            if (messages.length > 0) {
                try {
                    await saveSessionTranscript(companionId, messages);
                    setIsGeneratingRecap(true);
                    const recap = await generateSessionRecap(messages, name, subject, topic);
                    setIsGeneratingRecap(false);
                    if (recap) { setCurrentRecap(recap); setShowRecapModal(true); }
                } catch {
                    setIsGeneratingRecap(false);
                }
            }
        };

        const onMessage = (msg: { type: string; transcriptType: string; role: string; transcript: string }) => {
            if (msg.type === 'transcript') {
                if (msg.role === 'assistant' && msg.transcriptType === 'partial') {
                    // Update live captions instantly with streaming partial text
                    setLiveTranscript(msg.transcript);
                } else if (msg.transcriptType === 'final') {
                    const newMsg: SavedMessage = {
                        role: msg.role === 'assistant' ? 'assistant' : 'user',
                        content: msg.transcript,
                    };
                    setMessages(prev => [...prev, newMsg]);

                    if (msg.role === 'assistant') {
                        setLiveTranscript(msg.transcript);

                        // Spawn keyword bubbles from AI messages
                        const keywords = extractKeywords(msg.transcript);
                        setBubbles(prev => [
                            ...prev,
                            ...keywords.map((kw, idx) => ({
                                id: `${Date.now()}-${idx}`,
                                text: kw,
                                x: 20 + Math.random() * 60,
                            })),
                        ]);
                        if (bubbleCleanupRef.current) clearTimeout(bubbleCleanupRef.current);
                        bubbleCleanupRef.current = setTimeout(() => setBubbles([]), 4000);
                    } else if (msg.role === 'user') {
                        // User started talking, clear the previous AI subtitles so they aren't stuck on screen
                        setLiveTranscript('');
                    }
                }
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => {
            if (error.message?.includes('Meeting ended due to ejection')) {
                setCallStatus(CallStatus.FINISHED);
                if (messages.length > 0) {
                    saveSessionTranscript(companionId, messages).catch(console.error);
                    setIsGeneratingRecap(true);
                    generateSessionRecap(messages, name, subject, topic)
                        .then(recap => {
                            setIsGeneratingRecap(false);
                            if (recap) { setCurrentRecap(recap); setShowRecapModal(true); }
                        })
                        .catch(() => setIsGeneratingRecap(false));
                }
            } else {
                setCallStatus(CallStatus.INACTIVE);
            }
        };

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('error', onError);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('error', onError);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
        };
    }, [companionId, messages, name, subject, topic]);

    const toggleMicrophone = () => {
        const muted = vapi.isMuted();
        vapi.setMuted(!muted);
        setIsMuted(!muted);
    };

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        const previousMessages = continueFromSession && hasPreviousSession ? messages : [];
        if (!continueFromSession || !hasPreviousSession) setMessages([]);
        try {
            const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "a3a53255-c933-4c98-8739-b151a3270781";
            let overrides: any = {
                variableValues: { subject, topic, style }
            };

            if (previousMessages.length > 0 && continueFromSession) {
                const ctx = previousMessages.slice(-10)
                    .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n');

                overrides.firstMessage = "Welcome back! Let's continue our session about {{topic}}.";
                overrides.model = {
                    provider: "openai",
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are a highly knowledgeable tutor teaching a real-time voice session with a student. Your goal is to teach the student about the topic and subject.\n\nImportant previous context from our last session:\n${ctx}\n\nReview this context and then smoothly continue the lesson where we left off.`
                        }
                    ]
                };
            }

            await vapi.start(assistantId, overrides);
        } catch {
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    const handleDisconnect = () => { setCallStatus(CallStatus.FINISHED); vapi.stop(); };

    const handleRepeat = async () => {
        vapi.stop();
        setCallStatus(CallStatus.CONNECTING);
        setMessages([]);
        try {
            const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "a3a53255-c933-4c98-8739-b151a3270781";
            await vapi.start(assistantId, { variableValues: { subject, topic, style } });
        } catch {
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    const isActive = callStatus === CallStatus.ACTIVE;
    const isConnecting = callStatus === CallStatus.CONNECTING;
    const isFinished = callStatus === CallStatus.FINISHED;

    // ─── Render ───────────────────────────────────────────────────────────
    return (
        <div className="immersive-session-page">

            {/* ── Animated background ── */}
            <SubjectBackground subject={subject} />

            {/* ── Floating keyword bubbles (above bg, below content) ── */}
            <FloatingKeywords bubbles={bubbles} accentColor={theme.accent} />

            {/* ── Back button ── */}
            <button
                onClick={() => router.push('/companions')}
                className="fixed top-4 left-5 z-[10000] flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/60 hover:text-white transition-all frosted-glass text-sm"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                <span className="hidden sm:block">Back</span>
            </button>

            {/* ── Main centred stage ── */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pb-28 pt-16 gap-6">

                {/* Topic pill */}
                <div className="px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase" style={{
                    background: `${theme.accent}18`,
                    border: `1px solid ${theme.accent}44`,
                    color: theme.accent,
                }}>
                    {subject} · {topic}
                </div>

                {/* Orbital avatar */}
                <OrbitalAvatar
                    subject={subject}
                    isSpeaking={isSpeaking}
                    callStatus={callStatus}
                />

                {/* Companion name + status */}
                <div className="text-center -mt-2">
                    <h2 className="text-white font-bold text-xl tracking-wide">{name}</h2>
                    <p className="text-sm mt-1 h-5 transition-opacity duration-500"
                        style={{ color: theme.accent, opacity: isActive ? 1 : 0 }}>
                        {isSpeaking ? `${name.split(' ')[0]} is teaching...` : (isActive ? 'Listening...' : '')}
                    </p>
                </div>

                {/* Live Caption */}
                {isActive && (
                    <div className="w-full max-w-2xl min-h-[80px] flex items-center justify-center">
                        <LiveCaption text={liveTranscript} accentColor={theme.accent} />
                    </div>
                )}

                {/* Idle / finished text */}
                {!isActive && !isConnecting && (
                    <p className="text-white/40 text-base text-center">
                        {isFinished
                            ? 'Session complete — great work! 🎉'
                            : continueFromSession && hasPreviousSession
                                ? 'Ready to continue your last session'
                                : 'Press Start to begin your lesson'}
                    </p>
                )}

                {/* Connecting dots */}
                {isConnecting && (
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map((num, i) => (
                                <div key={num} className="w-2 h-2 rounded-full animate-bounce"
                                    style={{ background: theme.accent, animationDelay: `${num * 0.1}s` }} />
                            ))}
                        </div>
                        <p className="text-white/60 text-sm">Connecting to {name}...</p>
                    </div>
                )}
            </div>

            {/* ── User avatar pip (bottom-right, only when active) ── */}
            {isActive && (
                <div className="fixed bottom-28 right-5 z-[9997] frosted-glass rounded-2xl flex items-center gap-2 px-3 py-2"
                    style={{ border: `1px solid ${theme.accent}33` }}>
                    <div className="relative">
                        <Image src={userImage} alt={userName} width={36} height={36} className="rounded-lg" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black"
                            style={{ background: isMuted ? '#6b7280' : '#22c55e' }} />
                    </div>
                    <span className="text-white text-sm font-medium">{userName}</span>
                </div>
            )}

            {/* ══════════════════════════════════════════════
                Bottom control bar (frosted glass)
            ══════════════════════════════════════════════ */}
            <div className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-5 pt-2">
                <div className="frosted-glass rounded-2xl max-w-2xl mx-auto px-5 py-3 flex items-center gap-3 flex-wrap">

                    {/* Timer */}
                    {isActive && (
                        <TimerPill timeRemaining={timeRemaining} duration={duration} accentColor={theme.accent} />
                    )}

                    {/* Waveform */}
                    <WaveformVisualizer active={isSpeaking} accentColor={theme.accent} />

                    <div className="flex-1" />

                    {/* Mic toggle */}
                    <button onClick={toggleMicrophone} disabled={!isActive}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
                        style={{
                            background: isMuted ? 'rgba(239,68,68,0.2)' : `${theme.accent}22`,
                            border: `1px solid ${isMuted ? 'rgba(239,68,68,0.5)' : `${theme.accent}55`}`,
                            color: isMuted ? '#f87171' : 'white',
                        }}>
                        <Image src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'} alt="mic" width={18} height={18} />
                        <span className="hidden sm:block">{isMuted ? 'Muted' : 'Mic On'}</span>
                    </button>

                    {/* Transcript toggle */}
                    <button onClick={() => setTranscriptOpen(v => !v)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{
                            background: transcriptOpen ? `${theme.accent}33` : 'rgba(255,255,255,0.07)',
                            border: `1px solid ${transcriptOpen ? `${theme.accent}66` : 'rgba(255,255,255,0.12)'}`,
                            color: 'white',
                        }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="hidden sm:block">Transcript</span>
                    </button>

                    {/* Repeat (only finished) */}
                    {isFinished && (
                        <button onClick={handleRepeat}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}55`, color: 'white' }}>
                            <Image src="/icons/repeat.svg" alt="repeat" width={18} height={18} />
                            <span className="hidden sm:block">Repeat</span>
                        </button>
                    )}

                    {/* Main CTA */}
                    <button
                        onClick={() => isActive ? handleDisconnect() : handleCall()}
                        disabled={loadingPreviousSession || isConnecting}
                        className={cn(
                            'px-5 py-2 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                            isConnecting && 'animate-pulse'
                        )}
                        style={{
                            background: isActive
                                ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                                : `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
                            boxShadow: isActive
                                ? '0 0 20px rgba(220,38,38,0.4)'
                                : `0 0 20px ${theme.accent}44`,
                        }}>
                        {isActive ? 'End Session'
                            : isConnecting ? 'Connecting...'
                                : continueFromSession && hasPreviousSession ? 'Continue'
                                    : 'Start Session'}
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                Transcript drawer (slides up from bottom)
            ══════════════════════════════════════════════ */}
            {transcriptOpen && (
                <div
                    className="fixed inset-x-0 bottom-20 z-[9998] frosted-dark rounded-t-3xl max-h-[55vh] overflow-hidden flex flex-col"
                    style={{ animationName: 'drawer-slide-up', animationDuration: '0.3s', animationFillMode: 'both' }}
                >
                    {/* Handle */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-10 h-1 rounded-full bg-white/30" />
                    </div>
                    <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
                        <h3 className="text-white font-semibold text-sm tracking-wide">Live Transcript</h3>
                        <span className="text-white/40 text-xs">{messages.length} messages</span>
                    </div>

                    {/* Messages */}
                    <div ref={transcriptRef} className="overflow-y-auto flex-1 px-4 pb-4 space-y-3 no-scrollbar">
                        {messages.length === 0 ? (
                            <p className="text-white/30 text-sm text-center py-8">
                                No messages yet. Start the session to see the conversation here.
                            </p>
                        ) : messages.map((msg, i) => {
                            const isAI = msg.role === 'assistant';
                            const label = isAI ? name.split(' ')[0].replace(/[.,]/g, '') : (userName || 'You');
                            // Ensure key is unique
                            const messageKey = `${msg.role}-${i}-${msg.content.substring(0, 10)}`;
                            return (
                                <div key={messageKey} className={cn('flex gap-2', !isAI && 'flex-row-reverse')}>
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-1"
                                        style={{
                                            background: isAI ? `${theme.accent}33` : 'rgba(255,255,255,0.15)',
                                            color: isAI ? theme.accent : 'white',
                                            border: `1px solid ${isAI ? `${theme.accent}55` : 'rgba(255,255,255,0.2)'}`,
                                        }}>
                                        {label[0]}
                                    </div>
                                    <div className="max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed"
                                        style={{
                                            background: isAI ? `${theme.accent}15` : 'rgba(255,255,255,0.08)',
                                            borderLeft: isAI ? `2px solid ${theme.accent}66` : undefined,
                                            borderRight: !isAI ? '2px solid rgba(255,255,255,0.3)' : undefined,
                                            color: 'rgba(255,255,255,0.85)',
                                        }}>
                                        <span className="block text-[10px] font-bold uppercase tracking-wide mb-0.5 opacity-60">{label}</span>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Recap generating loader ── */}
            {isGeneratingRecap && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center">
                    <div className="frosted-dark rounded-3xl p-8 text-center max-w-xs mx-4 border border-white/10">
                        <div className="w-12 h-12 rounded-full border-2 border-t-transparent mx-auto mb-4 animate-spin"
                            style={{ borderColor: `${theme.accent} transparent transparent transparent` }} />
                        <h3 className="text-white font-bold mb-1">Generating Your Recap</h3>
                        <p className="text-white/50 text-sm">Crafting your learning summary...</p>
                    </div>
                </div>
            )}

            {/* ── Session recap modal ── */}
            <SessionRecapModal
                isOpen={showRecapModal}
                onClose={() => setShowRecapModal(false)}
                recap={currentRecap}
                companionName={name}
                subject={subject}
            />
        </div>
    );
};

export default CompanionComponent;