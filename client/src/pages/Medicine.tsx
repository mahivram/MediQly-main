import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bell, Clock, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockMedications = [
  {
    id: 1,
    name: "Vitamin D",
    dosage: "1000 IU",
    frequency: "Once daily",
    timeOfDay: "Morning",
    remainingDays: 15,
  },
  {
    id: 2,
    name: "Omega-3",
    dosage: "1000 mg",
    frequency: "Twice daily",
    timeOfDay: "Morning and Evening",
    remainingDays: 30,
  },
];

const Medicine = () => {
  const { toast } = useToast();

  const handleReminder = (medication: (typeof mockMedications)[0]) => {
    toast({
      title: "Medication Reminder",
      description: `Time to take ${medication.name} (${medication.dosage})`,
    });
  };

  return (
    <MainLayout>
      <div className="animate-in">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl w-fit font-bold primary-grad primary-grad">
            Medicine Tracker
          </h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Medication
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Medications
              </CardTitle>
              <Pill className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMedications.length}</div>
              <p className="text-xs text-muted-foreground">Currently taking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Dose</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 Hours</div>
              <p className="text-xs text-muted-foreground">Until next dose</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Refill Alert
              </CardTitle>
              <Bell className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Medication needs refill
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockMedications.map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold">{medication.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {medication.dosage} - {medication.frequency}
                    </p>
                    <p className="text-sm">Time: {medication.timeOfDay}</p>
                    <p className="text-sm">
                      Remaining: {medication.remainingDays} days
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReminder(medication)}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Remind
                    </Button>
                    <Button variant="outline" size="sm">
                      Refill
                    </Button>
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

export default Medicine;
