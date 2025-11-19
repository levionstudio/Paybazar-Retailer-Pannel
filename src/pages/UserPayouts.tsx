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
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface Transaction {
  transaction_id: string;
  phone_number: string;
  bank_name: string;
  beneficiary_name: string;
  amount: string;
  commission: string;
  transfer_type: string;
  transaction_status: string;
  transaction_date_and_time: string;
}

interface TokenData {
  data: {
    user_id: string;
    [key: string]: any;
  };
}

export default function UserPayouts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const getUserId = () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast({
            title: "Error",
            description: "Authentication token not found",
            variant: "destructive",
          });
          navigate("/login");
          return null;
        }
        const decoded: TokenData = jwtDecode(token);
        return decoded.data.user_id;
      } catch (error) {
        console.error("Error decoding token:", error);
        toast({
          title: "Error",
          description: "Failed to get user information",
          variant: "destructive",
        });
        return null;
      }
    };

    const userIdFromToken = getUserId();
    setUserId(userIdFromToken);
  }, [navigate, toast]);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const fetchTransactions = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/user/payout/get/transactions/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success" && response.data.data?.transactions) {
        setAllTransactions(response.data.data.transactions);
        setTransactions(response.data.data.transactions);
      } else {
        setAllTransactions([]);
        setTransactions([]);
      }
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      setAllTransactions([]);
      setTransactions([]);
      if (error.response?.status !== 404) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch transactions",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-600 text-white";
      case "FAILED":
        return "bg-red-600 text-white";
      case "PENDING":
        return "bg-yellow-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  // Filter transactions based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setTransactions(allTransactions);
      setCurrentPage(1);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = allTransactions.filter((transaction) => {
      // Search across all fields
      const searchableFields = [
        transaction.transaction_id,
        transaction.phone_number,
        transaction.bank_name,
        transaction.beneficiary_name,
        transaction.amount,
        transaction.commission,
        transaction.transfer_type,
        transaction.transaction_status,
        formatDate(transaction.transaction_date_and_time),
      ];

      return searchableFields.some((field) =>
        String(field).toLowerCase().includes(searchLower)
      );
    });

    setTransactions(filtered);
    setCurrentPage(1);
  }, [searchTerm, allTransactions]);

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  return (
    <div className="flex min-h-screen bg-background w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header walletBalance={0} />

        <main className="flex-1 overflow-auto bg-muted/20">
          {/* Header Section */}
          <div className="paybazaar-gradient text-white p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">User Payout Reports</h1>
            </div>
          </div>

          {/* Table Section */}
          <div className="p-6">
            <div className="bg-card rounded-lg border border-border shadow-lg overflow-hidden">
              <div className="paybazaar-gradient p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white font-medium">Show</span>
                    <Select
                      value={entriesPerPage.toString()}
                      onValueChange={(value) => {
                        setEntriesPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20 h-9 bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <SelectValue className="text-white" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-white font-medium">
                      entries
                    </span>
                    <span className="text-sm text-white/80 ml-2">
                      (Showing {transactions.length} of {allTransactions.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white font-medium">
                      Search:
                    </span>
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-56 h-9 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
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
                        <TableHead className="font-bold text-white text-center w-[150px] min-w-[150px]">
                          TRANSACTION ID
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[130px] min-w-[130px]">
                          PHONE NUMBER
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[180px] min-w-[180px]">
                          BANK NAME
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[180px] min-w-[180px]">
                          BENEFICIARY NAME
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">
                          AMOUNT (₹)
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">
                          COMMISSION (₹)
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[100px] min-w-[100px]">
                          TRANSFER TYPE
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[130px] min-w-[130px]">
                          STATUS
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[180px] min-w-[180px]">
                          DATE & TIME
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-16">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                              <p className="text-sm text-muted-foreground">Loading transactions...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : paginatedTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-16">
                            <div className="flex flex-col items-center justify-center">
                              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                                <FileText className="h-10 w-10 text-muted-foreground" />
                              </div>
                              <p className="text-lg font-semibold text-foreground mb-2">
                                {searchTerm ? "No matching transactions found" : "No transactions found"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {searchTerm
                                  ? "Try adjusting your search terms"
                                  : "Your payout transactions will appear here"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTransactions.map((transaction, index) => (
                          <TableRow
                            key={transaction.transaction_id}
                            className={`hover:bg-muted/50 transition-colors ${
                              index % 2 === 0 ? "bg-background" : "bg-muted/20"
                            }`}
                          >
                            <TableCell className="text-center font-mono text-sm py-4">
                              {transaction.transaction_id}
                            </TableCell>
                            <TableCell className="text-center font-mono py-4">
                              {transaction.phone_number}
                            </TableCell>
                            <TableCell className="text-center py-4">
                              {transaction.bank_name}
                            </TableCell>
                            <TableCell className="text-center font-medium py-4">
                              {transaction.beneficiary_name}
                            </TableCell>
                            <TableCell className="text-center font-semibold py-4">
                              ₹{parseFloat(transaction.amount).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell className="text-center font-semibold py-4">
                              ₹{parseFloat(transaction.commission).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell className="text-center py-4">
                              {transaction.transfer_type}
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  transaction.transaction_status
                                )}`}
                              >
                                {transaction.transaction_status}
                              </span>
                            </TableCell>
                            <TableCell className="text-center text-sm py-4">
                              {formatDate(transaction.transaction_date_and_time)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {transactions.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of {transactions.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum ? "paybazaar-gradient text-white" : ""}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

