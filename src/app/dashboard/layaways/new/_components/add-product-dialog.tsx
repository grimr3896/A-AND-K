
"use client";

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import Image from 'next/image';

type AddProductDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddProduct: (product: Product) => void;
  products: Product[];
};

export function AddProductDialog({ isOpen, onOpenChange, onAddProduct, products }: AddProductDialogProps) {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Product to Layaway</DialogTitle>
          <DialogDescription>
            Search for a product from your inventory to add it to this layaway plan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Input 
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.map(product => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <Image 
                                    src={product.imageUrl || `https://placehold.co/40x40.png`}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md"
                                />
                                {product.name}
                            </TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell className="text-right">Ksh {product.price.toFixed(2)}</TableCell>
                             <TableCell className="text-right">{product.stock}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" onClick={() => onAddProduct(product)}>
                                    Add
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                     {filteredProducts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No products found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
