
"use client";

import * as React from 'react';
import type { BusinessInfo } from '@/lib/types';
import { getAdminPassword as getDefaultPassword, getApiKey as getDefaultApiKey } from '@/lib/mock-data';

type BusinessInfoContextType = {
  businessInfo: BusinessInfo;
  setBusinessInfo: React.Dispatch<React.SetStateAction<BusinessInfo>>;
  getPassword: () => string;
  setPassword: (password: string) => void;
  getApiKey: () => string;
  setApiKey: (apiKey: string) => void;
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

  const [apiKey, setInternalApiKey] = React.useState(() => {
     if (typeof window !== 'undefined') {
        return localStorage.getItem('apiKey') || getDefaultApiKey();
     }
     return getDefaultApiKey();
  });

  // When password or apiKey changes, update localStorage
  React.useEffect(() => {
     if (typeof window !== 'undefined') {
        localStorage.setItem('adminPassword', password);
     }
  }, [password]);

  React.useEffect(() => {
     if (typeof window !== 'undefined') {
        localStorage.setItem('apiKey', apiKey);
     }
  }, [apiKey]);
  
  const getPassword = () => password;
  const setPassword = (newPassword: string) => setInternalPassword(newPassword);
  
  const getApiKey = () => apiKey;
  const setApiKey = (newApiKey: string) => setInternalApiKey(newApiKey);

  const value = { businessInfo, setBusinessInfo, getPassword, setPassword, getApiKey, setApiKey };

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
