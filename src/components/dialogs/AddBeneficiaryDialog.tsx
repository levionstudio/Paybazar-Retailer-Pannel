import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

interface AddBeneficiaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: BeneficiaryFormData) => void;
  mobileNumber?: string; // Phone number from login
}

interface BeneficiaryFormData {
  bank: string;
  ifsc: string;
  accountNumber: string;
  beneficiaryName: string;
  mobileNumber: string;
}

interface Bank {
  bank_name: string;
  ifsc_code: string;
}

export function AddBeneficiaryDialog({
  open,
  onOpenChange,
  onAdd,
  mobileNumber = "",
}: AddBeneficiaryDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BeneficiaryFormData>({
    bank: "",
    ifsc: "",
    accountNumber: "",
    beneficiaryName: "",
    mobileNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBankIFSC, setSelectedBankIFSC] = useState("");
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch banks from API
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user/get/banks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.status === "success" && response.data.data?.banks) {
          setBanks(response.data.data.banks);
        }
      } catch (error: any) {
        console.error("Error fetching banks:", error);
        toast({
          title: "Error",
          description: "Failed to fetch banks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchBanks();
    }
  }, [open, toast]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        bank: "",
        ifsc: "",
        accountNumber: "",
        beneficiaryName: "",
        mobileNumber: "",
      });
      setErrors({});
      setSelectedBankIFSC("");
      setIsAccountVerified(false);
    }
  }, [open]);

  // Reset verification when account number or IFSC changes
  useEffect(() => {
    setIsAccountVerified(false);
  }, [formData.accountNumber, formData.ifsc]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bank) newErrors.bank = "Please select a bank";
    if (!formData.ifsc) newErrors.ifsc = "IFSC code is required";
    if (formData.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
      newErrors.ifsc = "Invalid IFSC code format";
    }
    if (!formData.accountNumber)
      newErrors.accountNumber = "Account number is required";
    if (formData.accountNumber && formData.accountNumber.length < 9) {
      newErrors.accountNumber = "Account number must be at least 9 digits";
    }
    if (!formData.beneficiaryName)
      newErrors.beneficiaryName = "Beneficiary name is required";
    if (!formData.mobileNumber)
      newErrors.mobileNumber = "Mobile number is required";
    if (formData.mobileNumber && !/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Invalid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyAccount = async () => {
    if (!formData.ifsc || !formData.accountNumber) {
      setErrors({
        ...errors,
        verify: "Please enter IFSC and Account Number first",
      });
      setIsAccountVerified(false);
      return;
    }

    // Validate IFSC format
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
      setErrors({
        ...errors,
        verify: "Invalid IFSC code format",
      });
      setIsAccountVerified(false);
      return;
    }

    // Validate account number length
    if (formData.accountNumber.length < 9) {
      setErrors({
        ...errors,
        verify: "Account number must be at least 9 digits",
      });
      setIsAccountVerified(false);
      return;
    }

    try {
      setIsVerifying(true);
      setErrors({ ...errors, verify: "" });
      
      // TODO: Replace with actual API endpoint when available
      // Example API call:
      // const token = localStorage.getItem("authToken");
      // const response = await axios.post(
      //   `${import.meta.env.VITE_API_BASE_URL}/user/verify/account`,
      //   {
      //     ifsc_code: formData.ifsc,
      //     account_number: formData.accountNumber,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );
      
      // For now, simulate successful verification after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsAccountVerified(true);
      setErrors({ ...errors, verify: "" });
      toast({
        title: "Account Verified",
        description: "Account number has been verified successfully",
      });
    } catch (error: any) {
      setIsAccountVerified(false);
      setErrors({
        ...errors,
        verify: error.response?.data?.message || "Failed to verify account. Please try again.",
      });
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Failed to verify account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");
      
      const payload = {
        mobile_number: mobileNumber, // Logged-in user's phone number (from login)
        bank_name: formData.bank,
        ifsc_code: formData.ifsc,
        account_number: formData.accountNumber,
        beneficiary_name: formData.beneficiaryName,
        beneficiary_phone: formData.mobileNumber, // Beneficiary's phone number (user enters this)
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/add/beneficiary`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast({
          title: "Success",
          description: "Beneficiary added successfully",
        });

        if (onAdd) {
          onAdd(formData);
        }

        // Reset form and close dialog
        setFormData({
          bank: "",
          ifsc: "",
          accountNumber: "",
          beneficiaryName: "",
          mobileNumber: "",
        });
        setErrors({});
        setSelectedBankIFSC("");
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add beneficiary",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      bank: "",
      ifsc: "",
      accountNumber: "",
      beneficiaryName: "",
      mobileNumber: "",
    });
    setErrors({});
    setSelectedBankIFSC("");
    onOpenChange(false);
  };

  const handleBankChange = (bankName: string) => {
    const selectedBank = banks.find((b) => b.bank_name === bankName);
    if (selectedBank) {
      // Use complete IFSC code from API
      setSelectedBankIFSC(selectedBank.ifsc_code);
      setFormData({
        ...formData,
        bank: bankName,
        ifsc: selectedBank.ifsc_code, // Auto-fill with complete IFSC code
      });
    }
  };

  const handleIFSCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    // Limit to 11 characters (IFSC format: 4 letters + 0 + 6 alphanumeric)
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    
    setFormData({ ...formData, ifsc: value });
    // Clear selected bank IFSC if user manually edits the IFSC
    if (selectedBankIFSC && value !== selectedBankIFSC) {
      setSelectedBankIFSC("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-semibold tracking-wider">
            ADD BENEFICIARY
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Bank Selection */}
          <div className="space-y-2">
            <Label htmlFor="bank" className="text-sm font-medium">
              Select Bank
            </Label>
            <Select
              value={formData.bank}
              onValueChange={handleBankChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="--Select Bank--" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading banks...</SelectItem>
                ) : (
                  banks.map((bank) => (
                    <SelectItem key={bank.bank_name} value={bank.bank_name}>
                      {bank.bank_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.bank && (
              <p className="text-red-500 text-xs">{errors.bank}</p>
            )}
          </div>

          {/* IFSC and Account Number Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ifsc" className="text-sm font-medium">
                IFSC
              </Label>
              <Input
                id="ifsc"
                type="text"
                value={formData.ifsc}
                onChange={handleIFSCChange}
                placeholder="Enter IFSC"
                className="uppercase"
                maxLength={11}
              />
              {errors.ifsc && (
                <p className="text-red-500 text-xs">{errors.ifsc}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber" className="text-sm font-medium">
                Account Number
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="accountNumber"
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  placeholder="Account Number"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleVerifyAccount}
                  disabled={isVerifying}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded whitespace-nowrap disabled:opacity-50"
                >
                  {isVerifying ? "Verifying..." : "Verify A/C"}
                </Button>
              </div>
              {errors.accountNumber && (
                <p className="text-red-500 text-xs">{errors.accountNumber}</p>
              )}
              {errors.verify && (
                <p className="text-red-500 text-xs">{errors.verify}</p>
              )}
              {isAccountVerified && !errors.verify && (
                <p className="text-green-600 text-xs flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Account verified successfully
                </p>
              )}
            </div>
          </div>

          {/* Beneficiary Name */}
          <div className="space-y-2">
            <Label htmlFor="beneficiaryName" className="text-sm font-medium">
              Beneficiary Name
            </Label>
            <Input
              id="beneficiaryName"
              type="text"
              value={formData.beneficiaryName}
              onChange={(e) =>
                setFormData({ ...formData, beneficiaryName: e.target.value })
              }
              placeholder="Enter Beneficiary Name"
            />
            {errors.beneficiaryName && (
              <p className="text-red-500 text-xs">{errors.beneficiaryName}</p>
            )}
          </div>

          {/* Beneficiary Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="text-sm font-medium">
              Beneficiary Phone Number
            </Label>
            <Input
              id="mobileNumber"
              type="text"
              value={formData.mobileNumber}
              onChange={(e) =>
                setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
              placeholder="Enter Beneficiary Phone Number"
              maxLength={10}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-xs">{errors.mobileNumber}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 paybazaar-gradient text-white"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
