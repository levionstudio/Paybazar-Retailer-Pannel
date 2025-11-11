import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  icon: LucideIcon;
  status: "active" | "inactive" | "maintenance";
  description: string;
  stats: {
    label: string;
    value: string;
  }[];
  onManage?: () => void;
}

export function ServiceCard({
  title,
  icon: Icon,
  status,
  description,
  stats,
  onManage,
}: ServiceCardProps) {
  const statusConfig = {
    active: {
      badge: "bg-success text-success-foreground",
      text: "Active",
    },
    inactive: {
      badge: "bg-destructive text-destructive-foreground",
      text: "Inactive",
    },
    maintenance: {
      badge: "bg-warning text-warning-foreground",
      text: "Maintenance",
    },
  };

  return (
    <Card className="finance-card group ">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {onManage && (
          <Button
            variant="outline"
            size="sm"
            onClick={onManage}
            className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Manage Service
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
