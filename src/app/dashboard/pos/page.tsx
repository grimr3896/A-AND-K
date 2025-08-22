
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import type { Product, CartItem } from '@/lib/types';
import { MinusCircle, PlusCircle, Printer, Trash2, XCircle, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Receipt } from './_components/receipt';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function POSPage() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);
  const [amountReceived, setAmountReceived] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('Cash');
  
  const TAX_RATE = 0.08;

  const subtotal = cart.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  
  const isCheckoutDisabled = cart.length === 0;

  React.useEffect(() => {
    setAmountReceived(total.toFixed(2));
  }, [total]);

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
      return [...prevCart, { ...product, quantity: 1, currentPrice: product.price, originalPrice: product.price, managerOverride: false }];
    });
  };
  
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
      return;
    }

    setCart((prevCart) => {
      const itemToUpdate = prevCart.find(item => item.id === productId);
      if (itemToUpdate && newQuantity > itemToUpdate.stock) {
        toast({ variant: 'destructive', title: 'Out of Stock', description: `Only ${itemToUpdate.stock} units of ${itemToUpdate.name} available.` });
        return prevCart;
      }
      return prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };
  
  const handleCheckout = () => {
    if (isCheckoutDisabled) {
      return;
    }
    const received = parseFloat(amountReceived);
    if(isNaN(received) || received < total) {
      toast({ variant: 'destructive', title: 'Insufficient Amount', description: 'Amount received is less than the total.' });
      return;
    }
    setIsReceiptOpen(true);
  };
  
  const handleNewSale = () => {
    setCart([]);
    setAmountReceived('');
    setIsReceiptOpen(false);
    toast({ title: 'New Sale Started' });
  }

  const changeDue = parseFloat(amountReceived) - total;

  return (
    <>
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-5">
        {/* Left Column */}
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mockProducts.map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:border-primary transition-colors flex flex-col" onClick={() => addToCart(product)}>
                    <CardContent className="p-2 flex flex-col items-center gap-2 flex-grow">
                      <Image
                        src={product.imageUrl || `https://placehold.co/150x150.png`}
                        alt={product.name}
                        width={150}
                        height={150}
                        className="rounded-md object-cover aspect-square"
                      />
                      <div className="text-sm font-medium text-center flex-grow">{product.name}</div>
                      <div className="text-xs text-muted-foreground">Ksh {product.price.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
          <Card className="sticky top-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cart</CardTitle>
              <div className="text-sm text-muted-foreground font-medium">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)} items
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {cart.length > 0 ? (
                <div className="divide-y">
                   {cart.map(item => (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Ksh {item.currentPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                           <MinusCircle className="h-4 w-4" />
                         </Button>
                         <span className="font-medium w-4 text-center">{item.quantity}</span>
                         <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                           <PlusCircle className="h-4 w-4" />
                         </Button>
                      </div>
                       <div className="w-24 text-right font-medium">
                         Ksh {(item.currentPrice * item.quantity).toFixed(2)}
                       </div>
                    </div>
                   ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-12">
                  Cart is empty
                </div>
              )}
            </CardContent>
             <CardFooter className="flex flex-col items-stretch space-y-4 bg-muted/50 p-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-mono">Ksh {subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                        <span className="font-mono">Ksh {tax.toFixed(2)}</span>
                    </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="font-mono">Ksh {total.toFixed(2)}</span>
                </div>
                 <Separator />
                <div>
                  <label htmlFor="amount-received" className="text-sm font-medium">Amount Received</label>
                  <Input 
                    id="amount-received" 
                    placeholder="Enter amount" 
                    className="mt-1 text-base h-11"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={paymentMethod === 'Cash' ? 'default' : 'outline'} 
                      onClick={() => setPaymentMethod('Cash')}>
                      <Banknote className="mr-2"/> Cash
                    </Button>
                    <Button 
                      variant={paymentMethod === 'M-Pesa' ? 'default' : 'outline'} 
                      onClick={() => setPaymentMethod('M-Pesa')}>
                      <Smartphone className="mr-2"/> M-Pesa
                    </Button>
                    <Button 
                      variant={paymentMethod === 'Card' ? 'default' : 'outline'} 
                      onClick={() => setPaymentMethod('Card')}>
                      <CreditCard className="mr-2"/> Card
                    </Button>
                    <Button 
                      variant={paymentMethod === 'Layaway' ? 'default' : 'outline'} 
                      onClick={() => setPaymentMethod('Layaway')}>
                      Layaway
                    </Button>
                </div>
                <Button size="lg" onClick={handleCheckout} disabled={isCheckoutDisabled}>Checkout</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Transaction Complete</DialogTitle>
          </DialogHeader>
          <Receipt
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            paymentMethod={paymentMethod}
            amountReceived={parseFloat(amountReceived) || 0}
            changeDue={changeDue > 0 ? changeDue : 0}
          />
          <div className="flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={() => { handleNewSale(); }}>
              <Printer className="mr-2 h-4 w-4" /> Print & New Sale
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
