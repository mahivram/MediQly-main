import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface HealthMetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  trendDirection?: "up" | "down" | "neutral";
}

export function HealthMetricCard({
  title,
  value,
  trend,
  icon: Icon,
  trendDirection,
}: HealthMetricCardProps) {
  const getTrendColor = () => {
    switch (trendDirection) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-1">{value}</h3>
          {trend && (
            <p className={`text-sm mt-1 ${getTrendColor()}`}>{trend}</p>
          )}
        </div>
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </Card>
  );
}
