import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, TrendingUp, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CommissionData {
  amountRange: string;
  commissionRate: number;
}

const commissionData: CommissionData[] = [
  { amountRange: "100-1000", commissionRate: 1 },
  { amountRange: "1001-4000", commissionRate: 3 },
  { amountRange: "4001-8000", commissionRate: 7 },
  { amountRange: "8001-10000", commissionRate: 10 },
];

const MyCommission = () => {
  const navigate = useNavigate();

  const totalEarnings = 12750.5;
  const lastUpdated = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDownload = (format: "csv" | "pdf") => {
    // Implementation for download functionality
    console.log(`Downloading ${format} report...`);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1">
          {/* Header */}
          <header className="paybazaar-gradient text-white p-4 border-b">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">My Commission</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 space-y-6">
            {/* Commission Table Card */}
            <Card className="shadow-lg">
              <CardHeader className="paybazaar-gradient text-white rounded-t-lg">
                <CardTitle className="text-xl font-semibold">
                  Aadhar Enable Payment System
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold text-slate-700 py-4">
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4 text-paybazaar-blue" />
                            AMOUNT (₹)
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 py-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-paybazaar-blue" />
                            COMMISSION RATE (₹)
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionData.map((row, index) => (
                        <TableRow
                          key={index}
                          className={`
                          ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                          hover:text-paybazaar-blue transition-colors duration-200
                        `}
                        >
                          <TableCell className="py-4 font-medium text-slate-700">
                            {row.amountRange}
                          </TableCell>
                          <TableCell className="py-4 font-medium text-slate-700">
                            {row.commissionRate}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Summary and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Total Earnings
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      ₹{totalEarnings.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Last Updated</p>
                    <p className="text-sm font-medium text-slate-700">
                      {lastUpdated}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyCommission;
