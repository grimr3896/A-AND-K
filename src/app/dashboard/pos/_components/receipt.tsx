
"use client";

import React from 'react';
import type { CartItem } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

type ReceiptProps = {
    cart: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    amountReceived: number;
    changeDue: number;
};

export function Receipt({ cart, subtotal, tax, total, paymentMethod, amountReceived, changeDue }: ReceiptProps) {
    return (
        <div className="bg-white text-black p-4 rounded-lg shadow-md font-mono text-sm w-full max-w-sm mx-auto border">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold">A & K babyshop</h2>
                <p>123 Blossom Lane, Garden City</p>
                <p>Date: {new Date().toLocaleString()}</p>
            </div>
            <Separator className="my-2 bg-black" />
            <div className="space-y-1">
                {cart.map((item) => (
                    <React.Fragment key={item.id}>
                        <div className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>Ksh {(item.currentPrice * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.currentPrice !== item.price && (
                             <div className="flex justify-between pl-4 text-xs">
                                <span>(Original: Ksh {item.price.toFixed(2)})</span>
                                <span className="text-green-600">-{((item.price - item.currentPrice) * item.quantity).toFixed(2)}</span>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
            <Separator className="my-2 bg-black" />
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Ksh {subtotal.toFixed(2)}</span>
                </div>
                 {tax > 0 && <div className="flex justify-between">
                    <span>Tax</span>
                    <span>Ksh {tax.toFixed(2)}</span>
                </div>}
            </div>
            <Separator className="my-2 bg-black" />
            <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>Ksh {total.toFixed(2)}</span>
            </div>
             <Separator className="my-2 bg-black" />
             <div className="space-y-1">
                 <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span>{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                    <span>Amount Received</span>
                    <span>Ksh {amountReceived.toFixed(2)}</span>
                </div>
                {changeDue > 0 && (
                     <div className="flex justify-between font-bold">
                        <span>Change Due</span>
                        <span>Ksh {changeDue.toFixed(2)}</span>
                    </div>
                )}
            </div>
            <div className="text-center mt-4">
                <p>Thank you for your purchase!</p>
            </div>
        </div>
    );
}
