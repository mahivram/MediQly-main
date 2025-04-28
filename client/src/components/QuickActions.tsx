import { Button } from "@/components/ui/button";
import { Plus, Pill, Calendar, Activity } from "lucide-react";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-4  animate-fadeIn">
      <Button className="bg-primary hover:bg-primary/90">
        <Plus className="h-4 w-4 mr-2" />
        Log Symptom
      </Button>
      <Button
        variant="outline"
        className="dark:text-white hover:bg-secondary/90"
      >
        <Pill className="h-4 w-4 mr-2" />
        Track Medication
      </Button>
      <Button variant="outline" className=" dark:text-white hover:bg-accent/90">
        <Calendar className="h-4 w-4 mr-2" />
        Schedule Appointment
      </Button>
      <Button variant="outline">
        <Activity className="h-4 w-4 mr-2" />
        Record Vitals
      </Button>
    </div>
  );
}
