import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Activity, CalendarCheck } from "lucide-react";

const mockCheckups = [
  {
    title: "Annual Physical Examination",
    dueDate: "2024-04-15",
    status: "upcoming",
    description: "Comprehensive health checkup including blood work and vitals",
  },
  {
    title: "Dental Cleaning",
    dueDate: "2024-05-01",
    status: "upcoming",
    description: "Regular dental cleaning and checkup",
  },
  {
    title: "Eye Examination",
    dueDate: "2024-06-10",
    status: "upcoming",
    description: "Vision test and eye health assessment",
  },
];

const PreventiveHealth = () => {
  return (
    <MainLayout>
      <div className="animate-in">
        <h1 className="mb-8 text-3xl w-fit font-bold primary-grad">
          Preventive Health
        </h1>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Low</div>
              <p className="text-xs text-muted-foreground">
                Based on your health data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Health Score
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85/100</div>
              <p className="text-xs text-muted-foreground">
                Good overall health status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Checkup
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15 Days</div>
              <p className="text-xs text-muted-foreground">
                Until your next scheduled checkup
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Preventive Care</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockCheckups.map((checkup, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <h3 className="font-semibold">{checkup.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {checkup.description}
                    </p>
                    <p className="text-sm">Due: {checkup.dueDate}</p>
                  </div>
                  <Button variant="outline">Schedule</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PreventiveHealth;
