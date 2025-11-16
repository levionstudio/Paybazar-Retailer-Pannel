import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TokenData {
  data: {
    user_id: string;
    user_unique_id: string;
    user_name: string;
    admin_id: string;
    distributor_id?: string;
    master_distributor_id?: string;
  };
  exp: number;
}

// Backend response model
interface GetFundRequestModel {
  request_id: string;
  request_unique_id: string;
  requester_id: string;
  requester_unique_id: string;
  requester_name: string;
  requester_type: string;
  amount: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_branch?: string;
  utr_number: string;
  payment_mode?: string;
  date?: string;
  remarks: string;
  request_status: string;
}

const GetFundRequests = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fundRequests, setFundRequests] = useState<GetFundRequestModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const redirectTo = useCallback(
    (path: string) => navigate(path, { replace: true }),
    [navigate]
  );

  // --- AUTH CHECK ---
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        redirectTo("/login");
        return;
      }

      try {
        const decoded: TokenData = jwtDecode(token);

        if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("authToken");
          toast({
            title: "Session expired",
            description: "Please log in again.",
            variant: "destructive",
          });
          redirectTo("/login");
          return;
        }

        setTokenData(decoded);
      } catch (e) {
        console.error("Token decode failed:", e);
        redirectTo("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [toast, redirectTo]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchRequests = async () => {
      if (!tokenData) return;

      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        setLoading(true);

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user/get/fund/request/${tokenData.data.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (Array.isArray(data.data)) {
          setFundRequests(data.data);
        } else {
          setFundRequests([]);
        }
      } catch (err: any) {
        console.error("Fetch request error:", err);
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to fetch fund requests.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (tokenData) fetchRequests();
  }, [tokenData, toast]);

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      <AppSidebar />

      <div
        className="flex-1 flex flex-col min-w-0 transition-opacity duration-500"
        style={{ opacity: isCheckingAuth ? 0.3 : 1 }}
        aria-busy={isCheckingAuth}
      >
        <Header walletBalance={10} />

        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-3xl font-semibold mb-6">My Fund Requests</h2>

          {/* Loading state */}
          {loading && (
            <div className="text-center text-lg text-muted-foreground py-20">
              Loading fund requests...
            </div>
          )}

          {/* No data */}
          {!loading && fundRequests.length === 0 && (
            <div className="text-center text-lg text-muted-foreground py-20">
              No fund requests found.
            </div>
          )}

          {/* Table */}
          {!loading && fundRequests.length > 0 && (
            <div className="overflow-x-auto shadow-md rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold min-w-[150px]">Request ID</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">Name</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Payment Mode</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Amount</TableHead>
                    <TableHead className="font-semibold min-w-[150px]">UTR Number</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Date</TableHead>
                    <TableHead className="font-semibold min-w-[200px]">Remarks</TableHead>
                    <TableHead className="font-semibold min-w-[120px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fundRequests.map((req) => (
                    <TableRow key={req.request_id} className="hover:bg-muted/50">
                      <TableCell>{req.request_unique_id || req.request_id}</TableCell>
                      <TableCell>{req.requester_name}</TableCell>
                      <TableCell>{(req as any).payment_mode || "N/A"}</TableCell>
                      <TableCell className="font-medium">₹{req.amount}</TableCell>
                      <TableCell>{req.utr_number || "N/A"}</TableCell>
                      <TableCell>{(req as any).date || "N/A"}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={req.remarks}>
                        {req.remarks || "N/A"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            req.request_status === "approved"
                              ? "bg-green-100 text-green-700"
                              : req.request_status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {req.request_status.toUpperCase()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Auth check overlay */}
      {isCheckingAuth && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-fade-in">
          <span className="animate-pulse text-lg text-muted-foreground">
            Checking authentication...
          </span>
        </div>
      )}
    </div>
  );
};

export default GetFundRequests;
