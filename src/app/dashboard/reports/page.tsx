

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MonthlySalesChart } from './_components/monthly-sales-chart';
import { CategorySalesChart } from './_components/category-sales-chart';
import { BestSellingItems } from './_components/best-selling-items';
import { PasswordProtectedRoute } from '@/components/auth/password-protected-route';


function ReportsPageContent() {
  return (
    <div className="grid gap-4 md:gap-8">
      <Card>
          <CardHeader>
            <CardTitle>Best Selling Items</CardTitle>
            <CardDescription>Your top products by sales volume.</CardDescription>
          </CardHeader>
          <CardContent>
            <BestSellingItems />
          </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Report</CardTitle>
          <CardDescription>A summary of sales revenue over the last six months.</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlySalesChart />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>Breakdown of sales across different product categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategorySalesChart />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
    return (
        <PasswordProtectedRoute pageTitle="Reports">
            <ReportsPageContent />
        </PasswordProtectedRoute>
    )
}
