"use client";

import React from 'react';
import type { CartItem } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

type ReceiptProps = {
    cart: CartItem[];
    total: number;
    paymentMethod: string;
};

export function Receipt({ cart, total, paymentMethod }: ReceiptProps) {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;

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
                    <div key={item.id} className="flex justify-between">
                        <span>{item.name} x{item.quantity}</span>
                        <span>Ksh {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <Separator className="my-2 bg-black" />
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Ksh {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>Ksh {tax.toFixed(2)}</span>
                </div>
            </div>
            <Separator className="my-2 bg-black" />
            <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>Ksh {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span>Payment Method</span>
                <span>{paymentMethod}</span>
            </div>
            <div className="text-center mt-4">
                <p>Thank you for your purchase!</p>
            </div>
        </div>
    );
}
