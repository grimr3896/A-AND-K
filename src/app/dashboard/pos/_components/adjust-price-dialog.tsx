
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

type AdjustPriceDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: CartItem;
  onPriceAdjust: (itemId: string, newPrice: number, reason: string) => void;
};

export function AdjustPriceDialog({ isOpen, onOpenChange, item, onPriceAdjust }: AdjustPriceDialogProps) {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [isManagerAlertOpen, setIsManagerAlertOpen] = React.useState(false);
  const [managerPassword, setManagerPassword] = React.useState('');
  
  const formSchema = z.object({
    agreedPrice: z.coerce.number().min(0, 'Price cannot be negative'),
    reason: z.string().nonempty({ message: 'Reason is required' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agreedPrice: item.currentPrice,
      reason: item.adjustmentReason || '',
    },
  });

  React.useEffect(() => {
    form.reset({
      agreedPrice: item.currentPrice,
      reason: item.adjustmentReason || '',
    });
  }, [item, form]);

  const handleManagerOverride = () => {
    if (managerPassword === 'ALEXA') { // In a real app, verify this securely
      const values = form.getValues();
      onPriceAdjust(item.id, values.agreedPrice, values.reason);
      toast({ title: 'Manager Override Approved', description: 'Price has been updated.' });
      setIsManagerAlertOpen(false);
      onOpenChange(false);
    } else {
      toast({ variant: 'destructive', title: 'Authentication Failed', description: 'Incorrect manager password.' });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.agreedPrice < item.minPrice && !hasRole(['Admin', 'Manager'])) {
      setIsManagerAlertOpen(true);
      return;
    }
    
    if (values.agreedPrice < item.minPrice && hasRole(['Admin', 'Manager'])) {
        toast({
            title: "Manager Override",
            description: `Price set below minimum for ${item.name}.`,
            variant: "default"
        })
    }

    onPriceAdjust(item.id, values.agreedPrice, values.reason);
    onOpenChange(false);
  }

  return (
    <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>Adjust Price for {item.name}</DialogTitle>
            <DialogDescription>
                Original: Ksh {item.price.toFixed(2)} | Min: Ksh {item.minPrice.toFixed(2)}
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="agreedPrice"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Agreed Price (Ksh)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reason for Adjustment</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Stock Clearance">Stock Clearance</SelectItem>
                                <SelectItem value="Customer Loyalty">Customer Loyalty</SelectItem>
                                <SelectItem value="Price Match">Price Match</SelectItem>
                                <SelectItem value="Damaged Item">Damaged Item</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter className="pt-4">
                <Button type="submit">Set Price</Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
        </Dialog>
        
        <AlertDialog open={isManagerAlertOpen} onOpenChange={setIsManagerAlertOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Manager Override Required</AlertDialogTitle>
                <AlertDialogDescription>
                The price is below the minimum allowed. Please enter manager password to approve.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
                type="password"
                placeholder="Manager Password"
                value={managerPassword}
                onChange={(e) => setManagerPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManagerOverride()}
            />
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setManagerPassword('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleManagerOverride}>Approve</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    