import { NextResponse } from 'next/server';
import Replicate from 'replicate';

// Initialize the API client
const replicate = new Replicate();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    // Security check: Ensure the token exists before hitting the matrix
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'System Halt: REPLICATE_API_TOKEN is missing or unauthorized.' },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prism Core Error: Visual system directives are required.' },
        { status: 400 }
      );
    }

    // Force a 1:1 Spotify/Apple Music standard crop directly into the Flux parameter stack
    const enhancedPrompt = `High fidelity, masterpiece album cover art: ${prompt}`;

    console.log(`[VELOCITY STUDIO: ART FOUNDRY] Compiling Visual Directive...`);

    // Flux Schnell executes in ~1-2 seconds for roughly $0.003
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: enhancedPrompt,
          aspect_ratio: "1:1",
          output_format: "webp", // WebP is inherently smaller/faster for rendering the dashboard
          output_quality: 90
        }
      }
    );

    console.log('[VELOCITY STUDIO] Object Decoded:', output);

    let finalUrl = '';
    
    // NEW NEURAL DECODING LOGIC: Replicate SDK now returns ReadableStreams for some models
    if (Array.isArray(output) && output[0] instanceof ReadableStream) {
      console.log('[VELOCITY STUDIO] Decoding Neural Bitstream...');
      const reader = (output[0] as ReadableStream).getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
      const base64 = buffer.toString('base64');
      finalUrl = `data:image/webp;base64,${base64}`;
      console.log('[VELOCITY STUDIO] Neural Bitstream Synthesis Complete.');
    } else if (Array.isArray(output)) {
        finalUrl = typeof output[0] === 'string' ? output[0] : (output[0].url ? output[0].url() : output[0]);
    } else if (typeof output === 'object' && output !== null && 'url' in output) {
        finalUrl = typeof (output as any).url === 'function' ? (output as any).url() : (output as any).url;
    } else if (typeof output === 'string') {
        finalUrl = output;
    }

    return NextResponse.json({ 
        url: finalUrl,
        status: 'success'
    });

  } catch (error: any) {
    console.error('[VELOCITY STUDIO] Critical Visual Routing Error:', error);
    return NextResponse.json(
      { error: error.message || 'Art Foundry failed to synthesize the 1024x1024 visual matrix.' },
      { status: 500 }
    );
  }
}
