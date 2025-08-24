"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const LayawayDetailPageClient = dynamic(() => import('./_components/layaway-detail-page-client'), { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-[600px]" />,
});

export default function LayawayDetailPage() {
    return <LayawayDetailPageClient />;
}
