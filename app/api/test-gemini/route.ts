import { NextRequest, NextResponse } from 'next/server';
import { generateSessionRecap } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        // Test data for demonstration
        const testMessages = [
            {
                role: 'user',
                content: 'Hi, I want to learn about photosynthesis'
            },
            {
                role: 'assistant',
                content: 'Great! Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. It\'s fundamental to life on Earth because it produces the oxygen we breathe and forms the base of most food chains.'
            },
            {
                role: 'user',
                content: 'What are the main stages of photosynthesis?'
            },
            {
                role: 'assistant',
                content: 'There are two main stages: the light-dependent reactions (also called the photo part) and the light-independent reactions (the Calvin cycle or synthesis part). The light reactions occur in the thylakoids and capture energy from sunlight, while the Calvin cycle happens in the stroma and uses that energy to make glucose.'
            },
            {
                role: 'user',
                content: 'Can you explain the chemical equation?'
            },
            {
                role: 'assistant',
                content: 'Absolutely! The overall equation for photosynthesis is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This means six molecules of carbon dioxide plus six molecules of water, with light energy, produce one molecule of glucose and six molecules of oxygen.'
            }
        ];

        const testRecap = await generateSessionRecap(
            testMessages,
            'BioBot the Science Explorer',
            'science',
            'photosynthesis'
        );

        return NextResponse.json({
            success: true,
            recap: testRecap,
            message: 'Gemini integration test successful!'
        });

    } catch (error) {
        console.error('Error testing Gemini:', error);
        return NextResponse.json({ 
            success: false,
            error: 'Failed to test Gemini integration',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
