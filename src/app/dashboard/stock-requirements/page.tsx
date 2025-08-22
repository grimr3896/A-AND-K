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
import { Input } from '@/components/ui/input';
import { mockProducts } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Check } from 'lucide-react';

type ReorderItem = Product & {
  required: number;
  ordered: number;
};

export default function StockRequirementsPage() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  
  const lowStockProducts = mockProducts.filter(p => p.stock < p.lowStockThreshold);

  const [reorderList, setReorderList] = React.useState<ReorderItem[]>(
    lowStockProducts.map(p => ({
      ...p,
      required: p.lowStockThreshold > p.stock ? p.lowStockThreshold - p.stock + 5 : 5, // Suggest ordering 5 more than threshold
      ordered: 0,
    }))
  );

  const handleOrderedChange = (productId: string, value: number) => {
    if (!hasRole(['Admin', 'Manager'])) {
      toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to edit orders.' });
      return;
    }
    setReorderList(currentList =>
      currentList.map(item =>
        item.id === productId ? { ...item, ordered: value } : item
      )
    );
  };
  
  const handleReceiveStock = (productId: string) => {
     if (!hasRole(['Admin', 'Manager'])) {
      toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to receive stock.' });
      return;
    }
    
    const item = reorderList.find(i => i.id === productId);
    if(item && item.ordered > 0) {
        // In a real app, you would update the main product list state here.
        // For this mock, we just show a toast and reset the ordered quantity.
        toast({ title: 'Stock Received', description: `Added ${item.ordered} units to ${item.name}.` });
        handleOrderedChange(productId, 0);
    }
  }

  const exportToCSV = () => {
    const headers = ['Product Name', 'SKU', 'Current Stock', 'Quantity Required', 'Quantity Ordered', 'Supplier'];
    const rows = reorderList.map(item => 
      [item.name, item.sku, item.stock, item.required, item.ordered, item.supplier || 'N/A'].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stock_reorder_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  const isEditable = hasRole(['Admin', 'Manager']);


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Stock Requirements / Reorder</CardTitle>
                <CardDescription>
                Track low-stock items and manage your reorders.
                </CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Qty Required</TableHead>
              <TableHead>Qty Ordered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reorderList.map((item) => (
              <TableRow key={item.id} className={item.stock < item.lowStockThreshold ? 'bg-destructive/10' : ''}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant={item.stock < item.lowStockThreshold ? 'destructive' : 'default'}>
                    {item.stock < item.lowStockThreshold ? 'Low Stock' : 'OK'}
                  </Badge>
                </TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>{item.required}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.ordered}
                    onChange={(e) => handleOrderedChange(item.id, parseInt(e.target.value) || 0)}
                    className="w-24"
                    disabled={!isEditable}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => handleReceiveStock(item.id)} disabled={!isEditable || item.ordered <= 0}>
                    <Check className="mr-2 h-4 w-4" />
                    Receive
                  </Button>
                </TableCell>
              </TableRow>
            ))}
             {reorderList.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        All stock levels are currently okay.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
