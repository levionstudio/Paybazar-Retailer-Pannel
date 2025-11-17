import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";

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
  request_date: string;
}

const GetFundRequests = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fundRequests, setFundRequests] = useState<GetFundRequestModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  const fetchRequests = async () => {
    if (!tokenData) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/user/get/fund/request/${
          tokenData.data.user_id
        }`,
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

      toast({
        title: "Success",
        description: "Fund requests loaded successfully",
      });
    } catch (err: any) {
      console.error("Fetch request error:", err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to fetch fund requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenData) fetchRequests();
  }, [tokenData]);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-300"
          >
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-300"
          >
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-300"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(fundRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = fundRequests.slice(startIndex, endIndex);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">
              Checking authentication...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header walletBalance={10} />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  My Fund Requests
                </h1>
                <p className="text-muted-foreground mt-1">
                  View your fund request history
                </p>
              </div>
              <Button onClick={fetchRequests} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div>
                    <div className="max-h-[600px]  overflow-y-auto pl-10">
                      <Table className="w-full">
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="text-center whitespace-nowrap">
                              Request ID
                            </TableHead>
                            <TableHead className="text-center whitespace-nowrap">
                              Name
                            </TableHead>

                            <TableHead className="text-center whitespace-nowrap">
                              Amount
                            </TableHead>
                            <TableHead className="text-center whitespace-nowrap">
                              UTR Number
                            </TableHead>
                            <TableHead className="text-center whitespace-nowrap">
                              Date
                            </TableHead>
                            <TableHead className="text-center whitespace-nowrap">
                              Remarks
                            </TableHead>
                            <TableHead className="text-center whitespace-nowrap">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedRequests.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="text-center text-muted-foreground py-8"
                              >
                                No fund requests found
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedRequests.map((req) => (
                              <TableRow key={req.request_id}>
                                <TableCell className="text-center whitespace-nowrap">
                                  {req.requester_unique_id }
                                </TableCell>
                                <TableCell className="font-medium text-center whitespace-nowrap">
                                  {req.requester_name}
                                </TableCell>

                                <TableCell className="font-semibold text-center whitespace-nowrap">
                                  ₹
                                  {parseFloat(req.amount).toLocaleString(
                                    "en-IN"
                                  )}
                                </TableCell>
                                <TableCell className="text-center whitespace-nowrap">
                                  {req.utr_number || "N/A"}
                                </TableCell>
                                <TableCell className="text-center whitespace-nowrap">
                                  {req.request_date}
                                </TableCell>
                                <TableCell className="text-center max-w-xs truncate">
                                  {req.remarks || "N/A"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getStatusBadge(req.request_status)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>

              {fundRequests.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, fundRequests.length)} of{" "}
                    {fundRequests.length} requests
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetFundRequests;
