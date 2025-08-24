
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const NewLayawayPageClient = dynamic(() => import('./_components/new-layaway-page-client'), { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-[600px]" />,
});

export default function NewLayawayPage() {
    return <NewLayawayPageClient />;
}
