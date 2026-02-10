// Twilio Configuration for SOS Emergency Calls
import Twilio from 'twilio';

// Initialize Twilio client with environment variables
function getTwilioClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not found. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your environment variables.');
    }

    return Twilio(accountSid, authToken);
}

// Configuration object for Twilio
export const twilioConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    emergencyContact: process.env.EMERGENCY_CONTACT_NUMBER,
};

// Validate Twilio configuration
export function validateTwilioConfig(): boolean {
    return !!(
        twilioConfig.accountSid &&
        twilioConfig.authToken &&
        twilioConfig.phoneNumber &&
        twilioConfig.emergencyContact
    );
}

// Make emergency call function
export async function makeEmergencyCall(patientName?: string, location?: string) {
    try {
        if (!validateTwilioConfig()) {
            throw new Error('Twilio configuration is incomplete');
        }

        const client = getTwilioClient();

        // Create the emergency message
        let voiceMessage = `Emergency alert! `;
        if (patientName) {
            voiceMessage += `${patientName} is in critical condition and needs medical help immediately. `;
        } else {
            voiceMessage += `A patient is in critical condition and needs medical help immediately. `;
        }
        if (location) {
            voiceMessage += `Patient location: ${location}. `;
        }
        voiceMessage += `Please respond as soon as possible.`;

        // Create TwiML voice response (inline, no URL needed - works with free tier)
        const twiml = new Twilio.twiml.VoiceResponse();
        twiml.say({ voice: 'alice' }, voiceMessage);
        twiml.pause({ length: 2 });
        twiml.say({ voice: 'alice' }, 'This is an automated emergency alert from EcoMedAi.');

        // Make the call with inline TwiML
        const call = await client.calls.create({
            to: twilioConfig.emergencyContact!,
            from: twilioConfig.phoneNumber!,
            twiml: twiml.toString(),  // Use inline TwiML instead of URL
        });

        // Create SMS message
        let smsMessage = `🚨 EMERGENCY ALERT! `;
        if (patientName) {
            smsMessage += `${patientName} is in critical condition and needs medical help immediately. `;
        } else {
            smsMessage += `A patient is in critical condition and needs medical help immediately. `;
        }
        if (location) {
            smsMessage += `Location: ${location}. `;
        }
        smsMessage += `Please respond or contact emergency services immediately.`;

        // Also send an SMS for backup
        const sms = await client.messages.create({
            body: smsMessage,
            to: twilioConfig.emergencyContact!,
            from: twilioConfig.phoneNumber!,
        });

        return {
            success: true,
            callSid: call.sid,
            smsSid: sms.sid,
            message: 'Emergency call and SMS sent successfully'
        };

    } catch (error) {
        console.error('Failed to make emergency call:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

// Create a custom TwiML response for emergency calls
export async function createEmergencyCallTwiML(patientName?: string, location?: string) {
    let message = `Emergency alert. SOS button activated.`;
    if (patientName) {
        message += ` Patient name: ${patientName}.`;
    }
    if (location) {
        message += ` Location: ${location}.`;
    }
    message += ` Please respond immediately.`;

    // TwiML response for voice call
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${message}</Say>
    <Pause length="2"/>
    <Say voice="alice">Press 1 to acknowledge this emergency, or hang up to call emergency services.</Say>
    <Gather action="/api/emergency/response" method="POST" numDigits="1" timeout="30">
        <Say voice="alice">Waiting for your response...</Say>
    </Gather>
    <Say voice="alice">No response received. Please contact emergency services immediately.</Say>
</Response>`;

    return twiml;
}

// Test Twilio connection
export async function testTwilioConnection() {
    try {
        if (!validateTwilioConfig()) {
            return { success: false, error: 'Configuration incomplete' };
        }

        const client = getTwilioClient();

        // Try to fetch account info to test connection
        const account = await client.api.accounts(twilioConfig.accountSid).fetch();

        return {
            success: true,
            message: 'Twilio connection successful',
            accountStatus: account.status,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Connection failed',
        };
    }
}