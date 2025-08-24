
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const InventoryPageClient = dynamic(() => import('./_components/inventory-page-client'), { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-[600px]" />,
});

export default function InventoryPage() {
    return <InventoryPageClient />;
}
