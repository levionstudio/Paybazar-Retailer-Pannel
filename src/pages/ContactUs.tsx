import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowLeft,
  Headphones,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface TokenData {
  data: {
    admin_id: string;
  };
}

const ContactUs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adminId, setAdminId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    mobile: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded: TokenData = jwtDecode(token);
        if (decoded?.data?.admin_id) {
          setAdminId(decoded.data.admin_id);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminId) {
      toast({
        title: "Error",
        description: "Authentication required. Please login again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const payload = {
        admin_id: adminId,
        name: formData.name,
        subject: formData.subject,
        mobile: formData.mobile,
        email: formData.email,
        message: formData.message,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/add/ticket`,
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
          description: response.data.message || "Ticket raised successfully",
        });

        // Reset form
        setFormData({
          name: "",
          subject: "",
          mobile: "",
          email: "",
          message: "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to raise ticket",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <AppSidebar />

      <SidebarInset className="flex-1">
        {/* PAGE HEADER */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-lg font-semibold">Contact Us</h1>
            <p className="text-xs text-muted-foreground">
              Get in touch with our support team
            </p>
          </div>
        </header>

        {/* MAIN PAGE BODY */}
        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* CONTACT DETAILS CARD */}
              <Card className="h-fit">
                <CardHeader className="paybazaar-gradient text-white rounded-t-md border-b border-white/20">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Get in Touch With Us Now!
                  </CardTitle>
                  <CardDescription className="text-slate-200">
                    Reach out to us through any of the following channels
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* SINGLE ROW */}
                  {[
                    {
                      icon: <Phone className="h-5 w-5" />,
                      title: "Phone Number",
                      value: "+91 9319187762",
                    },
                    {
                      icon: <Headphones className="h-5 w-5" />,
                      title: "Onboarding Number",
                      value: "+91 9289174141",
                    },
                    {
                      icon: <Mail className="h-5 w-5" />,
                      title: "Email",
                      value: "info@paybazaar.in",
                    },
                    {
                      icon: <MapPin className="h-5 w-5" />,
                      title: "Location",
                      value: (
                        <>
                          Office No-304, Plot No-2 T/F Netaji Subhash Marg
                          <br />
                          Delhi
                        </>
                      ),
                    },
                    {
                      icon: <Clock className="h-5 w-5" />,
                      title: "Working Hours",
                      value: (
                        <>
                          Monday to Saturday
                          <br />
                          9 AM to 7 PM
                        </>
                      ),
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-muted-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* SUPPORT FORM CARD */}
              <Card className="h-fit">
                <CardHeader className="paybazaar-gradient text-white rounded-t-md border-b border-white/20">
                  <CardTitle>Raise Ticket & Any Query</CardTitle>
                  <CardDescription className="text-slate-200">
                    Fill out the form below and we'll get back to you shortly
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* INPUT FIELDS */}
                    {[
                      { label: "Name", id: "name", type: "text" },
                      { label: "Subject", id: "subject", type: "text" },
                      { label: "Mobile No", id: "mobile", type: "tel" },
                      { label: "Email ID", id: "email", type: "email" },
                    ].map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>{field.label} *</Label>
                        <Input
                          id={field.id}
                          name={field.id}
                          type={field.type}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          value={(formData as any)[field.id]}
                          onChange={handleInputChange}
                          required
                          className="h-11"
                        />
                      </div>
                    ))}

                    {/* MESSAGE FIELD */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Describe your query or issue..."
                        value={formData.message}
                        onChange={handleInputChange}
                        className="min-h-[120px] resize-none"
                        required
                      />
                    </div>

                    {/* SUBMIT BUTTON */}
                    <Button
                      type="submit"
                      className="w-full h-11 paybazaar-gradient text-white hover:opacity-90 font-medium"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  );
};

export default ContactUs;
