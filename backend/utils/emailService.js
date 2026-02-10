const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_APP_PASSWORD,
        },
    });
};

/**
 * Generate a Google Meet-style link.
 * Uses a random code to create a real meet.google.com/new URL pattern.
 */
const generateMeetLink = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const segment = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    // Format: xxx-xxxx-xxx (Google Meet style)
    const code = `${segment(3)}-${segment(4)}-${segment(3)}`;
    return `https://meet.google.com/${code}`;
};

/**
 * Send appointment confirmation emails to both doctor and patient.
 */
const sendAppointmentEmails = async ({
    patientName,
    patientEmail,
    doctorName,
    doctorEmail,
    appointmentDate,
    appointmentType,
    purpose,
    notes,
    meetingLink,
    appointmentId,
}) => {
    const transporter = createTransporter();

    const dateObj = new Date(appointmentDate);
    const formattedDate = dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    const isOnline = appointmentType === 'Online';

    // ---- Beautiful HTML Email Template ----
    const buildEmailHTML = (recipientName, isDoctor) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:32px 24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">VaidyaSetu</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">AI-Powered Healthcare Network</p>
        </div>

        <!-- Green accent bar -->
        <div style="height:4px;background:linear-gradient(to right,#10b981,#06b6d4,#10b981);"></div>

        <!-- Content -->
        <div style="padding:32px 28px;">
            <h2 style="margin:0 0 6px;color:#1a1a2e;font-size:22px;">Appointment ${isDoctor ? 'Scheduled' : 'Confirmed'} ✅</h2>
            <p style="margin:0 0 24px;color:#666;font-size:14px;">
                Hello <strong>${recipientName}</strong>, your ${appointmentType.toLowerCase()} consultation has been ${isDoctor ? 'scheduled' : 'confirmed'}.
            </p>

            <!-- Appointment Details Card -->
            <div style="background:#f8fffe;border:1px solid #d1fae5;border-radius:12px;padding:20px;margin-bottom:24px;">
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:8px 0;color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;width:120px;">📅 Date</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${formattedDate}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🕐 Time</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${formattedTime}</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📍 Type</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${appointmentType} Consultation</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 0;color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">${isDoctor ? '🧑‍⚕️ Patient' : '👨‍⚕️ Doctor'}</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;font-weight:600;">${isDoctor ? patientName : doctorName}</td>
                    </tr>
                    ${purpose ? `
                    <tr>
                        <td style="padding:8px 0;color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📝 Purpose</td>
                        <td style="padding:8px 0;color:#1a1a2e;font-size:14px;">${purpose}</td>
                    </tr>
                    ` : ''}
                    ${notes ? `
                    <tr>
                        <td style="padding:8px 0;color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📋 Notes</td>
                        <td style="padding:8px 0;color:#555;font-size:13px;">${notes}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>

            ${isOnline && meetingLink ? `
            <!-- Google Meet Link -->
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 4px;font-size:13px;color:#666;">🎥 Google Meet Link for your consultation</p>
                <a href="${meetingLink}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:700;margin-top:12px;letter-spacing:0.5px;">
                    Join Google Meet
                </a>
                <p style="margin:12px 0 0;font-size:12px;color:#999;">
                    Or copy this link: <a href="${meetingLink}" style="color:#10b981;word-break:break-all;">${meetingLink}</a>
                </p>
            </div>
            ` : ''}

            <!-- Appointment ID -->
            <div style="text-align:center;margin-bottom:16px;">
                <span style="display:inline-block;background:#f1f5f9;border-radius:8px;padding:8px 16px;font-size:12px;color:#888;font-family:monospace;">
                    Appointment ID: <strong style="color:#333">${appointmentId || 'N/A'}</strong>
                </span>
            </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8fafb;border-top:1px solid #eee;padding:20px 28px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;color:#aaa;">
                This is an automated notification from VaidyaSetu Healthcare Network.
            </p>
            <p style="margin:0;font-size:11px;color:#ccc;">
                © ${new Date().getFullYear()} VaidyaSetu • AI-Powered Healthcare
            </p>
        </div>
    </div>
</body>
</html>`;

    // Send to patient
    const patientMailResult = patientEmail ? await transporter.sendMail({
        from: `"VaidyaSetu Healthcare" <${process.env.SMTP_EMAIL}>`,
        to: patientEmail,
        subject: `✅ Appointment Confirmed — ${formattedDate} at ${formattedTime} | VaidyaSetu`,
        html: buildEmailHTML(patientName || 'Patient', false),
    }) : null;

    // Send to doctor
    const doctorMailResult = doctorEmail ? await transporter.sendMail({
        from: `"VaidyaSetu Healthcare" <${process.env.SMTP_EMAIL}>`,
        to: doctorEmail,
        subject: `📋 New Appointment Scheduled — ${patientName} on ${formattedDate} | VaidyaSetu`,
        html: buildEmailHTML(doctorName || 'Doctor', true),
    }) : null;

    console.log(`📧 Emails sent — Patient: ${patientMailResult?.messageId || 'skipped'}, Doctor: ${doctorMailResult?.messageId || 'skipped'}`);

    return { patientMailResult, doctorMailResult };
};

module.exports = {
    generateMeetLink,
    sendAppointmentEmails,
};
