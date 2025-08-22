
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { CartItem } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

type AdjustPriceDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: CartItem | null;
  onAdjustPrice: (itemId: string, newPrice: number, reason: string) => void;
};

export function AdjustPriceDialog({ isOpen, onOpenChange, item, onAdjustPrice }: AdjustPriceDialogProps) {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [isManagerAlertOpen, setIsManagerAlertOpen] = React.useState(false);
  const [managerPassword, setManagerPassword] = React.useState('');
  const [pendingAdjustment, setPendingAdjustment] = React.useState<{newPrice: number, reason: string} | null>(null);

  const formSchema = z.object({
    agreedPrice: z.coerce.number().min(0, 'Price cannot be negative'),
    reason: z.string().min(1, 'A reason for the price change is required.'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agreedPrice: item?.price,
      reason: item?.adjustmentReason || '',
    },
  });

  React.useEffect(() => {
    if (item) {
      form.reset({
        agreedPrice: item.currentPrice,
        reason: item.adjustmentReason || '',
      });
    }
  }, [item, form]);

  const handleManagerOverride = () => {
    if (managerPassword === 'ALEXA') { // In a real app, verify this securely
      if (item && pendingAdjustment) {
        onAdjustPrice(item.id, pendingAdjustment.newPrice, pendingAdjustment.reason);
        onOpenChange(false);
      }
      setIsManagerAlertOpen(false);
      setManagerPassword('');
      setPendingAdjustment(null);
    } else {
      toast({ variant: 'destructive', title: 'Authentication Failed', description: 'Incorrect manager password.' });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!item) return;

    if (values.agreedPrice < item.minPrice) {
      if (hasRole(['Admin', 'Manager'])) {
         setPendingAdjustment({ newPrice: values.agreedPrice, reason: values.reason });
         setIsManagerAlertOpen(true);
      } else {
        toast({
            variant: 'destructive',
            title: 'Price Below Minimum',
            description: `The price for ${item.name} is below the minimum allowed. Manager approval is required.`,
            duration: 5000
        });
      }
    } else {
      onAdjustPrice(item.id, values.agreedPrice, values.reason);
      onOpenChange(false);
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Price for {item?.name}</DialogTitle>
            <DialogDescription>
              Standard Price: Ksh {item?.price.toFixed(2)} | Minimum Price: Ksh {item?.minPrice.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          {item && (
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
                      <FormControl>
                        <Textarea placeholder="e.g., End of season sale, minor defect..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit">Apply Price</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
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
            <AlertDialogCancel onClick={() => { setManagerPassword(''); setPendingAdjustment(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleManagerOverride}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
