
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const LayawaysPageClient = dynamic(() => import('./_components/layaways-page-client'), { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-[600px]" />,
});

export default function LayawaysPage() {
    return <LayawaysPageClient />;
}
