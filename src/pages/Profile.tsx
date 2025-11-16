import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useToast } from "@/hooks/use-toast";

interface TokenData {
  data: {
    user_id?: string;
  };
}

interface UserProfile {
  user_id: string;
  user_unique_id?: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_aadhar_number: string;
  user_pan_number: string;
  user_city: string;
  user_state: string;
  user_address: string;
  user_pincode: string;
  user_date_of_birth: string;
  user_gender: string;
  user_kyc_status: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userInfo, setUserInfo] = useState({
    name: "",
    userId: "",
    kycStatus: "NOT VERIFIED",
    avatar: "/lovable-uploads/c0876286-fbc5-4e25-b7e8-cb81e868b3fe.png",
    presentShop: "",
    mobileNo: "",
    email: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    aadhaarNumber: "",
    panNumber: "",
    city: "",
    state: "",
    pinCode: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);

  // Format date from DD-MM-YYYY to DD/MM/YYYY for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    return dateString.replace(/-/g, "/");
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your profile.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        // Get user_id from token
        const decoded: TokenData = jwtDecode(token);
        if (!decoded.data?.user_id) {
          toast({
            title: "Error",
            description: "User ID not found. Please log in again.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user/get/profile/${
            decoded.data.user_id
          }`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.status === "success" && response.data.data?.user) {
          const userData: UserProfile = response.data.data.user;

          // Map API data to display format
          setUserInfo({
            name: userData.user_name || "",
            userId: userData.user_unique_id || userData.user_id || "",
            kycStatus: userData.user_kyc_status ? "VERIFIED" : "NOT VERIFIED",
            avatar: "/lovable-uploads/c0876286-fbc5-4e25-b7e8-cb81e868b3fe.png",
            presentShop: "", // Not available in API
            mobileNo: userData.user_phone || "",
            email: userData.user_email || "",
            lastName: "", // Not available separately in API
            dateOfBirth: formatDateForDisplay(
              userData.user_date_of_birth || ""
            ),
            gender: userData.user_gender || "",
            aadhaarNumber: userData.user_aadhar_number || "",
            panNumber: userData.user_pan_number || "",
            city: userData.user_city || "",
            state: userData.user_state || "",
            pinCode: userData.user_pincode || "",
            address: userData.user_address || "",
          });
        } 
      } catch (error: any) {
        window.location.href = "/profile/update";

        console.error("Error fetching profile:", error);

        let errorMessage = "Failed to load profile data.";

        if (error.response?.status === 401) {
          errorMessage = "Session expired. Please log in again.";
          setTimeout(() => navigate("/login"), 2000);
        } else if (error.response?.status === 404) {
          errorMessage = "Profile not found.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        // toast({
        //   title: "Error",
        //   description: errorMessage,
        //   variant: "destructive",
        // });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, toast]);

  const infoSections = [
    {
      title: "Contact Information",
      icon: Phone,
      items: [
        { label: "Mobile No", value: userInfo.mobileNo, icon: Phone },
        { label: "Email", value: userInfo.email, icon: Mail },
      ],
    },
    {
      title: "Personal Details",
      icon: Calendar,
      items: [
        { label: "Date of Birth", value: userInfo.dateOfBirth, icon: Calendar },
        { label: "Gender", value: userInfo.gender },
      ],
    },
    {
      title: "Verification Details",
      icon: CreditCard,
      items: [
        {
          label: "Aadhaar Number",
          value: userInfo.aadhaarNumber,
          icon: CreditCard,
        },
        { label: "PAN Number", value: userInfo.panNumber, icon: CreditCard },
        { label: "KYC Status", value: userInfo.kycStatus, isStatus: true },
      ],
    },
    {
      title: "Address Information",
      icon: MapPin,
      items: [
        { label: "City", value: userInfo.city, icon: MapPin },
        { label: "State", value: userInfo.state },
        { label: "Pin Code", value: userInfo.pinCode },
        { label: "Address", value: userInfo.address, fullWidth: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Profile Overview
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading profile data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Hero Section */}
              <Card className="paybazaar-gradient border-0">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <Avatar className="h-24 w-24 ring-4 ring-white/20">
                      <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                      <AvatarFallback className="text-2xl bg-white/10 text-white">
                        {userInfo.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          {userInfo.name}
                        </h2>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-white/90 text-lg">
                            {userInfo.userId}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-green-500/20 text-green-100 border-green-400/30 hover:bg-green-500/30"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {userInfo.kycStatus}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        onClick={() => navigate("/profile/update")}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Information Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {infoSections.map((section, sectionIndex) => (
                  <Card
                    key={sectionIndex}
                    className="hover:shadow-lg transition-shadow duration-200"
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <section.icon className="h-5 w-5 text-primary" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className={`${item.fullWidth ? "col-span-full" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            {item.icon && (
                              <item.icon className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {item.label}
                              </p>
                              {item.isStatus ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {item.value}
                                </Badge>
                              ) : (
                                <p className="text-sm text-foreground font-medium break-words">
                                  {item.value}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => navigate("/profile/update")}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Update KYC
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
