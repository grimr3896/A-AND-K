
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockProducts, mockSales } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

export default function ProfitAnalysisPage() {
  const profitData = mockProducts.map(product => {
    const salesOfProduct = mockSales.flatMap(sale => 
      sale.items.filter(item => item.productId === product.id)
    );
    const totalQuantitySold = salesOfProduct.reduce((acc, item) => acc + item.quantity, 0);
    const totalRevenue = salesOfProduct.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalCost = totalQuantitySold * product.cost;
    const profit = totalRevenue - totalCost;

    return {
      ...product,
      totalQuantitySold,
      totalRevenue,
      profit,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Analysis</CardTitle>
        <CardDescription>
          Analyze profit margins for each product. Prices shown are the listing price and the minimum acceptable price.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Items Sold</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Price (Min)</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
              <TableHead className="text-right">Total Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profitData.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.totalQuantitySold}</TableCell>
                <TableCell className="text-right">Ksh {product.cost.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  Ksh {product.price.toFixed(2)}
                  <span className="text-muted-foreground"> (Ksh {product.minPrice.toFixed(2)})</span>
                </TableCell>
                <TableCell className="text-right">Ksh {product.totalRevenue.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={product.profit >= 0 ? 'default' : 'destructive'}>
                    Ksh {product.profit.toFixed(2)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
