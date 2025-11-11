import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ServiceCard } from "@/components/dashboard/ServiceCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  ArrowLeftRight,
  Receipt,
  Smartphone,
  Shield,
  Wallet,
  Landmark,
  Banknote,
  Building2,
  Activity,
  Users,
  IndianRupee,
} from "lucide-react";
import { TransactionsTable } from "@/components/dashboard/TransactionTable";

export default function Dashboard() {
  const services = [
    {
      title: "Money Transfer",
      icon: ArrowLeftRight,
      status: "active" as const,
      description: "Send money instantly to any bank account",
      stats: [{ label: "Today", value: "₹0.00" }],
    },
    {
      title: "Mobile Recharge",
      icon: Smartphone,
      status: "active" as const,
      description: "Recharge prepaid mobiles and DTH connections",
      stats: [{ label: "Today", value: "₹0.00" }],
    },
    {
      title: "AePS",
      icon: Shield,
      status: "active" as const,
      description: "Aadhaar Enabled Payment Services",
      stats: [{ label: "Today", value: "₹0.00" }],
    },
    {
      title: "Bill Payments",
      icon: Receipt,
      status: "active" as const,
      description: "Pay electricity, water, gas and other bills",
      stats: [{ label: "Today", value: "₹0.00" }],
    },
    {
      title: "Cash Deposit",
      icon: Banknote,
      status: "active" as const,
      description: "Deposit cash directly into bank accounts",
      stats: [{ label: "Today", value: "₹0.00" }],
    },
    {
      title: "AePS Settlement",
      icon: Landmark,
      status: "active" as const,
      description: "Settle AePS transactions securely",
      stats: [{ label: "Today", value: "₹0.00" }],
    },
    {
      title: "Move to Bank",
      icon: Building2,
      status: "active" as const,
      description: "Transfer wallet balance to bank account",
      stats: [{ label: "Today", value: "₹0.00" }],
    },
    {
      title: "Wallet Management",
      icon: Wallet,
      status: "active" as const,
      description: "Manage and track digital wallet balance",
      stats: [{ label: "Balance", value: "₹25,000" }],
    },
  ];

  const stats = [
    {
      title: "Total Revenue",
      value: "₹2,45,680",
      change: { type: "positive" as const },
      icon: IndianRupee,
    },
    {
      title: "Total Transactions",
      value: "1,234",
      change: { type: "positive" as const },
      icon: Activity,
    },
    {
      title: "Active Users",
      value: "892",
      change: { type: "positive" as const },
      icon: Users,
    },
    {
      title: "Commission Earned",
      value: "₹12,340",
      change: { type: "positive" as const },
      icon: Wallet,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Welcome Section */}
          <div className="paybazaar-gradient rounded-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Welcome back, John!</h1>
            <p className="text-white/90">
              Here's your business overview for today. You've processed ₹93,270
              in transactions.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Services Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <ServiceCard
                  key={index}
                  {...service}
                  onManage={() => console.log(`Managing ${service.title}`)}
                />
              ))}
            </div>
          </div>

          <TransactionsTable />
        </main>
      </div>
    </div>
  );
}