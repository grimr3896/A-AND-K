
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const POSPageClient = dynamic(() => import('./_components/pos-page-client'), { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-[800px]" />,
});

export default function POSPage() {
    return <POSPageClient />;
}
