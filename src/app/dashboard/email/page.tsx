
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateEmailReport, EmailReportInput } from '@/ai/flows/generate-email-report';
import { Loader2, Send, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PasswordProtectedRoute } from '@/components/auth/password-protected-route';
import { mockProducts, mockSales } from '@/lib/mock-data'; 
import { sendEmail } from './_actions/send-email';


function EmailPageContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [reportHtml, setReportHtml] = React.useState<string | null>(null);

  const handleGenerateAndSend = async () => {
    setIsLoading(true);
    setReportHtml(null);

    try {
      // 1. Prepare data for the AI (using mock data for this example)
      const lowStockItems = mockProducts.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
      const outOfStockItems = mockProducts.filter(p => p.stock === 0);
      const salesData = mockSales.flatMap(s => s.items).reduce((acc, item) => {
        const existing = acc.find(i => i.name === item.name);
        if (existing) {
          existing.quantitySold += item.quantity;
          existing.totalRevenue += item.price * item.quantity;
        } else {
          acc.push({ name: item.name, quantitySold: item.quantity, totalRevenue: item.price * item.quantity });
        }
        return acc;
      }, [] as { name: string; quantitySold: number; totalRevenue: number }[]);

      const aiInput: EmailReportInput = {
        salesData,
        lowStockItems,
        outOfStockItems,
      };

      // 2. Generate Report using Genkit Flow
      const result = await generateEmailReport(aiInput);
      setReportHtml(result.htmlBody);
      
      // 3. Send the email via Server Action
      const sendResult = await sendEmail(result.htmlBody);

      if (sendResult.error) {
        throw new Error(sendResult.error);
      }

      toast({
        title: 'Report Sent!',
        description: 'The daily sales and inventory report has been sent successfully.',
      });

    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: e.message || 'Failed to generate or send the report.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Daily Email Report</CardTitle>
                <CardDescription>
                Generate and send the daily sales and inventory report to the management team.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>How It Works</AlertTitle>
                    <AlertDescription>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Clicking the button gathers the latest sales and stock data.</li>
                            <li>An AI flow organizes this data into a professional HTML email.</li>
                            <li>The generated email is sent using the Resend service.</li>
                            <li>Ensure your Resend API key is set in the <code>.env</code> file.</li>
                        </ol>
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleGenerateAndSend} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Generating and Sending...' : 'Generate and Send Report'}
                </Button>
            </CardFooter>
        </Card>

        {reportHtml && (
            <Card>
                <CardHeader>
                    <CardTitle>Email Preview</CardTitle>
                    <CardDescription>This is a preview of the email that was sent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md p-4 bg-white text-black">
                        <div dangerouslySetInnerHTML={{ __html: reportHtml }} />
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}


export default function EmailPage() {
    return (
        <PasswordProtectedRoute pageTitle="Email Reports">
            <EmailPageContent />
        </PasswordProtectedRoute>
    );
}
