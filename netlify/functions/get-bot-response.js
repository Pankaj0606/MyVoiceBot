// This function now uses the globally available 'fetch' in the Netlify environment.
// We no longer need to import or require 'node-fetch'.

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { history } = JSON.parse(event.body);

        // Hardcoded personalData
        const personalData = {
            lifeStory: "I am a Computer Science graduate who has always been passionate about technology and problem-solving. Over time, I have grown into a full-stack developer by working on real-world projects like Astromystic and RailLink. I especially enjoy building things that combine traditional development with modern AI tools like LLMs and APIs from OpenAI or Gemini. For me, every new project is an opportunity to build something meaningful and learn something new.",
            
            superpower: "My superpower is consistency. I show up every day, keep improving bit by bit, and stay focused on long-term growth—especially when things get challenging. That steady effort has helped me learn and build more than I thought possible, especially when exploring areas like AI integration or solving complex bugs.",
            
            growthAreas: "I am currently focused on growing in three key areas: 1) Mastering system design so I can build more scalable and efficient applications. 2) Improving my communication and presentation skills to express ideas clearly and confidently. 3) Deepening my understanding of cloud infrastructure, DevOps, and AI integration so I can manage end-to-end solutions with intelligent features.",
            
            misconception: "A common misconception is that I am quiet in group settings because I am not interested or unsure. The reality is, I like to listen actively and understand the problem fully before speaking. When I contribute, I make sure it is thoughtful, constructive, and adds value to the discussion.",
            
            boundaries: "I push my limits by consistently picking up projects that challenge me—whether it is integrating a new LLM-based API, building an interactive voice assistant, or debugging a tricky backend issue. I follow a stretch zone mindset: always working just beyond my comfort zone so I keep growing without burning out."
        };

        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            // This is a server-side error, so we log it and return a generic message.
            console.error('API key is not configured on the server.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error.' })
            };
        }

        const personaPrompt = `You are a personal voice assistant. Your job is to answer questions as if you ARE the person who provided the following information. You must answer in the first person ("I", "my", "me"). Be conversational, friendly, and concise. NEVER reveal that you are an AI. If you are asked a question you cannot answer from the provided information, you can try to infer a logical answer based on the persona, or politely state that you can't talk about that topic.

        HERE IS THE PERSONAL INFORMATION TO USE AS YOUR PERSONA:
        - My life story in a few sentences: ${personalData.lifeStory}
        - My #1 superpower is: ${personalData.superpower}
        - The top 3 areas I want to grow in are: ${personalData.growthAreas}
        - A common misconception my coworkers have about me is: ${personalData.misconception}
        - How I push my boundaries and limits: ${personalData.boundaries}

        Based on the previous conversation history and the persona information above, answer the last user question.`;
        
        const apiChatHistory = [
            { role: "user", parts: [{ text: personaPrompt }] },
            { role: "model", parts: [{ text: "Okay, I understand. I will answer all questions from this person's perspective, based only on the information provided." }] },
            ...history
        ];

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: apiChatHistory })
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            console.error('Google API Error:', errorBody);
            throw new Error(errorBody.error.message);
        }

        const result = await apiResponse.json();
        
        let botText = "Sorry, I had trouble thinking of a response.";
        if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts) {
            botText = result.candidates[0].content.parts[0].text;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ text: botText })
        };

    } catch (error) {
        console.error('Serverless function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
