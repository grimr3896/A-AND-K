
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import type { Product, CartItem } from '@/lib/types';
import { Plus, Minus, CreditCard, Smartphone, DollarSign, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';

export default function POSPage() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [amountReceived, setAmountReceived] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);

  // agreedPrices is no longer needed with this cart design.
  // Prices are managed directly within the cart items if necessary, 
  // but for now, we'll use the standard price.

  const subtotal = React.useMemo(() =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const taxAmount = subtotal * 0.08;
  const total = subtotal + taxAmount;

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

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart(prevCart => {
      const product = prevCart.find(item => item.id === productId);
      if (!product) return prevCart;

      if (newQuantity > 0 && newQuantity <= product.stock) {
        return prevCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
      } else if (newQuantity === 0) {
        // Remove item if quantity is zero
        return prevCart.filter(item => item.id !== productId);
      } else if (newQuantity > product.stock) {
          toast({ variant: 'destructive', title: 'Out of Stock', description: `Only ${product.stock} of ${product.name} available.` });
      }
      return prevCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };
  
  const isCheckoutDisabled = cart.length === 0 || !paymentMethod || parseFloat(amountReceived || '0') < total;

  const handleCheckout = () => {
     if(cart.length === 0) {
         toast({ variant: 'destructive', title: 'Cart Empty', description: 'Please add products to the cart.' });
         return;
     }
     if(!paymentMethod) {
         toast({ variant: 'destructive', title: 'Payment Method', description: 'Please select a payment method.' });
         return;
     }
      if(parseFloat(amountReceived || '0') < total) {
         toast({ variant: 'destructive', title: 'Insufficient Amount', description: 'Amount received is less than the total.' });
         return;
     }

     toast({
        title: 'Checkout Successful!',
        description: `Sale complete. Total: Ksh ${total.toFixed(2)}`
     });
     setCart([]);
     setAmountReceived('');
     setPaymentMethod(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
      {/* Left Side: Product Selection */}
      <Card className="flex flex-col lg:col-span-3">
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
      <Card className="flex flex-col lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="text-lg">Cart</CardTitle>
            <div className="text-sm font-medium text-muted-foreground">
                {cart.reduce((acc, item) => acc + item.quantity, 0)} items
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow overflow-y-auto space-y-4">
            {cart.length > 0 ? (
                cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Ksh {item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                    <Minus className="h-4 w-4"/>
                                </Button>
                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </div>
                            <span className="w-20 text-right font-mono">Ksh {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>Your cart is empty</p>
                </div>
            )}
        </CardContent>
        <CardFooter className="flex-col items-stretch p-4 border-t space-y-4 bg-muted/50">
             <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-mono">Ksh {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Tax (8%)</span>
                    <span className="font-mono">Ksh {taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="font-mono">Ksh {total.toFixed(2)}</span>
                </div>
            </div>
            
            <div>
                <label htmlFor="amount-received" className="text-sm font-medium mb-2 block">Amount Received</label>
                <Input
                    id="amount-received"
                    type="number"
                    placeholder="0.00"
                    value={amountReceived}
                    onChange={e => setAmountReceived(e.target.value)}
                    className="text-right font-mono"
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                 <Button variant={paymentMethod === 'Cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Cash')}>
                     <DollarSign className="mr-2 h-4 w-4"/> Cash
                 </Button>
                 <Button variant={paymentMethod === 'M-Pesa' ? 'default' : 'outline'} onClick={() => setPaymentMethod('M-Pesa')}>
                    <Smartphone className="mr-2 h-4 w-4"/> M-Pesa
                 </Button>
                 <Button variant={paymentMethod === 'Card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Card')}>
                    <CreditCard className="mr-2 h-4 w-4"/> Card
                 </Button>
                 <Button variant={paymentMethod === 'Layaway' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Layaway')}>
                    <Calendar className="mr-2 h-4 w-4"/> Layaway
                 </Button>
            </div>
            <Button size="lg" className="w-full" disabled={isCheckoutDisabled} onClick={handleCheckout}>
                Checkout
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
