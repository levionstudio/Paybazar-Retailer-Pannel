import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeftRight,
  FileText,
  Fingerprint,
  Smartphone,
  Wallet,
  Landmark,
} from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function Services() {
  const services = [
    {
      id: "aeps1",
      title: "AEPS",
      icon: Fingerprint,
      route: "/aeps",
    },
    {
      id: "aeps2",
      title: "AEPS-2",
      icon: Fingerprint,
      route: "/aeps2",
    },
    {
      id: "utilities-bill",
      title: "UTILITIES BILL",
      icon: FileText,
      route: "/utility-payments",
    },
    {
      id: "digi-khata-ppi",
      title: "Digi Khata PPI",
      icon: Wallet,
      route: "/digikatha",
    },
    {
      id: "dmt-1",
      title: "DMT-1",
      icon: ArrowLeftRight,
      route: "/dmt1",
    },
    {
      id: "dmt-2",
      title: "DMT-2",
      icon: ArrowLeftRight,
      route: "/dmt2",
    },
    {
      id: "mobile-recharge",
      title: "MOBILE RECHARGE",
      icon: Smartphone,
      route: "/mobile-recharge",
    },
    {
      id: "payout",
      title: "PAYOUT",
      icon: Landmark,
      route: "/settlement",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header walletBalance={0} />

        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-foreground mb-6">Our Services</h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="group cursor-pointer border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 rounded-lg bg-card"
                  onClick={() => service.route && window.location.replace(service.route)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-3 min-h-[120px]">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-sm font-medium text-foreground text-center leading-tight">
                      {service.title}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
