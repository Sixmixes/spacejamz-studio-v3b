import { NextResponse } from 'next/server';

/**
 * Cloud Stream Tunnel
 * Circumvents client-side Web Audio API CORS blockouts when analyzing 
 * cross-origin networks (Suno/YouTube streaming buffers) natively inside the browser.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const audioUrl = searchParams.get('url');

    if (!audioUrl) return new NextResponse("Missing URL", { status: 400 });

    try {
        const response = await fetch(audioUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": audioUrl.includes("suno") ? "https://suno.com" : ""
            }
        });

        if (!response.ok) {
            throw new Error(`Target firewall blocked proxy. Status: ${response.status}`);
        }

        const headers = new Headers(response.headers);
        // Force the physical byte response to be accepted by the browser WebGL AudioContext analyzer
        headers.set('Access-Control-Allow-Origin', '*'); 
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

        return new NextResponse(response.body, {
            status: 200,
            headers,
        });
    } catch (error: any) {
        console.error("Proxy Error:", error);
        return new NextResponse("Matrix Proxy Failed", { status: 500 });
    }
}
