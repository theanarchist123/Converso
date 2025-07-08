import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateSessionRecap(
    messages: { role: string; content: string }[],
    companionName: string,
    subject: string,
    topic: string
) {
    try {
        // Get the Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Create a conversation transcript
        const conversation = messages
            .map(msg => `${msg.role === 'user' ? 'Student' : companionName}: ${msg.content}`)
            .join('\n\n');

        // Create the prompt for Gemini
        const prompt = `
You are an educational AI assistant analyzing a learning session between a student and an AI companion named "${companionName}". 

**Session Details:**
- Subject: ${subject}
- Topic: ${topic}
- Total Messages: ${messages.length}

**Conversation Transcript:**
${conversation}

Please analyze this learning session and provide a comprehensive recap. Your response must be a valid JSON object with exactly this structure:

{
  "bullet_points": [
    "Key learning point 1",
    "Key learning point 2",
    "Key learning point 3"
  ],
  "key_topics": [
    "Topic 1",
    "Topic 2", 
    "Topic 3"
  ],
  "summary": "A comprehensive summary of the learning session"
}

**Instructions:**
1. **Bullet Points**: Extract 5-8 key learning points from the conversation. Focus on educational value and specific concepts learned.
2. **Key Topics**: Identify 3-5 main topics discussed during the session.
3. **Summary**: Write a 2-3 sentence summary highlighting main concepts and learning outcomes.

**Important**: Return ONLY valid JSON, no markdown formatting, no backticks, no additional text.
`;

        // Generate content using Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Clean the response - remove any markdown formatting
        let cleanedText = text;
        if (text.startsWith('```json')) {
            cleanedText = text.replace(/```json\s*/, '').replace(/```\s*$/, '');
        } else if (text.startsWith('```')) {
            cleanedText = text.replace(/```\s*/, '').replace(/```\s*$/, '');
        }

        // Parse the JSON response
        try {
            const recap = JSON.parse(cleanedText);
            
            // Validate the response structure
            if (!recap.bullet_points || !recap.key_topics || !recap.summary) {
                throw new Error('Invalid response structure from Gemini');
            }

            return {
                bullet_points: Array.isArray(recap.bullet_points) ? recap.bullet_points : [],
                key_topics: Array.isArray(recap.key_topics) ? recap.key_topics : [],
                summary: typeof recap.summary === 'string' ? recap.summary : 'Session recap generated successfully.'
            };
        } catch (parseError) {
            console.error('Error parsing Gemini response:', parseError);
            
            // Fallback to basic recap generation
            return generateFallbackRecap(messages, companionName, subject, topic);
        }

    } catch (error) {
        console.error('Error generating recap with Gemini:', error);
        
        // Fallback to basic recap generation
        return generateFallbackRecap(messages, companionName, subject, topic);
    }
}

// Fallback function in case Gemini fails
function generateFallbackRecap(
    messages: { role: string; content: string }[],
    companionName: string,
    subject: string,
    topic: string
) {
    const conversation = messages
        .map(msg => `${msg.role === 'user' ? 'Student' : companionName}: ${msg.content}`)
        .join('\n\n');

    // Simple extraction logic for fallback
    const sentences = conversation.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const bullet_points: string[] = [];

    // Look for educational patterns
    const educationalPatterns = [
        /learned about/i,
        /important to remember/i,
        /key concept/i,
        /main idea/i,
        /remember that/i,
        /it's crucial/i,
        /the principle/i,
        /fundamental/i,
        /explained/i,
        /discussed/i
    ];

    sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (educationalPatterns.some(pattern => pattern.test(trimmed)) && bullet_points.length < 6) {
            bullet_points.push(trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
        }
    });

    // Add some generic subject-based points if we don't have enough
    if (bullet_points.length < 3) {
        bullet_points.push(`Explored key concepts in ${subject} related to ${topic}`);
        bullet_points.push(`Engaged in interactive learning session with ${companionName}`);
        bullet_points.push(`Discussed practical applications and examples`);
    }

    // Extract key topics using simple word frequency
    const words = conversation.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those']);
    
    const wordFreq: { [key: string]: number } = {};
    
    words.forEach(word => {
        const cleaned = word.replace(/[^\w]/g, '');
        if (cleaned.length > 3 && !stopWords.has(cleaned)) {
            wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
        }
    });

    const topWords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

    // Always include the main topic
    const key_topics = [topic, ...topWords.filter(w => w.toLowerCase() !== topic.toLowerCase())].slice(0, 5);

    // Generate summary
    const messageCount = messages.length;
    const duration = Math.ceil(messageCount * 1.5); // Estimate duration in minutes
    
    const summary = `You completed a ${duration}-minute interactive learning session with ${companionName} on ${topic} in ${subject}. The session covered important concepts and included practical discussions to enhance your understanding of the subject matter.`;

    return {
        bullet_points,
        key_topics,
        summary
    };
}
