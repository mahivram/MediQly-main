import { Link, useLocation } from "react-router-dom";
import { Home, User, Calendar, Activity, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: Activity, label: "Health", path: "/preventive-health" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function Navigation() {
  const location = useLocation();
  const isMobile = useIsMobile();
  useEffect(() => {
    console.log("hello");
  }, []);
  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background p-2">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-primary",
              location.pathname === item.path && "text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="mt-1 text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
