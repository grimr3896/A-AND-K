
"use client";

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { getLayawayById, addLayawayPayment } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

type LayawayWithPayments = Layaway & { payments: Payment[] };

export default function LayawayDetailPageClient() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [layaway, setLayaway] = React.useState<LayawayWithPayments | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = React.useState(false);

  const layawayId = params.id as string;

  const fetchLayaway = React.useCallback(async () => {
    setIsLoading(true);
    try {
        const foundLayaway = await getLayawayById(layawayId);
        if (foundLayaway) {
            setLayaway(foundLayaway as LayawayWithPayments);
        } else {
            toast({variant: 'destructive', title: 'Error', description: 'Layaway not found.'});
            router.push('/dashboard/layaways');
        }
    } catch(e) {
        toast({variant: 'destructive', title: 'Error', description: 'Failed to load layaway details.'});
        router.push('/dashboard/layaways');
    } finally {
        setIsLoading(false);
    }
  }, [layawayId, router, toast]);

  React.useEffect(() => {
    if (layawayId) {
        fetchLayaway();
    }
  }, [layawayId, fetchLayaway]);

  const totalPaid = React.useMemo(() => {
    return layaway?.payments.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  }, [layaway?.payments]);

  const handleAddPayment = async (payment: Omit<Payment, 'date'|'id'>) => {
    if (!user || !layaway) return;
    try {
        await addLayawayPayment(layaway.id, payment, user.username);
        toast({ title: "Payment Added", description: `Logged a payment of Ksh ${payment.amount.toFixed(2)}.`});
        setIsAddPaymentOpen(false);
        fetchLayaway(); // Refresh data
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  }


  if (isLoading || !layaway) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
    );
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
                            {layaway.payments.length > 0 ? (
                               layaway.payments.map((payment) => (
                                <TableRow key={payment.id}>
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
                Back to List
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
