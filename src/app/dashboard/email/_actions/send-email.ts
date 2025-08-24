
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
        return { error: 'Invalid Resend API Key. Please configure it in Business Info settings.' };
    }
    if (!fromEmail || !toEmail) {
        return { error: 'From and To email addresses must be provided in Business Info settings.' };
    }
    
    const resend = new Resend(apiKey);

    try {
        const { error } = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: `A&K Babyshop Daily Report - ${new Date().toLocaleDateString()}`,
            html: htmlContent,
        });

        if (error) {
            console.error("Email sending failed", error);
            // Provide a more specific error message if available
            return { error: `Failed to send email: ${error.message}` };
        }

        return {};
    } catch (e: any) {
        console.error("Email sending failed with exception", e);
        return { error: e.message || 'An unexpected error occurred while sending the email.' };
    }
}
