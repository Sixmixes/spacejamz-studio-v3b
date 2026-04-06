import { NextResponse } from 'next/server';

const MOCK_MISSIONS = [
    {
        id: 'mission-001',
        title: 'NEON CHASE: CYBERPUNK SYNC',
        description: 'High-energy electronic tracks for a major AAA cyber-thriller game. Focus on aggressive synth leads and industrial percussion.',
        genre: 'Cyberpunk / Mid-Tempo',
        deadline: '2026-04-05T00:00:00Z',
        bpm: '105 - 110',
        reward: 'Level 4 Clearance + $500 Sync',
        refAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        status: 'active',
        difficulty: 'EASY',
    },
    {
        id: 'mission-002',
        title: 'ABYSSAL VOID: ATMOSPHERIC AMBIENT',
        description: 'Ethereal, dark ambient textures for an upcoming sci-fi anthology. No rhythm, focus on sonic depth and haunting pads.',
        genre: 'Dark Ambient / Drone',
        deadline: '2026-04-10T00:00:00Z',
        bpm: 'N/A',
        reward: 'Matrix King Points + $1.2k License',
        refAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        status: 'active',
        difficulty: 'MEDIUM',
    }
];

export async function GET() {
    return NextResponse.json({
        status: 'ONLINE',
        system: 'SPACEJAMZ-SYNCSPACE-V3',
        missions: MOCK_MISSIONS
    });
}
