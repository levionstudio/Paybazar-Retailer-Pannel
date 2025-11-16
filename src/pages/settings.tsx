import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";

const ChangePasswordMpin = () => {
  const { toast } = useToast();

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [id, setId] = useState("");

  // MPIN form state
  const [mpinForm, setMpinForm] = useState({
    oldMpin: "",
    newMpin: "",
    confirmMpin: "",
  });
  const [showOldMpin, setShowOldMpin] = useState(false);
  const [showNewMpin, setShowNewMpin] = useState(false);
  const [showConfirmMpin, setShowConfirmMpin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const decoded: JwtPayload = jwtDecode(token);
      //@ts-ignore
      setId(decoded.data.user_id);
    } catch (error) {
      console.error("Error decoding JWT:", error);
    }
  }, []);

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await axios.post('API_ENDPOINT', passwordForm);

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    }
  };

  // Handle MPIN Change
  const handleMpinChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mpinForm.newMpin !== mpinForm.confirmMpin) {
      toast({
        title: "Error",
        description: "New MPIN and confirm MPIN do not match",
        variant: "destructive",
      });
      return;
    }

    if (mpinForm.newMpin.length !== 4 || !/^\d+$/.test(mpinForm.newMpin)) {
      toast({
        title: "Error",
        description: "MPIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Replace with actual API call
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/verify/mpin`,
        {
          mpin: mpinForm.oldMpin,
          user_id: id,
        }
      );

      if (response.status === 200) {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/user/set/mpin`,
          {
            mpin: mpinForm.newMpin,
            user_id: id,
          }
        );
        if (res.status === 200) {
          toast({
            title: "Success",
            description: "MPIN changed successfully",
          });
          setMpinForm({
            oldMpin: "",
            newMpin: "",
            confirmMpin: "",
          });
        }
      }else{
        throw new Error("Failed to change MPIN");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change MPIN",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Security Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Change your password and MPIN for enhanced security
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change Password Card */}
              {/* <Card className="shadow-lg">
                <CardHeader className="paybazaar-gradient text-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    Change Password
                  </CardTitle>
                  <p className="text-sm text-blue-50 mt-1">
                    Update your account password
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="oldPassword"
                        className="text-sm font-medium"
                      >
                        Old Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="oldPassword"
                          type={showOldPassword ? "text" : "password"}
                          placeholder="Enter old password"
                          value={passwordForm.oldPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              oldPassword: e.target.value,
                            })
                          }
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showOldPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-sm font-medium"
                      >
                        New Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium"
                      >
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full paybazaar-gradient text-white"
                      size="lg"
                    >
                      Change Password
                    </Button>
                  </form>
                </CardContent>
              </Card> */}

              <Card className="shadow-lg">
                <CardHeader className="paybazaar-gradient text-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    Change MPIN
                  </CardTitle>
                  <p className="text-sm text-teal-50 mt-1">
                    Update your 4-digit MPIN
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleMpinChange} className="space-y-4">
                    {/* Old MPIN */}
                    <div className="space-y-2">
                      <Label htmlFor="oldMpin" className="text-sm font-medium">
                        Old MPIN <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="oldMpin"
                          type={showOldMpin ? "text" : "password"}
                          placeholder="Enter old MPIN"
                          value={mpinForm.oldMpin}
                          onChange={(e) =>
                            setMpinForm({
                              ...mpinForm,
                              oldMpin: e.target.value,
                            })
                          }
                          maxLength={4}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldMpin(!showOldMpin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showOldMpin ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newMpin" className="text-sm font-medium">
                        New MPIN <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="newMpin"
                          type={showNewMpin ? "text" : "password"}
                          placeholder="Enter new MPIN"
                          value={mpinForm.newMpin}
                          onChange={(e) =>
                            setMpinForm({
                              ...mpinForm,
                              newMpin: e.target.value,
                            })
                          }
                          maxLength={4}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewMpin(!showNewMpin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewMpin ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm MPIN */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmMpin"
                        className="text-sm font-medium"
                      >
                        Confirm MPIN <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmMpin"
                          type={showConfirmMpin ? "text" : "password"}
                          placeholder="Confirm new MPIN"
                          value={mpinForm.confirmMpin}
                          onChange={(e) =>
                            setMpinForm({
                              ...mpinForm,
                              confirmMpin: e.target.value,
                            })
                          }
                          maxLength={4}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmMpin(!showConfirmMpin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmMpin ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full paybazaar-gradient hover:bg-paybazaar-gradient/80 text-white"
                      size="lg"
                    >
                      Change MPIN
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordMpin;
