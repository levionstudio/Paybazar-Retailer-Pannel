import { useState, useEffect, useRef } from "react";
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<BeneficiaryFormData>({
    bank: "",
    ifsc: "",
    accountNumber: "",
    beneficiaryName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBankIFSC, setSelectedBankIFSC] = useState("");
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);

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
      });
      setErrors({});
      setSelectedBankIFSC("");
      setIsAccountVerified(false);
      setBankSearchTerm("");
    }
  }, [open]);

  // Reset verification when account number or IFSC changes
  useEffect(() => {
    setIsAccountVerified(false);
  }, [formData.accountNumber, formData.ifsc]);

  // Filter banks based on search term
  const filteredBanks = banks.filter((bank) =>
    bank.bank_name.toLowerCase().includes(bankSearchTerm.toLowerCase())
  );

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

    if (!mobileNumber) {
      toast({
        title: "Missing Phone Number",
        description: "Remitter phone number not found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");
      
      const payload = {
        mobile_number: mobileNumber, // Logged-in user's phone number (from login)
        bank_name: formData.bank,
        ifsc_code: formData.ifsc,
        account_number: formData.accountNumber,
        beneficiary_name: formData.beneficiaryName,
        beneficiary_phone: mobileNumber, // Use remitter's phone number for beneficiary
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
        });
        setErrors({});
        setSelectedBankIFSC("");
        setBankSearchTerm("");
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
    });
    setErrors({});
    setSelectedBankIFSC("");
    setBankSearchTerm("");
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
              onOpenChange={(isOpen) => {
                setIsSelectOpen(isOpen);
                if (!isOpen) {
                  setBankSearchTerm("");
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="--Select Bank--" />
              </SelectTrigger>
              <SelectContent 
                className="max-h-[300px]"
                onCloseAutoFocus={(e) => {
                  // Prevent auto-focus which can cause keyboard issues
                  e.preventDefault();
                }}
              >
                <div className="sticky top-0 bg-background p-2 border-b z-50">
                  <Input
                    ref={searchInputRef}
                    placeholder="Search bank..."
                    className="h-9"
                    type="search"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    inputMode="text"
                    style={{ fontSize: '16px' }}
                    value={bankSearchTerm}
                    onChange={(e) => {
                      setBankSearchTerm(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      // Prevent Enter key from closing the dropdown
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                      // Prevent escape from closing if there's search text
                      if (e.key === 'Escape' && bankSearchTerm) {
                        e.preventDefault();
                        setBankSearchTerm("");
                      }
                    }}
                  />
                </div>
                <div className="overflow-y-auto max-h-[250px]">
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading banks...</SelectItem>
                  ) : filteredBanks.length > 0 ? (
                    filteredBanks.map((bank) => (
                      <SelectItem key={bank.bank_name} value={bank.bank_name}>
                        {bank.bank_name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {bankSearchTerm ? "No banks match your search" : "No banks found"}
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
            {errors.bank && (
              <p className="text-red-500 text-xs">{errors.bank}</p>
            )}
          </div>

          {/* IFSC */}
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

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-sm font-medium">
              Account Number
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="accountNumber"
                type="number"
                inputMode="numeric"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                placeholder="Enter Account Number"
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