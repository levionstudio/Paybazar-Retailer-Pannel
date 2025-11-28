import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { ArrowLeft, RefreshCw, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TokenData {
  data: {
    user_id: string;
    user_unique_id: string;
    user_name: string;
    admin_id: string;
    distributor_id: string;
    master_distributor_id: string;
  };
  exp: number;
}

interface Transaction {
  transaction_id: string;
  transactor_name: string;
  transactor_type: string;
  receiver_name: string;
  receiver_type: string;
  transaction_type: string;
  amount: string;
  transaction_status: string;
  remarks: string;
}

const UserWalletTransactions = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Decode token
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to continue.",
        variant: "destructive",
      });
      window.location.href = "/login";
      return;
    }

    try {
      const decoded: TokenData = jwtDecode(token);

      if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
        toast({
          title: "Session expired",
          description: "Login again.",
          variant: "destructive",
        });
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        return;
      }

      setTokenData(decoded);
    } catch (error) {
      toast({
        title: "Invalid token",
        description: "Please login.",
        variant: "destructive",
      });
      window.location.href = "/login";
    }
  }, []);

  // Fetch wallet transactions
  const fetchTransactions = async () => {
    if (!tokenData) return;

    const token = localStorage.getItem("authToken");
    setLoading(true);

    try {
      const res = await axios.get(
        `https://server.paybazaar.in/user/wallet/get/transactions/${tokenData.data.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.status === "success") {
        setAllTransactions(res.data.data || []);
        setTransactions(res.data.data || []);
        toast({
          title: "Success",
          description: "Transactions loaded successfully",
        });
      } else {
        setAllTransactions([]);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      toast({
        title: "Error",
        description: "Unable to fetch transactions",
        variant: "destructive",
      });
      setAllTransactions([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenData) fetchTransactions();
  }, [tokenData]);

  // Search Filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setTransactions(allTransactions);
      setCurrentPage(1);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = allTransactions.filter((transaction) => {
      const searchableFields = [
        transaction.transaction_id,
        transaction.transactor_name,
        transaction.transactor_type,
        transaction.receiver_name,
        transaction.receiver_type,
        transaction.transaction_type,
        transaction.amount,
        transaction.transaction_status,
        transaction.remarks,
      ];

      return searchableFields.some((field) =>
        String(field).toLowerCase().includes(searchLower)
      );
    });

    setTransactions(filtered);
    setCurrentPage(1);
  }, [searchTerm, allTransactions]);

  const getTransactionTypeColor = (type: string) => {
    return type === "DEBIT"
      ? "bg-red-600 text-white"
      : "bg-green-600 text-white";
  };

  const getStatusColor = (status: string) => {
    return status === "SUCCESS"
      ? "bg-green-600 text-white"
      : "bg-yellow-600 text-white";
  };

  // Pagination
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
            <div className="flex items-center justify-between">
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
                  <h1 className="text-2xl font-bold">Wallet Transactions</h1>
                  <p className="text-white/80 text-sm mt-1">
                    View your wallet transaction history
                  </p>
                </div>
              </div>
              <Button
                onClick={fetchTransactions}
                className="bg-white text-primary hover:bg-white/90"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
                        <TableHead className="font-bold text-white text-center w-[200px] min-w-[200px]">
                          TRANSACTOR
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[200px] min-w-[200px]">
                          RECEIVER
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">
                          TYPE
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">
                          AMOUNT (₹)
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">
                          STATUS
                        </TableHead>
                      
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-16">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                              <p className="text-sm text-muted-foreground">Loading transactions...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : paginatedTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-16">
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
                                  : "Your wallet transactions will appear here"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTransactions.map((tx, index) => (
                          <TableRow
                            key={tx.transaction_id}
                            className={`hover:bg-muted/50 transition-colors ${
                              index % 2 === 0 ? "bg-background" : "bg-muted/20"
                            }`}
                          >
                            <TableCell className="text-center py-4">
                              <div>
                                <span className="font-medium block">
                                  {tx.transactor_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {tx.transactor_type}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <div>
                                <span className="font-medium block">
                                  {tx.receiver_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {tx.receiver_type}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getTransactionTypeColor(
                                  tx.transaction_type
                                )}`}
                              >
                                {tx.transaction_type}
                              </span>
                            </TableCell>
                            <TableCell className="text-center font-semibold py-4">
                              ₹{parseFloat(tx.amount).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  tx.transaction_status
                                )}`}
                              >
                                {tx.transaction_status}
                              </span>
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
};

export default UserWalletTransactions;