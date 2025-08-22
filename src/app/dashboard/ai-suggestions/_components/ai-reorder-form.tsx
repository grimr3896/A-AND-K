"use client";

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { suggestReorderItems, SuggestReorderItemsOutput } from '@/ai/flows/suggest-reorder-items';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  salesData: z.string().min(1, { message: 'Sales data is required.' }),
  productDetails: z.string().min(1, { message: 'Product details are required.' }),
});

type AiReorderFormProps = {
  defaultSalesData: string;
  defaultProductDetails: string;
};

export function AiReorderForm({ defaultSalesData, defaultProductDetails }: AiReorderFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<SuggestReorderItemsOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesData: defaultSalesData,
      productDetails: defaultProductDetails,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await suggestReorderItems(values);
      setResult(response);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salesData"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales Data (JSON)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter sales data" className="min-h-[200px] font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Details (JSON)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter product details" className="min-h-[200px] font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Get Suggestions
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-8">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && result.itemsToReorder && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Reorder Suggestions</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.itemsToReorder.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </FormProvider>
  );
}
