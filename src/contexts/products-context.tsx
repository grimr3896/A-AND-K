
"use client";

import * as React from 'react';
import type { Product, CartItem } from '@/lib/types';
import { getProducts, addProduct as addProductAction, updateProduct as updateProductAction, deleteProduct as deleteProductAction, processCheckout as processCheckoutAction, receiveStock as receiveStockAction } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';


type ProductsContextType = {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  handleCheckout: (cart: CartItem[], customerName: string, paymentMethod: string) => Promise<any>;
  receiveStock: (productId: string, quantity: number) => Promise<void>;
};

const ProductsContext = React.createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const dbProducts = await getProducts();
      setProducts(dbProducts);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({variant: "destructive", title: "Error", description: "Could not load products from the database."})
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if(!user) throw new Error("User not authenticated");
    try {
        await addProductAction(product, user.username);
        await fetchProducts(); // Re-fetch to get the latest list
    } catch (error: any) {
        // This will catch the error thrown from the action and display it
        console.error("Failed to add product:", error);
        toast({ variant: "destructive", title: "Error Adding Product", description: error.message });
        throw error; // Re-throw to indicate failure to the caller
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    if(!user) return;
    await updateProductAction(updatedProduct, user.username);
    await fetchProducts();
  };

  const deleteProduct = async (productId: string) => {
     if(!user) return;
    await deleteProductAction(productId, user.username);
    await fetchProducts();
  };
  
  const handleCheckout = async (cart: CartItem[], customerName: string, paymentMethod: string) => {
    if(!user) return;
    const sale = await processCheckoutAction(cart, customerName, paymentMethod, user.username);
    await fetchProducts();
    return sale;
  };
  
  const receiveStock = async (productId: string, quantity: number) => {
    if(!user) return;
    await receiveStockAction(productId, quantity, user.username);
    await fetchProducts();
  };

  const value = { products, isLoading, addProduct, updateProduct, deleteProduct, handleCheckout, receiveStock };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = React.useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
