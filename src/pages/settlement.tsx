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
import { ArrowLeft, Eye, CheckCircle2, Trash2 } from "lucide-react";
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
            <Dialog open={showLoginDialog} onOpenChange={() => {}}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    Payout User Login
                  </DialogTitle>
                  <DialogDescription>
                    Please enter your credentials to access payout services
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Phone Number (Without +91)</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                   
                      onChange={(e) => setPayoutPhoneNumber(e.target.value)}
                      placeholder="Enter Phone Number"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleLogin}
                    className="w-full paybazaar-gradient text-white"
                  >
                    Login
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            <div className="bg-card rounded-lg border border-border shadow-sm">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <Select defaultValue="10">
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">entries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Search:</span>
                    <Input className="w-48 h-8" placeholder="Search..." />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-center">BENEFICIARY NAME</TableHead>
                      <TableHead className="font-semibold text-center">BANK NAME</TableHead>
                      <TableHead className="font-semibold text-center">IFSC</TableHead>
                      <TableHead className="font-semibold text-center">ACCOUNT NUMBER</TableHead>
                      <TableHead className="font-semibold text-center">MOBILE NUMBER</TableHead>
                      <TableHead className="font-semibold text-center">PAY</TableHead>
                      <TableHead className="font-semibold text-center">VERIFY</TableHead>
                      <TableHead className="font-semibold text-center">DELETE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beneficiaries.map((beneficiary) => (
                      <TableRow key={beneficiary.id}>
                        <TableCell className="text-center">{beneficiary.beneficiaryName}</TableCell>
                        <TableCell className="text-center">{beneficiary.bankName}</TableCell>
                        <TableCell className="text-center">{beneficiary.ifsc}</TableCell>
                        <TableCell className="text-center">{beneficiary.accountNumber}</TableCell>
                        <TableCell className="text-center">{beneficiary.mobileNumber}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => handlePayClick(beneficiary)}
                            className="bg-foreground text-background hover:bg-foreground/90"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          {beneficiary.isVerified ? (
                            <Button
                              size="sm"
                              disabled
                              className="bg-green-600 text-white cursor-not-allowed"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Verified
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleVerify(beneficiary.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(beneficiary.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

