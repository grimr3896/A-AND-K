
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  const updateAgreedPrice = (productId: string, newPrice: number) => {
     setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === productId) {
          if (newPrice < item.minPrice) {
            toast({
              variant: 'destructive',
              title: 'Price Error',
              description: `Agreed price for ${item.name} cannot be below the minimum price of Ksh ${item.minPrice.toFixed(2)}.`,
            });
          }
          return { ...item, currentPrice: newPrice };
        }
        return item;
      });
    });
  }
  
  const handleCheckout = () => {
    if (isCheckoutDisabled) {
      const itemBelowMin = cart.find(item => item.currentPrice < item.minPrice);
      if(itemBelowMin) {
         toast({ variant: 'destructive', title: 'Price Error', description: `Cannot proceed: Price for ${itemBelowMin.name} is below the minimum.` });
      }
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
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
        {/* Top-Left: Product Selection */}
        <div className="grid auto-rows-max items-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Product</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
           {/* Bottom-Left: Pending Transactions */}
          <Card>
              <CardHeader>
                  <CardTitle>Pending</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-center text-muted-foreground p-8">
                    Pending transactions will appear here.
                  </div>
              </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
          {/* Top-Right: Price Agreement */}
          <Card>
              <CardHeader>
                  <CardTitle>Price agreement</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-right">SP</TableHead>
                              <TableHead className="text-right">MM</TableHead>
                              <TableHead>Agreed price</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                           {cart.length > 0 ? cart.map(item => (
                               <TableRow key={item.id}>
                                   <TableCell>{item.name}</TableCell>
                                   <TableCell className="text-right font-mono">{item.originalPrice.toFixed(2)}</TableCell>
                                   <TableCell className="text-right font-mono">{item.minPrice.toFixed(2)}</TableCell>
                                   <TableCell>
                                       <Input 
                                           type="number" 
                                           value={item.currentPrice}
                                           onChange={(e) => updateAgreedPrice(item.id, parseFloat(e.target.value) || 0)}
                                           className={`h-8 w-28 ${item.currentPrice < item.minPrice ? 'border-destructive ring-destructive' : ''}`}
                                       />
                                   </TableCell>
                               </TableRow>
                           )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">Add products to begin</TableCell>
                                </TableRow>
                           )}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>

          {/* Bottom-Right: Running Cart */}
          <Card className="sticky top-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cart</CardTitle>
            </CardHeader>
            <CardContent>
                {cart.length > 0 ? (
                    <div className="space-y-2">
                        {cart.map(item => (
                           <div key={item.id} className="flex justify-between items-center text-sm">
                               <span>{item.name} {item.quantity}@{item.currentPrice.toFixed(2)}</span>
                                <div className="flex items-center gap-2">
                                     <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                       <MinusCircle className="h-4 w-4" />
                                     </Button>
                                     <span className="font-medium w-4 text-center">{item.quantity}</span>
                                     <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                       <PlusCircle className="h-4 w-4" />
                                     </Button>
                                </div>
                           </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8">Cart is empty</div>
                )}
            </CardContent>
             <CardFooter className="flex flex-col items-stretch space-y-4 bg-muted/50 p-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between font-bold">
                        <span>Subtotal</span>
                        <span className="font-mono">Ksh {subtotal.toFixed(2)}</span>
                    </div>
                </div>
                <Button size="lg" onClick={handleCheckout} disabled={isCheckoutDisabled}>Cashout</Button>
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

    