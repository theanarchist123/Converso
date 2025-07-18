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
    "Comprehensive learning point 1 that thoroughly explains a key concept, its significance in the broader context of the subject, and practical applications that demonstrate real-world relevance",
    "Detailed learning point 2 that explores another important aspect discussed during the session, providing in-depth analysis and connecting it to related concepts for better understanding",
    "In-depth learning point 3 that covers specific examples or case studies mentioned, explaining their importance and how they illustrate fundamental principles of the topic",
    "Comprehensive learning point 4 that addresses common misconceptions or challenging aspects of the subject, providing clarification and deeper insight into complex ideas",
    "Detailed learning point 5 that explores practical applications and real-world scenarios where the discussed concepts apply, bridging theory with practice",
    "In-depth learning point 6 that covers historical context or development of key ideas, helping understand how current knowledge evolved over time",
    "Comprehensive learning point 7 that addresses problem-solving techniques or methodologies specific to the subject area, enhancing practical skills",
    "Detailed learning point 8 that explores connections between different concepts within the topic, showing how various elements interact and influence each other",
    "In-depth learning point 9 that covers critical thinking aspects and analytical approaches discussed during the session, developing reasoning skills",
    "Comprehensive learning point 10 that addresses terminology and vocabulary specific to the subject, ensuring proper understanding of technical language",
    "Detailed learning point 11 that explores interdisciplinary connections and broader applications of the concepts beyond the immediate topic",
    "In-depth learning point 12 that summarizes key takeaways and identifies areas for further exploration or continued learning"
  ],
  "key_topics": [
    "Topic 1",
    "Topic 2", 
    "Topic 3"
  ],
  "summary": "A comprehensive summary of the learning session"
}

**Instructions:**
1. **Bullet Points**: Extract exactly 12 comprehensive learning points from the conversation. Each point should be detailed and educational, consisting of at least 2-3 sentences that thoroughly explain the concept, its significance, and practical applications. Focus on educational value, specific concepts learned, examples discussed, and deeper insights.
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
        if (educationalPatterns.some(pattern => pattern.test(trimmed)) && bullet_points.length < 12) {
            // Make the point longer and more detailed
            const detailedPoint = trimmed.charAt(0).toUpperCase() + trimmed.slice(1) + 
                ` This concept is fundamental to understanding ${subject} and provides valuable insights for practical application.`;
            bullet_points.push(detailedPoint);
        }
    });

    // Add comprehensive subject-based points if we don't have enough
    if (bullet_points.length < 12) {
        const additionalPoints = [
            `Explored fundamental concepts in ${subject} related to ${topic}, gaining deep understanding of core principles and their real-world applications. This foundational knowledge serves as a building block for more advanced topics.`,
            `Engaged in comprehensive interactive learning session with ${companionName}, utilizing dynamic conversation to clarify complex ideas and reinforce understanding. The personalized approach helped address specific learning needs and questions.`,
            `Discussed practical applications and real-world examples that demonstrate how theoretical concepts apply to everyday situations. These concrete examples help bridge the gap between abstract knowledge and practical implementation.`,
            `Analyzed key relationships between different concepts within ${subject}, understanding how various elements interconnect and influence each other. This systems thinking approach enhances overall comprehension of the subject matter.`,
            `Developed critical thinking skills through guided questioning and exploration of ${topic}, learning to approach problems systematically and evaluate information effectively. These analytical skills are transferable to other areas of study.`,
            `Identified common misconceptions and potential pitfalls related to ${topic}, gaining awareness of typical mistakes and how to avoid them. This understanding helps build more accurate and robust knowledge foundations.`,
            `Explored historical context and evolution of key concepts in ${subject}, understanding how current knowledge developed over time and the contributions of key figures. This perspective provides deeper appreciation for the field.`,
            `Connected learning to broader themes and interdisciplinary applications, recognizing how ${topic} relates to other subjects and areas of knowledge. This integration helps create a more comprehensive understanding.`,
            `Practiced problem-solving techniques and methodologies specific to ${subject}, developing systematic approaches to tackle challenges and questions. These skills enhance confidence and competence in the subject area.`,
            `Reinforced understanding through discussion of examples, case studies, and scenarios that illustrate key principles in action. This application-based learning helps solidify theoretical knowledge through practical context.`,
            `Developed vocabulary and terminology specific to ${subject}, learning precise language for describing concepts and communicating ideas effectively. This technical literacy is essential for continued learning and professional development.`,
            `Reflected on learning progress and identified areas for further exploration and study, creating a roadmap for continued development in ${topic}. This metacognitive approach helps optimize future learning efforts.`
        ];
        
        // Add points until we reach 12
        while (bullet_points.length < 12 && additionalPoints.length > 0) {
            bullet_points.push(additionalPoints.shift()!);
        }
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
