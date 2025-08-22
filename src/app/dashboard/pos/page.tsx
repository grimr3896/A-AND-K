
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import type { Product, CartItem } from '@/lib/types';
import { MinusCircle, PlusCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function POSPage() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  
  const subtotal = cart.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);

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
            if (newPrice < item.minPrice) {
               toast({
                variant: 'destructive',
                title: 'Price Alert',
                description: `Agreed price for ${item.name} is below the minimum price of Ksh ${item.minPrice.toFixed(2)}.`,
              });
            }
            return { ...item, currentPrice: newPrice };
          }
          return { ...item, currentPrice: 0 }; // Or handle as an error
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

  const removeItem = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  const isCashoutDisabled = cart.some(item => item.currentPrice < item.minPrice) || cart.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Left Side */}
      <div className="grid grid-rows-2 gap-4">
        {/* Product Selection */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Product</CardTitle>
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
        {/* Price Agreement */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Price agreement</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
            {cart.length > 0 ? (
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
                        {cart.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="font-mono">Ksh {item.price.toFixed(2)}</TableCell>
                                <TableCell className="font-mono">Ksh {item.minPrice.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={item.currentPrice}
                                        onChange={(e) => handleAgreedPriceChange(item.id, e.target.value)}
                                        className={`w-28 text-right font-mono h-8 ${item.currentPrice < item.minPrice ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    Add products to begin price agreement.
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Side */}
      <div className="grid grid-rows-2 gap-4">
        {/* Running Cart */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Cart</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
            {cart.length > 0 ? (
                <div className="space-y-2">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                            <span>{item.name} {item.quantity}@{item.currentPrice.toFixed(2)}</span>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                    <MinusCircle className="h-4 w-4" />
                                </Button>
                                <span className="font-medium w-4 text-center">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-destructive" onClick={() => removeItem(item.id)}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="flex items-center justify-center h-full text-muted-foreground">
                    Cart is empty.
                </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-stretch space-y-2 border-t pt-4">
            <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>Ksh {subtotal.toFixed(2)}</span>
            </div>
            <Button size="lg" disabled={isCashoutDisabled}>Cashout</Button>
          </CardFooter>
        </Card>
        {/* Pending Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-md text-muted-foreground">
              Suspended transactions will appear here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    