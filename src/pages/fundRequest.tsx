import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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


const RequestFunds = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    bank_branch: "",
    utr_number: "",
    amount: "",
    remarks: "",
  });

  // Bank to IFSC mapping
  const bankToIFSC: Record<string, string> = {
    "State Bank of India": "SBIN",
    "HDFC Bank": "HDFC",
    "ICICI Bank": "ICIC",
    "Punjab National Bank": "PUNB",
    "Bank of Baroda": "BARB",
    "Canara Bank": "CNRB",
    "Union Bank of India": "UBIN",
    "Axis Bank": "UTIB",
    "Kotak Mahindra Bank": "KKBK",
    "IndusInd Bank": "INDB",
    "IDFC FIRST Bank": "IDFB",
    "IDFC Bank Limited": "IDFB",
  };

  const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "IndusInd Bank",
    "IDFC FIRST Bank",
    "IDFC Bank Limited",
  ];

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

  const handleBankChange = (bankName: string) => {
    const ifscPrefix = bankToIFSC[bankName] || "";
    setFormData((prev) => ({
      ...prev,
      bank_name: bankName,
      ifsc_code: ifscPrefix, // Auto-fill IFSC prefix when bank is selected
    }));
  };

  const handleIFSCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    // If bank is selected, ensure IFSC starts with bank's prefix
    if (formData.bank_name && bankToIFSC[formData.bank_name]) {
      const prefix = bankToIFSC[formData.bank_name];
      
      // If user is typing and value doesn't start with prefix, prepend it
      if (value.length > 0 && !value.startsWith(prefix)) {
        // If user deleted prefix, restore it
        if (value.length < prefix.length) {
          value = prefix;
        } else {
          // Keep prefix and append remaining characters
          value = prefix + value.substring(prefix.length);
        }
      }
      
      // Limit to 11 characters (IFSC format: 4 letters + 0 + 6 alphanumeric)
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
    } else {
      // No bank selected, just limit to 11 characters
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
    }
    
    setFormData((prev) => ({ ...prev, ifsc_code: value }));
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
          <main className="p-6 flex flex-col items-center">
            {/* Fund Request Form */}
            <div className="flex flex-col max-w-3xl w-full">
              <Card className="shadow-lg border border-border rounded-xl overflow-hidden animate-fade-in">
                <CardHeader className="paybazaar-gradient text-white rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-1 bg-white/30 rounded-full"></div>
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        Request E-Value
                      </CardTitle>
                      <CardDescription className="text-white/90 mt-1">
                        Submit your fund request with transaction details
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-gradient-to-br from-background to-muted/30">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    aria-label="Fund request form"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      {/* Bank Name */}
                      <div className="space-y-2">
                        <Label htmlFor="bank_name" className="text-sm font-semibold text-foreground flex items-center gap-1">
                          Select Bank <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.bank_name}
                          onValueChange={handleBankChange}
                          required
                        >
                          <SelectTrigger className="h-12 border-2 border-border focus:border-primary transition-colors bg-background hover:bg-muted/50">
                            <SelectValue placeholder="--Select Bank--" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.map((bank) => (
                              <SelectItem key={bank} value={bank}>
                                {bank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* IFSC Code */}
                      <div className="space-y-2">
                        <Label htmlFor="ifsc_code" className="text-sm font-semibold text-foreground flex items-center gap-1">
                          IFSC Code <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="ifsc_code"
                          type="text"
                          value={formData.ifsc_code}
                          onChange={handleIFSCChange}
                          className="h-12 border-2 border-border focus:border-primary transition-colors bg-background uppercase"
                          placeholder="Enter IFSC Code"
                          maxLength={11}
                          required
                          aria-required="true"
                        />
                      </div>

                      {/* Account Number */}
                      <div className="space-y-2">
                        <Label htmlFor="account_number" className="text-sm font-semibold text-foreground flex items-center gap-1">
                          Account Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="account_number"
                          type="text"
                          value={formData.account_number}
                          onChange={handleChange}
                          className="h-12 border-2 border-border focus:border-primary transition-colors bg-background"
                          placeholder="Enter Account Number"
                          required
                          aria-required="true"
                        />
                      </div>

                      {/* Bank Branch */}
                      <div className="space-y-2">
                        <Label htmlFor="bank_branch" className="text-sm font-semibold text-foreground flex items-center gap-1">
                          Bank Branch <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="bank_branch"
                          type="text"
                          value={formData.bank_branch}
                          onChange={handleChange}
                          className="h-12 border-2 border-border focus:border-primary transition-colors bg-background"
                          placeholder="Enter Bank Branch"
                          required
                          aria-required="true"
                        />
                      </div>

                      {/* UTR Number */}
                      <div className="space-y-2">
                        <Label htmlFor="utr_number" className="text-sm font-semibold text-foreground flex items-center gap-1">
                          UTR Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="utr_number"
                          type="text"
                          value={formData.utr_number}
                          onChange={handleChange}
                          className="h-12 border-2 border-border focus:border-primary transition-colors bg-background"
                          placeholder="Enter UTR Number"
                          required
                          aria-required="true"
                        />
                      </div>

                      {/* Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-semibold text-foreground flex items-center gap-1">
                          Amount <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          value={formData.amount}
                          onChange={handleChange}
                          className="h-12 border-2 border-border focus:border-primary transition-colors bg-background"
                          placeholder="Enter Amount"
                          min="0"
                          step="0.01"
                          required
                          aria-required="true"
                        />
                      </div>
                    </div>

                    {/* Remarks */}
                    <div className="space-y-2">
                      <Label htmlFor="remarks" className="text-sm font-semibold text-foreground flex items-center gap-1">
                        Remarks <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="min-h-[120px] border-2 border-border focus:border-primary transition-colors bg-background resize-none"
                        placeholder="Enter any additional notes or remarks"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div className="flex gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 border-2 hover:bg-muted"
                        disabled={loading}
                        onClick={() => navigate("/dashboard")}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        className="flex-1 h-12 paybazaar-gradient text-white hover:opacity-90 shadow-lg font-semibold"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit"}
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
