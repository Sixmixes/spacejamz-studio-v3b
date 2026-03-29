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
      return NextResponse.json({ error: 'Neural Sequencer Error: Frame directives required.' }, { status: 400 });
    }

    console.log(`[AI FOUNDRY: DEFORUM] Rendering Neural Video Sequence...`);

    // Using deforum model protocol
    // Defaulting to a high-quality cinematic output
    const output: any = await replicate.run(
      "deforum/deforum_stable_diffusion:e22e77440ac64851494f101981180378bc0f828a2a7f59847eede7a69bc1315e",
      {
        input: {
          animation_mode: "2D",
          max_frames: 120, // Keep it relatively short for efficiency as requested
          fps: 15,
          prompts: prompt, // Expected format: 0: prompt, 100: prompt
          angle: "0: (0)",
          zoom: "0: (1.04)",
          translation_x: "0: (0)",
          translation_y: "0: (0)",
          color_coherence: "Match Frame 0 LAB",
          sampler: "euler_ancestral",
          seed_step_specific: true
        }
      }
    );

    // Deforum returns a URL to the final mp4 in its output object
    let finalUrl = Array.isArray(output) ? output[output.length - 1] : output;
    if (typeof finalUrl === 'object' && finalUrl !== null && 'url' in finalUrl) {
       finalUrl = typeof finalUrl.url === 'function' ? finalUrl.url() : finalUrl.url;
    }

    // Sometimes Deforum returns an array where the last item is the video
    if (Array.isArray(output)) {
        const videoItem = output.find((item: any) => typeof item === 'string' && item.endsWith('.mp4'));
        if (videoItem) finalUrl = videoItem;
    }

    return NextResponse.json({ videoUrl: finalUrl, status: 'success' });

  } catch (error: any) {
    console.error('[AI FOUNDRY] Deforum Error:', error);
    return NextResponse.json({ error: error.message || 'Video synthesis failed.' }, { status: 500 });
  }
}
