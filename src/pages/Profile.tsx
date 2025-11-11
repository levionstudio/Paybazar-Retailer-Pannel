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

export default function Profile() {
  const navigate = useNavigate();

  const userInfo = {
    name: "Lokesh Kumar",
    userId: "RT6170",
    kycStatus: "VERIFIED",
    avatar: "/lovable-uploads/c0876286-fbc5-4e25-b7e8-cb81e868b3fe.png",
    presentShop: "LOKESH TELICOM",
    mobileNo: "9205008239",
    email: "LOKESHHCL@GMAIL.COM",
    lastName: "KUMAR",
    dateOfBirth: "15/03/1992",
    gender: "MALE",
    aadhaarNumber: "225917326264",
    panNumber: "KEYPS8635K",
    city: "ALWAR",
    state: "RAJASTHAN",
    pinCode: "321605",
    address: "KARANPURA, POST - TASAI, KATHUMAR, ALWAR(RAJ.)",
  };

  const infoSections = [
    {
      title: "Contact Information",
      icon: Phone,
      items: [
        { label: "Present Shop", value: userInfo.presentShop, icon: Building2 },
        { label: "Mobile No", value: userInfo.mobileNo, icon: Phone },
        { label: "Email", value: userInfo.email, icon: Mail },
      ],
    },
    {
      title: "Personal Details",
      icon: Calendar,
      items: [
        { label: "Last Name", value: userInfo.lastName },
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
                <Button variant="outline" className="justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update KYC
                </Button>
                <Button variant="outline" className="justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
