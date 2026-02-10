// API endpoint for handling TwiML call responses
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Parse the form data from Twilio
        const formData = await request.formData();
        const digits = formData.get('Digits');

        console.log('📞 Emergency call response received:', { digits });

        // Create TwiML response based on user input
        let twimlResponse = '';

        if (digits === '1') {
            // User acknowledged the emergency
            twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Thank you for acknowledging the emergency alert. Emergency services have been notified. Stay safe.</Say>
</Response>`;
        } else {
            // No response or wrong input
            twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Emergency alert acknowledged. If this is a real emergency, please contact emergency services immediately. Stay safe.</Say>
</Response>`;
        }

        return new NextResponse(twimlResponse, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });

    } catch (error) {
        console.error('TwiML response error:', error);

        // Return a basic TwiML response on error
        const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">An error occurred. Please contact emergency services if needed.</Say>
</Response>`;

        return new NextResponse(errorResponse, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });
    }
}