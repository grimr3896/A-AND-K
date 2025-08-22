
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
import { Trash2, Plus, Minus, CreditCard, Smartphone, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';

export default function POSPage() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [agreedPrices, setAgreedPrices] = React.useState<Record<string, number>>({});
  const [amountReceived, setAmountReceived] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);

  const subtotal = React.useMemo(() =>
    cart.reduce((acc, item) => {
        const price = agreedPrices[item.id] ?? item.price;
        return acc + price * item.quantity;
    }, 0)
  , [cart, agreedPrices]);

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
      setAgreedPrices(prev => ({...prev, [product.id]: product.price}));
      // This is a simplified version, for a real app, you might need more robust price handling
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
        return prevCart.filter(item => item.id !== productId);
      } else if (newQuantity > product.stock) {
          toast({ variant: 'destructive', title: 'Out of Stock', description: `Only ${product.stock} of ${product.name} available.` });
      }
      return prevCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    setAgreedPrices(prev => {
        const newPrices = {...prev};
        delete newPrices[productId];
        return newPrices;
    })
  };

  const isCheckoutDisabled = cart.length === 0 || !paymentMethod || parseFloat(amountReceived) < total;

  const handleCheckout = () => {
     if(isCheckoutDisabled) {
         toast({
            variant: 'destructive',
            title: 'Checkout Incomplete',
            description: 'Please select a payment method and ensure amount received covers the total.',
         });
         return;
     }

     toast({
        title: 'Checkout Successful!',
        description: `Sale complete. Total: Ksh ${total.toFixed(2)}`
     });
     setCart([]);
     setAgreedPrices({});
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
        <CardHeader className="flex flex-row items-center justify-between bg-muted/50 p-4">
            <CardTitle className="text-lg">Shopping Cart</CardTitle>
            <div className="text-sm font-medium text-muted-foreground bg-background border rounded-full px-3 py-1">
                {cart.reduce((acc, item) => acc + item.quantity, 0)} items
            </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow overflow-y-auto">
            {cart.length > 0 ? (
                <div className="space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Image src={item.imageUrl || `https://placehold.co/64x64.png`} alt={item.name} width={64} height={64} className="rounded-md border object-cover"/>
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Ksh {item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                    <Minus className="h-4 w-4"/>
                                </Button>
                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                    <Plus className="h-4 w-4"/>
                                </Button>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>Your cart is empty</p>
                    <p className="text-sm">Add products to get started</p>
                </div>
            )}
        </CardContent>
        <div className="p-4 border-t space-y-4 bg-muted/50">
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
            <div className="grid gap-2">
                <label htmlFor="amount-received" className="text-sm font-medium">Amount Received</label>
                <Input
                    id="amount-received"
                    type="number"
                    placeholder="Enter amount customer paid"
                    value={amountReceived}
                    onChange={e => setAmountReceived(e.target.value)}
                    className="text-right font-mono"
                />
            </div>
            <div>
                 <p className="text-sm font-medium mb-2">Payment Method</p>
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
            </div>
            <Button size="lg" className="w-full" disabled={isCheckoutDisabled} onClick={handleCheckout}>
                Checkout
            </Button>
        </div>
      </Card>
    </div>
  );
}

    