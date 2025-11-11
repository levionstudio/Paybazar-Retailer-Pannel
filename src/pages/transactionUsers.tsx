import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";

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

const UserWalletTransactions = () => {
  const { toast } = useToast();

  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Decode token
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

  // ✅ Fetch wallet transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!tokenData) return;

      const token = localStorage.getItem("authToken");

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
          setTransactions(res.data.data || []);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error fetching wallet transactions:", error);
        toast({
          title: "Error",
          description: "Unable to fetch transactions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [tokenData]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <div className="max-w-6xl mx-auto w-full mt-6">
          <Card className="shadow-lg border rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                Wallet Transactions
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-center text-lg text-muted-foreground">Loading...</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-lg text-muted-foreground">
                  No transactions found
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transactor</TableHead>
                        <TableHead>Receiver</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {transactions.map((tx: any) => (
                        <TableRow key={tx.transaction_id}>


                          <TableCell>
                            <span className="font-medium">{tx.transactor_name}</span>
                            <div className="text-xs text-muted-foreground">
                              {tx.transactor_type}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="font-medium">{tx.receiver_name}</span>
                            <div className="text-xs text-muted-foreground">
                              {tx.receiver_type}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                tx.transaction_type === "DEBIT"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {tx.transaction_type}
                            </span>
                          </TableCell>

                          <TableCell className="font-bold">
                            ₹{tx.amount}
                          </TableCell>

                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                tx.transaction_status === "SUCCESS"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {tx.transaction_status}
                            </span>
                          </TableCell>

                          <TableCell className="max-w-xs truncate">
                            {tx.remarks}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserWalletTransactions;
