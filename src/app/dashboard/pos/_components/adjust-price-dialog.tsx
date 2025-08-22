
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  newPrice: z.coerce.number().min(0, 'Price cannot be negative'),
  reason: z.string().min(1, 'A reason is required for price adjustments.'),
});

type AdjustPriceDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: CartItem | null;
  onAdjustPrice: (itemId: string, newPrice: number) => void;
};

export function AdjustPriceDialog({ isOpen, onOpenChange, item, onAdjustPrice }: AdjustPriceDialogProps) {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [isManagerAlertOpen, setIsManagerAlertOpen] = React.useState(false);
  const [managerPassword, setManagerPassword] = React.useState('');
  const [pendingPrice, setPendingPrice] = React.useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  React.useEffect(() => {
    if (item) {
      form.reset({
        newPrice: item.currentPrice,
        reason: '',
      });
    }
  }, [item, form]);

  if (!item) return null;

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.newPrice < item!.minPrice) {
       if (hasRole(['Admin', 'Manager'])) {
            setPendingPrice(values.newPrice);
            setIsManagerAlertOpen(true);
       } else {
            toast({
                variant: 'destructive',
                title: 'Price Below Minimum',
                description: `The entered price of Ksh ${values.newPrice.toFixed(2)} is below the minimum of Ksh ${item!.minPrice.toFixed(2)}. Manager approval required.`,
            });
       }
    } else {
      onAdjustPrice(item!.id, values.newPrice);
      onOpenChange(false);
      toast({ title: 'Price Adjusted', description: `${item.name} price set to Ksh ${values.newPrice.toFixed(2)}.` });
    }
  }

  const handleManagerOverride = () => {
    // In a real app, you'd verify this against a secure source.
    if (managerPassword === 'ALEXA') {
      if (pendingPrice !== null) {
        onAdjustPrice(item!.id, pendingPrice);
        toast({ title: 'Manager Override Successful', description: `Price for ${item.name} set to Ksh ${pendingPrice.toFixed(2)}.` });
      }
      setIsManagerAlertOpen(false);
      onOpenChange(false);
      setManagerPassword('');
      setPendingPrice(null);
    } else {
      toast({ variant: 'destructive', title: 'Authentication Failed', description: 'Incorrect manager password.' });
    }
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Price for {item.name}</DialogTitle>
          <DialogDescription>
            Original Price: Ksh {item.price.toFixed(2)} | Minimum Price: Ksh {item.minPrice.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Agreed Price (Ksh)</FormLabel>
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
                    <FormLabel>Reason for Change</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Customer Bargain">Customer Bargain</SelectItem>
                        <SelectItem value="Item Damage">Item Damage</SelectItem>
                        <SelectItem value="Loyalty Discount">Loyalty Discount</SelectItem>
                        <SelectItem value="Manager Approval">Manager Approval</SelectItem>
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
              The price Ksh {pendingPrice?.toFixed(2)} is below the minimum allowed. Please enter manager password to approve.
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

