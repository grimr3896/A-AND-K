
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
import { useToast } from '@/hooks/use-toast';
import type { Product, CartItem } from '@/lib/types';
import { Minus, Plus, Trash2, CreditCard, Smartphone, DollarSign, StickyNote, PauseCircle, Printer, ShoppingCart } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Receipt } from './receipt';
import { useProducts } from '@/contexts/products-context';
import Image from 'next/image';
import { useBusinessInfo } from '@/contexts/business-info-context';
import { useAuth } from '@/hooks/use-auth';

type AgreementItem = {
    id:string;
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

type PendingTransaction = {
    id: number;
    items: CartItem[];
    itemCount: number;
    total: number;
}


export default function POSPageClient() {
    const { toast } = useToast();
    const { products, handleCheckout: processCheckout } = useProducts();
    const { businessInfo } = useBusinessInfo();
    const { user } = useAuth();
    const [cart, setCart] = React.useState<CartItem[]>([]);
    const [agreementTable, setAgreementTable] = React.useState<AgreementItem[]>([]);
    const [customerName, setCustomerName] = React.useState('');
    const [amountReceived, setAmountReceived] = React.useState<number>(0);
    const [paymentMethod, setPaymentMethod] = React.useState<string>('Cash');
    const [completedSale, setCompletedSale] = React.useState<CompletedSale | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);
    const [pendingTransactions, setPendingTransactions] = React.useState<PendingTransaction[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const receiptRef = React.useRef<HTMLDivElement>(null);

    const addProductToCart = React.useCallback((product: Product) => {
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
                    imageUrl: product.imageUrl || undefined
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart, agreementTable, toast]);
    
    React.useEffect(() => {
        const priceErrors = agreementTable.some(item => item.agreedPrice < item.minPrice);
        if(priceErrors) {
            toast({
                variant: "destructive",
                title: "Price Error",
                description: `One or more items have a price below the minimum allowed.`
            });
        }
    }, [agreementTable, toast]);


    const handlePriceChange = React.useCallback((productId: string, newPriceStr: string) => {
        let newPrice = parseFloat(newPriceStr);
        
        const agreementItem = agreementTable.find(a => a.id === productId);
        if(!agreementItem) return;

        if (isNaN(newPrice)) {
            newPrice = agreementItem.agreedPrice; // Keep old price if input is invalid
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
    }, [agreementTable]);
    
     const validatePrice = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        const newPrice = parseFloat(e.target.value);
        const productId = e.target.dataset.id!;
        const agreementItem = agreementTable.find(a => a.id === productId);

        if (agreementItem && newPrice < agreementItem.minPrice) {
            toast({
                variant: 'destructive',
                title: 'Price Alert',
                description: `Price for ${agreementItem.name} cannot be below minimum of Ksh ${agreementItem.minPrice.toFixed(2)}`,
            });
             handlePriceChange(productId, agreementItem.minPrice.toString());
        }
    }, [agreementTable, toast, handlePriceChange]);


    const updateQuantity = React.useCallback((productId: string, delta: number) => {
        setCart(prevCart => {
            const itemIndex = prevCart.findIndex(item => item.id === productId);
            if (itemIndex === -1) return prevCart;

            const item = prevCart[itemIndex];
            const newQuantity = item.quantity + delta;
            
            const deleteItemFromCart = (id: string, current: CartItem[]) => {
                const newCart = current.filter(i => i.id !== id);
                setAgreementTable(a => a.filter(a => a.id !== id));
                return newCart;
            }

            if (newQuantity <= 0) {
                return deleteItemFromCart(productId, prevCart);
            }
            if (newQuantity > item.stock) {
                toast({ variant: 'destructive', title: 'Out of Stock', description: `Only ${item.stock} of ${item.name} available.` });
                return prevCart;
            }
            
            const newCart = [...prevCart];
            newCart[itemIndex] = { ...item, quantity: newQuantity };
            return newCart;
        });
    }, [toast]);

    const deleteItem = React.useCallback((productId: string) => {
        setCart(currentCart => currentCart.filter(i => i.id !== productId));
        setAgreementTable(currentAgreementTable => currentAgreementTable.filter(a => a.id !== productId));
    }, []);
    
    // Tax-inclusive pricing logic
    const subtotal = React.useMemo(() => cart.reduce((acc, item) => acc + item.agreedPrice * item.quantity, 0), [cart]);
    const total = subtotal; // Total is the same as subtotal (sticker price)
    const taxRate = businessInfo.taxRate / 100; // e.g., 16% becomes 0.16
    const tax = total - (total / (1 + taxRate)); // VAT is extracted from the total
    const changeDue = amountReceived - total;

    const resetSale = React.useCallback(() => {
        setCart([]);
        setAgreementTable([]);
        setAmountReceived(0);
        setCustomerName('');
        setPaymentMethod('Cash');
    }, []);
    
    const handlePrintReceipt = () => {
        const printContent = receiptRef.current?.innerHTML;
        if (printContent) {
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow?.document.write('<html><head><title>Print Receipt</title>');
            // A minimal set of styles to make the receipt look decent when printed
            printWindow?.document.write(`
                <style>
                    body { font-family: monospace; font-size: 10pt; }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: bold; }
                    .mb-4 { margin-bottom: 1rem; }
                    .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
                    .space-y-1 > * + * { margin-top: 0.25rem; }
                    .text-green-600 { color: #16a34a; }
                    .text-xs { font-size: 0.75rem; }
                    .pl-4 { padding-left: 1rem; }
                    hr { border: none; border-top: 1px dashed black; margin: 0.5rem 0; }
                    .flex { display: flex; }
                    .justify-between { justify-content: space-between; }
                    .text-base { font-size: 1rem; }
                </style>
            `);
            printWindow?.document.write('</head><body>');
            printWindow?.document.write(printContent);
            printWindow?.document.write('</body></html>');
            printWindow?.document.close();
            printWindow?.print();
        }
    };


    const handleFinalCheckout = React.useCallback(async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to perform a checkout.' });
            return;
        }
        if(cart.length === 0) {
            toast({ variant: 'destructive', title: 'Cart Empty', description: 'Please add products to the cart.' });
            return;
        }
        if(amountReceived < total) {
            toast({ variant: 'destructive', title: 'Insufficient Amount', description: 'Amount received is less than the total.' });
            return;
        }

        const saleDataForReceipt: CompletedSale = {
            cart,
            subtotal,
            tax,
            total,
            paymentMethod,
            amountReceived,
            changeDue
        };
        
        await processCheckout(cart, customerName, paymentMethod);

        setCompletedSale(saleDataForReceipt);
        setIsReceiptOpen(true);

        toast({ title: 'Checkout Complete', description: 'Sale has been recorded and stock updated.' });
        resetSale();
    }, [user, cart, subtotal, tax, total, paymentMethod, amountReceived, changeDue, processCheckout, toast, resetSale, customerName]);

    const handleSuspend = React.useCallback(() => {
        if(cart.length === 0) {
            toast({ variant: 'destructive', title: 'Cart Empty', description: 'Cannot suspend an empty cart.' });
            return;
        }

        const newPendingTx: PendingTransaction = {
            id: Date.now(),
            items: [...cart],
            itemCount: cart.reduce((acc, item) => acc + item.quantity, 0),
            total: total
        };

        setPendingTransactions(prev => [...prev, newPendingTx]);
        toast({ title: 'Order Suspended', description: `Order with ${newPendingTx.itemCount} items suspended.` });
        resetSale();
    }, [cart, total, toast, resetSale]);

    const handleResume = React.useCallback((txId: number) => {
        if (cart.length > 0) {
            toast({ variant: 'destructive', title: 'Active Cart', description: 'Please clear or complete the current sale before resuming another.' });
            return;
        }

        const txToResume = pendingTransactions.find(tx => tx.id === txId);
        if (txToResume) {
            setCart(txToResume.items);
            // Re-populate agreement table
            const newAgreementTable = txToResume.items.map(item => ({
                id: item.id,
                name: item.name,
                standardPrice: item.price,
                minPrice: item.minPrice,
                agreedPrice: item.agreedPrice,
            }));
            setAgreementTable(newAgreementTable);
            setPendingTransactions(prev => prev.filter(tx => tx.id !== txId));
            toast({ title: 'Order Resumed', description: 'The suspended order has been loaded into the cart.' });
        }
    }, [cart, pendingTransactions, toast]);
    
    const filteredProducts = React.useMemo(() => products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]);


    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-4">
                {/* Product Selection Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product</CardTitle>
                        <div className="pt-2">
                           <Input 
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[40vh] overflow-y-auto">
                        {filteredProducts.map((product) => (
                            <button key={product.id} onClick={() => addProductToCart(product)} className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-muted transition-colors text-center aspect-square">
                                <Image 
                                    src={product.imageUrl || `https://placehold.co/100x100.png`}
                                    alt={product.name}
                                    width={100}
                                    height={100}
                                    className="object-cover rounded-md aspect-square mb-2"
                                    data-ai-hint="product image"
                                />
                                <p className="text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
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
                                                data-id={item.id}
                                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                                onBlur={validatePrice}
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cart.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-semibold">{item.name}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.agreedPrice}
                                                    data-id={item.id}
                                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                                    onBlur={validatePrice}
                                                    className="h-7 w-24 text-sm"
                                                    min={item.minPrice}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.id, -1)}>
                                                        <Minus className="h-3 w-3"/>
                                                    </Button>
                                                    <span className="font-bold w-5 text-center">{item.quantity}</span>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(item.id, 1)}>
                                                        <Plus className="h-3 w-3"/>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-right">
                                                {(item.agreedPrice * item.quantity).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}>
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>VAT (Included)</span>
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
                                    <label className="text-sm font-medium">Customer Name (Optional)</label>
                                    <Input
                                        placeholder="Enter customer name for record"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
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
                                       <Button variant='outline' disabled><StickyNote/>Layaway</Button>
                                    </div>
                                </div>
                             </div>
                             <div className='grid grid-cols-2 gap-2'>
                                <Button size="lg" variant="outline" onClick={handleSuspend}>
                                    <PauseCircle className="mr-2 h-4 w-4" />
                                    Suspend
                                </Button>
                                <Button size="lg" className="w-full" disabled={cart.length === 0} onClick={handleFinalCheckout}>
                                    Checkout
                                </Button>
                             </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
             {/* Pending Transactions Section */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingTransactions.length > 0 ? (
                            <div className="space-y-2">
                                {pendingTransactions.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg bg-amber-50 dark:bg-amber-900/10">
                                        <div>
                                            <p className="font-semibold">Suspended Sale</p>
                                            <p className="text-sm text-muted-foreground">{tx.itemCount} items - Total: Ksh {tx.total.toFixed(2)}</p>
                                        </div>
                                        <Button size="sm" onClick={() => handleResume(tx.id)}>Resume</Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="border-2 border-dashed rounded-lg min-h-[100px] flex items-center justify-center">
                                <p className="text-muted-foreground">Suspended transactions will appear here</p>
                            </div>
                        )}
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
                    <Receipt ref={receiptRef} {...completedSale} />
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsReceiptOpen(false)}>
                            New Sale
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handlePrintReceipt}>
                           <Printer className="mr-2 h-4 w-4" />
                           Print Receipt
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
        </>
    );
}
