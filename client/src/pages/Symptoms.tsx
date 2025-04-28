import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus, Calendar, AlertCircle } from "lucide-react";

const mockSymptoms = [
  {
    id: 1,
    symptom: "Headache",
    severity: "Mild",
    date: "2024-03-15",
    duration: "2 hours",
    status: "Resolved",
  },
  {
    id: 2,
    symptom: "Fatigue",
    severity: "Moderate",
    date: "2024-03-14",
    duration: "All day",
    status: "Ongoing",
  },
];

const Symptoms = () => {
  return (
    <MainLayout>
      <div className="animate-in">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold primary-grad">Symptom Tracker</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Log New Symptom
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Symptoms
              </CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Currently being monitored
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Logged</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Today</div>
              <p className="text-xs text-muted-foreground">At 2:30 PM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">None</div>
              <p className="text-xs text-muted-foreground">
                All symptoms normal
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockSymptoms.map((symptom) => (
                <div
                  key={symptom.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold">{symptom.symptom}</h3>
                    <p className="text-sm text-muted-foreground">
                      Severity: {symptom.severity}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span>{symptom.date}</span>
                      <span>Duration: {symptom.duration}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs ${
                        symptom.status === "Resolved"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                      }`}
                    >
                      {symptom.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Symptoms;
