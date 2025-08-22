
// This is a placeholder file for a future feature where you can view
// and edit an existing layaway. For now, the creation flow is the main focus.
// You can navigate back to the layaways list.

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LayawayDetailPage({ params }: { params: { id: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Layaway Details</CardTitle>
        <CardDescription>
          Viewing details for Layaway ID: {params.id}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4">
          The ability to edit and manage existing layaway plans is under construction.
        </p>
        <Button asChild>
            <Link href="/dashboard/layaways">Back to Layaways</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
