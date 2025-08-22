"use client";

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const businessInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required."),
  address: z.string().min(1, "Address is required."),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative.").max(100, "Tax rate cannot exceed 100."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

export default function BusinessInfoPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [currentInfo, setCurrentInfo] = React.useState({
        businessName: "A & K babyshop",
        address: "123 Blossom Lane, Garden City",
        taxRate: 8,
        password: "CALEXA",
    });

  const form = useForm<z.infer<typeof businessInfoSchema>>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: currentInfo,
  });

  function onSubmit(values: z.infer<typeof businessInfoSchema>) {
    setIsLoading(true);

    // Simulate saving the data
    setTimeout(() => {
        setCurrentInfo(values);
        toast({
          title: "Success!",
          description: "Business information has been updated.",
        });
        setIsLoading(false);
        // In a real app, you would save this to a database or local storage.
        // For example: localStorage.setItem('businessInfo', JSON.stringify(values));
        // And update the login password reference.
    }, 1000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>
          Manage your business details and settings. This information will be used across the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Your Business Name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                        <Input placeholder="Your Business Address" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 8" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Admin Login Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
