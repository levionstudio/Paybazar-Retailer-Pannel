"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    is_mpin_set?: boolean | number | string;
  };
  exp: number;
}

interface PayoutPayload {
  user_id: string;
  mobile_number: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  beneficiary_name: string;
  amount: string;
  transfer_type: string;
  remarks: string;
  commission: string;
  mpin?: string;
}

const PayoutRequest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isMpinSet, setIsMpinSet] = useState(false);
  const [showMpinDialog, setShowMpinDialog] = useState(false);
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [mpinError, setMpinError] = useState<string | null>(null);
  const [isSavingMpin, setIsSavingMpin] = useState(false);
  const [showMpinVerificationDialog, setShowMpinVerificationDialog] = useState(false);
  const [verifiedMpin, setVerifiedMpin] = useState("");
  const [mpinVerificationError, setMpinVerificationError] = useState<string | null>(null);

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
        const mpinFlag = decoded?.data?.is_mpin_set;
        const hasMpin =
          mpinFlag === true ||
          mpinFlag === 1 ||
          mpinFlag === "1" ||
          mpinFlag === "true";
        setIsMpinSet(Boolean(hasMpin));
        
        // Reset MPIN verification state when page loads
        setVerifiedMpin("");
        
        // Don't show any dialog on page load - user can fill form first
        // MPIN dialog will show after form submission
        if (!hasMpin) {
          // Only show setup dialog if MPIN is not set (user needs to set it first)
          setShowMpinDialog(true);
          setShowMpinVerificationDialog(false);
        } else {
          // MPIN is set, so don't show any dialog initially
          // User will fill form, then MPIN dialog will appear on submit
          setShowMpinDialog(false);
          setShowMpinVerificationDialog(false);
        }
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

    if (!localStorage.getItem("authToken")) return redirectTo("/login");

    // Check if MPIN is set
    if (!isMpinSet) {
      // If MPIN is not set, show setup dialog
      toast({
        title: "MPIN Setup Required",
        description: "Please set your MPIN first to proceed with payout.",
        variant: "destructive",
      });
      setShowMpinDialog(true);
      return;
    }

    // If MPIN is set, show verification dialog
    // Store form data will be used after MPIN verification
    setShowMpinVerificationDialog(true);
    setVerifiedMpin("");
    setMpinVerificationError(null);
  };

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
      redirectTo("/login");
      return;
    }

    // Log MPIN setup request
    const setupPayload = { 
      user_id: tokenData.data.user_id,
      mpin: mpin 
    };
    console.log("=== MPIN Setup Request ===");
    console.log("API URL:", `${import.meta.env.VITE_API_BASE_URL}/user/set/mpin`);
    console.log("Payload (MPIN masked):", {
      ...setupPayload,
      mpin: "****",
      mpin_length: setupPayload.mpin.length,
      mpin_type: typeof setupPayload.mpin,
    });
    console.log("Full Payload JSON:", JSON.stringify(setupPayload, null, 2));

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

      // Log successful MPIN setup response
      console.log("=== MPIN Setup Response (Success) ===");
      console.log("Response Status:", response.status);
      console.log("Response Data:", JSON.stringify(response.data, null, 2));

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
        description: "You can now fill the payout form and submit.",
      });
    } catch (err: any) {
      // Log MPIN setup error
      console.error("=== MPIN Setup Error ===");
      console.error("Error Response Status:", err.response?.status);
      console.error("Error Response Data:", JSON.stringify(err.response?.data, null, 2));
      console.error("Error Message:", err.message);
      
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

    if (!tokenData?.data?.user_id) {
      setMpinVerificationError("User information not available. Please try again.");
      return;
    }

    // Log MPIN verification details
    console.log("=== MPIN Verification ===");
    console.log("Verified MPIN length:", verifiedMpin.length);
    console.log("User ID:", tokenData.data.user_id);
    console.log("Form Data:", formData);
    console.log("Commission:", commission);

    // No separate verification - directly submit payout with MPIN
    // The backend will validate MPIN when processing the payout
    setShowMpinVerificationDialog(false);
    setMpinVerificationError(null);
    
    // Submit payout with MPIN and all form data
    await submitPayout();
  };

  const submitPayout = async () => {
    if (!tokenData?.data?.user_id) {
      toast({
        title: "Error",
        description: "User information not available.",
        variant: "destructive",
      });
      return;
    }

    // Double-check MPIN before submission
    if (!verifiedMpin || verifiedMpin.length !== 4) {
      console.error("=== MPIN Validation Failed ===");
      console.error("Verified MPIN:", verifiedMpin ? "****" : "empty");
      console.error("Verified MPIN length:", verifiedMpin?.length);
      console.error("Verified MPIN type:", typeof verifiedMpin);
      
      toast({
        title: "Error",
        description: "Please verify your MPIN first.",
        variant: "destructive",
      });
      setShowMpinVerificationDialog(true);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      redirectTo("/login");
      return;
    }

    // Prepare payload with all form data and MPIN
    const payload: PayoutPayload = {
      user_id: tokenData.data.user_id,
      mobile_number: formData.mobile_number,
      account_number: formData.account_number,
      ifsc_code: formData.ifsc_code,
      bank_name: formData.bank_name,
      beneficiary_name: formData.beneficiary_name,
      amount: formData.amount,
      transfer_type: formData.transfer_type,
      remarks: formData.remarks,
      commission: commission,
      mpin: verifiedMpin,
    };

    // Log the complete payload (mask MPIN for security)
    console.log("=== Payout Request Payload ===");
    console.log("API URL:", `${import.meta.env.VITE_API_BASE_URL}/user/payout`);
    console.log("Payload (MPIN masked):", {
      ...payload,
      mpin: payload.mpin ? "****" : undefined,
      mpin_length: payload.mpin?.length,
      mpin_type: typeof payload.mpin,
    });
    console.log("Full Payload JSON:", JSON.stringify(payload, null, 2));
    console.log("Headers:", {
      Authorization: `Bearer ${token?.substring(0, 20)}...`,
      "Content-Type": "application/json",
    });

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

      // Log successful response
      console.log("=== Payout Response (Success) ===");
      console.log("Response Status:", response.status);
      console.log("Response Data:", JSON.stringify(response.data, null, 2));

      toast({
        title: "Payout Request Submitted",
        description: response.data.message || "Success",
      });

      // Reset form and MPIN verification for next transaction
      setFormData({
        mobile_number: "",
        account_number: "",
        ifsc_code: "",
        bank_name: "",
        beneficiary_name: "",
        amount: "",
        transfer_type: "",
        remarks: "",
      });
      setCommission("0");
      setVerifiedMpin("");
      
      // Reload after a short delay to refresh token and reset state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      // Log detailed error information
      console.error("=== Payout Error ===");
      console.error("Error Object:", err);
      console.error("Error Response Status:", err.response?.status);
      console.error("Error Response Headers:", err.response?.headers);
      console.error("Error Response Data:", JSON.stringify(err.response?.data, null, 2));
      console.error("Error Message:", err.message);
      console.error("Request Payload (for reference):", {
        ...payload,
        mpin: "****",
        mpin_length: payload.mpin?.length,
      });
      console.error("Verified MPIN State:", {
        verifiedMpin_length: verifiedMpin.length,
        verifiedMpin_type: typeof verifiedMpin,
        verifiedMpin_value: verifiedMpin ? "****" : "empty",
      });

      // If payout fails (possibly due to invalid MPIN), clear MPIN and show error
      setVerifiedMpin("");
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Invalid MPIN or request failed. Please try again.";
      setMpinVerificationError(errorMessage);
      
      // Show MPIN dialog again if request fails (likely due to invalid MPIN)
      if (err.response?.status === 401 || err.response?.status === 403 || err.response?.data?.message?.toLowerCase().includes("mpin")) {
        setShowMpinVerificationDialog(true);
      }
      
      toast({
        title: "Request Failed",
        description: errorMessage,
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
                className="w-full gradient-primary hover:opacity-90"
                disabled={isSavingMpin}
              >
                {isSavingMpin ? "Saving..." : "Save MPIN"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      )}

      {/* MPIN Dialog - Show after form submission */}
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
                className="flex-1 gradient-primary hover:opacity-90"
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
};

export default PayoutRequest;
