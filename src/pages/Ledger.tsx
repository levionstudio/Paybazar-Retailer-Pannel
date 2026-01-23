import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  FileText,
  Download,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface PayoutReport {
  payout_transaction_id: string;
  user_id: string;
  mobile_number: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  beneficiary_name: string;
  amount: string;
  commission: string;
  transfer_type: string;
  transaction_status: string;
  remarks: string;
  before_balance: string;
  after_balance: string;
  created_at: string;
}

interface TokenData {
  data: {
    user_id: string;
    admin_id?: string;
    distributor_id?: string;
    user_unique_id?: string;
    user_name?: string;
  };
  exp: number;
}

type TransactionStatus = "all" | "success" | "pending" | "failed";

export default function Ledger() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [reports, setReports] = useState<PayoutReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PayoutReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>("all");

  // Get user ID from token on mount
  useEffect(() => {
    const getUserIdFromToken = () => {
      try {
        const token = localStorage.getItem("authToken");
        
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your ledger",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        const decoded: TokenData = jwtDecode(token);
        const id = decoded?.data?.user_id;

        if (!id) {
          toast({
            title: "Error",
            description: "User ID not found. Please log in again.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        setUserId(id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid session. Please log in again.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    getUserIdFromToken();
  }, [navigate, toast]);

  // Fetch payout reports when userId is available
  useEffect(() => {
    if (userId) {
      fetchPayoutReports();
    }
  }, [userId]);

  // Filter reports based on search term and status
  useEffect(() => {
    let filtered = [...reports];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (report) =>
          report.transaction_status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.beneficiary_name.toLowerCase().includes(search) ||
          report.bank_name.toLowerCase().includes(search) ||
          report.account_number.toLowerCase().includes(search) ||
          report.mobile_number.toLowerCase().includes(search) ||
          report.amount.toLowerCase().includes(search)
      );
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter]);

  const fetchPayoutReports = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `https://server.paybazaar.in/user/payout/report/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        let reportsArray = null;
        
        if (response.data.data?.reports && Array.isArray(response.data.data.reports)) {
          reportsArray = response.data.data.reports;
        } else if (response.data.reports && Array.isArray(response.data.reports)) {
          reportsArray = response.data.reports;
        } else if (Array.isArray(response.data.data)) {
          reportsArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          reportsArray = response.data;
        }

        if (reportsArray && reportsArray.length > 0) {
          const sortedReports = reportsArray.sort(
            (a: PayoutReport, b: PayoutReport) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setReports(sortedReports);
          
          toast({
            title: "Success",
            description: `Loaded ${sortedReports.length} transaction(s)`,
          });
        } else {
          setReports([]);
          toast({
            title: "No Data",
            description: "No payout transactions found",
          });
        }
      } else {
        setReports([]);
      }
    } catch (error: any) {
      setReports([]);

      if (error.response?.status !== 404) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || error.message || "Failed to fetch payout reports",
          variant: "destructive",
        });
      } else {
        toast({
          title: "No Data",
          description: "No payout transactions found for this user",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPayoutReports();
    toast({
      title: "Refreshing",
      description: "Fetching latest transactions...",
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: string | number) => {
    try {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      return `₹${num.toFixed(2)}`;
    } catch {
      return `₹${amount}`;
    }
  };

  const formatCommission = (commission: string) => {
    try {
      const num = parseFloat(commission) / 2;
      return `₹${num.toFixed(2)}`;
    } catch {
      return `₹${commission}`;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "success":
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "failed":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const downloadCSV = () => {
    if (filteredReports.length === 0) {
      toast({
        title: "No Data",
        description: "No transactions to download",
        variant: "destructive",
      });
      return;
    }

    // CSV headers
    const headers = [
      "Date",
      "Beneficiary Name",
      "Bank Name",
      "Account Number",
      "IFSC Code",
      "Mobile Number",
      "Amount",
      "Commission",
      "Transfer Type",
      "Status",
      "Before Balance",
      "After Balance",
      "Remarks",
    ];

    // CSV rows
    const rows = filteredReports.map((report) => [
      formatDate(report.created_at),
      report.beneficiary_name,
      report.bank_name,
      report.account_number,
      report.ifsc_code,
      report.mobile_number,
      report.amount,
      (parseFloat(report.commission) / 2).toFixed(2),
      report.transfer_type,
      report.transaction_status,
      report.before_balance,
      report.after_balance,
      report.remarks || "-",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `payout_ledger_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Ledger downloaded successfully",
    });
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header walletBalance={0} />

        <main className="flex-1 overflow-auto bg-muted/20">
          {/* Header Section */}
          <div className="paybazaar-gradient text-white p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Payout Ledger</h1>
                  <p className="text-white/90 text-sm">
                    View and manage your payout transaction history
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRefresh}
                  className="bg-white/10 text-white hover:bg-white/20 border border-white/30"
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={downloadCSV}
                  className="bg-white text-primary hover:bg-white/90"
                  disabled={filteredReports.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg border border-border shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Transactions
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{reports.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-600">
                    {
                      reports.filter(
                        (r) =>
                          r.transaction_status.toLowerCase() === "success" ||
                          r.transaction_status.toLowerCase() === "completed"
                      ).length
                    }
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <h3 className="text-2xl font-bold mt-1 text-yellow-600">
                    {
                      reports.filter(
                        (r) =>
                          r.transaction_status.toLowerCase() === "pending"
                      ).length
                    }
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <h3 className="text-2xl font-bold mt-1 text-red-600">
                    {
                      reports.filter(
                        (r) =>
                          r.transaction_status.toLowerCase() === "failed" ||
                          r.transaction_status.toLowerCase() === "rejected"
                      ).length
                    }
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="p-6">
            <div className="bg-card rounded-lg border border-border shadow-lg overflow-hidden">
              <div className="paybazaar-gradient p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-white font-medium">Show</span>
                    <Select
                      value={entriesPerPage}
                      onValueChange={setEntriesPerPage}
                    >
                      <SelectTrigger className="w-20 h-9 bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-white font-medium">
                      entries
                    </span>

                    <div className="flex items-center gap-2 ml-4">
                      <Filter className="h-4 w-4 text-white" />
                      <Select
                        value={statusFilter}
                        onValueChange={(value: TransactionStatus) =>
                          setStatusFilter(value)
                        }
                      >
                        <SelectTrigger className="w-32 h-9 bg-white/10 border-white/20 text-white hover:bg-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-white" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 h-9 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                      placeholder="Search transactions..."
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="w-full min-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="paybazaar-gradient hover:opacity-95">
                        <TableHead className="font-bold text-white text-center w-[160px] min-w-[160px]">
                          DATE & TIME
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[180px] min-w-[180px]">
                          BENEFICIARY
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[160px] min-w-[160px]">
                          BANK NAME
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[160px] min-w-[160px]">
                          ACCOUNT NO.
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">
                          AMOUNT
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[130px] min-w-[130px]">
                          COMMISSION
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[130px] min-w-[130px]">
                          BEFORE BAL.
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[130px] min-w-[130px]">
                          AFTER BAL.
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">
                          TYPE
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">
                          STATUS
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-16">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                              <p className="text-sm text-muted-foreground">
                                Loading transactions...
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredReports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-16">
                            <div className="flex flex-col items-center justify-center">
                              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                                <FileText className="h-10 w-10 text-muted-foreground" />
                              </div>
                              <p className="text-lg font-semibold text-foreground mb-2">
                                No transactions found
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {searchTerm || statusFilter !== "all"
                                  ? "Try adjusting your filters"
                                  : "Your payout transactions will appear here"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReports
                          .slice(0, parseInt(entriesPerPage))
                          .map((report, index) => (
                            <TableRow
                              key={report.payout_transaction_id}
                              className={`hover:bg-muted/50 transition-colors ${
                                index % 2 === 0 ? "bg-background" : "bg-muted/20"
                              }`}
                            >
                              <TableCell className="text-center text-sm py-4">
                                {formatDate(report.created_at)}
                              </TableCell>
                              <TableCell className="text-center font-medium py-4">
                                {report.beneficiary_name}
                              </TableCell>
                              <TableCell className="text-center py-4">
                                {report.bank_name}
                              </TableCell>
                              <TableCell className="text-center font-mono text-sm py-4">
                                {report.account_number}
                              </TableCell>
                              <TableCell className="text-center font-semibold py-4">
                                {formatCurrency(report.amount)}
                              </TableCell>
                              <TableCell className="text-center font-semibold py-4 text-purple-600">
                                {formatCommission(report.commission)}
                              </TableCell>
                              <TableCell className="text-center font-semibold py-4 text-blue-600">
                                {formatCurrency(report.before_balance)}
                              </TableCell>
                              <TableCell className="text-center font-semibold py-4 text-green-600">
                                {formatCurrency(report.after_balance)}
                              </TableCell>
                              <TableCell className="text-center py-4">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  {report.transfer_type}
                                </span>
                              </TableCell>
                              <TableCell className="text-center py-4">
                                <span
                                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(
                                    report.transaction_status
                                  )}`}
                                >
                                  {report.transaction_status.toUpperCase()}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination Info */}
              {!loading && filteredReports.length > 0 && (
                <div className="p-4 border-t border-border bg-muted/10">
                  <p className="text-sm text-muted-foreground text-center">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(parseInt(entriesPerPage), filteredReports.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {filteredReports.length}
                    </span>{" "}
                    transactions
                    {searchTerm || statusFilter !== "all"
                      ? ` (filtered from ${reports.length} total)`
                      : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}