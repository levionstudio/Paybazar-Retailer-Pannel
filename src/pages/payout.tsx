"use client";

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
    user_id: string;
    user_unique_id?: string;
    user_name?: string;
  };
  exp: number;
}

const PayoutRequest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    mobile_number: "",
    account_number: "",
    ifsc_code: "",
    bank_name: "",
    beneficiary_name: "",
    amount: "",
    transfer_type: "",
    remarks: "",
  });

  const [commission, setCommission] = useState("0"); // auto-calculated 1%
  const [loading, setLoading] = useState(false);
  const [walletBalance] = useState(50000);

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

        setTokenData(decoded);
        setRole(localStorage.getItem("userRole") || "user");
      } catch (error) {
        localStorage.removeItem("authToken");
        redirectTo("/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [redirectTo, toast]);

  // Handle input change + auto-commission calculation
  const handleChange = (e: any) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (id === "amount") {
      const commissionValue = (parseFloat(value || "0") * 0.01).toFixed(2);
      setCommission(commissionValue);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!tokenData) return;

    const token = localStorage.getItem("authToken");
    if (!token) return redirectTo("/login");

    const payload = {
      user_id: tokenData.data.user_id,
      mobile_number: formData.mobile_number,
      account_number: formData.account_number,
      ifsc_code: formData.ifsc_code,
      bank_name: formData.bank_name,
      beneficiary_name: formData.beneficiary_name,
      amount: formData.amount,
      transfer_type: formData.transfer_type,
      remarks: formData.remarks,
      commission: commission, // ✅ 1% auto-calculated
    };

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/payout`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Payout Request Submitted",
        description: response.data.message || "Success",
      });

      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      toast({
        title: "Request Failed",
        description: err.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      <AppSidebar />

      <div
        className="flex-1 flex flex-col min-w-0 transition-opacity duration-500"
        style={{ opacity: isCheckingAuth ? 0.3 : 1 }}
      >
        <Header walletBalance={walletBalance} />

        <div className="flex-1 overflow-y-auto">
          <main className="p-6 flex flex-col items-center">
            <Card className="max-w-2xl w-full shadow-md border border-border rounded-xl animate-fade-in">
              <CardHeader className="bg-gradient-primary rounded-t-xl">
                <CardTitle className="text-2xl font-semibold text-white">
                  Payout Request
                </CardTitle>
                <CardDescription className="text-white/80">
                  Fill the details below to initiate payout.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 bg-card">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    {/* Input Fields */}
                    {Object.keys(formData).map(
                      (key) =>
                        key !== "remarks" && (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={key}>
                              {key.replace(/_/g, " ").toUpperCase()}
                            </Label>
                            <Input
                              id={key}
                              type={key === "amount" ? "number" : "text"}
                              value={(formData as any)[key]}
                              onChange={handleChange}
                              required
                              className="h-11"
                            />
                          </div>
                        )
                    )}

                    {/* Commission Field */}
                    <div className="space-y-2">
                      <Label htmlFor="commission">COMMISSION (1%)</Label>
                      <Input
                        id="commission"
                        value={commission}
                        disabled
                        className="h-11 bg-muted"
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-2">
                    <Label htmlFor="remarks">REMARKS</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      className="h-32"
                      required
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
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
                      {loading ? "Processing..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {isCheckingAuth && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <span className="text-lg animate-pulse">Checking authentication...</span>
        </div>
      )}
    </div>
  );
};

export default PayoutRequest;
