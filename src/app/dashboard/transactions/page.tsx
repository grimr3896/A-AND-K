
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
import { Badge } from '@/components/ui/badge';
import { mockSales } from '@/lib/mock-data';

export default function SalesHistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales History</CardTitle>
        <CardDescription>A complete record of all sales.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-mono">{sale.id}</TableCell>
                <TableCell>{sale.customerName}</TableCell>
                <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={
                    sale.paymentMethod === 'Card' ? 'default' : 
                    sale.paymentMethod === 'M-Pesa' ? 'secondary' : 'outline'
                  }>
                    {sale.paymentMethod}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">Ksh {sale.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
