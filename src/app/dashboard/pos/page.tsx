import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MinusCircle, CreditCard, Smartphone, Banknote } from 'lucide-react';
import Image from 'next/image';
import { mockProducts } from '@/lib/mock-data';

export default function POSPage() {
  // Mock cart state
  const cart = [
    { ...mockProducts[0], quantity: 1 },
    { ...mockProducts[2], quantity: 2 },
  ];
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-5">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8 xl:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Click on a product to add it to the cart.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockProducts.map((product) => (
                <Card key={product.id} className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-2 flex flex-col items-center gap-2">
                    <Image
                      src={`https://placehold.co/150x150.png`}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="rounded-md"
                      data-ai-hint="product image"
                    />
                    <div className="text-sm font-medium text-center">{product.name}</div>
                    <div className="text-xs text-muted-foreground">${product.price.toFixed(2)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1 xl:col-span-2">
        <Card className="sticky top-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cart</CardTitle>
            <Badge variant="outline">3 items</Badge>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              {cart.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span>{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline"><Banknote className="mr-2 h-4 w-4" /> Cash</Button>
              <Button variant="outline"><Smartphone className="mr-2 h-4 w-4" /> M-Pesa</Button>
              <Button variant="outline"><CreditCard className="mr-2 h-4 w-4" /> Card</Button>
              <Button variant="secondary">Layaway</Button>
            </div>
            <Button size="lg" className="w-full">Checkout</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
