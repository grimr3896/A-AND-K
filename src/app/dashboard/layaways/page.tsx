"use client";

import * as React from 'react';
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
import { Button } from '@/components/ui/button';
import { mockLayaways as initialLayaways } from '@/lib/mock-data';
import type { Layaway } from '@/lib/types';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function LayawaysPage() {
  const [layaways, setLayaways] = React.useState<Layaway[]>(initialLayaways);
  const { toast } = useToast();

  const handleAddPayment = (id: string) => {
    // In a real app, this would open a dialog to enter the payment amount
    toast({ title: 'Functionality not implemented', description: 'Adding a payment is not yet available.' });
  };

  const handleMarkAsComplete = (id: string) => {
    setLayaways(currentLayaways =>
      currentLayaways.map(l =>
        l.id === id ? { ...l, status: 'Paid', amountPaid: l.totalAmount } : l
      )
    );
    toast({ title: 'Success', description: 'Layaway marked as complete.' });
  };
  
  const handleCancelLayaway = (id: string) => {
     setLayaways(currentLayaways =>
      currentLayaways.map(l =>
        l.id === id ? { ...l, status: 'Cancelled' } : l
      )
    );
    toast({ title: 'Layaway Cancelled', description: 'The layaway plan has been cancelled.' });
  }
  
  const handleAddNewLayaway = () => {
      // In a real app, this would open a dialog to add a new layaway
      toast({ title: 'Functionality not implemented', description: 'Adding a new layaway is not yet available.' });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Layaway Management</CardTitle>
                <CardDescription>Track and manage customer deposits and layaway plans.</CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={handleAddNewLayaway}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add New Layaway
                </span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead className="text-right">Amount Paid</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {layaways.map((layaway) => {
                const remaining = layaway.totalAmount - layaway.amountPaid;
                return (
                    <TableRow key={layaway.id}>
                        <TableCell className="font-medium">{layaway.customerName}</TableCell>
                        <TableCell>{layaway.productName}</TableCell>
                        <TableCell>
                          <Badge variant={
                              layaway.status === 'Pending' ? 'secondary' : 
                              layaway.status === 'Paid' ? 'default' : 'destructive'
                            }>
                            {layaway.status}
                          </Badge>
                        </TableCell>
                         <TableCell>{format(new Date(layaway.lastPaymentDate), 'PPP')}</TableCell>
                        <TableCell className="text-right">Ksh {layaway.amountPaid.toFixed(2)}</TableCell>
                        <TableCell className="text-right">Ksh {remaining.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">Ksh {layaway.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleAddPayment(layaway.id)}>Add Payment</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleMarkAsComplete(layaway.id)}>Mark as Complete</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleCancelLayaway(layaway.id)}>Cancel Layaway</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
            })}
             {layaways.length === 0 && (
                <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                        No layaway plans found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}