import { useState, useEffect } from "react";
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
import { ArrowLeft, Eye, CheckCircle2, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddBeneficiaryDialog } from "@/components/dialogs/AddBeneficiaryDialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Beneficiary {
  id: string;
  beneficiaryName: string;
  bankName: string;
  ifsc: string;
  accountNumber: string;
  mobileNumber: string;
  isVerified: boolean;
}

// Bank to IFSC mapping (sample data - you can expand this)
const bankToIFSC: Record<string, string> = {
  "State Bank of India": "SBIN0000001",
  "HDFC Bank": "HDFC0000001",
  "ICICI Bank": "ICIC0000001",
  "Punjab National Bank": "PUNB0000001",
  "Bank of Baroda": "BARB0XXXXXX",
  "Canara Bank": "CNRB0000001",
  "Union Bank of India": "UBIN0543560",
  "Axis Bank": "UTIB0000001",
  "Kotak Mahindra Bank": "KKBK0000958",
  "IndusInd Bank": "INDB0000001",
  "IDFC FIRST Bank": "IDFB0000001",
  "IDFC Bank Limited": "IDFB0000001",
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

export default function Settlement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLoginDialog, setShowLoginDialog] = useState(true);
  const [payoutPhoneNumber, setPayoutPhoneNumber] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    {
      id: "1",
      beneficiaryName: "SRUJAN KM",
      bankName: "UNION BANK OF INDIA",
      ifsc: "UBIN0000001",
      accountNumber: "10248252306",
      mobileNumber: "8240285939",
      isVerified: true,
    },
  
  ]);

  const [payFormData, setPayFormData] = useState({
    transactionType: "",
    amount: "",
    mpin: "",
  });

  const handleLogin = async () => {
    if (!payoutPhoneNumber) {
      toast({
        title: "Error",
        description: "Please enter both Phone Number",
        variant: "destructive",
      });
      return;
    }

    try {
      // Replace with actual API call
      // const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payout/login`, {
      //   user_id: payoutUserId,
      //   password: payoutPassword,
      // });

      // For now, simulate successful login
      setIsAuthenticated(true);
      setShowLoginDialog(false);
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

  const handleAddBeneficiary = (beneficiaryData: {
    bank: string;
    ifsc: string;
    accountNumber: string;
    beneficiaryName: string;
    mobileNumber: string;
  }) => {
    const newBeneficiary: Beneficiary = {
      id: Date.now().toString(),
      beneficiaryName: beneficiaryData.beneficiaryName,
      bankName: beneficiaryData.bank,
      ifsc: beneficiaryData.ifsc,
      accountNumber: beneficiaryData.accountNumber,
      mobileNumber: beneficiaryData.mobileNumber,
      isVerified: false,
    };
    setBeneficiaries([...beneficiaries, newBeneficiary]);
    toast({
      title: "Success",
      description: "Beneficiary added successfully",
    });
  };

  const handleVerify = async (id: string) => {
    setBeneficiaries(
      beneficiaries.map((b) =>
        b.id === id ? { ...b, isVerified: true } : b
      )
    );
    toast({
      title: "Success",
      description: "Beneficiary verified successfully",
    });
  };

  const handleDelete = (id: string) => {
    setBeneficiaries(beneficiaries.filter((b) => b.id !== id));
    toast({
      title: "Success",
      description: "Beneficiary deleted successfully",
    });
  };

  const handlePayClick = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setPayFormData({
      transactionType: "",
      amount: "",
      mpin: "",
    });
    setShowPayDialog(true);
  };

  const handlePaySubmit = async () => {
    if (!selectedBeneficiary) return;

    if (!payFormData.transactionType || !payFormData.amount || !payFormData.mpin) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Replace with actual API call
      // const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payout/transfer`, {
      //   beneficiary_id: selectedBeneficiary.id,
      //   transaction_type: payFormData.transactionType,
      //   amount: payFormData.amount,
      //   mpin: payFormData.mpin,
      // });

      toast({
        title: "Success",
        description: "Payout request submitted successfully",
      });

      setShowPayDialog(false);
      setPayFormData({
        transactionType: "",
        amount: "",
        mpin: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Payout failed",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header walletBalance={0} />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <div className="paybazaar-gradient rounded-lg p-6 text-white mb-6">
                <h1 className="text-2xl font-bold">Remitter Login</h1>
                <p className="text-white/90 mt-1">Enter your phone number to access payout services</p>
              </div>
              <div className="bg-card rounded-lg border border-border shadow-lg p-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                      Mobile Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={payoutPhoneNumber}
                        onChange={(e) => setPayoutPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
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
    <div className="flex min-h-screen bg-background">
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
                <h1 className="text-2xl font-bold">Settlement (PayOut)</h1>
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
                    <span className="text-sm text-white font-medium">entries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white font-medium">Search:</span>
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
                        <TableHead className="font-bold text-white text-center w-[180px] min-w-[180px]">BENEFICIARY NAME</TableHead>
                        <TableHead className="font-bold text-white text-center w-[180px] min-w-[180px]">BANK NAME</TableHead>
                        <TableHead className="font-bold text-white text-center w-[140px] min-w-[140px]">IFSC</TableHead>
                        <TableHead className="font-bold text-white text-center w-[180px] min-w-[180px]">ACCOUNT NUMBER</TableHead>
                        <TableHead className="font-bold text-white text-center w-[150px] min-w-[150px]">MOBILE NUMBER</TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">PAY</TableHead>
                        <TableHead className="font-bold text-white text-center w-[130px] min-w-[130px]">VERIFY</TableHead>
                        <TableHead className="font-bold text-white text-center w-[120px] min-w-[120px]">DELETE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {beneficiaries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-16">
                            <div className="flex flex-col items-center justify-center">
                              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                                <Eye className="h-10 w-10 text-muted-foreground" />
                              </div>
                              <p className="text-lg font-semibold text-foreground mb-2">No beneficiaries found</p>
                              <p className="text-sm text-muted-foreground">Click "+ Add Bene" to add a new beneficiary</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        beneficiaries.map((beneficiary, index) => (
                          <TableRow 
                            key={beneficiary.id}
                            className={`hover:bg-muted/50 transition-colors ${
                              index % 2 === 0 ? "bg-background" : "bg-muted/20"
                            }`}
                          >
                            <TableCell className="text-center font-medium py-4">{beneficiary.beneficiaryName}</TableCell>
                            <TableCell className="text-center py-4">{beneficiary.bankName}</TableCell>
                            <TableCell className="text-center py-4 font-mono text-sm">{beneficiary.ifsc}</TableCell>
                            <TableCell className="text-center py-4 font-mono text-sm">{beneficiary.accountNumber}</TableCell>
                            <TableCell className="text-center py-4 font-mono">{beneficiary.mobileNumber}</TableCell>
                            <TableCell className="text-center py-4">
                              <Button
                                size="sm"
                                onClick={() => handlePayClick(beneficiary)}
                                className="paybazaar-gradient text-white hover:opacity-90 shadow-md"
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
                                  onClick={() => handleVerify(beneficiary.id)}
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
                                onClick={() => handleDelete(beneficiary.id)}
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
        bankToIFSC={bankToIFSC}
      />

      {/* Pay Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Payout Transaction</DialogTitle>
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
                    <span className="text-muted-foreground">Beneficiary Name:</span>
                    <p className="font-medium">{selectedBeneficiary.beneficiaryName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bank Name:</span>
                    <p className="font-medium">{selectedBeneficiary.bankName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IFSC:</span>
                    <p className="font-medium">{selectedBeneficiary.ifsc}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Number:</span>
                    <p className="font-medium">{selectedBeneficiary.accountNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Mobile Number:</span>
                    <p className="font-medium">{selectedBeneficiary.mobileNumber}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Type */}
              <div className="space-y-2">
                <Label htmlFor="transactionType">Transaction Type *</Label>
                <Select
                  value={payFormData.transactionType}
                  onValueChange={(value) =>
                    setPayFormData({ ...payFormData, transactionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Transaction Type" />
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
                />
              </div>

              {/* MPIN */}
              <div className="space-y-2">
                <Label htmlFor="mpin">MPIN *</Label>
                <Input
                  id="mpin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={payFormData.mpin}
                  onChange={(e) =>
                    setPayFormData({ ...payFormData, mpin: e.target.value.replace(/\D/g, "") })
                  }
                  placeholder="Enter 4-digit MPIN"
                  className="text-center tracking-[0.5em]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPayDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaySubmit}
              className="paybazaar-gradient text-white"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

