import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

// Initialize the API client
const replicate = new Replicate();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, batchSize = 1 } = body;

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

    const numRuns = typeof batchSize === 'number' ? batchSize : parseInt(batchSize, 10);
    let finalUrls: string[] = [];
    
    // Process sequentially to avoid Replicate burst concurrency throttles
    for (let i = 0; i < numRuns; i++) {
        let success = false;
        let attempt = 0;

        while (!success && attempt < 5) {
            try {
                attempt++;
                console.log(`[VELOCITY STUDIO: ART FOUNDRY] Compiling Visual Directive [${i + 1}/${numRuns}] - Attempt ${attempt}...`);
                
                const output = await replicate.run(
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

                console.log(`[VELOCITY STUDIO] Object Decoded [${i + 1}]:`, Boolean(output));

                // NEW NEURAL DECODING LOGIC
                if (Array.isArray(output)) {
                  for (const item of output) {
                    if (item instanceof ReadableStream) {
                      const reader = item.getReader();
                      const chunks: Uint8Array[] = [];
                      while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        chunks.push(value);
                      }
                      const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
                      finalUrls.push(`data:image/webp;base64,${buffer.toString('base64')}`);
                    } else if (typeof item === 'string') {
                      finalUrls.push(item);
                    } else if (typeof item === 'object' && item !== null && 'url' in item) {
                      finalUrls.push(typeof (item as any).url === 'function' ? (item as any).url() : (item as any).url);
                    }
                  }
                } else if (typeof output === 'string') {
                    finalUrls.push(output);
                } else if (typeof output === 'object' && output !== null && 'url' in output) {
                    finalUrls.push(typeof (output as any).url === 'function' ? (output as any).url() : (output as any).url);
                }
                
                success = true;

                // Artificial stagger between requested items regardless of failure to keep bucket healthy
                if (i < numRuns - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                
            } catch (error: any) {
                const errMsg = error.message || '';
                if (error.response?.status === 429 || errMsg.includes('429')) {
                    const match = errMsg.match(/RETRY_AFTER["']?:(\d+)/i);
                    const waitSecs = match ? parseInt(match[1], 10) : 4;
                    console.log(`[VELOCITY STUDIO] Network Throttle active. Holding buffer for ${waitSecs}s...`);
                    await new Promise(r => setTimeout(r, waitSecs * 1000));
                } else {
                    throw error;
                }
            }
        }
    }

    return NextResponse.json({ 
        urls: finalUrls,
        status: 'success'
    });

  } catch (error: any) {
    console.error('[VELOCITY STUDIO] Critical Visual Routing Error:', error);
    
    // Check if it's a native Node fetch failure mapped as 'fetch failed'
    if (error.message === 'fetch failed' || error.cause?.code === 'ECONNREFUSED') {
        return NextResponse.json(
            { error: 'Neural Gateway Offline. Unable to reach Replicate synthesis matrix locally.' },
            { status: 504 }
        );
    }
    
    return NextResponse.json(
      { error: error.message || 'Art Foundry failed to synthesize the 1024x1024 visual matrix.' },
      { status: 500 }
    );
  }
}
