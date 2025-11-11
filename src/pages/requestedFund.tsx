import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  bank_branch: string;
  utr_number: string;
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
              <table className="min-w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-3 text-left">Request ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Bank</th>
                    <th className="p-3 text-left">UTR</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {fundRequests.map((req) => (
                    <tr key={req.request_id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{req.request_unique_id}</td>
                      <td className="p-3">{req.requester_name}</td>
                      <td className="p-3">₹{req.amount}</td>
                      <td className="p-3">
                        {req.bank_name} <br />
                        <span className="text-xs text-muted-foreground">
                          {req.account_number} / {req.ifsc_code}
                        </span>
                      </td>
                      <td className="p-3">{req.utr_number}</td>
                      <td
                        className={`p-3 font-medium ${
                          req.request_status === "approved"
                            ? "text-green-600"
                            : req.request_status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {req.request_status.toUpperCase()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
