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
        if ((url.includes('suno.com') || url.includes('suno.ai')) && !url.includes('/playlist/')) {
            // Natively follow the HTTP 302 Redirect and read HTML to decrypt metadata
            const res = await fetch(url, { 
                redirect: "follow",
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            
            const finalUrl = res.url || url;
            const htmlText = await res.text();
            
            let trackTitle = "UNKNOWN SUNO TRACK";
            
            // Aggressively rip out the OpenGraph Title metadata using Regex
            const titleMatch = htmlText.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
            if (titleMatch && titleMatch[1]) {
                trackTitle = titleMatch[1];
                // Strip out Suno's standard "by @username" suffix
                if (trackTitle.includes(' - a song by')) {
                    trackTitle = trackTitle.split(' - a song by')[0].trim();
                } else if (trackTitle.includes('by @')) {
                    trackTitle = trackTitle.split('by @')[0].trim();
                }
            } else {
                // Fallback to standard HTML <title> tag
                const basicTitleMatch = htmlText.match(/<title>([^<]+)<\/title>/i);
                if (basicTitleMatch && basicTitleMatch[1]) {
                     trackTitle = basicTitleMatch[1].replace('Suno', '').replace('- ', '').trim();
                }
            }

            if (finalUrl.includes('/song/')) {
                const uuid = finalUrl.split('/song/')[1].split('?')[0].replace(/\//g, '');
                const directUrl = `https://cdn1.suno.ai/${uuid}.mp3`;
                
                return NextResponse.json({
                    success: true,
                    title: trackTitle.toUpperCase(),
                    streamUrl: directUrl,
                    type: "suno"
                });
            } else {
                return NextResponse.json({ error: "Suno extraction failed. Firewall intact." }, { status: 500 });
            }
        }

        // --- YOUTUBE / SOUNDCLOUD / SUNO PLAYLISTS (Using yt-dlp) ---
        // Scrapes the raw media link bypassing browser blocks
        const ytInfo = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            callHome: false,
            format: 'bestaudio',
            flatPlaylist: true
        }).catch(err => {
            console.error(err);
            throw new Error("Unable to pierce Extractor Firewall.");
        });

        const data = ytInfo as any;
        
        // Handle Playlist Arrays natively
        if (data.entries && Array.isArray(data.entries)) {
             return NextResponse.json({
                  success: true,
                  isPlaylist: true,
                  playlistTitle: data.title || "Decrypted External Playlist",
                  tracks: data.entries.map((t: any) => ({
                       title: t.title || "Unknown Encrypted Track",
                       streamUrl: t.url,
                       type: url.includes('suno') ? 'suno' : 'youtube-dl',
                       thumbnail: t.thumbnail
                  })).filter((t: any) => t.streamUrl)
             });
        }

        return NextResponse.json({
            success: true,
            title: data.title || "Unknown Encrypted Track",
            streamUrl: data.url, // Raw Direct CDN Stream
            type: url.includes('suno') ? 'suno' : 'youtube-dl',
            thumbnail: data.thumbnail
        });

    } catch (error: any) {
        console.error("Ingestion Error:", error);
        return NextResponse.json({ error: Object.keys(error).length ? error.message : "Failed to ingest stream link." }, { status: 500 });
    }
}
