"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
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
import { Shirt, Footprints, Mouse, Vest, ShoppingCart, Minus, Plus } from 'lucide-react';

type CartItem = {
    id: string;
    name: string;
    quantity: number;
    agreedPrice: number;
    stock: number;
    category: string;
};

type AgreementItem = {
    id: string;
    name: string;
    standardPrice: number;
    minPrice: number;
    agreedPrice: number;
};

export default function POSPage() {
    const { toast } = useToast();
    const [cart, setCart] = React.useState<CartItem[]>([]);
    const [agreementTable, setAgreementTable] = React.useState<AgreementItem[]>([]);

    const productIcons: { [key: string]: React.ReactNode } = {
        'Dresses': <Shirt />,
        'Trousers': <Shirt />, 
        'Shirts': <Shirt />,
        'Shoes': <Footprints />,
        'Accessories': <Mouse />,
        'Tie': <Vest />,
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
            setCart(prev => [...prev, { 
                id: product.id, 
                name: product.name, 
                quantity: 1, 
                agreedPrice: product.price, 
                stock: product.stock,
                category: product.category,
            }]);
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
    
    const handlePriceChange = (productId: string, newPriceStr: string) => {
        const newPrice = parseFloat(newPriceStr);
        setAgreementTable(currentTable => 
            currentTable.map(item => {
                if (item.id === productId) {
                    if (isNaN(newPrice) || newPrice < item.minPrice) {
                        toast({
                            variant: "destructive",
                            title: "Price Error",
                            description: `Agreed price for ${item.name} cannot be less than Ksh ${item.minPrice.toFixed(2)}.`
                        });
                        return { ...item, agreedPrice: item.minPrice };
                    }
                    return { ...item, agreedPrice: newPrice };
                }
                return item;
            })
        );

        setCart(currentCart => 
            currentCart.map(item => {
                if (item.id === productId) {
                    const agreementItem = agreementTable.find(a => a.id === productId);
                    const finalPrice = (newPrice >= (agreementItem?.minPrice ?? 0)) ? newPrice : (agreementItem?.minPrice ?? 0);
                    return { ...item, agreedPrice: finalPrice };
                }
                return item;
            })
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

    const handleCheckout = () => {
        if(cart.length === 0) {
            toast({ variant: 'destructive', title: 'Cart Empty', description: 'Please add products to the cart.' });
            return;
        }

        toast({
           title: 'Checkout Successful!',
           description: `Sale complete. Total: Ksh ${total.toFixed(2)}`
        });
        setCart([]);
        setAgreementTable([]);
    };

    const subtotal = React.useMemo(() => cart.reduce((acc, item) => acc + item.agreedPrice * item.quantity, 0), [cart]);
    const total = subtotal; // Assuming no tax for now
    const isCheckoutDisabled = cart.length === 0;

    return (
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
                                    {productIcons[product.name] || productIcons[product.category] || productIcons['Default']}
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

            {/* RIGHT COLUMN (CART & PENDING) */}
            <div className="flex flex-col gap-4">
                <Card className="flex flex-col flex-grow">
                     <CardHeader>
                        <CardTitle>Cart</CardTitle>
                        <CardDescription>
                            {cart.reduce((acc, item) => acc + item.quantity, 0)} items
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto pr-2">
                        {cart.length > 0 ? (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</p>
                                            <p className="text-sm text-primary">
                                               {item.quantity} @ Ksh {item.agreedPrice.toFixed(2)}
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
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="font-mono">Ksh {total.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button size="lg" className="w-full" disabled={isCheckoutDisabled} onClick={handleCheckout}>
                                Cashout
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
    );
}
