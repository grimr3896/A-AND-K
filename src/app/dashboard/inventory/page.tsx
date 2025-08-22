
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { mockProducts as initialProducts } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { AddProductDialog } from './_components/add-product-dialog';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


export default function InventoryPage() {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [passwordPrompt, setPasswordPrompt] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [actionToConfirm, setActionToConfirm] = React.useState<(() => void) | null>(null);

  const { hasRole } = useAuth();
  const { toast } = useToast();

  const handlePasswordSubmit = () => {
    if (passwordInput === 'ALEXA') {
      setPasswordPrompt(false);
      setPasswordInput('');
      actionToConfirm?.();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Incorrect password.',
      });
    }
  };

  const requestPassword = (action: () => void) => {
    setActionToConfirm(() => action);
    setPasswordPrompt(true);
  };
  
  const handleOpenAddDialog = () => {
    if (!hasRole(['Admin'])) {
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to add products.' });
        return;
    }
    requestPassword(() => {
        setProductToEdit(null);
        setIsDialogOpen(true);
    });
  }

  const handleOpenEditDialog = (product: Product) => {
     if (!hasRole(['Admin'])) {
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to edit products.' });
        return;
    }
    requestPassword(() => {
        setProductToEdit(product);
        setIsDialogOpen(true);
    });
  };

  const handleOpenDeleteDialog = (product: Product) => {
    if (!hasRole(['Admin'])) {
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'You do not have permission to delete products.' });
        return;
    }
    requestPassword(() => {
        setProductToDelete(product);
        setIsDeleteAlertOpen(true);
    });
  }

  const confirmDelete = () => {
    if(productToDelete) {
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        toast({title: "Success", description: `Product "${productToDelete.name}" has been deleted.`});
        setIsDeleteAlertOpen(false);
        setProductToDelete(null);
    }
  }
  
  const handleProductSubmit = (submittedProduct: Omit<Product, 'id'>) => {
    if (productToEdit) {
      // Edit existing product
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productToEdit.id ? { ...productToEdit, ...submittedProduct } : p
        )
      );
    } else {
      // Add new product
      const productWithId = {
        ...submittedProduct,
        id: `PROD${(products.length + 1).toString().padStart(3, '0')}`,
      };
      setProducts(prevProducts => [...prevProducts, productWithId]);
    }
    setIsDialogOpen(false);
    setProductToEdit(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Manage your products and stock levels.</CardDescription>
            </div>
            {hasRole(['Admin']) && (
              <Button size="sm" className="gap-1" onClick={handleOpenAddDialog}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                    Image
                </TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                 <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                        src={product.imageUrl || `https://placehold.co/64x64.png`}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="rounded-md aspect-square object-cover"
                        data-ai-hint="product image"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    {product.stock < product.lowStockThreshold ? (
                      <Badge variant="destructive">Low Stock ({product.stock})</Badge>
                    ) : (
                      product.stock
                    )}
                  </TableCell>
                  <TableCell className="text-right">Ksh {product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(product)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDeleteDialog(product)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddProductDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddProduct={handleProductSubmit}
        productToEdit={productToEdit}
      />
      <AlertDialog open={passwordPrompt} onOpenChange={setPasswordPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Admin Access Required</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the admin password to proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="password"
            placeholder="••••••••"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPasswordInput(''); setActionToConfirm(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
       <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


    