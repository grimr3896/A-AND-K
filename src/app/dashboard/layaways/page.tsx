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
import { Progress } from '@/components/ui/progress';
import { mockLayaways } from '@/lib/mock-data';

export default function LayawaysPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Layaway Management</CardTitle>
        <CardDescription>Track and manage customer deposits and layaway plans.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Amount Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLayaways.map((layaway) => (
              <TableRow key={layaway.id}>
                <TableCell className="font-medium">{layaway.customerName}</TableCell>
                <TableCell>{layaway.productName}</TableCell>
                <TableCell>
                  <Badge variant={layaway.status === 'Pending' ? 'default' : 'outline'}>
                    {layaway.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={(layaway.amountPaid / layaway.totalAmount) * 100} className="w-32" />
                    <span>
                      {Math.round((layaway.amountPaid / layaway.totalAmount) * 100)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  Ksh {layaway.amountPaid.toFixed(2)} / Ksh {layaway.totalAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
