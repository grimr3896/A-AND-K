
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, MinusCircle, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Receipt } from './_components/receipt';
import type { CartItem, Product, UserRole } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdjustPriceDialog } from './_components/adjust-price-dialog';
import { useAuth } from '@/hooks/use-auth';

export default function POSPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [isAdjustPriceOpen, setIsAdjustPriceOpen] = React.useState(false);
  const [itemToAdjust, setItemToAdjust] = React.useState<CartItem | null>(null);
  
  const [lastTransaction, setLastTransaction] = React.useState<{ cart: CartItem[], subtotal: number, tax: number, total: number, paymentMethod: string, amountReceived: number, changeDue: number, balanceRemaining: number } | null>(null);
  const [amountReceived, setAmountReceived] = React.useState(0);

  const subtotal = cart.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  const balanceRemaining = total - amountReceived;
  const changeDue = amountReceived > total ? amountReceived - total : 0;

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
        const newCart = prevCart.map((item) => {
            if (item.id === productId) {
                const newQuantity = item.quantity + change;
                if (newQuantity <= 0) {
                    return null; // will be filtered out
                }
                if (newQuantity > item.stock) {
                    toast({ variant: 'destructive', title: 'Out of Stock' });
                    return item;
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(Boolean) as CartItem[]; // filter out nulls

        // Reset amount received if cart becomes empty
        if (newCart.length === 0) {
          setAmountReceived(0);
        }
        return newCart;
    });
  };
  
  const handleRemoveItem = (productId: string) => {
      setCart(cart.filter(item => item.id !== productId));
  }
  
  const handleOpenAdjustPrice = (item: CartItem) => {
      if (!hasRole(['Admin', 'Manager'])) {
          toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to adjust prices.'});
          return;
      }
      setItemToAdjust(item);
      setIsAdjustPriceOpen(true);
  }

  const handlePriceChange = (productId: string, newPrice: number) => {
      setCart(cart.map(item => item.id === productId ? { ...item, currentPrice: newPrice } : item));
      setIsAdjustPriceOpen(false);
      setItemToAdjust(null);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Empty Cart', description: 'Please add items to the cart before checkout.' });
      return;
    }
     if (amountReceived < total) {
      toast({ variant: 'destructive', title: 'Insufficient Payment', description: 'Amount received is less than the total.' });
      return;
    }
    setLastTransaction({ cart, subtotal, tax, total, paymentMethod: 'Cash', amountReceived, changeDue, balanceRemaining: balanceRemaining > 0 ? 0 : balanceRemaining });
    setShowReceipt(true);
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
    setCart([]);
    setAmountReceived(0);
  }

  return (
    <>
      <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-1 xl:col-span-2">
             <Card>
                <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Click a product to add it to the cart.</CardDescription>
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
        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Cart</CardTitle>
                </CardHeader>
                <CardContent className="min-h-32">
                    {cart.length > 0 ? (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center mb-4">
                                <div>
                                    <span className="font-medium">{item.name}</span>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <span>{item.quantity} x Ksh {item.currentPrice.toFixed(2)}</span>
                                         {item.currentPrice !== item.price && (
                                            <span className="text-xs text-destructive">(Orig: Ksh {item.price.toFixed(2)})</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, -1)}>
                                        <MinusCircle className="h-4 w-4" />
                                    </Button>
                                    <span className="w-5 text-center text-sm">{item.quantity}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(item.id, 1)}>
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenAdjustPrice(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                     <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveItem(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <span className="font-mono w-20 text-right">
                                    Ksh {(item.currentPrice * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))
                    ) : (
                         <div className="text-center text-muted-foreground py-12">Cart is empty</div>
                    )}
                </CardContent>
                {cart.length > 0 && (
                    <CardFooter className="flex-col items-stretch space-y-4">
                        <Separator />
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>Ksh {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax (8%)</span>
                            <span>Ksh {tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>Ksh {total.toFixed(2)}</span>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="amount-received">Amount Received (Ksh)</Label>
                             <Input 
                                id="amount-received"
                                type="number" 
                                value={amountReceived}
                                onChange={(e) => setAmountReceived(Number(e.target.value))}
                                className="text-right text-lg font-mono"
                             />
                        </div>
                         <div className="flex justify-between font-bold text-base">
                           {balanceRemaining > 0 ? (
                                <>
                                    <span>Balance Remaining:</span>
                                    <span className="text-destructive">Ksh {balanceRemaining.toFixed(2)}</span>
                                </>
                           ) : (
                               <>
                                    <span>Change Due:</span>
                                    <span className="text-primary">Ksh {changeDue.toFixed(2)}</span>
                               </>
                           )}
                        </div>
                        <Button size="lg" onClick={handleCheckout} disabled={amountReceived < total}>Cashout</Button>
                    </CardFooter>
                )}
            </Card>
        </div>
      </div>
       <AlertDialog open={showReceipt} onOpenChange={setShowReceipt}>
          <AlertDialogContent className="max-w-sm">
              <AlertDialogHeader>
                  <AlertDialogTitle>Transaction Complete</AlertDialogTitle>
                  <AlertDialogDescription>
                      Print the receipt for the customer.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="max-h-[60vh] overflow-y-auto p-2" id="receipt-section">
                  {lastTransaction && <Receipt {...lastTransaction} />}
              </div>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleCloseReceipt}>New Sale</AlertDialogCancel>
                  <Button onClick={handlePrint}>Print Receipt</Button>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      {itemToAdjust && (
          <AdjustPriceDialog 
            isOpen={isAdjustPriceOpen}
            onOpenChange={setIsAdjustPriceOpen}
            item={itemToAdjust}
            onPriceAdjust={handlePriceChange}
          />
      )}
    </>
  );
}

    