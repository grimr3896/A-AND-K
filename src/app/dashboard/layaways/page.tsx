
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
        
        setLayaways(prevLayaways => {
          const updatedLayaways = [...prevLayaways];
          newLayaways.forEach((newLayaway, index) => {
            const layawayWithId: Layaway = {
              ...newLayaway,
              id: `LAY_NEW_${Date.now()}_${index}`, 
            };
            updatedLayaways.push(layawayWithId);
          });
          return updatedLayaways.sort((a, b) => new Date(b.lastPaymentDate).getTime() - new Date(a.lastPaymentDate).getTime());
        });
        sessionStorage.removeItem('newLayaways');
      }

      const updatedLayawaysData = sessionStorage.getItem('updatedLayaways');
      if (updatedLayawaysData) {
        const updatedLayaways = JSON.parse(updatedLayawaysData) as { [id: string]: Layaway };
        setLayaways(prev => 
            prev.map(l => updatedLayaways[l.id] || l)
                .sort((a, b) => new Date(b.lastPaymentDate).getTime() - new Date(a.lastPaymentDate).getTime())
        );
        sessionStorage.removeItem('updatedLayaways');
      }

    } catch (error) {
      console.error("Could not process layaways from session storage", error);
    }
  }, []);

  const pendingLayaways = layaways.filter(l => l.status === 'Pending' || l.status === 'Cancelled');
  const completedLayaways = layaways.filter(l => l.status === 'Paid');
  
  const handleAddNewLayaway = () => {
      router.push('/dashboard/layaways/new');
  }

  const handleAddLayaway = (layawayData: Omit<Layaway, 'id' | 'lastPaymentDate'>) => {
    const newLayaway: Layaway = {
        ...layawayData,
        id: `LAY${(layaways.length + 1).toString().padStart(3, '0')}`,
        lastPaymentDate: new Date().toISOString(),
    };
    setLayaways(prev => [...prev, newLayaway].sort((a, b) => new Date(b.lastPaymentDate).getTime() - new Date(a.lastPaymentDate).getTime()));
    toast({ title: "Success!", description: "New layaway plan has been created."});
    setIsDialogOpen(false);
  }

  const LayawayTable = ({ plans, isCompleted }: { plans: Layaway[], isCompleted?: boolean }) => (
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
        {plans.map((layaway) => {
            const remaining = layaway.totalAmount - layaway.amountPaid;
            return (
                <TableRow 
                  key={layaway.id} 
                  onClick={() => router.push(`/dashboard/layaways/${layaway.id}`)} 
                  className={`cursor-pointer ${isCompleted ? 'text-green-600 dark:text-green-400 hover:bg-green-500/10' : 'hover:bg-muted/50'}`}
                >
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
                    <TableCell className="text-right">Ksh {remaining > 0 ? remaining.toFixed(2) : '0.00'}</TableCell>
                    <TableCell className="text-right font-medium">Ksh {layaway.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </TableCell>
                </TableRow>
            )
        })}
        {plans.length === 0 && (
            <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                    No layaway plans in this category.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                  <CardTitle>Pending Layaways</CardTitle>
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
          <LayawayTable plans={pendingLayaways} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
              <div>
                  <CardTitle>Completed Layaways</CardTitle>
                  <CardDescription>These layaway plans have been fully paid off.</CardDescription>
              </div>
        </CardHeader>
        <CardContent>
          <LayawayTable plans={completedLayaways} isCompleted />
        </CardContent>
      </Card>

      <AddLayawayDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddLayaway={handleAddLayaway}
      />
    </div>
  );
}
