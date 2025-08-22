
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import type { Product, CartItem } from '@/lib/types';
import { MinusCircle, PlusCircle, Printer, Trash2, Edit, RotateCcw, PauseCircle, CornerUpLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AdjustPriceDialog } from './_components/adjust-price-dialog';
import { Receipt } from './_components/receipt';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type PendingCart = {
  id: string;
  cart: CartItem[];
  amountReceived: number;
  paymentMethod: string;
  timestamp: string;
}

export default function POSPage() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = React.useState('Cash');
  const [amountReceived, setAmountReceived] = React.useState(0);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = React.useState(false);
  const [itemToAdjust, setItemToAdjust] = React.useState<CartItem | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);
  const [pendingCarts, setPendingCarts] = React.useState<PendingCart[]>([]);

  const TAX_RATE = 0.08; // 8%

  const subtotal = cart.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const changeDue = amountReceived - total;
  const balanceRemaining = total - amountReceived;
  
  const isCashoutDisabled = cart.length === 0 || amountReceived < total;


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
      return [...prevCart, { ...product, quantity: 1, currentPrice: product.price, originalPrice: product.price, adjustmentReason: '' }];
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

  const handleOpenPriceDialog = (item: CartItem) => {
    setItemToAdjust(item);
    setIsPriceDialogOpen(true);
  };

  const handlePriceAdjust = (itemId: string, newPrice: number, reason: string) => {
    setCart(cart.map(item => item.id === itemId ? {...item, currentPrice: newPrice, adjustmentReason: reason} : item));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Empty Cart', description: 'Add products to the cart before checkout.' });
      return;
    }
    if (amountReceived < total) {
      toast({ variant: 'destructive', title: 'Insufficient Payment', description: `Amount received is less than the total of Ksh ${total.toFixed(2)}.` });
      return;
    }
    // In a real app, this is where you'd save the sale to the database.
    setIsReceiptOpen(true);
  };

  const handleNewSale = () => {
    setCart([]);
    setAmountReceived(0);
    setPaymentMethod('Cash');
    setIsReceiptOpen(false);
    toast({ title: 'New Sale Started' });
  }

  const handleSuspendSale = () => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Empty Cart', description: 'Cannot suspend an empty cart.' });
      return;
    }
    const newPendingCart: PendingCart = {
      id: `pending-${Date.now()}`,
      cart,
      amountReceived,
      paymentMethod,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPendingCarts(prev => [newPendingCart, ...prev]);
    setCart([]);
    setAmountReceived(0);
    setPaymentMethod('Cash');
    toast({ title: 'Sale Suspended', description: 'The current sale has been moved to pending.' });
  }

  const handleResumeSale = (pendingId: string) => {
    if (cart.length > 0) {
      toast({ variant: 'destructive', title: 'Active Sale', description: 'Please suspend or complete the current sale before resuming another.' });
      return;
    }
    const saleToResume = pendingCarts.find(p => p.id === pendingId);
    if (saleToResume) {
      setCart(saleToResume.cart);
      setAmountReceived(saleToResume.amountReceived);
      setPaymentMethod(saleToResume.paymentMethod);
      setPendingCarts(prev => prev.filter(p => p.id !== pendingId));
      toast({ title: 'Sale Resumed', description: `Resumed sale from ${saleToResume.timestamp}.` });
    }
  }

  const handleDiscardSale = (pendingId: string) => {
    setPendingCarts(prev => prev.filter(p => p.id !== pendingId));
    toast({ title: 'Sale Discarded', description: 'The pending sale has been removed.' });
  }

  return (
    <>
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Left Column */}
        <div className="grid auto-rows-max items-start gap-4 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
              <CardDescription>Sales that have been put on hold. Resume or discard them.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingCarts.length > 0 ? (
                <ul className="space-y-3">
                  {pendingCarts.map(p => (
                    <li key={p.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                      <div>
                        <div className="font-medium">
                          Suspended Sale ({p.cart.reduce((acc, item) => acc + item.quantity, 0)} items)
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Suspended at {p.timestamp} - Total: Ksh {(p.cart.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0) * (1 + TAX_RATE)).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleResumeSale(p.id)}>
                          <CornerUpLeft className="mr-2 h-4 w-4" /> Resume
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDiscardSale(p.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Discard
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  No pending transactions.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="grid auto-rows-max items-start gap-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Cart</CardTitle>
              <CardDescription>
                Manage quantities and prices for the current sale.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map(item => (
                      <TableRow key={item.id}>
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
                        <TableCell className="text-right font-mono">
                           {item.currentPrice.toFixed(2)}
                           {item.currentPrice !== item.price && (
                             <p className="text-xs text-muted-foreground line-through">{item.price.toFixed(2)}</p>
                           )}
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="outline" size="sm" onClick={() => handleOpenPriceDialog(item)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Adjust
                            </Button>
                            <Button variant="ghost" size="icon" className="ml-1 text-destructive" onClick={() => removeFromCart(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-12">
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
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="amount-received" className="text-xs font-medium">Amount Received</label>
                    <Input
                      id="amount-received"
                      type="number"
                      value={amountReceived || ''}
                      onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)}
                      className="text-right font-mono"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="payment-method" className="text-xs font-medium">Payment Method</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger id="payment-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                 {amountReceived > 0 && (
                   <div className={`flex justify-between font-bold text-base p-2 rounded-md ${changeDue >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {changeDue >= 0 ? (
                      <>
                        <span>Change Due:</span>
                        <span>Ksh {changeDue.toFixed(2)}</span>
                      </>
                    ) : (
                      <>
                        <span>Balance Remaining:</span>
                        <span>Ksh {balanceRemaining.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}
                 <div className="grid grid-cols-2 gap-2">
                  <Button size="lg" variant="outline" onClick={handleSuspendSale} disabled={cart.length === 0}>
                    <PauseCircle className="mr-2 h-4 w-4" />
                    Suspend
                  </Button>
                  <Button size="lg" onClick={handleCheckout} disabled={isCashoutDisabled}>Cashout</Button>
                </div>
                <Button size="lg" variant="destructive" onClick={() => setCart([])}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear Cart
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {itemToAdjust && (
        <AdjustPriceDialog
          isOpen={isPriceDialogOpen}
          onOpenChange={setIsPriceDialogOpen}
          item={itemToAdjust}
          onPriceAdjust={handlePriceAdjust}
        />
      )}
      
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
            amountReceived={amountReceived}
            changeDue={changeDue}
          />
          <div className="flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={() => { window.print(); handleNewSale(); }}>
              <Printer className="mr-2 h-4 w-4" /> Print & New Sale
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

    