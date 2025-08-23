
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockSales } from '@/lib/mock-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';
import React from 'react';

export default function SalesHistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales History</CardTitle>
        <CardDescription>A complete record of all sales. Click on a sale to view its details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Details</TableHead>
              <TableHead>Sale ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <Accordion type="multiple" asChild>
            <TableBody>
              {mockSales.map((sale) => (
                <AccordionItem value={sale.id} key={sale.id} asChild>
                  <>
                    <TableRow>
                      <TableCell>
                        <AccordionTrigger>Details</AccordionTrigger>
                      </TableCell>
                      <TableCell className="font-mono">{sale.id}</TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell>{format(new Date(sale.date), 'PPP')}</TableCell>
                      <TableCell>
                        <Badge variant={
                          sale.paymentMethod === 'Card' ? 'default' : 
                          sale.paymentMethod === 'M-Pesa' ? 'secondary' : 'outline'
                        }>
                          {sale.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">Ksh {sale.total.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <AccordionContent>
                          <div className="p-4 bg-muted/50">
                            <h4 className="font-semibold mb-2">Items in Sale #{sale.id}</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product Name</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead className="text-right">Price Sold At</TableHead>
                                  <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sale.items.map((item, index) => (
                                  <TableRow key={`${sale.id}-${item.productId}-${index}`}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell className="text-right">Ksh {item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">Ksh {(item.price * item.quantity).toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </AccordionContent>
                      </TableCell>
                    </TableRow>
                  </>
                </AccordionItem>
              ))}
            </TableBody>
          </Accordion>
        </Table>
      </CardContent>
    </Card>
  );
}
