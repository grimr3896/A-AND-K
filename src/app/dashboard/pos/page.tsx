
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import type { Product, CartItem } from '@/lib/types';
import { MinusCircle, PlusCircle, Printer, Trash2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Receipt } from './_components/receipt';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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


export default function POSPage() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);
  const [pendingCarts, setPendingCarts] = React.useState<any[]>([]);
  const [isManagerAlertOpen, setIsManagerAlertOpen] = React.useState(false);
  const [managerPassword, setManagerPassword] = React.useState('');
  const [priceToOverride, setPriceToOverride] = React.useState<{itemId: string, price: number} | null>(null);

  const TAX_RATE = 0.08;

  const subtotal = cart.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  
  const isCheckoutDisabled = cart.some(item => item.currentPrice < item.minPrice && !item.managerOverride) || cart.length === 0;

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

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };
  
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
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
  
  const handlePriceChange = (itemId: string, newPrice: number) => {
     setCart(cart.map(item => {
        if (item.id === itemId) {
            const isValid = newPrice >= item.minPrice;
            if (!isValid && !hasRole(['Admin', 'Manager'])) {
                setPriceToOverride({itemId, price: newPrice});
                setIsManagerAlertOpen(true);
                return item; // Don't update price until override
            }
            return {...item, currentPrice: newPrice, managerOverride: !isValid };
        }
        return item;
    }));
  }
  
  const handleManagerOverride = () => {
    if (managerPassword === 'ALEXA') { // In a real app, verify this securely
      if (priceToOverride) {
        setCart(cart.map(item => item.id === priceToOverride.itemId ? {...item, currentPrice: priceToOverride.price, managerOverride: true } : item));
        toast({ title: 'Manager Override Approved', description: 'Price has been updated below minimum.' });
      }
      setIsManagerAlertOpen(false);
      setManagerPassword('');
      setPriceToOverride(null);
    } else {
      toast({ variant: 'destructive', title: 'Authentication Failed', description: 'Incorrect manager password.' });
    }
  };

  const handleCheckout = () => {
    if (isCheckoutDisabled) {
      toast({ variant: 'destructive', title: 'Checkout Blocked', description: 'Please resolve pricing errors before checkout.' });
      return;
    }
    // In a real app, this is where you'd save the sale to the database.
    setIsReceiptOpen(true);
  };
  
  const handleNewSale = () => {
    setCart([]);
    setIsReceiptOpen(false);
    toast({ title: 'New Sale Started' });
  }
  
  const handleSuspend = () => {
    if (cart.length === 0) return;
    const pendingId = `PEND_${Date.now()}`;
    const cartSummary = cart.length > 1 ? `${cart.length} items` : cart[0].name;
    setPendingCarts([...pendingCarts, { id: pendingId, cart, summary: cartSummary, total }]);
    setCart([]);
    toast({ title: 'Sale Suspended', description: `Cart with ${cartSummary} was moved to pending.` });
  }

  const handleResume = (pendingId: string) => {
     if(cart.length > 0) {
        toast({ variant: 'destructive', title: 'Active Cart', description: 'Please suspend or complete the current sale before resuming another.' });
        return;
    }
    const pendingSale = pendingCarts.find(p => p.id === pendingId);
    if(pendingSale) {
        setCart(pendingSale.cart);
        setPendingCarts(pendingCarts.filter(p => p.id !== pendingId));
    }
  }

  const handleDiscard = (pendingId: string) => {
    setPendingCarts(pendingCarts.filter(p => p.id !== pendingId));
    toast({ title: 'Sale Discarded', description: 'The pending sale has been removed.' });
  }


  return (
    <>
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Left Column */}
        <div className="grid auto-rows-max items-start gap-4 xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <Card>
              <CardHeader>
                  <CardTitle>Pending</CardTitle>
                  <CardDescription>Suspended transactions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                  {pendingCarts.length > 0 ? pendingCarts.map(p => (
                      <div key={p.id} className="flex justify-between items-center p-2 border rounded-md">
                          <div>
                            <p className="font-medium">{p.summary}</p>
                            <p className="text-sm text-muted-foreground">Ksh {p.total.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleResume(p.id)}>Resume</Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDiscard(p.id)}><XCircle className="h-4 w-4"/></Button>
                          </div>
                      </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No pending sales.</p>
                  )}
              </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="grid auto-rows-max items-start gap-4 xl:col-span-2">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Price Agreement</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>SP</TableHead>
                      <TableHead>MM</TableHead>
                      <TableHead className="w-[150px]">Agreed Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map(item => {
                      const isPriceInvalid = item.currentPrice < item.minPrice;
                      return (
                        <TableRow key={item.id} className={isPriceInvalid && !item.managerOverride ? 'bg-destructive/10' : ''}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                 <MinusCircle className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                className="w-12 h-8 text-center"
                              />
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                  <PlusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">{item.price.toFixed(2)}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">{item.minPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <Input 
                                type="number"
                                value={item.currentPrice}
                                onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                                className={`w-28 font-mono ${isPriceInvalid && !item.managerOverride ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            />
                            {item.managerOverride && <p className="text-xs text-yellow-600">Override</p>}
                          </TableCell>
                          <TableCell className="text-right font-mono">{(item.currentPrice * item.quantity).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFromCart(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  Cart is empty
                </div>
              )}
            </CardContent>
             <CardFooter className="flex flex-col items-stretch space-y-4 bg-muted/50 p-4">
                 <CardTitle>Cart</CardTitle>
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
                 <div className="grid grid-cols-2 gap-2">
                  <Button size="lg" onClick={handleCheckout} disabled={isCheckoutDisabled}>Cashout</Button>
                  <Button size="lg" variant="outline" onClick={handleSuspend} disabled={cart.length === 0}>Suspend</Button>
                </div>
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
            paymentMethod={"Cash"}
            amountReceived={total}
            changeDue={0}
          />
          <div className="flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={() => { window.print(); handleNewSale(); }}>
              <Printer className="mr-2 h-4 w-4" /> Print & New Sale
            </Button>
          </div>
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
                <AlertDialogCancel onClick={() => { setManagerPassword(''); setPriceToOverride(null); }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleManagerOverride}>Approve</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    