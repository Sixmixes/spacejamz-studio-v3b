import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileId = searchParams.get('fileId');

        if (!fileId) return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });

        const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            return NextResponse.json({ error: 'Drive Credentials Missing' }, { status: 500 });
        }

        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Retrieve metadata first to get the correct MIME type
        const metadata = await drive.files.get({
            fileId: fileId,
            fields: 'name, mimeType, size'
        });

        // Steam the actual bytes from Google's physical server array
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, { responseType: 'stream' });

        const nodeStream = response.data as Readable;
        
        const webStream = new ReadableStream({
            start(controller) {
                nodeStream.on('data', (chunk) => {
                    try {
                        if (controller.desiredSize !== null) {
                            controller.enqueue(chunk);
                        }
                    } catch (e) {
                        nodeStream.destroy();
                    }
                });
                nodeStream.on('end', () => {
                    try { controller.close(); } catch (e) {}
                });
                nodeStream.on('error', (err) => {
                    try { controller.error(err); } catch (e) {}
                });
            },
            cancel() {
                nodeStream.destroy();
            }
        });

        const headers = new Headers();
        headers.set('Content-Type', metadata.data.mimeType || 'application/octet-stream');
        headers.set('Content-Disposition', `inline; filename="${metadata.data.name}"`);
        if (metadata.data.size) headers.set('Content-Length', metadata.data.size);
        
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new Response(webStream, {
            status: 200,
            headers,
        });

    } catch (err: any) {
        console.error('Proxy GET Error:', err);
        return NextResponse.json({ error: 'Failed to stream from personal drive matix' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as Blob;
        const fileName = formData.get('fileName') as string;
        const mimeType = formData.get('mimeType') as string;

        if (!file || !fileName) {
            return NextResponse.json({ error: 'Missing file payload.' }, { status: 400 });
        }

        const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            return NextResponse.json({ error: 'Personal Drive Matrix is not mapped in Identity Environment.' }, { status: 500 });
        }

        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const requestBody: any = {
            name: fileName,
            mimeType: mimeType || 'application/octet-stream',
        };

        if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
            requestBody.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
        }

        const media = {
            mimeType: mimeType || 'application/octet-stream',
            body: stream,
        };

        console.log("Starting Personal Drive Synthesis sequence...");
        const driveResponse = await drive.files.create({
            requestBody,
            media: media,
            supportsAllDrives: true,
            fields: 'id',
        });

        const fileId = driveResponse.data.id;
        
        // Return our own proxy URL instead of relying on public Google subdomains
        const proxyUrl = `/api/storage/drive?fileId=${fileId}`;
        console.log("Synthesized Proxy Link:", proxyUrl);

        return NextResponse.json({ success: true, url: proxyUrl, fileId: fileId }, { status: 200 });

    } catch (error: any) {
        console.error('Personal Google Drive Matrix Error:', error);
        return NextResponse.json({ error: error.message || 'Fatal Personal Drive Sync Error' }, { status: 500 });
    }
}
