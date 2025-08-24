
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import type { Product, Payment, Layaway } from '@/lib/types';
import { AddProductDialog } from './add-product-dialog';
import { AddPaymentDialog } from './add-payment-dialog';
import { useProducts } from '@/contexts/products-context';
import { PlusCircle, Save } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function NewLayawayPageClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { products: mockProducts } = useProducts();

  const [clientName, setClientName] = React.useState('');
  const [clientPhone, setClientPhone] = React.useState('');
  const [addedProducts, setAddedProducts] = React.useState<Product[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  
  const [isAddProductOpen, setIsAddProductOpen] = React.useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = React.useState(false);

  const totalAmount = React.useMemo(() => {
    return addedProducts.reduce((sum, product) => sum + product.price, 0);
  }, [addedProducts]);

  const totalPaid = React.useMemo(() => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);
  
  const isCashoutDisabled = totalAmount === 0 || totalPaid < totalAmount;
  const isSaveDisabled = !clientName || addedProducts.length === 0;

  const handleAddProduct = (product: Product) => {
    // In a real app, you'd also check for stock and place a hold.
    setAddedProducts(prev => [...prev, product]);
    setIsAddProductOpen(false);
  };
  
  const handleAddPayment = (payment: Omit<Payment, 'date'>) => {
    const newPayment: Payment = { ...payment, date: new Date().toISOString() };
    setPayments(prev => [...prev, newPayment]);
    setIsAddPaymentOpen(false);
    toast({ title: "Payment Added", description: `Logged a payment of Ksh ${payment.amount.toFixed(2)}.`})
  }

  const handleSaveLayaway = (type: 'Draft' | 'Final') => {
     if (isSaveDisabled) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide client name and add at least one product.',
      });
      return;
    }
    if (type === 'Final' && payments.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Payment',
        description: 'Please log an initial payment before cashing out.',
      });
      return;
    }

    const newLayaway: Omit<Layaway, 'id'> = {
      customerName: clientName,
      productName: addedProducts.length > 1 ? `${addedProducts.length} items` : addedProducts[0].name,
      totalAmount: totalAmount,
      amountPaid: totalPaid,
      status: totalPaid >= totalAmount ? 'Paid' : 'Pending',
      lastPaymentDate: new Date().toISOString(),
    };

    // In a real app, you would save this data to your database.
    // For this mock, we use sessionStorage to pass it back to the list.
    try {
      const existingLayaways = JSON.parse(sessionStorage.getItem('newLayaways') || '[]');
      const layawayWithId = { ...newLayaway, id: `LAY_NEW_${Date.now()}`};
      sessionStorage.setItem('newLayaways', JSON.stringify([...existingLayaways, layawayWithId]));
    } catch (error) {
      console.error("Could not save layaway to session storage", error);
    }
    
    toast({
      title: `Layaway ${type === 'Draft' ? 'Draft Saved' : 'Created'}!`,
      description: `The layaway plan has been saved successfully.`,
    });
    router.push('/dashboard/layaways');
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
           <CardHeader>
            <CardTitle>Client & Product Details</CardTitle>
            <CardDescription>Manage client information and the products on this layaway.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="client-name" className="text-sm font-medium">Name</label>
                    <Input id="client-name" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client's full name" />
                </div>
                 <div>
                    <label htmlFor="client-phone" className="text-sm font-medium">Phone Number</label>
                    <Input id="client-phone" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="e.g., 0712345678" />
                </div>
             </div>
             <Separator />
             <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Products</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsAddProductOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>
                <div className="border rounded-md min-h-[100px] p-2">
                    {addedProducts.length > 0 ? (
                        <ul className="space-y-1">
                            {addedProducts.map((p, index) => (
                                <li key={`${p.id}-${index}`} className="flex justify-between items-center text-sm">
                                    <span>{index + 1}. {p.name}</span>
                                    <span>Ksh {p.price.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No products added yet.</p>
                    )}
                </div>
             </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-4 font-bold text-lg flex justify-between">
              <span>Total</span>
              <span>Ksh {totalAmount.toFixed(2)}</span>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Payment Ledger</CardTitle>
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
                    <span>Total Paid:</span>
                    <span>Ksh {totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                    {totalPaid >= totalAmount ? (
                      <>
                        <span className="text-primary">Change Due:</span>
                        <span className="text-primary">Ksh {(totalPaid - totalAmount).toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span>Remaining Balance:</span>
                        <span>Ksh {(totalAmount - totalPaid).toFixed(2)}</span>
                      </>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button size="lg" variant="outline" onClick={() => setIsAddPaymentOpen(true)}>
                        Add Payment
                    </Button>
                     <Button size="lg" variant="outline" disabled={isSaveDisabled} onClick={() => handleSaveLayaway('Draft')}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                    </Button>
                </div>
                <Button size="lg" disabled={isCashoutDisabled} onClick={() => handleSaveLayaway('Final')}>
                    Cashout & Create Layaway
                </Button>
            </CardFooter>
        </Card>
      </div>

      <AddProductDialog
        isOpen={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onAddProduct={handleAddProduct}
        products={mockProducts}
      />
      <AddPaymentDialog
        isOpen={isAddPaymentOpen}
        onOpenChange={setIsAddPaymentOpen}
        onAddPayment={handleAddPayment}
      />
    </>
  );
}
