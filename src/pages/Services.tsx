
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeftRight,
  CreditCard,
  FileText,
  Fingerprint,
  Smartphone,
  Wallet,
  Search,
  Landmark,
  Bus,
  BusIcon,
  UploadCloudIcon,
  IndianRupee,
} from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const services = [

    {
      id: "payout",
      title: "SETTLEMENT",
      subtitle: "Instant Settlement",
      icon: Landmark,
      status: "active",
      description: "Send settlement instantly to bank",
      color: "bg-gradient-to-r from-purple-600 to-purple-400",
      category: "Settlement",
      route: "/settlement",
    },
      {
      id: "dmt-1",
      title: "DMT",
      subtitle: "Domestic Money Transfer",
      icon: ArrowLeftRight,
      status: "active",
      description: "Send money across India instantly",
      color: "bg-gradient-to-r from-indigo-600 to-indigo-400",
      category: "Transfer",
      route: "/dmt1",
    },
    {
      
      id: "aeps1",
      title: "AEPS",
      subtitle: "Aadhaar Enabled Payment",
      icon: Fingerprint,
      status: "active",
      description: "Withdraw cash using Aadhaar authentication",
      color: "bg-gradient-to-r from-blue-600 to-blue-400",
      category: "Banking",
      route: "/aeps",
    },
    {
      id: "utilities-bill",
      title: "BBPS",
      subtitle: "Bill Payment Services",
      icon: FileText,
      status: "active",
      description: "Pay electricity, water, gas bills",
      color: "bg-gradient-to-r from-emerald-600 to-emerald-400",
      category: "Bills",
      route: "/utility-payments",
    },
    // {
    //   id: "digi-khata-ppi",
    //   title: "Digi Khata PPI",
    //   subtitle: "Digital Wallet Services",
    //   icon: Wallet,
    //   status: "active",
    //   description: "Prepaid payment instrument services",
    //   color: "bg-gradient-to-r from-cyan-600 to-cyan-400",
    //   category: "Wallet",
    //   route: "/digikatha",
    // },
  
    // {
    //   id: "dmt-2",
    //   title: "DMT-2",
    //   subtitle: "Money Transfer (New)",
    //   icon: ArrowLeftRight,
    //   status: "active",
    //   description: "Transfer using upgraded routing",
    //   color: "bg-gradient-to-r from-indigo-500 to-indigo-300",
    //   category: "Transfer",
    //   route: "/dmt2",
    // },
    {
      id: "mobile-recharge",
      title: "RECHARGE",
      subtitle: "Mobile & DTH Recharge",
      icon: Smartphone,
      status: "active",
      description: "Recharge prepaid and DTH connections",
      color: "bg-gradient-to-r from-orange-500 to-orange-400",
      category: "Recharge",
      route: "/mobile-recharge",
    },
     {
      id: "ticket-booking",
      title: "TICKET BOOKING",
      subtitle: "Flight and Bus Ticket Booking",
      icon: BusIcon,
      status: "active",
      description: "Book flight and bus tickets",
      color: "bg-gradient-to-r from-indigo-600 to-indigo-400",
      category: "Ticket Booking",
      route: "/service",
     },
    {
  id: "upi",
  title: "UPI",
  subtitle: "Universal Payment Interface",
  icon: IndianRupee,
  status: "active",
  description: "Pay for your purchases using UPI",
  color: "bg-gradient-to-r from-purple-600 to-purple-400",
  category: "upi",
  route: "/service",
},

    
  
  ];

  const categories = ["All", ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      (service.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (service.subtitle?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (service.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "All" || selectedCategory === service.category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex w-full font-sans antialiased">
      <AppSidebar />

      <div className="flex-1 flex flex-col">
        <Header walletBalance={0} />

        <main className="flex-1 overflow-auto">

          {/* HERO SECTION */}
          <div className="paybazaar-gradient p-6 sm:p-8 text-white shadow">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold">Our Services</h1>
              <p className="text-white/80 mt-2 text-lg">
                Empower your business with PayBazaar’s financial solutions
              </p>

              <div className="mt-6 flex flex-col md:flex-row gap-4">
                {/* SEARCH */}
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 h-5 w-5" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border border-white/20 text-white placeholder:text-white/60 rounded-xl"
                  />
                </div>

                {/* CATEGORY FILTERS */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category
                          ? "bg-white text-primary rounded-full"
                          : "text-white hover:bg-white/10 rounded-full"
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SERVICES GRID */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  onClick={() => window.location.replace(service.route)}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 rounded-2xl"
                >
                  <CardContent className="p-6 flex flex-col justify-between h-full">

                    {/* Icon */}
                    <div className={`p-4 rounded-xl ${service.color} w-fit shadow-md`}>
                      <service.icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mt-4">{service.title}</h3>
                    <p className="text-sm text-gray-500">{service.subtitle}</p>

                    {/* Description */}
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {service.description}
                    </p>

                  

                    <Button className="w-full mt-4 rounded-full">Use Service</Button>
                  </CardContent>
                </Card>
              ))}

              {filteredServices.length === 0 && (
                <div className="text-center py-12 col-span-full">
                  <div className="text-6xl mb-2">🔍</div>
                  <p className="text-gray-500">No services found</p>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
