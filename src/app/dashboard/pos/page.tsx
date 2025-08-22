"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MinusCircle, CreditCard, Smartphone, Banknote } from 'lucide-react';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Receipt } from './_components/receipt';
import type { CartItem, Product } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"


export default function POSPage() {
  const { toast } = useToast();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [lastTransaction, setLastTransaction] = React.useState<{ cart: CartItem[], total: number, paymentMethod: string } | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast({ variant: 'destructive', title: 'Out of Stock', description: `No more ${product.name} in stock.` });
          return prevCart;
        }
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      return prevCart.reduce((acc, item) => {
        if (item.id === productId) {
          if (item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as CartItem[]);
    });
  };

  const handleCheckout = (paymentMethod: string) => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Empty Cart', description: 'Please add items to the cart before checkout.' });
      return;
    }
    setLastTransaction({ cart, total, paymentMethod });
    setShowReceipt(true);
    setCart([]);
  };
  
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-section');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

    if (printWindow && printContent) {
        printWindow.document.write('<html><head><title>Print Receipt</title>');
        printWindow.document.write('<style>@media print { body { -webkit-print-color-adjust: exact; } .page-break-before { page-break-before: always; } }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setLastTransaction(null);
  }

  return (
    <>
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-5 print:hidden">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8 xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Click on a product to add it to the cart.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockProducts.map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => addToCart(product)}>
                    <CardContent className="p-2 flex flex-col items-center gap-2">
                      <Image
                        src={`https://placehold.co/150x150.png`}
                        alt={product.name}
                        width={150}
                        height={150}
                        className="rounded-md"
                        data-ai-hint="product image"
                      />
                      <div className="text-sm font-medium text-center">{product.name}</div>
                      <div className="text-xs text-muted-foreground">Ksh {product.price.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 xl:col-span-2">
          <Card className="sticky top-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cart</CardTitle>
              <Badge variant="outline">{cart.reduce((acc, item) => acc + item.quantity, 0)} items</Badge>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2 min-h-[120px]">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Ksh {item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(item.id)}>
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addToCart(item)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right font-medium">
                        Ksh {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Cart is empty
                  </div>
                )}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Ksh {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>Ksh {tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Ksh {total.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => handleCheckout('Cash')}><Banknote className="mr-2 h-4 w-4" /> Cash</Button>
                <Button variant="outline" onClick={() => handleCheckout('M-Pesa')}><Smartphone className="mr-2 h-4 w-4" /> M-Pesa</Button>
                <Button variant="outline" onClick={() => handleCheckout('Card')}><CreditCard className="mr-2 h-4 w-4" /> Card</Button>
                <Button variant="secondary" onClick={() => toast({ title: 'Layaway not implemented' })}>Layaway</Button>
              </div>
              <Button size="lg" className="w-full" onClick={() => handleCheckout('Card')}>Checkout</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={showReceipt} onOpenChange={setShowReceipt}>
          <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                  <AlertDialogTitle>Transaction Complete</AlertDialogTitle>
                  <AlertDialogDescription>
                      Print the receipts for the customer and for your records.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="max-h-[60vh] overflow-y-auto p-2" id="receipt-section">
                  {lastTransaction && (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-bold text-center mb-2">Customer Copy</h3>
                          <Receipt cart={lastTransaction.cart} total={lastTransaction.total} paymentMethod={lastTransaction.paymentMethod} />
                        </div>
                        <div className="page-break-before">
                          <h3 className="font-bold text-center mb-2">Store Copy</h3>
                          <Receipt cart={lastTransaction.cart} total={lastTransaction.total} paymentMethod={lastTransaction.paymentMethod} />
                        </div>
                      </div>
                  )}
              </div>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleCloseReceipt}>Close</AlertDialogCancel>
                  <Button onClick={handlePrint}>Print Receipts</Button>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
