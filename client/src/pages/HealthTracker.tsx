import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleFitDashboard from "@/components/GoogleFitDashboard";

const HealthTracker = () => {
  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl w-fit font-bold tracking-tight primary-grad">
            Health Dashboard
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Google Fit Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleFitDashboard />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HealthTracker;
