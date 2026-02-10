// API endpoint for generating TwiML voice call content
import { NextRequest, NextResponse } from 'next/server';
import { createEmergencyCallTwiML } from '@/lib/twilio';

export async function POST(request: NextRequest) {
    try {
        // Parse any parameters from the request
        const formData = await request.formData();
        const patientName = formData.get('patientName')?.toString();
        const location = formData.get('location')?.toString();

        // Generate the TwiML response
        const twiml = await createEmergencyCallTwiML(patientName, location);

        return new NextResponse(twiml, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });

    } catch (error) {
        console.error('TwiML generation error:', error);

        // Return a basic emergency TwiML on error
        const basicTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Emergency alert. SOS button has been activated. Please respond immediately.</Say>
    <Pause length="2"/>
    <Say voice="alice">Press 1 to acknowledge this emergency.</Say>
    <Gather action="/api/emergency/response" method="POST" numDigits="1" timeout="30">
        <Say voice="alice">Waiting for your response...</Say>
    </Gather>
    <Say voice="alice">No response received. Please contact emergency services immediately.</Say>
</Response>`;

        return new NextResponse(basicTwiml, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });
    }
}