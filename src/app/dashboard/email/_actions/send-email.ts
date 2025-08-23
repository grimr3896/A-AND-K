
'use server';

import { Resend } from 'resend';

export async function sendEmail(htmlContent: string): Promise<{error?: string}> {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await resend.emails.send({
            from: process.env.FROM_EMAIL!,
            to: 'delivered@resend.dev', // For testing, this sends to your own email
            subject: `A&K Babyshop Daily Report - ${new Date().toLocaleDateString()}`,
            html: htmlContent,
        });
        return {};
    } catch (e: any) {
        console.error("Email sending failed", e);
        return { error: e.message || 'Failed to send email.' };
    }
}
