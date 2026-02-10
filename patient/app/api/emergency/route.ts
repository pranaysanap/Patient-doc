// API endpoint for triggering emergency calls
import { NextRequest, NextResponse } from 'next/server';
import { makeEmergencyCall, validateTwilioConfig } from '@/lib/twilio';

export async function POST(request: NextRequest) {
    try {
        // Check if Twilio is properly configured
        if (!validateTwilioConfig()) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Twilio is not properly configured. Please check your environment variables.'
                },
                { status: 500 }
            );
        }

        // Parse request body
        const body = await request.json().catch(() => ({}));
        const { patientName, location, userAgent } = body;

        // Log the emergency call attempt
        console.log('🚨 EMERGENCY CALL TRIGGERED', {
            timestamp: new Date().toISOString(),
            patientName,
            location,
            userAgent,
            ip: request.ip || 'unknown'
        });

        // Make the emergency call
        const result = await makeEmergencyCall(patientName, location);

        if (result.success) {
            // Log successful call
            console.log('✅ Emergency call sent successfully', {
                callSid: result.callSid,
                smsSid: result.smsSid
            });

            return NextResponse.json({
                success: true,
                message: 'Emergency services have been notified',
                callId: result.callSid,
                smsId: result.smsSid
            });
        } else {
            // Log failed call
            console.error('❌ Emergency call failed', result.error);

            return NextResponse.json(
                {
                    success: false,
                    error: result.error || 'Failed to send emergency alert'
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Emergency API error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error occurred while processing emergency call'
            },
            { status: 500 }
        );
    }
}

// Handle GET requests (for testing)
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Emergency API is operational',
        timestamp: new Date().toISOString(),
        configured: validateTwilioConfig()
    });
}