import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeftRight,
  CreditCard,
  FileText,     // ✅ Utilities Bill
  Fingerprint,  // ✅ AEPS
  Smartphone,
  Wallet,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");

  const services = [
    {
      id: "aeps",
      title: "AEPS",
      subtitle: "Aadhaar Enabled Payment",
      icon: Fingerprint,
      status: "active" as const,
      description: "Withdraw cash using Aadhaar authentication",
      commission: "₹5-15 per transaction",
      color: "bg-gradient-to-r from-blue-600 to-blue-400", // Corporate Blue
      category: "Banking",
      route: "/aeps",
    },
    {
      id: "utilities-bill",
      title: "UTILITIES BILL",
      subtitle: "Bill Payment Services",
      icon: FileText,
      status: "active" as const,
      description: "Pay electricity, water, gas bills",
      commission: "0.5% - 2% commission",
      color: "bg-gradient-to-r from-emerald-600 to-emerald-400", // Green
      category: "Bills",
      route: "/utility-payments",
    },
    {
      id: "digi-khata-ppi",
      title: "Digi Khata PPI",
      subtitle: "Digital Wallet Services",
      icon: Wallet,
      status: "active" as const,
      description: "Prepaid payment instrument services",
      commission: "₹2-10 per transaction",
      color: "bg-gradient-to-r from-cyan-600 to-cyan-400", // ✅ Changed to bright cyan
      category: "Wallet",
      route: "/digikatha",
    },
    {
      id: "dmt-1",
      title: "DMT-1",
      subtitle: "Domestic Money Transfer",
      icon: ArrowLeftRight,
      status: "active" as const,
      description: "Send money across India instantly",
      commission: "₹10-25 per transaction",
      color: "bg-gradient-to-r from-indigo-600 to-indigo-400", // Indigo
      category: "Transfer",
      route: "/dmt1",
    },
    {
      id: "mobile-recharge",
      title: "MOBILE RECHARGE",
      subtitle: "Mobile & DTH Recharge",
      icon: Smartphone,
      status: "active" as const,
      description: "Prepaid mobile and DTH recharge",
      commission: "1% - 3% commission",
      color: "bg-gradient-to-r from-orange-500 to-orange-400", // ✅ Changed to orange
      category: "Recharge",
    },
  ];

  const categories = [
    "All",
    ...Array.from(new Set(services.map((s) => s.category))),
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex w-full font-sans antialiased">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-auto">
          {/* Hero Section */}
          <div className="paybazaar-gradient p-6 sm:p-8 text-white shadow">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold">Our Services</h1>
              <p className="text-white/80 mt-2 text-base sm:text-lg">
                Empower your business with PayBazaar’s financial solutions
              </p>
              <div className="mt-6 flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border border-white/20 text-white placeholder:text-white/70 rounded-xl"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category
                          ? "bg-white text-primary rounded-full"
                          : "text-white hover:bg-white/10  rounded-full"
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="group hover:shadow-xl border border-gray-100 transition-all duration-300 rounded-2xl h-full flex flex-col"
                >
                  <CardContent className="p-4 sm:p-6 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Icon with solid background */}
                      <div
                        className={`p-3 sm:p-4 rounded-xl ${service.color} shadow-md w-fit mb-4`}
                      >
                        <service.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>

                      <h3 className="font-semibold text-lg sm:text-xl text-gray-900 line-clamp-1">
                        {service.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
                        {service.subtitle}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 mt-2">
                        {service.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs sm:text-sm border-t pt-3">
                        <span className="text-gray-500">Commission:</span>
                        <span className="font-semibold text-green-600">
                          {service.commission}
                        </span>
                      </div>

                      <Button
                        className="w-full mt-3 sm:mt-4 rounded-full"
                        size="sm"
                        onClick={() =>
                          window.location.replace(`${service.route}`)
                        }
                      >
                        Use Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">
                    No services found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
