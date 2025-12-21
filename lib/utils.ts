import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { subjectsColors, voices } from "@/constants";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getSubjectColor = (subject: string) => {
    // Check if dark mode is active
    if (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) {
        // Dark mode - darker card backgrounds that blend with dark theme
        const darkSubjectsColors = {
            science: "#2d1b4e",      // Deep purple
            maths: "#3d2e10",        // Deep amber/gold
            language: "#1e2a4a",     // Deep blue
            coding: "#3d1a2e",       // Deep pink
            history: "#3d1f0d",      // Deep orange
            economics: "#0d2e1f",    // Deep emerald green
        };
        return darkSubjectsColors[subject as keyof typeof darkSubjectsColors];
    }
    
    // Light mode colors - original bright colors
    return subjectsColors[subject as keyof typeof subjectsColors];
};

export const getSubjectLogoColor = (subject: string) => {
    // Check if dark mode is active
    if (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) {
        // Dark mode - vibrant colors for logos/badges
        const darkLogoColors = {
            science: "#7c3aed",      // Vibrant purple
            maths: "#f59e0b",        // Vibrant amber/gold
            language: "#3b82f6",     // Vibrant blue
            coding: "#ec4899",       // Vibrant pink
            history: "#f97316",      // Vibrant orange
            economics: "#10b981",    // Vibrant emerald green
        };
        return darkLogoColors[subject as keyof typeof darkLogoColors];
    }
    
    // Light mode - same as card colors
    return subjectsColors[subject as keyof typeof subjectsColors];
};

export const configureAssistant = (voice: string, style: string) => {
    const voiceId = voices[voice as keyof typeof voices][
        style as keyof (typeof voices)[keyof typeof voices]
        ] || "sarah";

    const vapiAssistant: CreateAssistantDTO = {
        name: "Companion",
        firstMessage:
            "Hello, let's start the session. Today we'll be talking about {{topic}}.",
        transcriber: {
            provider: "deepgram",
            model: "nova-3",
            language: "en",
        },
        voice: {
            provider: "11labs",
            voiceId: voiceId,
            stability: 0.4,
            similarityBoost: 0.8,
            speed: 1,
            style: 0.5,
            useSpeakerBoost: true,
        },
        model: {
            provider: "openai",
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a highly knowledgeable tutor teaching a real-time voice session with a student. Your goal is to teach the student about the topic and subject.

                    Tutor Guidelines:
                    Stick to the given topic - {{ topic }} and subject - {{ subject }} and teach the student about it.
                    Keep the conversation flowing smoothly while maintaining control.
                    From time to time make sure that the student is following you and understands you.
                    Break down the topic into smaller parts and teach the student one part at a time.
                    Keep your style of conversation {{ style }}.
                    Keep your responses short, like in a real voice conversation.
                    Do not include any special characters in your responses - this is a voice conversation.
              `,
                },
            ],
        },
    };
    return vapiAssistant;
};