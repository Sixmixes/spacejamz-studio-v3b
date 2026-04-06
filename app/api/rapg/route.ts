import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { style } = await req.json();
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ 
                prompt: "GEMINI_API_KEY missing in .env.local. [FALLBACK_MODE_ENGAGED]: A hauntingly beautiful surrealist desertscape with floating obsidian monoliths, shot on 35mm film, volumetric sunset lighting, highly detailed masterpiece." 
            });
        }

        const promptTemplate = `
You are the R.A.P.G. (Random Action Prompt Generator) core for the Neural Foundry.
Your job is to generate highly dynamic, visually striking image-generation prompts. 
Avoid repetitive sci-fi and cyberpunk cliches. Create something conceptually dense, aesthetically varied, and visually captivating. Ensure distinct thematic coherence between elements.

Requested Style Target: ${style || 'Random Masterpiece, unpredictable medium and environment'}

Output ONLY the prompt text. Stop generating after the prompt. Keep it between 30 and 70 words. Explicitly detail subjects, lighting, environment, and artistic medium.
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptTemplate }] }],
                generationConfig: {
                    temperature: 0.95,
                    maxOutputTokens: 150
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Gemini API Error: ${response.statusText}`);
        }

        const data = await response.json();
        let generatedPrompt = data?.candidates?.[0]?.content?.parts?.[0]?.text || "A cinematic masterwork emerging from the neural void.";

        // Strip quotes if LLM added them
        generatedPrompt = generatedPrompt.replace(/^["']|["']$/g, '').trim();

        return NextResponse.json({ prompt: generatedPrompt });
    } catch (error: any) {
        console.error("RAPG Engine Error:", error);
        return NextResponse.json({ 
            prompt: "Neuro-Transmission Failed. A colossal cybernetic leviathan stranded in a neon-lit silicon desert, dramatic storm clouds, 8k resolution, octane render, masterpiece." 
        });
    }
}
