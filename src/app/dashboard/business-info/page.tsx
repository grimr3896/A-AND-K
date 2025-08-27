
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
  CardFooter
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, PlusCircle, Check, X, Eye, EyeOff, Copy, KeyRound, AlertTriangle, Save, Undo } from 'lucide-react';
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
import { useBusinessInfo } from '@/contexts/business-info-context';
import { PasswordProtectedRoute } from '@/components/auth/password-protected-route';

const newInfoSchema = z.object({
  category: z.string().min(1, "Category is required."),
  value: z.string().min(1, "Value is required."),
});

function BusinessInfoPageContent() {
    const { toast } = useToast();
    const { businessInfo, setBusinessInfo, getPassword, setPassword, getResendApiKey, setResendApiKey, getFromEmail, setFromEmail, getRecipientEmail, setRecipientEmail } = useBusinessInfo();
    
    const [isEditing, setIsEditing] = React.useState(false);
    const [passwordPrompt, setPasswordPrompt] = React.useState(false);
    const [isGeneratingKey, setIsGeneratingKey] = React.useState(false);
    const [passwordInput, setPasswordInput] = React.useState('');
    const [actionToConfirm, setActionToConfirm] = React.useState<(() => void) | null>(null);
    const [sensitiveFieldVisibility, setSensitiveFieldVisibility] = React.useState<{ [key: string]: boolean }>({});
    
    const allFields = React.useMemo(() => ({
        "Business Name": businessInfo.name,
        "Address": businessInfo.address,
        "Tax Rate (%)": businessInfo.taxRate,
        "Admin Login Password": getPassword(),
        "Resend API Key": getResendApiKey(),
        "From Email": getFromEmail(),
        "Recipient Email": getRecipientEmail(),
        ...businessInfo.customFields
    }), [businessInfo, getPassword, getResendApiKey, getFromEmail, getRecipientEmail]);

    const [tempData, setTempData] = React.useState(allFields);
    
    React.useEffect(() => {
        setTempData(allFields);
    }, [allFields]);

    const form = useForm({
      resolver: zodResolver(newInfoSchema),
      defaultValues: {
        category: '',
        value: '',
      }
    });

    const isDirty = React.useMemo(() => JSON.stringify(tempData) !== JSON.stringify(allFields), [tempData, allFields]);
    
    const toggleVisibility = (field: string) => {
      setSensitiveFieldVisibility(prev => ({...prev, [field]: !prev[field]}));
    }

    const handleCopy = (value: string | number) => {
        navigator.clipboard.writeText(String(value));
        toast({ title: "Copied!", description: "The value has been copied to your clipboard."});
    }
    
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
    
    const handleValueChange = (key: string, value: string | number) => {
        setTempData(prev => ({ ...prev, [key]: value }));
    }

    const handleSaveChanges = () => {
      requestPassword(() => {
        // Create new objects for state updates
        const newBusinessInfo = { ...businessInfo, customFields: { ...businessInfo.customFields } };
        let newPassword = getPassword();
        let newApiKey = getResendApiKey();
        let newFromEmail = getFromEmail();
        let newRecipientEmail = getRecipientEmail();

        Object.entries(tempData).forEach(([key, value]) => {
            if (key === "Business Name") {
                newBusinessInfo.name = value as string;
            } else if (key === "Address") {
                newBusinessInfo.address = value as string;
            } else if (key === "Tax Rate (%)") {
                newBusinessInfo.taxRate = Number(value);
            } else if (key === "Admin Login Password") {
                newPassword = value as string;
            } else if (key === "Resend API Key") {
                newApiKey = value as string;
            } else if (key === "From Email") {
                newFromEmail = value as string;
            } else if (key === "Recipient Email") {
                newRecipientEmail = value as string;
            } else {
                newBusinessInfo.customFields[key] = value;
            }
        });

        // Update state
        setBusinessInfo(newBusinessInfo);
        setPassword(newPassword);
        setResendApiKey(newApiKey);
        setFromEmail(newFromEmail);
        setRecipientEmail(newRecipientEmail);

        setIsEditing(false);
        toast({ title: "Success!", description: "All changes have been saved." });
      });
    };
    
    const handleCancelChanges = () => {
        setTempData(allFields);
        setIsEditing(false);
    }
    
    const handleAddNewInfo = (values: z.infer<typeof newInfoSchema>) => {
      setBusinessInfo(prev => ({...prev, customFields: {...prev.customFields, [values.category]: values.value}}));
      toast({ title: "Success!", description: `New field "${values.category}" has been added.` });
      form.reset();
    }

    const generateNewSecureApiKey = () => {
      const array = new Uint32Array(16);
      window.crypto.getRandomValues(array);
      const randomString = Array.from(array, dec => ('0' + dec.toString(16)).substr(-8)).join('');
      return `re_` + randomString;
    }

    const handleGenerateApiKey = () => {
        requestPassword(() => {
            const newKey = generateNewSecureApiKey();
            setResendApiKey(newKey); // This will update localStorage via useEffect in context
            setTempData(prev => ({ ...prev, "Resend API Key": newKey })); // Update temporary state as well
            toast({
                title: "API Key Generated",
                description: "A new unique API key has been generated. Click 'Save Changes' to apply.",
            });
            setIsGeneratingKey(false);
        });
    }

    const isSensitiveField = (key: string) => {
        return key === "Admin Login Password" || key === "Resend API Key";
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
            <div className="flex gap-2">
                 <Button onClick={() => setIsGeneratingKey(true)} variant="outline">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Generate New API Key
                </Button>
                 {isEditing ? (
                    <Button onClick={handleCancelChanges} variant="ghost">
                        <Undo className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Info
                    </Button>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {Object.entries(tempData).map(([key, value]) => (
                 <div key={key} className="flex items-center justify-between p-3 rounded-md border min-h-[72px]">
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-muted-foreground">{key}</p>
                        {isEditing ? (
                             <Input
                                type={typeof value === 'number' ? 'number' : (isSensitiveField(key) ? (sensitiveFieldVisibility[key] ? 'text' : 'password') : 'text')}
                                value={String(value)}
                                onChange={(e) => handleValueChange(key, typeof allFields[key as keyof typeof allFields] === 'number' ? Number(e.target.value) : e.target.value)}
                                className="mt-1"
                             />
                        ) : (
                             <p className="text-lg font-semibold truncate">
                                {isSensitiveField(key) && !sensitiveFieldVisibility[key] ? '••••••••••••••••' : String(value)}
                             </p>
                        )}
                    </div>
                     <div className="flex items-center gap-2 ml-4">
                        {isSensitiveField(key) && (
                            <>
                                <Button variant="ghost" size="icon" onClick={() => toggleVisibility(key)}>
                                    {sensitiveFieldVisibility[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(value as string)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                     </div>
                 </div>
            ))}
        </CardContent>
         {isEditing && (
            <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSaveChanges} disabled={!isDirty}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </CardFooter>
         )}
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

      <AlertDialog open={isGeneratingKey} onOpenChange={setIsGeneratingKey}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive" />
                    Generate New API Key?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    Generating a new API key will invalidate the old one immediately. Any services or integrations using the old key will stop working. This action cannot be undone, but you must click "Save Changes" to finalize it.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleGenerateApiKey} className="bg-destructive hover:bg-destructive/90">
                    Yes, Generate New Key
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function BusinessInfoPage() {
    return (
        <PasswordProtectedRoute pageTitle="Business Info">
            <BusinessInfoPageContent />
        </PasswordProtectedRoute>
    )
}
