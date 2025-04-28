import { useState } from "react";
import {
  Activity,
  Stethoscope,
  Apple,
  Pill,
  Bot,
  HeartPulse,
  Leaf,
  AlertCircle,
  Info,
  Bell,
  Calendar,
  CheckCircle2,
  Phone,
  ArrowRight,
  Video,
  Clock,
  Shield,
  Brain,
  Sparkles,
  Heart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const { currentUser, currentDoctor } = useAuth();
  const userName =
    currentUser?.firstName || currentDoctor?.firstName || "Guest";

  // Feature sections with visual elements and descriptions
  const features = [
    {
      title: "Health Monitoring",
      description: "Track your vital signs and health metrics in real-time",
      icon: HeartPulse,
      color:
        "bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20",
      iconColor: "text-red-500",
      link: "/health-tracker",
      highlights: [
        "Real-time vitals",
        "Health trends",
        "Personalized insights",
      ],
      pattern:
        "radial-gradient(circle at 100% 100%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)",
    },
    {
      title: "Doctor Consultations",
      description: "Connect with healthcare professionals instantly",
      icon: Stethoscope,
      color:
        "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20",
      iconColor: "text-blue-500",
      link: "/consultation",
      highlights: ["Video calls", "Chat support", "Appointment booking"],
      pattern:
        "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
    },
    {
      title: "AI Health Assistant",
      description: "Get instant health insights powered by AI",
      icon: Brain,
      color:
        "bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20",
      iconColor: "text-purple-500",
      link: "/ai-doctor",
      highlights: [
        "Symptom analysis",
        "Health recommendations",
        "24/7 availability",
      ],
      pattern:
        "radial-gradient(circle at 100% 0%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)",
    },
    {
      title: "Diet & Nutrition",
      description: "Personalized meal plans and nutrition tracking",
      icon: Apple,
      color:
        "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20",
      iconColor: "text-green-500",
      link: "/diet",
      highlights: ["Meal planning", "Nutritional analysis", "Diet tracking"],
      pattern:
        "radial-gradient(circle at 0% 100%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)",
    },
  ];

  const quickActions = [
    {
      title: "Emergency",
      icon: AlertCircle,
      color: "bg-gradient-to-br from-red-500/10 to-pink-500/10",
      border: "border-red-500/20",
      iconColor: "text-red-500",
      link: "/emergency",
      action: handleEmergencyCall,
      description: "24/7 Emergency Support",
      pattern:
        "radial-gradient(circle at 100% 100%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)",
    },
    {
      title: "Book Appointment",
      icon: Calendar,
      color: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
      border: "border-blue-500/20",
      iconColor: "text-blue-500",
      link: "/consultation",
      description: "Schedule Your Visit",
      pattern:
        "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
    },
  ];

  function handleEmergencyCall() {
    window.location.href = "tel:112";
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20 p-8 mb-8 backdrop-blur-xl">
          {/* Subtle background pattern */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 25%)`,
                backgroundSize: "40px 40px",
                backgroundPosition: "0 0, 20px 20px",
              }}
            />
          </div>

          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <HeartPulse className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl primary-grad font-bold text-foreground mb-1">
                  Welcome back, {userName}
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your personal health companion
                </p>
              </div>
            </div>
          </div>

          {/* Subtle decorative elements */}
          <div className="absolute -right-16 -top-16 opacity-[0.02] pointer-events-none">
            <Plus className="w-48 h-48 text-blue-500 rotate-12" />
          </div>
          <div className="absolute -left-16 -bottom-16 opacity-[0.02] pointer-events-none">
            <Plus className="w-48 h-48 text-purple-500 -rotate-12" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              onClick={action.action}
              className="group"
            >
              <Card
                className={`
                h-full transition-all duration-500
                hover:shadow-xl ${action.color} border ${action.border}
                backdrop-blur-xl relative overflow-hidden
                transform hover:-translate-y-1
              `}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: action.pattern }}
                />
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`
                      p-3 rounded-xl ${action.color} ${action.border}
                      transform transition-transform duration-300
                      group-hover:scale-110 group-hover:rotate-3
                    `}
                    >
                      <action.icon className={`w-8 h-8 ${action.iconColor}`} />
                    </div>
                    <ArrowRight
                      className={`w-5 h-5 ${action.iconColor} transition-transform duration-300 group-hover:translate-x-2`}
                    />
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                  <p className="text-muted-foreground">{action.description}</p>

                  {action.title === "Emergency" && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
                      <Phone className="w-4 h-4" />
                      <span>Call 112</span>
                    </div>
                  )}

                  {action.title === "Book Appointment" && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-500">
                      <Clock className="w-4 h-4" />
                      <span>Available 24/7</span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Link key={index} to={feature.link} className="group">
              <Card
                className={`
                h-full transition-all duration-500
                hover:shadow-xl ${feature.color} border backdrop-blur-xl
                relative overflow-hidden
                transform hover:-translate-y-1
              `}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: feature.pattern }}
                />
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`
                      p-3 rounded-xl ${feature.color}
                      transform transition-transform duration-300
                      group-hover:scale-110 group-hover:rotate-3
                    `}
                    >
                      <feature.icon
                        className={`w-7 h-7 ${feature.iconColor}`}
                      />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 transition-transform duration-300 group-hover:translate-x-2" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 mb-6">{feature.description}</p>

                  <div className="space-y-3">
                    {feature.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 mr-2 ${feature.iconColor}`}
                        />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
