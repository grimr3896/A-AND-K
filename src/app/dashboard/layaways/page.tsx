
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
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { AddLayawayDialog } from './_components/add-layaway-dialog';

export default function LayawaysPage() {
  const [layaways, setLayaways] = React.useState<Layaway[]>(initialLayaways);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    try {
      const newLayawaysData = sessionStorage.getItem('newLayaways');
      if (newLayawaysData) {
        const newLayaways = JSON.parse(newLayawaysData) as Omit<Layaway, 'id'>[];
        
        // Add new layaways to the state, assigning unique IDs
        setLayaways(prevLayaways => {
          const updatedLayaways = [...prevLayaways];
          newLayaways.forEach((newLayaway, index) => {
            const layawayWithId: Layaway = {
              ...newLayaway,
              id: `LAY_NEW_${Date.now()}_${index}`, 
            };
            updatedLayaways.push(layawayWithId);
          });
          return updatedLayaways;
        });

        // Clear the session storage to avoid adding them again on refresh
        sessionStorage.removeItem('newLayaways');
      }
    } catch (error) {
      console.error("Could not process new layaways from session storage", error);
    }
  }, []);
  
  const handleAddNewLayaway = () => {
      router.push('/dashboard/layaways/new');
  }

  const handleAddLayaway = (layawayData: Omit<Layaway, 'id' | 'lastPaymentDate'>) => {
    const newLayaway: Layaway = {
        ...layawayData,
        id: `LAY${(layaways.length + 1).toString().padStart(3, '0')}`,
        lastPaymentDate: new Date().toISOString(),
    };
    setLayaways(prev => [...prev, newLayaway]);
    toast({ title: "Success!", description: "New layaway plan has been created."});
    setIsDialogOpen(false);
  }

  return (
    <>
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
                      <TableRow key={layaway.id} onClick={() => router.push(`/dashboard/layaways/${layaway.id}`)} className="cursor-pointer">
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
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
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
      <AddLayawayDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddLayaway={handleAddLayaway}
      />
    </>
  );
}
