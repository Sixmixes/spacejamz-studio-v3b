import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        let url = body.url;

        if (!url) {
            return NextResponse.json({ error: "No URL provided for telemetry" }, { status: 400 });
        }

        console.log(`[INGESTION_NODE] Extracting: ${url}`);

        // --- SPACEJAMZ CUSTOM SUNO ABSTRACTION ---
        if (url.includes('suno.com') || url.includes('suno.ai')) {
            // Natively follow the HTTP 302 Redirect to reveal the hidden /song/ ID
            const res = await fetch(url, { redirect: "follow" });
            const finalUrl = res.url || url;

            if (finalUrl.includes('/song/')) {
                const uuid = finalUrl.split('/song/')[1].split('?')[0].replace(/\//g, '');
                const directUrl = `https://cdn1.suno.ai/${uuid}.mp3`;
                
                return NextResponse.json({
                    success: true,
                    title: `Suno Neural Signal (${uuid.substring(0,6)})`,
                    streamUrl: directUrl,
                    type: "suno"
                });
            } else {
                return NextResponse.json({ error: "Suno extraction failed. Firewall intact." }, { status: 500 });
            }
        }

        // --- YOUTUBE / SOUNDCLOUD (Using yt-dlp) ---
        // Scrapes the raw media link bypassing browser blocks
        const ytInfo = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            format: 'bestaudio',
        }).catch(err => {
            console.error(err);
            throw new Error("Unable to pierce YouTube/SC Firewall.");
        });

        const data = ytInfo as any;
        return NextResponse.json({
            success: true,
            title: data.title || "Unknown Encrypted Track",
            streamUrl: data.url, // Raw Direct CDN Stream
            type: "youtube-dl",
            thumbnail: data.thumbnail
        });

    } catch (error: any) {
        console.error("Ingestion Error:", error);
        return NextResponse.json({ error: Object.keys(error).length ? error.message : "Failed to ingest stream link." }, { status: 500 });
    }
}
