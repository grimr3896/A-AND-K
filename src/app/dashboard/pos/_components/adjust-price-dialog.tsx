
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
import type { CartItem, UserRole } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
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


const formSchema = z.object({
  newPrice: z.coerce.number().min(0, "Price cannot be negative."),
  reason: z.string().min(1, "A reason for the price change is required."),
});

type AdjustPriceDialogProps = {
  item: CartItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPriceAdjust: (itemId: string, newPrice: number) => void;
};

export function AdjustPriceDialog({ item, isOpen, onOpenChange, onPriceAdjust }: AdjustPriceDialogProps) {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [isOverrideAlertOpen, setIsOverrideAlertOpen] = React.useState(false);
  const [managerUsername, setManagerUsername] = React.useState('');
  const [managerPassword, setManagerPassword] = React.useState('');
  const [priceToOverride, setPriceToOverride] = React.useState<number | null>(null);

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

  const handleManagerOverride = () => {
    // In a real app, this would be a secure API call.
    if (managerUsername.toLowerCase() === 'manager' && managerPassword === 'ALEXA') {
        if (priceToOverride !== null) {
            onPriceAdjust(item.id, priceToOverride);
            toast({ title: "Override Approved", description: `Price for ${item.name} adjusted by manager.` });
            setIsOverrideAlertOpen(false);
            onOpenChange(false);
        }
    } else {
        toast({ variant: 'destructive', title: "Authentication Failed", description: "Invalid manager credentials." });
    }
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.newPrice < item!.minPrice) {
      if (hasRole(['Admin', 'Manager'])) {
         setPriceToOverride(values.newPrice);
         setIsOverrideAlertOpen(true);
      } else {
         toast({
            variant: "destructive",
            title: "Price Below Minimum",
            description: "The entered price is below the authorized minimum. Manager approval is required.",
            duration: 7000,
         });
      }
    } else {
      onPriceAdjust(item!.id, values.newPrice);
      toast({ title: "Price Adjusted", description: `The price for ${item.name} has been updated.` });
      onOpenChange(false);
    }
  }

  const reasons = ["Customer Bargain", "Item Damage", "Loyalty Discount", "Staff Discount", "Price Match"];

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Price for {item.name}</DialogTitle>
          <DialogDescription>
            Current Price: Ksh {item.price.toFixed(2)} | Minimum Price: Ksh {item.minPrice.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Price (Ksh)</FormLabel>
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
                        {reasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Update Price</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={isOverrideAlertOpen} onOpenChange={setIsOverrideAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Manager Override Required</AlertDialogTitle>
                <AlertDialogDescription>
                    The price entered is below the minimum allowed. Please enter manager credentials to approve this change.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
                <Input 
                    placeholder="Manager Username"
                    value={managerUsername}
                    onChange={(e) => setManagerUsername(e.target.value)}
                />
                <Input 
                    type="password"
                    placeholder="Manager Password"
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => { setManagerUsername(''); setManagerPassword(''); }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleManagerOverride}>Approve Override</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
