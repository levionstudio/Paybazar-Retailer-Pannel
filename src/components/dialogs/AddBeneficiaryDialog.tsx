import { useState } from "react";
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

interface AddBeneficiaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: BeneficiaryFormData) => void;
  bankToIFSC?: Record<string, string>;
}

interface BeneficiaryFormData {
  bank: string;
  ifsc: string;
  accountNumber: string;
  beneficiaryName: string;
  mobileNumber: string;
}

export function AddBeneficiaryDialog({
  open,
  onOpenChange,
  onAdd,
  bankToIFSC = {},
}: AddBeneficiaryDialogProps) {
  const [formData, setFormData] = useState<BeneficiaryFormData>({
    bank: "",
    ifsc: "",
    accountNumber: "",
    beneficiaryName: "",
    mobileNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleVerifyAccount = () => {
    if (!formData.ifsc || !formData.accountNumber) {
      setErrors({
        ...errors,
        verify: "Please enter IFSC and Account Number first",
      });
      return;
    }

    // Simulate account verification
    setErrors({ ...errors, verify: "" });
    alert("Account verified successfully!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

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
    onOpenChange(false);
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
    onOpenChange(false);
  };

  const handleBankChange = (value: string) => {
    const ifsc = bankToIFSC[value] || "";
    setFormData({
      ...formData,
      bank: value,
      ifsc: ifsc,
    });
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
                {banks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ifsc: e.target.value.toUpperCase(),
                  })
                }
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
              <div className="flex gap-2">
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
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded whitespace-nowrap"
                >
                  Verify A/C
                </Button>
              </div>
              {errors.accountNumber && (
                <p className="text-red-500 text-xs">{errors.accountNumber}</p>
              )}
              {errors.verify && (
                <p className="text-red-500 text-xs">{errors.verify}</p>
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

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="text-sm font-medium">
              Mobile Number
            </Label>
            <Input
              id="mobileNumber"
              type="text"
              value={formData.mobileNumber}
              onChange={(e) =>
                setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
              placeholder="Enter Mobile Number"
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
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
