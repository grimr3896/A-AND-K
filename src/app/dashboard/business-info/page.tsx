"use client";

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, PlusCircle } from 'lucide-react';
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

type BusinessInfo = {
  [key: string]: string | number;
};

const newInfoSchema = z.object({
  category: z.string().min(1, "Category is required."),
  value: z.string().min(1, "Value is required."),
});

export default function BusinessInfoPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [businessInfo, setBusinessInfo] = React.useState<BusinessInfo>({
        "Business Name": "A & K babyshop",
        "Address": "123 Blossom Lane, Garden City",
        "Tax Rate (%)": 8,
        "Admin Login Password": "ALEXA",
    });
    const [editingField, setEditingField] = React.useState<string | null>(null);
    const [passwordPrompt, setPasswordPrompt] = React.useState(false);
    const [passwordInput, setPasswordInput] = React.useState('');
    const [tempValue, setTempValue] = React.useState<string | number>('');

    const form = useForm({
      resolver: zodResolver(newInfoSchema),
      defaultValues: {
        category: '',
        value: '',
      }
    });

    const handleEditClick = (field: string) => {
        setEditingField(field);
        setTempValue(businessInfo[field]);
        setPasswordPrompt(true);
    };

    const handlePasswordSubmit = () => {
        if (passwordInput === businessInfo['Admin Login Password']) {
            setPasswordPrompt(false);
            setPasswordInput('');
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Incorrect password.',
            });
        }
    };
    
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const fieldType = typeof businessInfo[editingField!];
      setTempValue(fieldType === 'number' ? Number(e.target.value) : e.target.value);
    }

    const handleSave = () => {
      if(editingField){
        const oldPassword = businessInfo["Admin Login Password"];
        setBusinessInfo(prev => ({ ...prev, [editingField]: tempValue }));

        if(editingField === "Admin Login Password" && tempValue !== oldPassword) {
          toast({
            title: "Security Notice",
            description: `Password changed successfully. The new password is "${tempValue}". The reference on the login page has also been updated.`,
            duration: 9000,
          });
        } else {
           toast({
            title: "Success!",
            description: `${editingField} has been updated.`,
          });
        }
        setEditingField(null);
      }
    };
    
    const handleAddNewInfo = (values: z.infer<typeof newInfoSchema>) => {
      setBusinessInfo(prev => ({...prev, [values.category]: values.value}));
      toast({ title: "Success!", description: `New field "${values.category}" has been added.` });
      form.reset();
    }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Manage your business details and settings. This information will be used across the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {Object.entries(businessInfo).map(([key, value]) => (
                 <div key={key} className="flex items-center justify-between p-3 rounded-md border">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{key}</p>
                        {editingField === key && !passwordPrompt ? (
                             <Input
                                type={typeof value === 'number' ? 'number' : (key === "Admin Login Password" ? 'password' : 'text')}
                                value={tempValue}
                                onChange={handleValueChange}
                                className="mt-1"
                                autoFocus
                             />
                        ) : (
                             <p className="text-lg font-semibold">{key === 'Admin Login Password' ? '••••••••' : value}</p>
                        )}
                    </div>
                     {editingField === key && !passwordPrompt ? (
                        <div className="flex gap-2">
                             <Button onClick={handleSave} size="sm">Save</Button>
                             <Button onClick={() => setEditingField(null)} size="sm" variant="outline">Cancel</Button>
                        </div>
                     ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(key)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                     )}
                 </div>
            ))}
        </CardContent>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Add New Information</CardTitle>
          <CardDescription>Add a new category and value to your business information.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleAddNewInfo)} className="flex items-end gap-4">
              <div className="grid gap-2 flex-1">
                <label htmlFor="category">Category</label>
                <Input id="category" placeholder="e.g., Contact Email" {...form.register("category")} />
                {form.formState.errors.category && <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>}
              </div>
              <div className="grid gap-2 flex-1">
                <label htmlFor="value">Value</label>
                <Input id="value" placeholder="e.g., contact@example.com" {...form.register("value")} />
                 {form.formState.errors.value && <p className="text-sm text-destructive">{form.formState.errors.value.message}</p>}
              </div>
              <Button type="submit">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Info
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <AlertDialog open={passwordPrompt} onOpenChange={setPasswordPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Password</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the admin password to edit this information.
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
            <AlertDialogCancel onClick={() => { setPasswordInput(''); setEditingField(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
