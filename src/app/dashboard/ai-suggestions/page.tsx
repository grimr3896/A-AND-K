import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AiReorderForm } from './_components/ai-reorder-form';
import { productDetailsForAI, salesDataForAI } from '@/lib/mock-data';

export default function AiSuggestionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Reorder Suggestions</CardTitle>
        <CardDescription>
          Use our AI tool to get intelligent suggestions on which items to reorder based on your sales and inventory data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AiReorderForm
          defaultSalesData={salesDataForAI}
          defaultProductDetails={productDetailsForAI}
        />
      </CardContent>
    </Card>
  );
}
