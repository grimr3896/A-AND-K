
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
import { Loader2, Edit, PlusCircle, Check, X, Eye, EyeOff, Copy, KeyRound } from 'lucide-react';
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
import { getAdminPassword, setAdminPassword } from '@/lib/mock-data';
import { useBusinessInfo } from '@/contexts/business-info-context';
import { v4 as uuidv4 } from 'uuid';

const newInfoSchema = z.object({
  category: z.string().min(1, "Category is required."),
  value: z.string().min(1, "Value is required."),
});

export default function BusinessInfoPage() {
    const { toast } = useToast();
    const { businessInfo, setBusinessInfo, getPassword, setPassword, getApiKey, setApiKey } = useBusinessInfo();
    
    const [editingField, setEditingField] = React.useState<string | null>(null);
    const [passwordPrompt, setPasswordPrompt] = React.useState(false);
    const [passwordInput, setPasswordInput] = React.useState('');
    const [tempValue, setTempValue] = React.useState<string | number>('');
    const [actionToConfirm, setActionToConfirm] = React.useState<(() => void) | null>(null);
    const [sensitiveFieldVisibility, setSensitiveFieldVisibility] = React.useState<{ [key: string]: boolean }>({});

    const infoToDisplay = {
        "Business Name": businessInfo.name,
        "Address": businessInfo.address,
        "Tax Rate (%)": businessInfo.taxRate,
        "Admin Login Password": getPassword(),
        "API Key": getApiKey(),
    };

    const form = useForm({
      resolver: zodResolver(newInfoSchema),
      defaultValues: {
        category: '',
        value: '',
      }
    });
    
    const toggleVisibility = (field: string) => {
      setSensitiveFieldVisibility(prev => ({...prev, [field]: !prev[field]}));
    }

    const handleCopy = (value: string | number) => {
        navigator.clipboard.writeText(String(value));
        toast({ title: "Copied!", description: "The value has been copied to your clipboard."});
    }

    const handleEditClick = (field: string) => {
        requestPassword(() => {
            setEditingField(field);
            setTempValue(infoToDisplay[field as keyof typeof infoToDisplay]);
        });
    };
    
    const requestPassword = (action: () => void) => {
        setActionToConfirm(() => action);
        setPasswordPrompt(true);
    };

    const handlePasswordSubmit = () => {
        if (passwordInput === getPassword()) {
            setPasswordPrompt(false);
            setPasswordInput('');
            actionToConfirm?.();
            setActionToConfirm(null);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Incorrect password.',
            });
        }
    };
    
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const fieldType = typeof infoToDisplay[editingField as keyof typeof infoToDisplay];
      setTempValue(fieldType === 'number' ? Number(e.target.value) : e.target.value);
    }

    const handleSave = () => {
      if(editingField){
        if (editingField === "Admin Login Password") {
            const newPassword = tempValue as string;
            setPassword(newPassword);
            toast({
                title: "Security Notice",
                description: `Password changed successfully. Please use this for future logins and protected actions.`,
                duration: 9000,
            });
        } else if (editingField === "API Key") {
             setApiKey(tempValue as string);
              toast({ title: "Success!", description: `API Key has been updated.` });
        } else if (editingField === "Business Name"){
            setBusinessInfo(prev => ({ ...prev, name: tempValue as string }));
            toast({ title: "Success!", description: `Business Name has been updated.` });
        } else if (editingField === "Address"){
            setBusinessInfo(prev => ({ ...prev, address: tempValue as string }));
            toast({ title: "Success!", description: `Address has been updated.` });
        } else if (editingField === "Tax Rate (%)"){
            setBusinessInfo(prev => ({ ...prev, taxRate: tempValue as number }));
            toast({ title: "Success!", description: `Tax Rate has been updated.` });
        } else {
            // Handle custom fields
            setBusinessInfo(prev => ({ ...prev, customFields: {...prev.customFields, [editingField]: tempValue }}));
             toast({ title: "Success!", description: `${editingField} has been updated.` });
        }
        setEditingField(null);
      }
    };
    
    const handleAddNewInfo = (values: z.infer<typeof newInfoSchema>) => {
      setBusinessInfo(prev => ({...prev, customFields: {...prev.customFields, [values.category]: values.value}}));
      toast({ title: "Success!", description: `New field "${values.category}" has been added.` });
      form.reset();
    }

    const handleGenerateApiKey = () => {
        requestPassword(() => {
            const newKey = uuidv4();
            setApiKey(newKey);
            toast({
                title: "API Key Generated",
                description: "A new unique API key has been generated and saved.",
            });
        });
    }

    const isSensitiveField = (key: string) => {
        return key === "Admin Login Password" || key === "API Key";
    }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Manage your business details and settings. This information will be used across the application.
              </CardDescription>
            </div>
            <Button onClick={handleGenerateApiKey}>
                <KeyRound className="mr-2 h-4 w-4" />
                Generate New API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {Object.entries({ ...infoToDisplay, ...businessInfo.customFields }).map(([key, value]) => (
                 <div key={key} className="flex items-center justify-between p-3 rounded-md border min-h-[72px]">
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-muted-foreground">{key}</p>
                        {editingField === key ? (
                             <Input
                                type={typeof value === 'number' ? 'number' : (isSensitiveField(key) ? (sensitiveFieldVisibility[key] ? 'text' : 'password') : 'text')}
                                value={String(tempValue)}
                                onChange={handleValueChange}
                                className="mt-1"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                             />
                        ) : (
                             <p className="text-lg font-semibold truncate">
                                {isSensitiveField(key) && !sensitiveFieldVisibility[key] ? '••••••••' : String(value)}
                             </p>
                        )}
                    </div>
                     <div className="flex items-center gap-2 ml-4">
                         {editingField === key ? (
                            <>
                                 <Button onClick={handleSave} size="icon"><Check className="h-4 w-4" /></Button>
                                 <Button onClick={() => setEditingField(null)} size="icon" variant="ghost"><X className="h-4 w-4" /></Button>
                            </>
                         ) : (
                            <>
                                {isSensitiveField(key) && (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={() => toggleVisibility(key)}>
                                            {sensitiveFieldVisibility[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleCopy(value)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(key)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </>
                         )}
                     </div>
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
              Please enter the admin password to make changes.
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
    </>
  );
}

