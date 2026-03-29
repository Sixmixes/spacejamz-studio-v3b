import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate();

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'System Halt: REPLICATE_API_TOKEN is missing.' }, { status: 500 });
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prism Core Error: Prompt required.' }, { status: 400 });
    }

    const enhancedPrompt = `High fidelity, masterpiece album cover art: ${prompt}`;

    console.log(`[AI FOUNDRY: IMAGE] Synthesizing Neural Payload...`);

    const output: any = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: enhancedPrompt,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 90
        }
      }
    );

    let finalUrl = Array.isArray(output) ? output[0] : output;
    if (typeof finalUrl === 'object' && finalUrl !== null && 'url' in finalUrl) {
       finalUrl = typeof finalUrl.url === 'function' ? finalUrl.url() : finalUrl.url;
    }

    return NextResponse.json({ imageUrl: finalUrl, status: 'success' });

  } catch (error: any) {
    console.error('[AI FOUNDRY] Error:', error);
    return NextResponse.json({ error: error.message || 'Foundry synthesis failed.' }, { status: 500 });
  }
}
