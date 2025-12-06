import { useState, useEffect, FormEvent } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { ArrowLeft, Eye, CheckCircle2, Trash2, X, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddBeneficiaryDialog } from "@/components/dialogs/AddBeneficiaryDialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface Beneficiary {
  beneficiary_id: string;
  beneficiaryName: string;
  bankName: string;
  ifsc: string;
  accountNumber: string;
  mobileNumber: string;
  beneficiary_phone: string;
  isVerified: boolean;
}

interface TokenData {
  data: {
    admin_id: string;
    user_id?: string;
    distributor_id?: string;
    user_unique_id?: string;
    user_name?: string;
    is_mpin_set?: boolean | number | string;
  };
  exp: number;
}


export default function Settlement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLoginDialog, setShowLoginDialog] = useState(true);
  const [payoutPhoneNumber, setPayoutPhoneNumber] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<Beneficiary | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingBeneficiaries, setFetchingBeneficiaries] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  
  // Delete confirmation dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<Beneficiary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // MPIN related states
  const [isMpinSet, setIsMpinSet] = useState(false);
  const [showMpinDialog, setShowMpinDialog] = useState(false);
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [mpinError, setMpinError] = useState<string | null>(null);
  const [isSavingMpin, setIsSavingMpin] = useState(false);
  const [showMpinVerificationDialog, setShowMpinVerificationDialog] = useState(false);
  const [verifiedMpin, setVerifiedMpin] = useState("");
  const [mpinVerificationError, setMpinVerificationError] = useState<string | null>(null);

  const [payFormData, setPayFormData] = useState({
    transactionType: "",
    amount: "",
  });

  const fetchBeneficiaries = async (phoneNumber: string) => {
    try {
      setFetchingBeneficiaries(true);
      const token = localStorage.getItem("authToken");
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/user/get/beneficiaries/${phoneNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success" && response.data.data?.beneficieries) {
        const mappedBeneficiaries: Beneficiary[] = response.data.data.beneficieries.map((b: any) => ({
          beneficiary_id: b.beneficiary_id,
          beneficiaryName: b.beneficiary_name,
          bankName: b.bank_name,
          ifsc: b.ifsc_code,
          accountNumber: b.account_number,
          mobileNumber: b.mobile_number,
          beneficiary_phone: b.beneficiary_phone,
          isVerified: b.beneficiary_verified || false,
        }));
        setBeneficiaries(mappedBeneficiaries);
      } else {
        setBeneficiaries([]);
      }
    } catch (error: any) {
      console.error("Error fetching beneficiaries:", error);
      setBeneficiaries([]);
      if (error.response?.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to fetch beneficiaries",
          variant: "destructive",
        });
      }
    } finally {
      setFetchingBeneficiaries(false);
    }
  };

  // Check MPIN status on component mount
  useEffect(() => {
    const checkMpinStatus = () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const decoded: TokenData = jwtDecode(token);
        setTokenData(decoded);
        const mpinFlag = decoded?.data?.is_mpin_set;
        const hasMpin =
          mpinFlag === true ||
          mpinFlag === 1 ||
          mpinFlag === "1" ||
          mpinFlag === "true";
        setIsMpinSet(Boolean(hasMpin));
      } catch (error) {
        console.error("Error checking MPIN status:", error);
      }
    };

    checkMpinStatus();
  }, []);

  const handleLogin = async () => {
    if (!payoutPhoneNumber) {
      toast({
        title: "Error",
        description: "Please enter Phone Number",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      
      // Check MPIN status after login
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decoded: TokenData = jwtDecode(token);
          setTokenData(decoded);
          const mpinFlag = decoded?.data?.is_mpin_set;
          const hasMpin =
            mpinFlag === true ||
            mpinFlag === 1 ||
            mpinFlag === "1" ||
            mpinFlag === "true";
          setIsMpinSet(Boolean(hasMpin));
          
          // Show MPIN setup dialog if MPIN is not set
          if (!hasMpin) {
            setShowMpinDialog(true);
          }
        } catch (error) {
          console.error("Error checking MPIN status:", error);
        }
      }
      
      // Fetch beneficiaries after login
      await fetchBeneficiaries(payoutPhoneNumber);
      
      toast({
        title: "Login Successful",
        description: "Welcome to Payout Services",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleAddBeneficiary = async () => {
    // Refresh beneficiaries list after adding
    if (payoutPhoneNumber) {
      await fetchBeneficiaries(payoutPhoneNumber);
    }
  };

  const handleVerify = async (beneficiaryId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/user/verify/beneficiaries/${beneficiaryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Check if verification is successful (returns true/false)
      if (response.data === true || response.data.status === "success" || response.data.data === true) {
        // Refresh beneficiaries list
        if (payoutPhoneNumber) {
          await fetchBeneficiaries(payoutPhoneNumber);
        }
        toast({
          title: "Success",
          description: "Beneficiary verified successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Verification failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify beneficiary",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (beneficiary: Beneficiary) => {
    setBeneficiaryToDelete(beneficiary);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!beneficiaryToDelete) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("authToken");
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/user/delete/beneficiary/${beneficiaryToDelete.beneficiary_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Check if deletion is successful (204 No Content or 200 OK)
      if (response.status === 204 || response.status === 200 || response.data?.status === "success") {
        toast({
          title: "Success",
          description: `${beneficiaryToDelete.beneficiaryName} deleted successfully`,
        });
        
        // Refresh beneficiaries list
        if (payoutPhoneNumber) {
          await fetchBeneficiaries(payoutPhoneNumber);
        }
        
        setShowDeleteDialog(false);
        setBeneficiaryToDelete(null);
      } else {
        toast({
          title: "Error",
          description: response.data?.message || "Failed to delete beneficiary. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete beneficiary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePayClick = (beneficiary: Beneficiary) => {
    // Check if MPIN is set before allowing payment
    if (!isMpinSet) {
      toast({
        title: "MPIN Setup Required",
        description: "Please set your MPIN first to proceed with payout.",
        variant: "destructive",
      });
      setShowMpinDialog(true);
      return;
    }
    
    setSelectedBeneficiary(beneficiary);
    setPayFormData({
      transactionType: "",
      amount: "",
    });
    setShowPayDialog(true);
  };

  // MPIN Setup Handler
  const handleMpinInput = (value: string, setter: (val: string) => void) => {
    if (/^\d{0,4}$/.test(value)) {
      setter(value);
      setMpinError(null);
    }
  };

  const handleMpinSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mpin.length !== 4) {
      setMpinError("MPIN must be exactly 4 digits.");
      return;
    }

    if (mpin !== confirmMpin) {
      setMpinError("MPIN and confirm MPIN must match.");
      return;
    }

    if (!tokenData?.data?.user_id) {
      setMpinError("User information not available. Please try again.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Error",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

    const setupPayload = { 
      user_id: tokenData.data.user_id,
      mpin: mpin 
    };

    try {
      setIsSavingMpin(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/set/mpin`,
        setupPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Check if API returns a new token in response
      if (response.data.data?.token) {
        localStorage.setItem("authToken", response.data.data.token);
        const decoded: TokenData = jwtDecode(response.data.data.token);
        setTokenData(decoded);
        setIsMpinSet(true);
      } else {
        // Update local state if no new token
        setIsMpinSet(true);
        setTokenData((prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  is_mpin_set: true,
                },
              }
            : prev
        );
      }
      
      setShowMpinDialog(false);
      setMpin("");
      setConfirmMpin("");
      
      toast({
        title: "MPIN Set Successfully",
        description: "You can now proceed with payout transactions.",
      });
    } catch (err: any) {
      setMpinError(err.response?.data?.message || "Failed to set MPIN. Please try again.");
      toast({
        title: "Failed to Set MPIN",
        description: err.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingMpin(false);
    }
  };

  // MPIN Verification Handler
  const handleMpinVerificationInput = (value: string) => {
    if (/^\d{0,4}$/.test(value)) {
      setVerifiedMpin(value);
      setMpinVerificationError(null);
    }
  };

  const handleMpinVerification = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (verifiedMpin.length !== 4) {
      setMpinVerificationError("MPIN must be exactly 4 digits.");
      return;
    }

    // Close verification dialog and proceed with payout
    setShowMpinVerificationDialog(false);
    setMpinVerificationError(null);
    
    // Submit payout with verified MPIN
    await submitPayout();
  };

  const handlePaySubmit = async () => {
    if (!selectedBeneficiary) return;

    if (!payFormData.transactionType || !payFormData.amount) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    // Check if MPIN is set
    if (!isMpinSet) {
      toast({
        title: "MPIN Setup Required",
        description: "Please set your MPIN first to proceed with payout.",
        variant: "destructive",
      });
      setShowMpinDialog(true);
      return;
    }

    // If MPIN is set, show verification dialog
    setShowMpinVerificationDialog(true);
    setVerifiedMpin("");
    setMpinVerificationError(null);
  };

  const submitPayout = async () => {
    if (!selectedBeneficiary) return;

    // Double-check MPIN before submission
    if (!verifiedMpin || verifiedMpin.length !== 4) {
      toast({
        title: "Error",
        description: "Please verify your MPIN first.",
        variant: "destructive",
      });
      setShowMpinVerificationDialog(true);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      
      // Use same payload structure as payout.tsx
      // Fix: get user_id from decoded auth token
      const authToken = localStorage.getItem("authToken");
      // Decode the JWT token to get user_id (phone number)
      const base64Url = authToken?.split('.')[1];
      const base64 = base64Url ? base64Url.replace(/-/g, '+').replace(/_/g, '/') : '';
      const decodedToken = base64 ? JSON.parse(atob(base64)) : {};
      
      // Get user_id with fallbacks
      let userId = decodedToken.user_id || decodedToken.data?.user_id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "User ID not found. Please log in again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      const payload = {
        user_id: userId,
        mobile_number: selectedBeneficiary.beneficiary_phone || selectedBeneficiary.mobileNumber,
        account_number: selectedBeneficiary.accountNumber,
        ifsc_code: selectedBeneficiary.ifsc,
        bank_name: selectedBeneficiary.bankName,
        beneficiary_name: selectedBeneficiary.beneficiaryName,
        amount: payFormData.amount,
        transfer_type: payFormData.transactionType,
        remarks: "",
        commission: (parseFloat(payFormData.amount) * 0.012).toFixed(2),
        mpin: verifiedMpin,
      };


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
        title: "Success",
        description: response.data.message || "Payout request submitted successfully",
      });

      setShowPayDialog(false);
      setPayFormData({
        transactionType: "",
        amount: "",
      });
      setVerifiedMpin("");
      
      // Refresh beneficiaries list
      if (payoutPhoneNumber) {
        await fetchBeneficiaries(payoutPhoneNumber);
      }
    } catch (error: any) {
      // Clear MPIN on error
      setVerifiedMpin("");
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Invalid MPIN or request failed. Please try again.";
      setMpinVerificationError(errorMessage);
      
      // Show MPIN dialog again if request fails (likely due to invalid MPIN)
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.data?.message?.toLowerCase().includes("mpin")) {
        setShowMpinVerificationDialog(true);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
           <Header walletBalance={0} />

          <div className="paybazaar-gradient rounded-lg p-6 text-white m-6">
            <div className="flex items-center space-x-4 ">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/services")}
                className="text-white hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div >
                <h1 className="text-2xl font-bold">Remitter Login</h1>
                <p className="text-white/90 ">
                  Enter your phone number to access payout services
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex  justify-center p-6">
            <div className="w-full max-w-xl">
              <div className="bg-card rounded-lg border border-border shadow-lg p-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumber"
                      className="text-sm font-medium text-foreground"
                    >
                      Mobile Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={payoutPhoneNumber}
                        onChange={(e) =>
                          setPayoutPhoneNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 10)
                          )
                        }
                        placeholder="Enter Mobile Number"
                        className="h-12 border-2 border-border focus:border-primary transition-colors pr-10"
                        maxLength={10}
                        required
                      />
                      {payoutPhoneNumber && (
                        <button
                          type="button"
                          onClick={() => setPayoutPhoneNumber("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 paybazaar-gradient text-white hover:opacity-90 shadow-lg font-semibold"
                  >
                    Submit
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold">Settlement</h1>
              </div>
              <Button
                onClick={() => setShowAddBeneficiary(true)}
                className="bg-white text-primary hover:bg-white/90"
              >
                + Add Bene
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
                    <Select defaultValue="10">
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
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white font-medium">
                      Search:
                    </span>
                    <Input
                      className="w-56 h-9 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                      placeholder="Search..."
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="w-full min-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="paybazaar-gradient hover:opacity-95">
                        <TableHead className="font-bold text-white text-center w-[180px] min-w-[180px]">
                          BENEFICIARY NAME
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[180px] min-w-[180px]">
                          BANK NAME
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[140px] min-w-[140px]">
                          IFSC
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[180px] min-w-[180px]">
                          ACCOUNT NUMBER
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[150px] min-w-[150px]">
                          MOBILE NUMBER
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">
                          PAY
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[130px] min-w-[130px]">
                          VERIFY
                        </TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">
                          DELETE
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fetchingBeneficiaries ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-16">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                              <p className="text-sm text-muted-foreground">Loading beneficiaries...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : beneficiaries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-16">
                            <div className="flex flex-col items-center justify-center">
                              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                                <Eye className="h-10 w-10 text-muted-foreground" />
                              </div>
                              <p className="text-lg font-semibold text-foreground mb-2">
                                No beneficiaries found
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Click "+ Add Bene" to add a new beneficiary
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        beneficiaries.map((beneficiary, index) => (
                          <TableRow
                            key={beneficiary.beneficiary_id}
                            className={`hover:bg-muted/50 transition-colors ${
                              index % 2 === 0 ? "bg-background" : "bg-muted/20"
                            }`}
                          >
                            <TableCell className="text-center font-medium py-4">
                              {beneficiary.beneficiaryName}
                            </TableCell>
                            <TableCell className="text-center py-4">
                              {beneficiary.bankName}
                            </TableCell>
                            <TableCell className="text-center py-4 font-mono text-sm">
                              {beneficiary.ifsc}
                            </TableCell>
                            <TableCell className="text-center py-4 font-mono text-sm">
                              {beneficiary.accountNumber}
                            </TableCell>
                            <TableCell className="text-center py-4 font-mono">
                              {beneficiary.beneficiary_phone || beneficiary.mobileNumber}
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <Button
                                size="sm"
                                onClick={() => handlePayClick(beneficiary)}
                                className="paybazaar-gradient text-white hover:opacity-90 shadow-md"
                                disabled={!beneficiary.isVerified}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Pay
                              </Button>
                            </TableCell>
                            <TableCell className="text-center py-4">
                              {beneficiary.isVerified ? (
                                <Button
                                  size="sm"
                                  disabled
                                  className="bg-green-600 text-white cursor-not-allowed opacity-75"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Verified
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleVerify(beneficiary.beneficiary_id)}
                                  className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Verify
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="text-center py-4">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClick(beneficiary)}
                                className="shadow-md"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Beneficiary Dialog */}
      <AddBeneficiaryDialog
        open={showAddBeneficiary}
        onOpenChange={setShowAddBeneficiary}
        onAdd={handleAddBeneficiary}
        mobileNumber={payoutPhoneNumber}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Beneficiary
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Are you sure you want to delete this beneficiary?</p>
              {beneficiaryToDelete && (
                <div className="mt-4 p-4 bg-muted rounded-lg border">
                  <p className="font-semibold text-foreground mb-2">
                    {beneficiaryToDelete.beneficiaryName}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Bank:</span>{" "}
                      <span className="text-foreground">{beneficiaryToDelete.bankName}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Account:</span>{" "}
                      <span className="text-foreground font-mono">{beneficiaryToDelete.accountNumber}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">IFSC:</span>{" "}
                      <span className="text-foreground font-mono">{beneficiaryToDelete.ifsc}</span>
                    </p>
                  </div>
                </div>
              )}
              <p className="text-destructive font-medium">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pay Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Payout Transaction
            </DialogTitle>
            <DialogDescription>
              Complete the payout transaction details
            </DialogDescription>
          </DialogHeader>

          {selectedBeneficiary && (
            <div className="space-y-4 py-4">
              {/* Auto-filled Beneficiary Details */}
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Beneficiary Name:
                    </span>
                    <p className="font-medium">
                      {selectedBeneficiary.beneficiaryName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bank Name:</span>
                    <p className="font-medium">
                      {selectedBeneficiary.bankName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IFSC:</span>
                    <p className="font-medium">{selectedBeneficiary.ifsc}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Account Number:
                    </span>
                    <p className="font-medium">
                      {selectedBeneficiary.accountNumber}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">
                      Mobile Number:
                    </span>
                    <p className="font-medium">
                      {selectedBeneficiary.mobileNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Type */}
              <div className="space-y-2">
                <Label htmlFor="transactionType">Transfer Type *</Label>
                <Select
                  value={payFormData.transactionType}
                  onValueChange={(value) =>
                    setPayFormData({ ...payFormData, transactionType: value })
                  }
                  required
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Transfer Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMPS">IMPS</SelectItem>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={payFormData.amount}
                  onChange={(e) =>
                    setPayFormData({ ...payFormData, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                  className="h-11"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePaySubmit}
              className="paybazaar-gradient text-white"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MPIN Setup Dialog - Only show when MPIN is not set */}
      {!isMpinSet && (
        <Dialog
          open={showMpinDialog}
          onOpenChange={(open) => {
            // Prevent closing if MPIN is not set
            if (!isMpinSet) {
              setShowMpinDialog(true);
            } else {
              setShowMpinDialog(open);
            }
          }}
        >
          <DialogContent
            className="sm:max-w-md bg-background border-border"
            onEscapeKeyDown={(event) => {
              if (!isMpinSet) event.preventDefault();
            }}
            onInteractOutside={(event) => {
              if (!isMpinSet) event.preventDefault();
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Set Your MPIN
              </DialogTitle>
              <DialogDescription>
                Create a 4-digit MPIN to secure your transactions.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleMpinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mpin">MPIN</Label>
                <Input
                  id="mpin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={mpin}
                  maxLength={4}
                  placeholder="Enter 4-digit MPIN"
                  onChange={(event) => handleMpinInput(event.target.value, setMpin)}
                  required
                  className="text-center tracking-[0.5em]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmMpin">Confirm MPIN</Label>
                <Input
                  id="confirmMpin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={confirmMpin}
                  maxLength={4}
                  placeholder="Re-enter MPIN"
                  onChange={(event) =>
                    handleMpinInput(event.target.value, setConfirmMpin)
                  }
                  required
                  className="text-center tracking-[0.5em]"
                />
              </div>

              {mpinError && (
                <p className="text-sm text-destructive font-medium">{mpinError}</p>
              )}

              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full paybazaar-gradient text-white hover:opacity-90"
                  disabled={isSavingMpin}
                >
                  {isSavingMpin ? "Saving..." : "Save MPIN"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* MPIN Verification Dialog - Show after form submission */}
      <Dialog
        open={showMpinVerificationDialog}
        onOpenChange={(open) => {
          // Allow closing only if not during submission
          if (!loading) {
            setShowMpinVerificationDialog(open);
            if (!open) {
              // Reset MPIN when dialog is closed
              setVerifiedMpin("");
              setMpinVerificationError(null);
            }
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md bg-background border-border"
          onEscapeKeyDown={(event) => {
            if (loading) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (loading) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Enter Your MPIN
            </DialogTitle>
            <DialogDescription>
              Please enter your 4-digit MPIN to submit the payout request.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleMpinVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verifyMpin">MPIN</Label>
              <Input
                id="verifyMpin"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verifiedMpin}
                maxLength={4}
                placeholder="Enter 4-digit MPIN"
                onChange={(event) => handleMpinVerificationInput(event.target.value)}
                required
                className="text-center tracking-[0.5em]"
                disabled={loading}
                autoFocus
              />
            </div>

            {mpinVerificationError && (
              <p className="text-sm text-destructive font-medium">
                {mpinVerificationError}
              </p>
            )}

            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={loading}
                onClick={() => {
                  setShowMpinVerificationDialog(false);
                  setVerifiedMpin("");
                  setMpinVerificationError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 paybazaar-gradient text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}