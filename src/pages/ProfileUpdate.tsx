import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Camera,
  Save,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface TokenData {
  data: {
    user_id?: string;
    user_name?: string;
    user_email?: string;
    user_phone?: string;
  };
}

export default function ProfileUpdate() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
    user_aadhar_number: "",
    user_pan_number: "",
    user_city: "",
    user_state: "",
    user_address: "",
    user_pincode: "",
    user_date_of_birth: "",
    user_gender: "",
  });

  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profileImage, setProfileImage] = useState(
    "/lovable-uploads/c0876286-fbc5-4e25-b7e8-cb81e868b3fe.png"
  );
  const [isUploading, setIsUploading] = useState(false);

  // Get user_id from token on component mount and fetch profile
  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
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
        setFetchingProfile(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user/get/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.status === "success" && response.data.data?.user) {
          const userData = response.data.data.user;
          
          // Populate form with fetched data
          setFormData({
            user_name: userData.user_name || "",
            user_email: userData.user_email || "",
            user_phone: userData.user_phone || "",
            user_aadhar_number: userData.user_aadhar_number || "",
            user_pan_number: userData.user_pan_number || "",
            user_city: userData.user_city || "",
            user_state: userData.user_state || "",
            user_address: userData.user_address || "",
            user_pincode: userData.user_pincode || "",
            user_date_of_birth: userData.user_date_of_birth || "",
            user_gender: userData.user_gender || "",
          });

          toast({
            title: "Profile Loaded",
            description: "Your profile information has been loaded successfully.",
          });
        } else {
          // toast({
          //   title: "Warning",
          //   description: "Could not load profile data. You can still update your profile.",
          //   variant: "destructive",
          // });
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        
        let errorMessage = "Failed to load profile data. You can still update your profile.";
        
        if (error.response?.status === 401) {
          errorMessage = "Session expired. Please log in again.";
          setTimeout(() => navigate("/login"), 2000);
        } else if (error.response?.status === 404) {
          errorMessage = "Profile not found. You can create a new profile.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        // toast({
        //   title: "Warning",
        //   description: errorMessage,
        //   variant: "destructive",
        // });
      } finally {
        setFetchingProfile(false);
      }
    };

    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded: TokenData = jwtDecode(token);
        if (decoded.data?.user_id) {
          const userIdFromToken = decoded.data.user_id;
          setUserId(userIdFromToken);
          // Fetch profile data
          fetchUserProfile(userIdFromToken);
        } else {
          toast({
            title: "Error",
            description: "User ID not found in token. Please log in again.",
            variant: "destructive",
          });
          navigate("/login");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        toast({
          title: "Error",
          description: "Failed to load user information. Please log in again.",
          variant: "destructive",
        });
        navigate("/login");
      }
    } else {
      toast({
        title: "Authentication Required",
        description: "Please log in to update your profile.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);
        setIsUploading(false);
        toast({
          title: "Profile photo updated",
          description: "Your profile photo has been successfully updated.",
        });
      }, 1500);
    }
  };

  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return "";
    // If already in DD-MM-YYYY format, return as is
    if (dateString.includes("-") && dateString.split("-")[0].length === 2) {
      return dateString;
    }
    // Convert from YYYY-MM-DD to DD-MM-YYYY
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Format date from DD-MM-YYYY to YYYY-MM-DD for input field
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    // If already in YYYY-MM-DD format, return as is
    if (dateString.includes("-") && dateString.split("-")[0].length === 4) {
      return dateString;
    }
    // Convert from DD-MM-YYYY to YYYY-MM-DD
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update your profile.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Prepare payload with correct field names
    const payload = {
      user_id: userId,
      user_name: formData.user_name,
      user_email: formData.user_email,
      user_phone: formData.user_phone,
      user_aadhar_number: formData.user_aadhar_number,
      user_pan_number: formData.user_pan_number,
      user_city: formData.user_city,
      user_state: formData.user_state,
      user_address: formData.user_address,
      user_pincode: formData.user_pincode,
      user_date_of_birth: formatDateForAPI(formData.user_date_of_birth),
      user_gender: formData.user_gender,
    };

    try {
      setLoading(true);

      toast({
        title: "Updating Profile",
        description: "Please wait while we update your profile...",
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/update/profile`,
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
          description: response.data.message || "Profile updated successfully!",
        });
        

        // Optionally refresh the page or navigate back
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        toast({
          title: "Update Failed",
          description: response.data.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      
      let errorMessage = "Failed to update profile. Please try again.";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Invalid data. Please check all fields.";
        } else if (error.response.status === 401) {
          errorMessage = "Session expired. Please log in again.";
          setTimeout(() => navigate("/login"), 2000);
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => navigate("/profile")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Update Profile
            </h1>
          </div>

          {fetchingProfile ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading profile data...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Section */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                      <AvatarImage src={profileImage} alt="Profile" />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {formData.user_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-semibold mb-2">
                      Upload Profile Picture
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Choose a photo that represents you well. JPG, PNG files up
                      to 5MB.
                    </p>

                    <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                      <Button
                        type="button"
                        variant="outline"
                        className="relative overflow-hidden"
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Choose Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setProfileImage("")}
                        disabled={isUploading}
                      >
                        Remove Photo
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_name">Full Name *</Label>
                  <Input
                    id="user_name"
                    value={formData.user_name}
                    onChange={(e) => handleInputChange("user_name", e.target.value)}
                    className="mt-1"
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="user_gender">Gender</Label>
                  <Input
                    id="user_gender"
                    value={formData.user_gender}
                    onChange={(e) =>
                      handleInputChange("user_gender", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Male, Female, Other"
                  />
                </div>

                <div>
                  <Label htmlFor="user_date_of_birth">Date of Birth</Label>
                  <Input
                    id="user_date_of_birth"
                    type="date"
                    value={formatDateForInput(formData.user_date_of_birth)}
                    onChange={(e) => {
                      const formatted = formatDateForAPI(e.target.value);
                      handleInputChange("user_date_of_birth", formatted);
                    }}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_email">Email Address *</Label>
                  <Input
                    id="user_email"
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => handleInputChange("user_email", e.target.value)}
                    className="mt-1"
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="user_phone">Mobile Number *</Label>
                  <Input
                    id="user_phone"
                    value={formData.user_phone}
                    onChange={(e) =>
                      handleInputChange("user_phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className="mt-1"
                    required
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="user_address">Complete Address *</Label>
                  <Textarea
                    id="user_address"
                    value={formData.user_address}
                    onChange={(e) =>
                      handleInputChange("user_address", e.target.value)
                    }
                    className="mt-1"
                    rows={3}
                    required
                    placeholder="Enter your complete address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="user_city">City *</Label>
                    <Input
                      id="user_city"
                      value={formData.user_city}
                      onChange={(e) =>
                        handleInputChange("user_city", e.target.value)
                      }
                      className="mt-1"
                      required
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <Label htmlFor="user_state">State *</Label>
                    <Input
                      id="user_state"
                      value={formData.user_state}
                      onChange={(e) =>
                        handleInputChange("user_state", e.target.value)
                      }
                      className="mt-1"
                      required
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <Label htmlFor="user_pincode">Pin Code *</Label>
                    <Input
                      id="user_pincode"
                      value={formData.user_pincode}
                      onChange={(e) =>
                        handleInputChange("user_pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="mt-1"
                      required
                      placeholder="Enter pincode"
                      maxLength={6}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Verification Documents
                  <Badge
                    variant="secondary"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_pan_number">PAN Number</Label>
                  <Input
                    id="user_pan_number"
                    value={formData.user_pan_number}
                    onChange={(e) =>
                      handleInputChange("user_pan_number", e.target.value.toUpperCase())
                    }
                    className="mt-1"
                    placeholder="Enter PAN number"
                    maxLength={10}
                  />
                </div>

                <div>
                  <Label htmlFor="user_aadhar_number">Aadhaar Number</Label>
                  <Input
                    id="user_aadhar_number"
                    value={formData.user_aadhar_number}
                    onChange={(e) =>
                      handleInputChange("user_aadhar_number", e.target.value.replace(/\D/g, "").slice(0, 12))
                    }
                    className="mt-1"
                    placeholder="Enter Aadhaar number"
                    maxLength={12}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile")}
                className="sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="sm:w-auto paybazaar-gradient text-white"
                disabled={isUploading || loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
          )}
        </main>
      </div>
    </div>
  );
}
