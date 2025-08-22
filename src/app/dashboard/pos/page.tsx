
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
import { MinusCircle, PlusCircle, ShoppingCart, CreditCard, Landmark, Wallet, CalendarClock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function POSPage() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [amountReceived, setAmountReceived] = React.useState(0);
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
  const taxAmount = subtotal * 0.08; // 8% tax rate
  const total = subtotal + taxAmount;
  const changeDue = amountReceived - total;

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
      return [...prevCart, { ...product, quantity: 1, currentPrice: product.price }];
    });
  };

  const handleAgreedPriceChange = (productId: string, value: string) => {
    const newPrice = parseFloat(value);
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          if (!isNaN(newPrice)) {
            if (newPrice < item.minPrice && !hasRole(['Admin', 'Manager'])) {
               toast({
                variant: 'destructive',
                title: 'Price Alert',
                description: `Price for ${item.name} requires manager approval.`,
              });
            }
            return { ...item, currentPrice: newPrice };
          }
          return { ...item, currentPrice: 0 };
        }
        return item;
      })
    );
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
  
  const isCheckoutDisabled = cart.length === 0 || amountReceived < total || !paymentMethod;

  const handleCheckout = () => {
     // In a real app, this would trigger receipt printing, saving the sale, etc.
     toast({
        title: 'Checkout Successful!',
        description: `Sale complete. Change due: Ksh ${changeDue > 0 ? changeDue.toFixed(2) : '0.00'}`
     });
     // Reset state for next sale
     setCart([]);
     setAmountReceived(0);
     setPaymentMethod(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
      {/* Left Side: Product Selection */}
      <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Product Selection</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
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
      
      {/* Right Side: Cart */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card className="flex-grow flex flex-col">
            <CardHeader className="bg-primary text-primary-foreground text-center">
                 <CardTitle className="flex items-center justify-center gap-2">
                    <ShoppingCart /> Shopping Cart
                 </CardTitle>
            </CardHeader>
            <div className="text-center py-2 text-muted-foreground font-medium border-b">
                 {cart.length} items
            </div>
             <CardContent className="p-4 flex-grow overflow-y-auto">
                {cart.length > 0 ? (
                    <div className="space-y-4">
                        {cart.map(item => (
                             <div key={item.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={item.imageUrl || `https://placehold.co/70x70.png`}
                                        alt={item.name}
                                        width={70}
                                        height={70}
                                        className="rounded-md border"
                                    />
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-primary font-medium">Ksh {item.currentPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                        <MinusCircle className="h-5 w-5" />
                                    </Button>
                                    <span className="font-bold text-lg w-5 text-center">{item.quantity}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <PlusCircle className="h-5 w-5" />
                                    </Button>
                                </div>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Your cart is empty.
                    </div>
                )}
            </CardContent>
             <div className="px-4 pb-4 mt-auto space-y-4">
                 <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>Ksh {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Tax (8%)</span>
                        <span>Ksh {taxAmount.toFixed(2)}</span>
                    </div>
                     <Separator />
                    <div className="flex justify-between font-bold text-xl">
                        <span>Total</span>
                        <span>Ksh {total.toFixed(2)}</span>
                    </div>
                 </div>

                <div className="space-y-2">
                    <label className="font-semibold">Amount Received</label>
                    <Input 
                        type="number"
                        placeholder="Enter amount received"
                        value={amountReceived || ''}
                        onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                        className="text-lg h-12 text-right font-mono"
                    />
                     {amountReceived > 0 && changeDue >= 0 && (
                        <div className="text-right text-primary font-bold">
                            Change: Ksh {changeDue.toFixed(2)}
                        </div>
                     )}
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Select Payment Method</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {(['Cash', 'M-Pesa', 'Card', 'Layaway'] as const).map((method) => (
                             <Button 
                                key={method} 
                                variant={paymentMethod === method ? "default" : "outline"}
                                className="h-14 text-base"
                                onClick={() => setPaymentMethod(method)}
                            >
                                {method === 'Cash' && <Wallet className="mr-2"/>}
                                {method === 'M-Pesa' && <Landmark className="mr-2"/>}
                                {method === 'Card' && <CreditCard className="mr-2"/>}
                                {method === 'Layaway' && <CalendarClock className="mr-2"/>}
                                {method}
                             </Button>
                        ))}
                    </div>
                </div>

                <Button 
                    size="lg" 
                    className="w-full h-16 text-xl font-bold" 
                    disabled={isCheckoutDisabled}
                    onClick={handleCheckout}
                >
                    Checkout
                </Button>
             </div>
        </Card>
      </div>
    </div>
  );
}
