
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
        <Accordion type="multiple" className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[100px] text-center">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSales.map((sale) => (
                <React.Fragment key={sale.id}>
                  <TableRow>
                    <TableCell className="font-mono">{sale.id}</TableCell>
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
                    <TableCell className="p-0">
                       <AccordionItem value={sale.id} className="border-b-0">
                         <AccordionTrigger>Details</AccordionTrigger>
                       </AccordionItem>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <AccordionItem value={sale.id} className="border-b-0">
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
                       </AccordionItem>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Accordion>
      </CardContent>
    </Card>
  );
}
