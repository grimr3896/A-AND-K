
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import type { Product, CartItem } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';

export default function POSPage() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [agreedPrices, setAgreedPrices] = React.useState<Record<string, number>>({});

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
      return [...prevCart, { ...product, quantity: 1, currentPrice: product.price, originalPrice: product.price }];
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
  
  const handleAgreedPriceChange = (productId: string, value: string) => {
    const newPrice = parseFloat(value);
    const product = cart.find(p => p.id === productId);

    if (!product) return;

    if (isNaN(newPrice)) {
        setAgreedPrices(prev => ({...prev, [productId]: product.price})); // Revert to original price if input is invalid
        return;
    }
    
    setAgreedPrices(prev => ({...prev, [productId]: newPrice}));
  };

  React.useEffect(() => {
    const priceErrorFound = cart.some(item => {
        const agreedPrice = agreedPrices[item.id];
        return agreedPrice < item.minPrice && !hasRole(['Admin', 'Manager']);
    });

    if (priceErrorFound) {
      toast({
        variant: 'destructive',
        title: 'Manager Approval Required',
        description: 'One or more items are priced below the minimum allowed.',
      });
    }
  }, [agreedPrices, cart, hasRole, toast]);


  const isCheckoutDisabled = cart.length === 0;

  const handleCheckout = () => {
     let priceError = false;
     cart.forEach(item => {
         const agreedPrice = agreedPrices[item.id];
         if (agreedPrice < item.minPrice && !hasRole(['Admin', 'Manager'])) {
             priceError = true;
             toast({
                variant: 'destructive',
                title: `Price Error for ${item.name}`,
                description: `The agreed price (Ksh ${agreedPrice.toFixed(2)}) is below the minimum allowed (Ksh ${item.minPrice.toFixed(2)}).`,
             })
         }
     })

     if (priceError) return;

     toast({
        title: 'Checkout Successful!',
        description: `Sale complete. Total: Ksh ${total.toFixed(2)}`
     });
     setCart([]);
     setAgreedPrices({});
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
      {/* Left Side: Product Selection */}
      <Card className="flex flex-col lg:col-span-3">
          <CardHeader>
            <CardTitle>Product</CardTitle>
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
      
      {/* Right Side: Agreement, Cart, Pending */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card className="flex-grow flex flex-col">
            <CardHeader>
                 <CardTitle>Price agreement</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-0">
                <div className="relative">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2">Product</th>
                                <th className="p-2 text-right">SP</th>
                                <th className="p-2 text-right">MM</th>
                                <th className="p-2">Agreed price</th>
                                <th className="p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.length > 0 ? cart.map(item => {
                                const agreedPrice = agreedPrices[item.id] ?? item.price;
                                const isBelowMin = agreedPrice < item.minPrice && !hasRole(['Admin', 'Manager']);
                                return (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-2 font-medium">{item.name}</td>
                                        <td className="p-2 text-right font-mono">{item.price.toFixed(2)}</td>
                                        <td className="p-2 text-right font-mono">{item.minPrice.toFixed(2)}</td>
                                        <td className="p-2">
                                            <Input 
                                                type="number" 
                                                value={agreedPrices[item.id] ?? ''}
                                                onChange={(e) => handleAgreedPriceChange(item.id, e.target.value)}
                                                className={`h-8 w-28 text-right ${isBelowMin ? 'border-destructive ring-2 ring-destructive' : ''}`}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-muted-foreground">No products added.</td>
                                </tr>
                            )}
                        </tbody>
                     </table>
                </div>
            </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4">
            <Card>
                 <CardHeader>
                    <CardTitle>Cart</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-2 text-sm">
                        {cart.map(item => {
                            const agreedPrice = agreedPrices[item.id] ?? item.price;
                            return (
                                 <li key={item.id} className="flex justify-between">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span className="font-mono">@ {(agreedPrice).toFixed(2)}</span>
                                 </li>
                            )
                        })}
                    </ul>
                     <Separator className="my-2" />
                     <div className="space-y-1 font-medium">
                        <div className="flex justify-between text-lg font-bold border-t pt-1 mt-1">
                            <span>Subtotal</span>
                            <span className="font-mono">Ksh {subtotal.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button size="lg" className="w-full" disabled={isCheckoutDisabled} onClick={handleCheckout}>
                        Cashout
                    </Button>
                </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Pending</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center justify-center h-full text-muted-foreground">
                        No pending transactions.
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    