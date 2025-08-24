
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
import type { Layaway } from '@/lib/types';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { AddLayawayDialog } from './add-layaway-dialog';
import { createLayaway, getLayaways } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';

export default function LayawaysPageClient() {
  const [layaways, setLayaways] = React.useState<Layaway[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchLayaways = React.useCallback(async () => {
    setIsLoading(true);
    try {
        const data = await getLayaways();
        setLayaways(data as Layaway[]);
    } catch (error) {
        toast({variant: 'destructive', title: "Error", description: "Failed to fetch layaways."})
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchLayaways();
  }, [fetchLayaways]);


  const pendingLayaways = layaways.filter(l => l.status === 'Pending' || l.status === 'Cancelled');
  const completedLayaways = layaways.filter(l => l.status === 'Paid');
  
  const handleAddNewLayaway = () => {
      // This could open a dialog or navigate to a new page.
      // Let's use a dialog for simplicity.
      setIsDialogOpen(true);
  }

  const handleAddLayaway = async (layawayData: Omit<Layaway, 'id' | 'lastPaymentDate'>) => {
    if (!user) return;
    try {
        await createLayaway(layawayData, user.username);
        toast({ title: "Success!", description: "New layaway plan has been created."});
        setIsDialogOpen(false);
        fetchLayaways(); // Refresh the list
    } catch(error: any) {
        toast({ variant: 'destructive', title: "Error", description: error.message });
    }
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
