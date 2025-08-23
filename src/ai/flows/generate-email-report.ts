
'use server';
/**
 * @fileOverview An AI tool that generates a daily sales and inventory report email.
 *
 * - generateEmailReport - A function that handles the email generation process.
 */

import {ai} from '@/ai/genkit';
import { EmailReportInputSchema, EmailReportOutputSchema, type EmailReportInput, type EmailReportOutput } from '@/lib/types';


export async function generateEmailReport(input: EmailReportInput): Promise<EmailReportOutput> {
  return emailReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmailReportPrompt',
  input: {schema: EmailReportInputSchema},
  output: {schema: EmailReportOutputSchema},
  prompt: `You are an AI assistant for "A & K Babyshop". Your task is to generate a professional daily email report in HTML format.

The report must include the following sections:
1.  **Sales Summary:** A table showing yesterday's sales. The columns should be "Product Name", "Quantity Sold", and "Total Revenue (Ksh)".
2.  **Low Stock Items:** A list of items that are low in stock.
3.  **Out of Stock Items:** A list of items that are completely out of stock.
4.  **Best-Selling Products:** A highlighted section listing the top 3 best-selling products of the day by quantity.

Use clear headings, tables for structured data, and lists for stock information. The HTML should be clean, readable, and suitable for mobile and desktop email clients.

Here is the data for today's report:

**Sales Data:**
{{#each salesData}}
- {{name}}: {{quantitySold}} sold for a total of KSh {{totalRevenue}}
{{/each}}

**Low Stock Items:**
{{#if lowStockItems}}
{{#each lowStockItems}}
- {{name}}: {{quantityInStock}} left
{{/each}}
{{else}}
None
{{/if}}

**Out of Stock Items:**
{{#if outOfStockItems}}
{{#each outOfStockItems}}
- {{name}}
{{/each}}
{{else}}
None
{{/if}}

Generate the complete HTML for the email body now.
`,
});

const emailReportFlow = ai.defineFlow(
  {
    name: 'emailReportFlow',
    inputSchema: EmailReportInputSchema,
    outputSchema: EmailReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
