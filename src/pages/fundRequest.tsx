import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";

interface TokenData {
  data: {
    admin_id: string;
    user_id?: string;
    distributor_id?: string;
    user_unique_id?: string;
    user_name?: string;
  };
  exp: number;
}

const STATIC_BANK_DETAILS = {
  bank_name: "Axis Bank",
  account_number: "925020043148912",
  ifsc_code: "UTIB0000056",
};

const RequestFunds = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    bank_branch: "",
    utr_number: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [walletBalance] = useState(50000);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const redirectTo = useCallback(
    (path: string) => {
      navigate(path, { replace: true });
    },
    [navigate]
  );

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
            title: "Session Expired",
            description: "Please log in again.",
            variant: "destructive",
          });
          redirectTo("/login");
          return;
        }

        const userRole = localStorage.getItem("userRole") || "user";

        setTokenData(decoded);
        setRole(userRole);
      } catch (err) {
        console.error("Token decode error:", err);
        localStorage.removeItem("authToken");
        redirectTo("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [toast, redirectTo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenData) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      redirectTo("/login");
      return;
    }

    // ✅ Build correct payload according to backend model
    const payload = {
      admin_id: tokenData.data.admin_id,
      requester_id: tokenData.data.user_id,
      requester_unique_id: tokenData.data.user_unique_id,
      requester_name: tokenData.data.user_name,
      requster_type: "USER",
      amount: formData.amount,
      bank_name: formData.bank_name,
      account_number: formData.account_number,
      ifsc_code: formData.ifsc_code,
      bank_branch: formData.bank_branch,
      utr_number: formData.utr_number,
      remarks: formData.remarks,
    };

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/create/fund/request`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Fund Request Submitted",
        description: data.message || "Request submitted successfully.",
      });

      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      console.error("Fund request error:", err);
      toast({
        title: "Request Failed",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to format labels nicely
  const formatLabel = (key: string) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      {/* Sidebar stays visible */}
      <AppSidebar />

      <div
        className="flex-1 flex flex-col min-w-0 transition-opacity duration-500"
        style={{ opacity: isCheckingAuth ? 0.3 : 1 }}
        aria-busy={isCheckingAuth}
      >
        <Header walletBalance={walletBalance} />
        <div className="flex-1 overflow-y-auto">
          <main className="p-6 flex flex-col items-center space-y-8 ">
            {/* Static Bank Details Card */}
             <Card className="shadow-md border border-border rounded-xl overflow-hidden animate-fade-in ">
                <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-xl">
                  <CardTitle className="text-2xl font-semibold">
                  Our Bank Details
                </CardTitle>
                <CardDescription className="text-white/80 mt-1">
                  Please use these details for reference.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-card grid grid-cols-3 gap-6 text-center text-sm font-medium text-gray-400">
                <div>
                  <p className="text-black">Bank Name</p>
                  <p>{STATIC_BANK_DETAILS.bank_name}</p>
                </div>
                <div>
                  <p className="text-black">Account Number</p>
                  <p>{STATIC_BANK_DETAILS.account_number}</p>
                </div>
                <div>
                  <p className="text-black">IFSC Code</p>
                  <p>{STATIC_BANK_DETAILS.ifsc_code}</p>
                </div>
                  <div>
                  <p className="text-black">Bank Name</p>
                  <p>IDFC FIRST Bank</p>
                </div>
                <div>
                  <p className="text-black">Account Number</p>
                  <p>10248252306</p>
                </div>

                  <div>
                  <p className="text-black">IFSC Code</p>
                  <p>IDFB0020137</p>
                </div>

              </CardContent>
            </Card>

            {/* Fund Request Form */}
            <div className="flex flex-col max-w-2xl w-full">
              <Card className="shadow-md border border-border rounded-xl overflow-hidden animate-fade-in">
                <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-xl">
                  <CardTitle className="text-2xl font-semibold">
                    Fund Request Form
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/80 mt-1">
                    Fill in the details to request funds.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 bg-card">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    aria-label="Fund request form"
                  >
                    <div className="grid grid-cols-2 gap-5">
                      {Object.entries(formData).map(([key, value]) =>
                        key !== "remarks" ? (
                          <div className="space-y-2" key={key}>
                            <Label htmlFor={key} className="font-medium">
                              {formatLabel(key)}
                            </Label>
                            <Input
                              id={key}
                              type={key === "amount" ? "number" : "text"}
                              value={value}
                              onChange={handleChange}
                              className="h-11"
                              required
                              aria-required="true"
                            />
                          </div>
                        ) : null
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="remarks" className="font-medium">
                        Remarks
                      </Label>
                      <Textarea
                        id="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="h-32"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        disabled={loading}
                        onClick={() =>
                          navigate(role === "master" ? "/master" : "/user")
                        }
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        className="flex-1 gradient-primary hover:opacity-90"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit Request"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Smooth fade loader overlay without hiding UI */}
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

export default RequestFunds;
