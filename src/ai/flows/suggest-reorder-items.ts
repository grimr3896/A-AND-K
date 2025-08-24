
'use server';

/**
 * @fileOverview An AI tool that analyzes sales data and product details to suggest items for reordering.
 *
 * - suggestReorderItems - A function that handles the item reordering suggestion process.
 * - SuggestReorderItemsInput - The input type for the suggestReorderItems function.
 * - SuggestReorderItemsOutput - The return type for the suggestReorderItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestReorderItemsInputSchema = z.object({
  salesData: z.string().describe('Sales data, including product names and sales figures.'),
  productDetails: z.string().describe('Product details, including names, categories, and current stock levels.'),
});
export type SuggestReorderItemsInput = z.infer<typeof SuggestReorderItemsInputSchema>;

const SuggestReorderItemsOutputSchema = z.object({
  itemsToReorder: z.array(
    z.object({
      productName: z.string().describe('The name of the product to reorder.'),
      quantity: z.number().describe('The suggested quantity to reorder.'),
      reason: z.string().describe('The reason for suggesting the reorder.'),
    })
  ).describe('A list of items to reorder, with suggested quantities and reasons.'),
});
export type SuggestReorderItemsOutput = z.infer<typeof SuggestReorderItemsOutputSchema>;

export async function suggestReorderItems(input: SuggestReorderItemsInput): Promise<SuggestReorderItemsOutput> {
  return suggestReorderItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestReorderItemsPrompt',
  input: {schema: SuggestReorderItemsInputSchema},
  output: {schema: SuggestReorderItemsOutputSchema},
  prompt: `You are an AI assistant designed to analyze sales data and product details to suggest items for reordering. Based on the sales data and product details provided, suggest items that need to be reordered, the quantity to reorder, and the reason for the reorder.

Sales Data: {{{salesData}}}
Product Details: {{{productDetails}}}

Consider factors such as sales trends, current stock levels, and product categories when making your suggestions. Provide a clear and concise list of items to reorder, the suggested quantity, and the reason for each suggestion.

Ensure that the suggested quantities align with typical order sizes for each product. If data is incomplete or unclear, state your assumptions.
`, 
});

const suggestReorderItemsFlow = ai.defineFlow(
  {
    name: 'suggestReorderItemsFlow',
    inputSchema: SuggestReorderItemsInputSchema,
    outputSchema: SuggestReorderItemsOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        if (!output) {
            throw new Error("AI failed to generate suggestions. The output was empty.");
        }
        return output;
    } catch (error: any) {
        console.error("Error in suggestReorderItemsFlow:", error);
        // Re-throw a more user-friendly error message
        throw new Error(`AI suggestion failed: ${error.message || 'An unexpected error occurred.'}`);
    }
  }
);
