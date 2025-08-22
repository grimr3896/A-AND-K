
"use client";

import * as React from 'react';
import type { Product } from '@/lib/types';
import { mockProducts as initialProducts } from '@/lib/mock-data';

type ProductsContextType = {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
};

const ProductsContext = React.createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [
      ...prev,
      { ...product, id: `PROD${(prev.length + 1).toString().padStart(3, '0')}` }
    ]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const value = { products, addProduct, updateProduct, deleteProduct };

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
