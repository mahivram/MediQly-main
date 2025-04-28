import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  AlignCenterVertical,
  Calendar,
  HeartPulse,
  Home,
  LineChart,
  MessageSquare,
  Pill,
  Shield,
  Bot,
  Menu,
  X,
  Video,
  BookA,
  Shapes,
  Users,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  {
    icon: AlignCenterVertical,
    label: "Health Tracker",
    path: "/health-tracker",
  },
  { icon: HeartPulse, label: "Preventive Health", path: "/preventive-health" },
  { icon: Shield, label: "Insurance", path: "/insurance" },
  { icon: Activity, label: "Symptoms", path: "/symptoms" },
  { icon: Users, label: "Consultation", path: "/consultation" },
  { icon: Pill, label: "Medicine", path: "/medicine" },
  { icon: Video, label: "Feed", path: "/feed" },
  { icon: BookA, label: "Report", path: "/report" },
  { icon: Shapes, label: "Diet", path: "/diet" },
  { icon: AlertCircle, label: "Emergency", path: "/emergency" },
  { icon: Bot, label: "AI Doctor", path: "/ai-doctor" },
];

export function Sidebar() {
  const location = useLocation();
  const [toggleState, setToggleState] = useState(true);

  // Function to toggle sidebar using CSS class
  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("sidebar-open");
    setToggleState(!toggleState);
    // Toggle aria-expanded attribute for accessibility
    const toggleButton = document.getElementById("sidebar-toggle");
    const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
    toggleButton.setAttribute("aria-expanded", (!isExpanded).toString());
  };

  return (
    <>
      {/* Mobile toggle button - outside the sidebar */}
      <button
        id="sidebar-toggle"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-white md:hidden"
        style={{
          visibility: !toggleState === true ? "hidden" : "visible",
        }}
        aria-expanded="false"
        aria-controls="sidebar"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <div
        id="sidebar"
        className="fixed inset-y-0 left-0 flex flex-col w-64 bg-primary/5 backdrop-blur-xl transform -translate-x-full transition-transform duration-300 ease-in-out md:translate-x-0 z-40 sidebar-closed"
      >
        {/* Close button - visible only on mobile */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 p-1 rounded-md md:hidden"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 border-b px-6 py-4">
          <HeartPulse className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">MediQly</span>
        </div>

        {/* Sidebar Links */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                  location.pathname === item.path &&
                    "bg-primary/10 text-primary font-medium"
                )}
                onClick={() => {
                  // Close sidebar on mobile when a link is clicked
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </ScrollArea>

        {/* Chat with Doctor */}
        <div className="border-t p-4">
          <Button asChild className="w-full" variant="outline">
            <Link
              to="/chat"
              className="flex items-center gap-2 hover:bg-primary"
            >
              <MessageSquare className="h-4 w-4" />
              Chat with Doctor
            </Link>
          </Button>
        </div>
      </div>

      {/* Overlay for mobile - appears when sidebar is open */}
      <div
        id="sidebar-overlay"
        className="fixed inset-0 bg-black/50 opacity-0 pointer-events-none transition-opacity duration-300 md:hidden z-30"
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>
    </>
  );
}
