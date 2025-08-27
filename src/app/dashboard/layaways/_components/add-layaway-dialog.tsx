
"use client";

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product, Layaway } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/contexts/products-context';

type AddLayawayDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddLayaway: (layaway: Omit<Layaway, 'id' | 'lastPaymentDate' | 'status'> & { initialDeposit: number }) => void;
};

export function AddLayawayDialog({ isOpen, onOpenChange, onAddLayaway }: AddLayawayDialogProps) {
  const { toast } = useToast();
  const { products } = useProducts();

  // Dynamic schema based on the selected product
  const formSchema = z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    productId: z.string().min(1, 'Product is required'),
    totalAmount: z.coerce.number().min(0, 'Total amount cannot be negative'),
    initialDeposit: z.coerce.number().min(0, 'Initial deposit cannot be negative'),
  }).refine(data => data.initialDeposit <= data.totalAmount, {
      message: "Initial deposit cannot be greater than the total amount",
      path: ["initialDeposit"],
  }).refine(data => {
      const product = products.find(p => p.id === data.productId);
      return !product || data.totalAmount >= product.minPrice;
  }, {
      message: "Total amount cannot be less than the product's minimum price.",
      path: ["totalAmount"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      productId: '',
      totalAmount: 0,
      initialDeposit: 0,
    },
  });

  const selectedProductId = form.watch('productId');

  React.useEffect(() => {
    const product = products.find(p => p.id === selectedProductId);
    if (product) {
      form.setValue('totalAmount', product.price);
    } else {
      // Clear the amount if no product is selected
      form.setValue('totalAmount', 0);
    }
  }, [selectedProductId, products, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const product = products.find(p => p.id === values.productId);
    if (!product) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected product not found.' });
        return;
    }
    
    onAddLayaway({
        customerName: values.customerName,
        productName: product.name,
        totalAmount: values.totalAmount,
        amountPaid: values.initialDeposit,
        initialDeposit: values.initialDeposit,
    });
    form.reset();
  }

  const selectedProduct = products.find(p => p.id === selectedProductId);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Layaway Plan</DialogTitle>
          <DialogDescription>
            Enter the details for the new layaway plan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount (Ksh)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    {selectedProduct && <FormMessage>Min price: {selectedProduct.minPrice.toFixed(2)}</FormMessage>}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialDeposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Deposit (Ksh)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit">Create Layaway</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
