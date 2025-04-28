import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";

const mockAppointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "2024-03-20",
    time: "10:00 AM",
    location: "Heart Care Center",
    status: "upcoming",
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "General Physician",
    date: "2024-03-25",
    time: "2:30 PM",
    location: "Medical Plaza",
    status: "upcoming",
  },
];

const Appointments = () => {
  return (
    <MainLayout>
      <div className="animate-in ">
        <div className="mb-8 gap-4 flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-3xl font-bold primary-grad">Appointments</h1>
          <Button className="w-full sm:w-auto hover:bg-primary/80">
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </div>

        <div className="grid gap-6">
          {mockAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {appointment.doctor}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.specialty}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {appointment.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {appointment.location}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Reschedule</Button>
                  <Button variant="destructive">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Appointments;
