"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

import {
  CreditCard,
  Clock,
  Headphones,
  Building2,
  Mail,
  Phone,
  MapPin,
  Link,
} from "lucide-react";

const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^(\+91|0)?[6-9]\d{9}$/, "Invalid phone number")
    .min(10, "Phone number must be at least 10 digits"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(4, "OTP must be 4 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSendOtp = async (data: PhoneFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://server.paybazaar.in/user/login/send/otp",
        { user_phone: data.phone }
      );

      if (response.data.status === "success") {
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the OTP.",
        });
        setPhone(data.phone);
        setStep("otp");
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      toast({
        title: "Error sending OTP",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResendOtp = async () => {
    if (!phone) {
      toast({
        title: "Error",
        description:
          "Phone number not found. Please go back and enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsResendingOtp(true);
    try {
      const response = await axios.post(
        "https://server.paybazaar.in/user/login/send/otp",
        { user_phone: phone }
      );

      if (response.data.status === "success") {
        toast({
          title: "OTP Resent",
          description: "Please check your phone for the new OTP.",
        });
      } else {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      toast({
        title: "Error Resending OTP",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResendingOtp(false);
    }
  };

  const onVerifyOtp = async (data: OtpFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://server.paybazaar.in/user/login/validate/otp",
        {
          user_phone: phone,
          user_otp: data.otp,
        }
      );

      if (response.data.status === "success") {
        const token = response.data.data?.token;
        if (token) localStorage.setItem("authToken", token);

        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        });

        navigate("/dashboard");
      } else {
        throw new Error(response.data.message || "Invalid OTP");
      }
    } catch (error: any) {
      toast({
        title: "OTP Verification Failed",
        description: error.response?.data?.message || "Please check your OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 relative">
      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-col justify-center items-center bg-[#0d3154] px-12 py-16 text-white gap-8">
        <div className="flex flex-col items-center max-w-lg text-center space-y-6">
          <img
            src="/login-page.png"
            alt="PayBazaar Illustration"
            className="w-56 h-52 object-contain drop-shadow-lg"
          />
          <h2 className="text-3xl font-extrabold tracking-wide leading-tight">
            PayBazaar: Secure & Reliable Payments
          </h2>
          <p className="text-slate-200 text-sm leading-relaxed max-w-md">
            PAYBAZAAR empowers inclusive financial growth through technology,
            reaching every corner of the nation.
          </p>

          <ul className="flex justify-center gap-10 text-xs text-slate-200 mt-4">
            <li className="flex items-center gap-2 font-semibold">
              <Clock className="w-5 h-5 text-white" /> 1-hour settlements
            </li>
            <li className="flex items-center gap-2 font-semibold">
              <Headphones className="w-5 h-5 text-white" /> 24/7 Support
            </li>
          </ul>

          <Card className="w-full shadow-xl border-0 rounded-2xl bg-white backdrop-blur-lg  border-white/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0d3154] flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#0d3154]" /> Company Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-700">
              <p className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#0d3154]" /> info@paybazaar.in
              </p>
              <p className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#0d3154]" /> +91 9319187762
              </p>
              <div className="flex items-start ">
                <MapPin className="w-5 h-5 text-[#0d3154] mt-1" />
                <span className="text-xs text-slate-700 leading-relaxed">
                  Unit 902, Tower B4 on 9th Spaze I-Tech Park, Sector-49, Sohna
                  Road, Gurugram, Haryana, 122018.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-center items-center px-10 lg:px-20 bg-white min-h-screen overflow-auto">
        <div className="w-full max-w-md space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-[#0d3154] to-blue-900 rounded-3xl shadow-2xl">
              <CreditCard className="w-10 h-10 text-white drop-shadow" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-wide">
              Welcome to PayBazaar!
            </h1>
            <p className="text-slate-600 text-base font-medium">
              {step === "phone"
                ? "Enter your phone number to receive OTP"
                : "Enter OTP to verify"}
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-3xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold text-[#0d3154] tracking-tight">
                {step === "phone" ? "Sign In" : "Verify OTP"}
              </CardTitle>
              <CardDescription className="text-slate-600 text-base font-medium">
                {step === "phone"
                  ? "We’ll send you an OTP to login"
                  : "Check your SMS for the OTP"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === "phone" ? (
                <form
                  onSubmit={handleSubmitPhone(onSendOtp)}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <Label
                      htmlFor="phone"
                      className="text-md font-semibold text-slate-800"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      {...registerPhone("phone")}
                      className="h-14 bg-slate-50 border border-slate-300 rounded-xl focus:border-[#0d3154] focus:ring-[#0d3154]/50 text-lg"
                      disabled={isLoading}
                    />
                    {phoneErrors.phone && (
                      <p className="text-sm text-destructive">
                        {phoneErrors.phone.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-gradient-to-r from-[#0d3154] to-blue-900 text-white font-semibold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity duration-300"
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={handleSubmitOtp(onVerifyOtp)}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <Label
                      htmlFor="otp"
                      className="text-md font-semibold text-slate-800"
                    >
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Enter OTP"
                      maxLength={4}
                      {...registerOtp("otp")}
                      className="h-14 bg-slate-50 border border-slate-300 rounded-xl focus:border-[#0d3154] focus:ring-[#0d3154]/50 text-lg text-center tracking-widest"
                      disabled={isLoading}
                    />
                    {otpErrors.otp && (
                      <p className="text-sm text-destructive">
                        {otpErrors.otp.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={isLoading || isResendingOtp}
                      className="w-full h-14 bg-gradient-to-r from-[#0d3154] to-blue-900 text-white font-semibold text-lg rounded-xl shadow-lg hover:opacity-90 transition-opacity duration-300"
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>

                    <div className="flex items-center justify-center gap-2">
                      <p className="text-sm text-slate-600">
                        Didn't receive OTP?
                      </p>
                      <Button
                        type="button"
                        variant="link"
                        onClick={onResendOtp}
                        disabled={isLoading || isResendingOtp}
                        className="text-sm text-[#0d3154] font-semibold hover:underline p-0 h-auto"
                      >
                        {isResendingOtp ? "Resending..." : "Resend OTP"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Footer Credit */}
          <div className="text-center mt-8">
            <p className="text-xs text-slate-500">
              Designed and developed by{" "}
              <a href="https://gvinfotech.org/" target="_blank"  className="font-semibold text-slate-700">GV Infotech</a>
            </p>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
