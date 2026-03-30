import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as Blob;
        const fileName = formData.get('fileName') as string;
        const mimeType = formData.get('mimeType') as string;

        if (!file || !fileName) {
            return NextResponse.json({ error: 'Missing file payload.' }, { status: 400 });
        }

        // Parse Service Account Keys Securely
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!clientEmail || !privateKey) {
            return NextResponse.json({ error: '30TB Matrix is not mapped in Identity Environment.' }, { status: 500 });
        }

        const jwtClient = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });

        await jwtClient.authorize();
        const drive = google.drive({ version: 'v3', auth: jwtClient });

        // Convert incoming Blob to Node Stream
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const requestBody: any = {
            name: fileName,
            mimeType: mimeType || 'application/octet-stream',
        };

        // If the user has explicitly linked a 30TB Drive Shared Folder, mount it.
        if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
            requestBody.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
        }

        const media = {
            mimeType: mimeType || 'application/octet-stream',
            body: stream,
        };

        // Execute API Upload
        const driveResponse = await drive.files.create({
            requestBody,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        const fileId = driveResponse.data.id;
        
        // Unseal the asset so the SpaceJamz Client can render it
        if (fileId) {
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
        }

        // Return the raw direct-download link if available, otherwise fallback to standard viewer
        const directUrl = driveResponse.data.webContentLink || driveResponse.data.webViewLink;

        return NextResponse.json({ success: true, url: directUrl, fileId: fileId }, { status: 200 });

    } catch (error: any) {
        console.error('Google Drive Matrix Error:', error);
        return NextResponse.json({ error: error.message || 'Fatal Drive Sync Error' }, { status: 500 });
    }
}
