
'use server';

import { Resend } from 'resend';

type SendEmailPayload = {
    htmlContent: string;
    apiKey: string;
    fromEmail: string;
    toEmail: string;
}

export async function sendEmail({ htmlContent, apiKey, fromEmail, toEmail }: SendEmailPayload): Promise<{error?: string}> {
    if (!apiKey || apiKey.startsWith('re_xxxx')) {
        return { error: 'Invalid Resend API Key.' };
    }
    if (!fromEmail || !toEmail) {
        return { error: 'From and To email addresses must be provided.' };
    }
    
    const resend = new Resend(apiKey);

    try {
        await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: `A&K Babyshop Daily Report - ${new Date().toLocaleDateString()}`,
            html: htmlContent,
        });
        return {};
    } catch (e: any) {
        console.error("Email sending failed", e);
        return { error: e.message || 'Failed to send email.' };
    }
}
