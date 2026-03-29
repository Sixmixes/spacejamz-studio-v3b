import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate();

export async function POST(request: Request) {
  try {
    const { prompt, faceUrl } = await request.json();

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'System Halt: REPLICATE_API_TOKEN is missing.' }, { status: 500 });
    }

    if (!prompt || !faceUrl) {
      return NextResponse.json({ error: 'Identity Matrix Error: Prompt and Face Payload required.' }, { status: 400 });
    }

    console.log(`[AI FOUNDRY: FACESWAP] Mapping Identity onto Neural Matrix...`);

    // Using lucataco/instantid for professional identity synthesis
    const output: any = await replicate.run(
      "lucataco/instantid:6af360be1c48ba42ca5f6c82705663de40ff8f2939b7520448130a0da33caa9c",
      {
        input: {
          image: faceUrl,
          prompt: `High fidelity, masterpiece album cover art: ${prompt}`,
          negative_prompt: "(lowres, low quality, worst quality:1.2), (text:1.2), (watermark:1.2), (username:1.2), (signature:1.2)",
          adapter_strength_ratio: 0.8,
          identitynet_strength_ratio: 0.8
        }
      }
    );

    let finalUrl = Array.isArray(output) ? output[0] : output;
    if (typeof finalUrl === 'object' && finalUrl !== null && 'url' in finalUrl) {
       finalUrl = typeof finalUrl.url === 'function' ? finalUrl.url() : finalUrl.url;
    }

    return NextResponse.json({ imageUrl: finalUrl, status: 'success' });

  } catch (error: any) {
    console.error('[AI FOUNDRY] FaceSwap Error:', error);
    return NextResponse.json({ error: error.message || 'Identity mapping failed.' }, { status: 500 });
  }
}
