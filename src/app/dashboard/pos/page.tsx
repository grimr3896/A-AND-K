
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { mockProducts } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { Shirt, Footprints, Mouse, ShoppingCart, Minus, Plus, UserTie, CreditCard, Smartphone, DollarSign, StickyNote } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Receipt } from './_components/receipt';

type CartItem = {
    id: string;
    name: string;
    quantity: number;
    agreedPrice: number;
    stock: number;
    category: string;
    price: number; // original price
    minPrice: number;
};

type AgreementItem = {
    id: string;
    name: string;
    standardPrice: number;
    minPrice: number;
    agreedPrice: number;
};

type CompletedSale = {
    cart: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    amountReceived: number;
    changeDue: number;
}

export default function POSPage() {
    const { toast } = useToast();
    const [cart, setCart] = React.useState<CartItem[]>([]);
    const [agreementTable, setAgreementTable] = React.useState<AgreementItem[]>([]);
    const [amountReceived, setAmountReceived] = React.useState<number>(0);
    const [paymentMethod, setPaymentMethod] = React.useState<string>('Cash');
    const [completedSale, setCompletedSale] = React.useState<CompletedSale | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);

    const productIcons: { [key: string]: React.ReactNode } = {
        'Dresses': <Shirt />,
        'Trousers': <Shirt />,
        'Shirts': <Shirt />,
        'Shoes': <Footprints />,
        'Accessories': <Mouse />,
        'Tie': <UserTie />,
        'Default': <ShoppingCart />
    };

    const addProductToCart = (product: Product) => {
        const existingCartItemIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingCartItemIndex > -1) {
            const updatedCart = [...cart];
            if (updatedCart[existingCartItemIndex].quantity < product.stock) {
                updatedCart[existingCartItemIndex].quantity += 1;
                setCart(updatedCart);
            } else {
                toast({ variant: 'destructive', title: 'Out of Stock', description: `No more ${product.name} in stock.` });
            }
        } else {
            if (product.stock > 0) {
                setCart(prev => [...prev, { 
                    id: product.id, 
                    name: product.name, 
                    quantity: 1, 
                    agreedPrice: product.price, 
                    stock: product.stock,
                    category: product.category,
                    price: product.price,
                    minPrice: product.minPrice,
                }]);
            } else {
                 toast({ variant: 'destructive', title: 'Out of Stock', description: `${product.name} is out of stock.` });
            }
        }

        if (!agreementTable.find(item => item.id === product.id)) {
            setAgreementTable(prev => [...prev, {
                id: product.id,
                name: product.name,
                standardPrice: product.price,
                minPrice: product.minPrice,
                agreedPrice: product.price,
            }]);
        }
    };
    
    React.useEffect(() => {
        agreementTable.forEach(item => {
            if (item.agreedPrice < item.minPrice) {
                 toast({
                    variant: "destructive",
                    title: "Price Error",
                    description: `Agreed price for ${item.name} cannot be less than Ksh ${item.minPrice.toFixed(2)}.`
                });
            }
        });
    }, [agreementTable, toast]);


    const handlePriceChange = (productId: string, newPriceStr: string) => {
        let newPrice = parseFloat(newPriceStr);
        
        const agreementItem = agreementTable.find(a => a.id === productId);
        if(!agreementItem) return;

        if (isNaN(newPrice)) {
            newPrice = agreementItem.agreedPrice; // Keep old price if input is invalid
        }

        if (newPrice < agreementItem.minPrice) {
            toast({
                variant: 'destructive',
                title: 'Price Alert',
                description: `Price for ${agreementItem.name} cannot be below minimum of Ksh ${agreementItem.minPrice.toFixed(2)}`,
            });
            newPrice = agreementItem.minPrice;
        }

        setAgreementTable(currentTable => 
            currentTable.map(item =>
                item.id === productId ? { ...item, agreedPrice: newPrice } : item
            )
        );

        setCart(currentCart => 
            currentCart.map(item => 
                item.id === productId ? { ...item, agreedPrice: newPrice } : item
            )
        );
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prevCart => {
            const itemIndex = prevCart.findIndex(item => item.id === productId);
            if (itemIndex === -1) return prevCart;

            const item = prevCart[itemIndex];
            const newQuantity = item.quantity + delta;

            if (newQuantity <= 0) {
                const newCart = prevCart.filter(i => i.id !== productId);
                const newAgreementTable = agreementTable.filter(a => a.id !== productId);
                setAgreementTable(newAgreementTable);
                return newCart;
            }
            if (newQuantity > item.stock) {
                toast({ variant: 'destructive', title: 'Out of Stock', description: `Only ${item.stock} of ${item.name} available.` });
                return prevCart;
            }
            
            const newCart = [...prevCart];
            newCart[itemIndex] = { ...item, quantity: newQuantity };
            return newCart;
        });
    };
    
    const subtotal = React.useMemo(() => cart.reduce((acc, item) => acc + item.agreedPrice * item.quantity, 0), [cart]);
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const changeDue = amountReceived - total;

    const handleCheckout = () => {
        if(cart.length === 0) {
            toast({ variant: 'destructive', title: 'Cart Empty', description: 'Please add products to the cart.' });
            return;
        }
        if(amountReceived < total) {
            toast({ variant: 'destructive', title: 'Insufficient Amount', description: 'Amount received is less than the total.' });
            return;
        }

        const saleData: CompletedSale = {
            cart,
            subtotal,
            tax,
            total,
            paymentMethod,
            amountReceived,
            changeDue
        };

        setCompletedSale(saleData);
        setIsReceiptOpen(true);

        // Reset state for next sale
        setCart([]);
        setAgreementTable([]);
        setAmountReceived(0);
        setPaymentMethod('Cash');
    };

    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-4">
                {/* Product Selection Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {mockProducts.map((product) => (
                            <button key={product.id} onClick={() => addProductToCart(product)} className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-muted transition-colors text-center">
                                 <div className="text-primary mb-2">
                                    {productIcons[product.category] || productIcons['Default']}
                                </div>
                                <p className="text-sm font-medium">{product.name}</p>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* Price Agreement Section */}
                <Card className="flex-grow">
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
                                {agreementTable.length > 0 ? agreementTable.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>Ksh {item.standardPrice.toFixed(2)}</TableCell>
                                        <TableCell>Ksh {item.minPrice.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={item.agreedPrice}
                                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                                onBlur={(e) => handlePriceChange(item.id, e.target.value)}
                                                className="h-8"
                                                min={item.minPrice}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                            Add products to set prices
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN (CART) */}
            <div className="flex flex-col gap-4">
                <Card className="flex flex-col flex-grow">
                     <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Cart</CardTitle>
                            <CardDescription>
                                {cart.reduce((acc, item) => acc + item.quantity, 0)} items
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto pr-2">
                        {cart.length > 0 ? (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-primary">
                                               Ksh {item.agreedPrice.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, -1)}>
                                                <Minus className="h-4 w-4"/>
                                            </Button>
                                            <span className="font-bold w-5 text-center">{item.quantity}</span>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, 1)}>
                                                <Plus className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                        <div className="font-mono w-24 text-right">
                                            Ksh {(item.agreedPrice * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                                <ShoppingCart className="h-12 w-12 mb-4" />
                                <p>Your cart is empty</p>
                            </div>
                        )}
                    </CardContent>
                    {cart.length > 0 && (
                        <CardFooter className="flex-col items-stretch p-4 border-t space-y-4 bg-muted/50">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-mono">Ksh {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                    <span className="font-mono">Ksh {tax.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="font-mono">Ksh {total.toFixed(2)}</span>
                                </div>
                            </div>
                            <Separator />
                             <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Amount Received</label>
                                    <Input 
                                        type="number" 
                                        placeholder="Enter amount customer paid" 
                                        value={amountReceived || ''}
                                        onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                {changeDue > 0 && (
                                    <div className="flex justify-between font-bold text-primary text-lg">
                                        <span>Change Due</span>
                                        <span>Ksh {changeDue.toFixed(2)}</span>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Payment Method</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                       <Button variant={paymentMethod === 'Cash' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Cash')}><DollarSign/>Cash</Button>
                                       <Button variant={paymentMethod === 'M-Pesa' ? 'default' : 'outline'} onClick={() => setPaymentMethod('M-Pesa')}><Smartphone/>M-Pesa</Button>
                                       <Button variant={paymentMethod === 'Card' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Card')}><CreditCard/>Card</Button>
                                       <Button variant={paymentMethod === 'Layaway' ? 'default' : 'outline'} onClick={() => setPaymentMethod('Layaway')}><StickyNote/>Layaway</Button>
                                    </div>
                                </div>
                             </div>
                            <Button size="lg" className="w-full" disabled={cart.length === 0} onClick={handleCheckout}>
                                Checkout
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Pending Transactions Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border-2 border-dashed rounded-lg min-h-[100px] flex items-center justify-center">
                            <p className="text-muted-foreground">Pending transactions will appear here</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        {completedSale && (
             <AlertDialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Transaction Complete</AlertDialogTitle>
                    </AlertDialogHeader>
                    <Receipt {...completedSale} />
                    <AlertDialogAction onClick={() => setIsReceiptOpen(false)}>
                        New Sale
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>
        )}
        </>
    );
}

    