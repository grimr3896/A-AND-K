
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { CartItem } from '@/lib/types';
import { mockUsers } from '@/lib/mock-data';


type AdjustPriceDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: CartItem;
  onPriceAdjust: (productId: string, newPrice: number) => void;
};

export function AdjustPriceDialog({ isOpen, onOpenChange, item, onPriceAdjust }: AdjustPriceDialogProps) {
  const { toast } = useToast();
  const [showOverridePrompt, setShowOverridePrompt] = React.useState(false);
  const [managerPassword, setManagerPassword] = React.useState('');
  const [priceToApprove, setPriceToApprove] = React.useState<number | null>(null);

  const formSchema = z.object({
    newPrice: z.coerce.number().positive("Price must be a positive number."),
    reason: z.string().min(1, "A reason is required for price adjustment."),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPrice: item.currentPrice,
      reason: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.newPrice < item.minPrice) {
      setPriceToApprove(values.newPrice);
      setShowOverridePrompt(true);
    } else {
      onPriceAdjust(item.id, values.newPrice);
      toast({ title: "Price Adjusted", description: `Price for ${item.name} set to Ksh ${values.newPrice.toFixed(2)}.`});
    }
  }

  const handleManagerOverride = () => {
    // In a real app, you'd have a proper auth check here.
    const manager = mockUsers.find(u => (u.role === 'Admin' || u.role === 'Manager') && managerPassword === 'ALEXA');

    if (manager && priceToApprove !== null) {
      onPriceAdjust(item.id, priceToApprove);
      toast({
        title: "Override Approved",
        description: `Price for ${item.name} set to Ksh ${priceToApprove.toFixed(2)} by ${manager.username}.`,
      });
      setShowOverridePrompt(false);
      setManagerPassword('');
      setPriceToApprove(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: 'The password entered is incorrect.',
      });
    }
  };

  const closeDialog = () => {
    onOpenChange(false);
    form.reset();
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Price for: {item.name}</DialogTitle>
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
                    <FormLabel>Reason for Adjustment</FormLabel>
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
                        <SelectItem value="Manager Discretion">Manager Discretion</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button type="submit">Set Price</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showOverridePrompt} onOpenChange={setShowOverridePrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manager Override Required</AlertDialogTitle>
            <AlertDialogDescription>
              The price Ksh {priceToApprove?.toFixed(2)} is below the minimum of Ksh {item.minPrice.toFixed(2)}. Please enter a manager's password to approve this change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="manager-password">Manager Password</Label>
            <Input
              id="manager-password"
              type="password"
              value={managerPassword}
              onChange={(e) => setManagerPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManagerOverride()}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setManagerPassword('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleManagerOverride}>Approve</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    