
"use client";

import * as React from 'react';
import type { BusinessInfo } from '@/lib/types';
import { getAdminPassword as getDefaultPassword } from '@/lib/mock-data';

type BusinessInfoContextType = {
  businessInfo: BusinessInfo;
  setBusinessInfo: React.Dispatch<React.SetStateAction<BusinessInfo>>;
  getPassword: () => string;
  setPassword: (password: string) => void;
  getResendApiKey: () => string;
  setResendApiKey: (apiKey: string) => void;
  getFromEmail: () => string;
  setFromEmail: (email: string) => void;
  getRecipientEmail: () => string;
  setRecipientEmail: (email: string) => void;
};

const BusinessInfoContext = React.createContext<BusinessInfoContextType | undefined>(undefined);

export function BusinessInfoProvider({ children }: { children: React.ReactNode }) {
  const [businessInfo, setBusinessInfo] = React.useState<BusinessInfo>({
    name: "A & K babyshop",
    address: "123 Blossom Lane, Garden City",
    taxRate: 8,
    customFields: {},
  });
  
  // Use localStorage to persist sensitive info, falling back to mock data if not present.
  const [password, setInternalPassword] = React.useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('adminPassword') || getDefaultPassword();
    }
    return getDefaultPassword();
  });

  const [resendApiKey, setInternalResendApiKey] = React.useState(() => {
     if (typeof window !== 'undefined') {
        return localStorage.getItem('resendApiKey') || 're_xxxxxxxx_xxxxxxxx';
     }
     return 're_xxxxxxxx_xxxxxxxx';
  });
  
  const [fromEmail, setInternalFromEmail] = React.useState(() => {
    if (typeof window !== 'undefined') {
       return localStorage.getItem('fromEmail') || 'onboarding@resend.dev';
    }
    return 'onboarding@resend.dev';
 });

 const [recipientEmail, setInternalRecipientEmail] = React.useState(() => {
    if (typeof window !== 'undefined') {
       return localStorage.getItem('recipientEmail') || 'delivered@resend.dev';
    }
    return 'delivered@resend.dev';
 });

  // When sensitive info changes, update localStorage
  React.useEffect(() => {
     if (typeof window !== 'undefined') {
        localStorage.setItem('adminPassword', password);
     }
  }, [password]);

  React.useEffect(() => {
     if (typeof window !== 'undefined') {
        localStorage.setItem('resendApiKey', resendApiKey);
     }
  }, [resendApiKey]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
       localStorage.setItem('fromEmail', fromEmail);
    }
    }, [fromEmail]);

    React.useEffect(() => {
    if (typeof window !== 'undefined') {
       localStorage.setItem('recipientEmail', recipientEmail);
    }
    }, [recipientEmail]);
  
  const getPassword = () => password;
  const setPassword = (newPassword: string) => setInternalPassword(newPassword);
  
  const getResendApiKey = () => resendApiKey;
  const setResendApiKey = (newApiKey: string) => setInternalResendApiKey(newApiKey);
  
  const getFromEmail = () => fromEmail;
  const setFromEmail = (email: string) => setInternalFromEmail(email);

  const getRecipientEmail = () => recipientEmail;
  const setRecipientEmail = (email: string) => setInternalRecipientEmail(email);

  const value = { businessInfo, setBusinessInfo, getPassword, setPassword, getResendApiKey, setResendApiKey, getFromEmail, setFromEmail, getRecipientEmail, setRecipientEmail };

  return (
    <BusinessInfoContext.Provider value={value}>
      {children}
    </BusinessInfoContext.Provider>
  );
}

export function useBusinessInfo() {
  const context = React.useContext(BusinessInfoContext);
  if (context === undefined) {
    throw new Error('useBusinessInfo must be used within a BusinessInfoProvider');
  }
  return context;
}
