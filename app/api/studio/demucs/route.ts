import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { audioUrl } = await req.json();

        if (!audioUrl) {
            return NextResponse.json({ error: "Missing Neural Audio Payload" }, { status: 400 });
        }

        const replicateToken = process.env.REPLICATE_API_TOKEN;
        if (!replicateToken) {
            throw new Error("REPLICATE_API_TOKEN is missing or corrupted from system terminal.");
        }
        
        console.log(`[VELOCITY DEMUCS] Initiating GPU Stem Extraction Pipeline on Target Payload...`);

        // Initialize the Replicate Demucs model
        const initRes = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                "Authorization": `Token ${replicateToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "25a173108cff36ef9f80f854c162d01df9e6528be175794b81158fa03836d953",
                input: {
                    audio: audioUrl,
                    model_name: "htdemucs", // The highest fidelity mathematical iteration
                    mp3_bitrate: 320,
                    output_format: "mp3"
                }
            })
        });

        if (!initRes.ok) {
            const err = await initRes.json();
            throw new Error(err.detail || "Replicate GPU Inference Refused Access.");
        }

        const initData = await initRes.json();
        const getUrl = initData.urls.get;

        console.log(`[VELOCITY DEMUCS] Polling A100 GPUs...`);

        // Long-poll Replicate until processing achieves singularity
        let prediction = initData;
        let attempts = 0;
        
        while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 120) {
            await new Promise(r => setTimeout(r, 2000)); // Poll every 2 seconds to prevent throttling
            const pollRes = await fetch(getUrl, {
                headers: { "Authorization": `Token ${replicateToken}` }
            });
            prediction = await pollRes.json();
            attempts++;
        }

        if (prediction.status === 'failed') {
            throw new Error("Demucs Mathematical Exception. Stem processing failed in the cluster.");
        }

        if (!prediction.output) {
             throw new Error("Zero stem data returned by Neural Engine.");
        }

        // cjwbw/demucs output is an object natively mapping: vocals, bass, drums, other
        console.log(`[VELOCITY DEMUCS] Stems Successfully Shattered & Reconstructed.`);

        return NextResponse.json({
            success: true,
            stems: prediction.output
        });

    } catch (e: any) {
        console.error("[DEMUCS EXCEPTION]", e);
        return NextResponse.json({ error: e.message || "Unknown hardware cluster failure." }, { status: 500 });
    }
}
