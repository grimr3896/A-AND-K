
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import type { Product, CartItem } from '@/lib/types';
import { MinusCircle, PlusCircle, Printer, Trash2, XCircle, CreditCard, Smartphone, Banknote, PackageOpen } from 'lucide-react';
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
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const isCheckoutDisabled = cart.length === 0 || cart.some(item => item.currentPrice < item.minPrice);

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
    const itemToUpdate = cart.find(item => item.id === productId);
    if (!itemToUpdate) return;
    
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
      return;
    }

    if (newQuantity > itemToUpdate.stock) {
        toast({ variant: 'destructive', title: 'Out of Stock', description: `Only ${itemToUpdate.stock} units of ${itemToUpdate.name} available.` });
        return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  const handleCheckout = () => {
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
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-5 xl:grid-cols-5">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Product Selection</CardTitle>
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
                       <div className="text-xs text-muted-foreground font-mono">Ksh {product.price.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
            <Card className="sticky top-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Cart</CardTitle>
                    <span className="text-sm text-muted-foreground">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-col space-y-4">
                        {cart.length > 0 ? (
                           <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
                            {cart.map(item => (
                               <div key={item.id} className="flex justify-between items-start pt-4 border-t">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{item.name}</span>
                                        <span className="text-muted-foreground text-xs">Ksh {item.currentPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                           <MinusCircle className="h-4 w-4" />
                                         </Button>
                                         <span className="font-medium w-4 text-center text-sm">{item.quantity}</span>
                                         <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                           <PlusCircle className="h-4 w-4" />
                                         </Button>
                                         <span className="w-20 text-right font-mono text-sm">Ksh {(item.currentPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                               </div>
                            ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-12 border-t">Cart is empty</div>
                        )}
                        
                        <Separator />

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono">Ksh {subtotal.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax (8%)</span>
                                <span className="font-mono">Ksh {tax.toFixed(2)}</span>
                            </div>
                             <Separator className="my-2"/>
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span className="font-mono">Ksh {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Separator />
                        
                        <div>
                            <label className="text-sm text-muted-foreground">Amount Received</label>
                            <Input 
                                type="number" 
                                placeholder="Enter amount..." 
                                value={amountReceived}
                                onChange={(e) => setAmountReceived(e.target.value)}
                                className="text-right font-mono"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button variant={paymentMethod === 'Cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Cash')}>
                                <Banknote /> Cash
                            </Button>
                             <Button variant={paymentMethod === 'M-Pesa' ? 'default' : 'outline'} onClick={() => setPaymentMethod('M-Pesa')}>
                                <Smartphone /> M-Pesa
                            </Button>
                             <Button variant={paymentMethod === 'Card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Card')}>
                                <CreditCard /> Card
                            </Button>
                             <Button variant={paymentMethod === 'Layaway' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Layaway')} disabled>
                                <PackageOpen /> Layaway
                            </Button>
                        </div>
                        
                        <Button size="lg" className="w-full" onClick={handleCheckout} disabled={isCheckoutDisabled}>Checkout</Button>
                    </div>
                </CardContent>
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
