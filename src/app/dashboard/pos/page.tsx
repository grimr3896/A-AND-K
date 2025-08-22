
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, MinusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Receipt } from './_components/receipt';
import type { CartItem, Product } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function POSPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [lastTransaction, setLastTransaction] = React.useState<{ cart: CartItem[], subtotal: number, total: number, paymentMethod: string, amountReceived: number, changeDue: number } | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
  const total = subtotal; // No tax for now as per previous requests

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

  const handleQuantityChange = (productId: string, change: number) => {
    setCart((prevCart) => {
        return prevCart.reduce((acc, item) => {
            if (item.id === productId) {
                const newQuantity = item.quantity + change;
                if (newQuantity > 0 && newQuantity <= item.stock) {
                    acc.push({ ...item, quantity: newQuantity });
                } else if (newQuantity > item.stock) {
                    toast({ variant: 'destructive', title: 'Out of Stock' });
                    acc.push(item);
                }
                // if newQuantity is 0, item is removed
            } else {
                acc.push(item);
            }
            return acc;
        }, [] as CartItem[]);
    });
  };

  const handlePriceChange = (productId: string, newPrice: number) => {
      setCart(cart.map(item => item.id === productId ? { ...item, currentPrice: newPrice } : item));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Empty Cart', description: 'Please add items to the cart before checkout.' });
      return;
    }
    const hasInvalidPrice = cart.some(item => item.currentPrice < item.minPrice);
    if(hasInvalidPrice) {
      toast({ variant: 'destructive', title: 'Invalid Price', description: 'One or more items have a price below the minimum. Please correct it.' });
      return;
    }
    setLastTransaction({ cart, subtotal, total, paymentMethod: 'Cash', amountReceived: total, changeDue: 0 });
    setShowReceipt(true);
    setCart([]);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-section');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

    if (printWindow && printContent) {
        printWindow.document.write('<html><head><title>Print Receipt</title>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setLastTransaction(null);
  }

  return (
    <>
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Left Column */}
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-1 xl:col-span-2">
            {/* Product Selection */}
             <Card>
                <CardHeader>
                <CardTitle>Product</CardTitle>
                <CardDescription>Click a product to add it to the price agreement table.</CardDescription>
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
                            data-ai-hint="product image"
                        />
                        <div className="text-sm font-medium text-center">{product.name}</div>
                        <div className="text-xs text-muted-foreground">Ksh {product.price.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
                </CardContent>
            </Card>
            {/* Pending Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending</CardTitle>
                </CardHeader>
                <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
                    Suspended transactions will appear here.
                </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
            {/* Price Agreement */}
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
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.length > 0 ? cart.map(item => {
                                const isInvalid = item.currentPrice < item.minPrice;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.price.toFixed(2)}</TableCell>
                                        <TableCell>{item.minPrice.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number"
                                                value={item.currentPrice}
                                                onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                                                className={cn("w-24", isInvalid ? "border-destructive focus-visible:ring-destructive" : "")}
                                            />
                                            {isInvalid && <p className="text-xs text-destructive mt-1">Below min.</p>}
                                        </TableCell>
                                        <TableCell>
                                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, -item.quantity)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No products added.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {/* Cart */}
            <Card>
                <CardHeader>
                    <CardTitle>Cart</CardTitle>
                </CardHeader>
                <CardContent className="min-h-32">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                                <span className="font-medium">{item.name}</span>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleQuantityChange(item.id, -1)}>
                                    <MinusCircle className="h-3 w-3" />
                                    </Button>
                                    <span className="w-4 text-center text-sm">{item.quantity}</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleQuantityChange(item.id, 1)}>
                                    <PlusCircle className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <span className="font-mono">
                               @ {item.currentPrice.toFixed(2)}
                            </span>
                        </div>
                    ))}
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
       <AlertDialog open={showReceipt} onOpenChange={setShowReceipt}>
          <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                  <AlertDialogTitle>Transaction Complete</AlertDialogTitle>
                  <AlertDialogDescription>
                      Print the receipt for the customer.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="max-h-[60vh] overflow-y-auto p-2" id="receipt-section">
                  {lastTransaction && (
                      <div>
                        <h3 className="font-bold text-center mb-2">Customer Copy</h3>
                        <Receipt {...lastTransaction} tax={0} />
                      </div>
                  )}
              </div>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleCloseReceipt}>Close</AlertDialogCancel>
                  <Button onClick={handlePrint}>Print Receipt</Button>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
