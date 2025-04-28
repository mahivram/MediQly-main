import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HomeIcon, ArrowLeft, AlertTriangle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <MainLayout>
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center dark:bg-black p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <Card className="relative w-full max-w-lg mx-auto overflow-hidden backdrop-blur-sm border border-border/40 shadow-lg animate-in">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-4 animate-bounce">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <h1 className="text-7xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                404
              </h1>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Page not found
                </h2>
                <p className="text-muted-foreground max-w-sm">
                  Oops! The page you're looking for doesn't exist or has been
                  moved.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full">
                <Button
                  variant="outline"
                  className="flex-1 group"
                  onClick={handleGoBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Go Back
                </Button>

                <Button variant="default" className="flex-1 group" asChild>
                  <Link to="/">
                    <HomeIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    Return Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NotFound;
