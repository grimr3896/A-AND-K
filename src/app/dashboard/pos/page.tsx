
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
import { MinusCircle, PlusCircle, Edit, Printer } from 'lucide-react';
import { AdjustPriceDialog } from './_components/adjust-price-dialog';
import { Receipt } from './_components/receipt';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


export default function POSPage() {
  const { toast } = useToast();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = React.useState('Cash');
  const [amountReceived, setAmountReceived] = React.useState(0);
  const [itemToAdjust, setItemToAdjust] = React.useState<CartItem | null>(null);
  const [isAdjustPriceOpen, setIsAdjustPriceOpen] = React.useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);
  
  const TAX_RATE = 0.08; // 8%

  const subtotal = cart.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const changeDue = amountReceived - total;
  const balanceRemaining = total - amountReceived;

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
      return [...prevCart, { ...product, quantity: 1, currentPrice: product.price, originalPrice: product.price }];
    });
  };
  
  const updateQuantity = (productId: string, amount: number) => {
      setCart(prevCart => {
          const itemToUpdate = prevCart.find(item => item.id === productId);
          if (!itemToUpdate) return prevCart;

          const newQuantity = itemToUpdate.quantity + amount;

          if(newQuantity <= 0) {
              return prevCart.filter(item => item.id !== productId);
          }

          if (newQuantity > itemToUpdate.stock) {
              toast({ variant: 'destructive', title: 'Out of Stock', description: `Only ${itemToUpdate.stock} units of ${itemToUpdate.name} available.` });
              return prevCart;
          }
          
          return prevCart.map(item => item.id === productId ? {...item, quantity: newQuantity} : item);
      })
  }

  const handleAdjustPrice = (item: CartItem) => {
      setItemToAdjust(item);
      setIsAdjustPriceOpen(true);
  }

  const onAdjustPrice = (itemId: string, newPrice: number) => {
      setCart(cart.map(item => item.id === itemId ? {...item, currentPrice: newPrice} : item));
  }
  
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
      toast({title: 'New Sale Started'});
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
        </div>

        {/* Right Column */}
        <div className="grid auto-rows-max items-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Cart</CardTitle>
              <CardDescription>
                Manage items for the current transaction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[80px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cart.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Ksh {item.currentPrice.toFixed(2)} / unit
                                        {item.currentPrice !== item.price && (
                                            <span className="ml-2 text-destructive line-through">Ksh {item.price.toFixed(2)}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}><MinusCircle className="h-4 w-4" /></Button>
                                        <span className="w-4 text-center">{item.quantity}</span>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}><PlusCircle className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">Ksh {(item.currentPrice * item.quantity).toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="ghost" onClick={() => handleAdjustPrice(item)}><Edit className="h-4 w-4" /></Button>
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
            {cart.length > 0 && (
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
                         <div className={`flex justify-between font-bold text-base p-2 rounded-md ${changeDue >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
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

                     <Button size="lg" onClick={handleCheckout}>Cashout</Button>
                </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <AdjustPriceDialog 
        isOpen={isAdjustPriceOpen}
        onOpenChange={setIsAdjustPriceOpen}
        item={itemToAdjust}
        onAdjustPrice={onAdjustPrice}
      />
      
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
