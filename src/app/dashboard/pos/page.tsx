
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { Input } from '@/components/ui/input';

type NegotiationCartItem = Product & {
    quantity: number;
    agreedPrice: number;
    error?: string;
};

export default function POSPage() {
  const { toast } = useToast();
  const [cart, setCart] = React.useState<NegotiationCartItem[]>([]);

  const subtotal = cart.reduce((acc, item) => acc + item.agreedPrice * item.quantity, 0);

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
      return [...prevCart, { ...product, quantity: 1, agreedPrice: product.price }];
    });
  };
  
  const handleAgreedPriceChange = (productId: string, newPrice: number) => {
      setCart(cart.map(item => {
          if (item.id === productId) {
              const validatedPrice = isNaN(newPrice) ? 0 : newPrice;
              const error = validatedPrice < item.minPrice ? `Price is below minimum of Ksh ${item.minPrice.toFixed(2)}` : undefined;
              return { ...item, agreedPrice: validatedPrice, error };
          }
          return item;
      }));
  }

  const handleCheckout = () => {
      const hasErrors = cart.some(item => !!item.error);
      if(hasErrors) {
          toast({ variant: 'destructive', title: 'Price Error', description: 'Please correct all prices before cashing out.' });
          return;
      }
       if(cart.length === 0) {
          toast({ variant: 'destructive', title: 'Empty Cart', description: 'Please add items to the cart.' });
          return;
      }
      // In a real app, this would process the payment and save the transaction.
      toast({ title: 'Success', description: `Checkout for Ksh ${subtotal.toFixed(2)} successful.` });
      setCart([]);
  }

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-2">
      {/* Left Column */}
      <div className="grid auto-rows-max items-start gap-4">
        <Card>
            <CardHeader>
                <CardTitle>Product</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mockProducts.map((product) => (
                        <Card key={product.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => addToCart(product)}>
                            <CardContent className="p-2 flex flex-col items-center gap-2">
                            <Image
                                src={product.imageUrl || `https://placehold.co/150x150.png`}
                                alt={product.name}
                                width={150}
                                height={150}
                                className="rounded-md object-cover aspect-square"
                            />
                            <div className="text-sm font-medium text-center">{product.name}</div>
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
            </CardHeader>
            <CardContent>
                 <div className="text-center text-muted-foreground py-12">No pending transactions.</div>
            </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="grid auto-rows-max items-start gap-4">
        <Card>
            <CardHeader>
                <CardTitle>Price agreement</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>SP</TableHead>
                            <TableHead>MM</TableHead>
                            <TableHead>Agreed price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cart.length > 0 ? (
                            cart.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="font-mono">Ksh {item.price.toFixed(2)}</TableCell>
                                    <TableCell className="font-mono">Ksh {item.minPrice.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number"
                                            value={item.agreedPrice}
                                            onChange={e => handleAgreedPriceChange(item.id, parseFloat(e.target.value))}
                                            className={`w-32 ${item.error ? 'border-destructive' : ''}`}
                                        />
                                        {item.error && <p className="text-xs text-destructive mt-1">{item.error}</p>}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No products in cart.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Cart</CardTitle>
            </CardHeader>
            <CardContent>
                {cart.length > 0 ? (
                    <ul className="space-y-2">
                       {cart.map(item => (
                           <li key={item.id} className="flex justify-between items-center text-sm">
                               <span>{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                               <span className="font-mono">@{item.agreedPrice.toFixed(2)}</span>
                           </li>
                       ))}
                    </ul>
                ) : (
                    <div className="text-center text-muted-foreground py-8">Cart is empty</div>
                )}
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-4">
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Subtotal</span>
                    <span>Ksh {subtotal.toFixed(2)}</span>
                </div>
                <Button size="lg" onClick={handleCheckout}>Cashout</Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
