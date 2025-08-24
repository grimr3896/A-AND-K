
"use client";

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Payment, Layaway } from '@/lib/types';
import { AddPaymentDialog } from '../../new/_components/add-payment-dialog';
import { Save } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { mockLayaways } from '@/lib/mock-data';

// This is a simplified mock of fetching and updating a single layaway
// In a real app, this would interact with your database/API
const findLayaway = (id: string) => {
    // Also check session storage for updates not yet in mock data
    const updatedLayawaysData = sessionStorage.getItem('updatedLayaways');
    if (updatedLayawaysData) {
        const updatedLayaways = JSON.parse(updatedLayawaysData);
        if (updatedLayaways[id]) return updatedLayaways[id];
    }
     const newLayawaysData = sessionStorage.getItem('newLayaways');
    if (newLayawaysData) {
        const newLayaways = JSON.parse(newLayawaysData);
        const newMatch = newLayaways.find((l: Layaway) => l.id === id);
        if(newMatch) return newMatch;
    }
    return mockLayaways.find(l => l.id === id);
};


export default function LayawayDetailPageClient() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [layaway, setLayaway] = React.useState<Layaway | null>(null);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = React.useState(false);

  React.useEffect(() => {
    const layawayId = params.id as string;
    const foundLayaway = findLayaway(layawayId);
    if (foundLayaway) {
      setLayaway(foundLayaway);
      // Mock initial payments based on amount paid
      if(foundLayaway.amountPaid > 0) {
        setPayments([{ 
            date: foundLayaway.lastPaymentDate, 
            amount: foundLayaway.amountPaid, 
            method: 'M-Pesa' // Defaulting method for mock
        }]);
      }
    } else {
        toast({variant: 'destructive', title: 'Error', description: 'Layaway not found.'});
        router.push('/dashboard/layaways');
    }
  }, [params.id, router, toast]);

  const totalPaid = React.useMemo(() => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const handleAddPayment = (payment: Omit<Payment, 'date'>) => {
    const newPayment: Payment = { ...payment, date: new Date().toISOString() };
    setPayments(prev => [...prev, newPayment]);
    setIsAddPaymentOpen(false);
    toast({ title: "Payment Added", description: `Logged a payment of Ksh ${payment.amount.toFixed(2)}.`})
  }

  const handleSaveChanges = () => {
    if (layaway) {
        const updatedLayaway = {
            ...layaway,
            amountPaid: totalPaid,
            status: totalPaid >= layaway.totalAmount ? 'Paid' : 'Pending',
            lastPaymentDate: new Date().toISOString(),
        };

        // In a real app, this would be an API call to update the layaway.
        // For this demo, we can just log it and navigate back.
        console.log("Saving updated layaway:", updatedLayaway);

        // We can use session storage to simulate the update on the main page
         try {
            const existingLayaways = JSON.parse(sessionStorage.getItem('updatedLayaways') || '{}');
            existingLayaways[layaway.id] = updatedLayaway;
            sessionStorage.setItem('updatedLayaways', JSON.stringify(existingLayaways));
        } catch (error) {
            console.error("Could not save updated layaway to session storage", error);
        }

        toast({ title: 'Layaway Updated', description: 'The layaway plan has been saved successfully.' });
        router.push('/dashboard/layaways');
    }
  }

  if (!layaway) {
    return <div>Loading...</div>;
  }

  const remainingBalance = layaway.totalAmount - totalPaid;

  return (
    <>
      <div className="grid gap-4">
        <Card>
           <CardHeader>
            <CardTitle>Manage Layaway: {layaway.id}</CardTitle>
            <CardDescription>
                Client: <span className="font-semibold">{layaway.customerName}</span> | Product: <span className="font-semibold">{layaway.productName}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Payment Ledger</CardTitle>
                         <Button variant="outline" size="sm" onClick={() => setIsAddPaymentOpen(true)}>
                            Add New Payment
                        </Button>
                    </div>
                    <CardDescription>Track all payments made for this layaway.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                     <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Transaction</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length > 0 ? (
                               payments.map((payment, index) => (
                                <TableRow key={index}>
                                    <TableCell>{format(new Date(payment.date), 'PPp')}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{payment.method}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">Ksh {payment.amount.toFixed(2)}</TableCell>
                                </TableRow>
                               ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        No payments logged.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex-col items-stretch space-y-4 p-4 bg-muted/50">
                    <div className="flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span className="font-mono">Ksh {layaway.totalAmount.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between font-semibold">
                        <span>Total Paid:</span>
                        <span className="font-mono">Ksh {totalPaid.toFixed(2)}</span>
                    </div>
                     <Separator />
                    <div className={`flex justify-between font-bold text-lg ${remainingBalance <= 0 ? 'text-green-600' : ''}`}>
                         {remainingBalance <= 0 ? (
                            <>
                                <span>Plan Completed. Change Due:</span>
                                <span>Ksh {(totalPaid - layaway.totalAmount).toFixed(2)}</span>
                            </>
                         ) : (
                            <>
                                <span>Remaining Balance:</span>
                                <span>Ksh {remainingBalance.toFixed(2)}</span>
                            </>
                         )}
                    </div>
                </CardFooter>
            </Card>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/layaways')}>
                Cancel
            </Button>
            <Button onClick={handleSaveChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AddPaymentDialog
        isOpen={isAddPaymentOpen}
        onOpenChange={setIsAddPaymentOpen}
        onAddPayment={handleAddPayment}
      />
    </>
  );
}
