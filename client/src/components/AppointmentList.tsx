import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
}

const appointments: Appointment[] = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "2024-03-15",
    time: "10:00 AM",
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "General Physician",
    date: "2024-03-20",
    time: "2:30 PM",
  },
];

export function AppointmentList() {
  return (
    <Card className="p-6 animate-fadeIn">
      <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-start space-x-4 p-4 rounded-lg dark:bg-black hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <h4 className="font-medium">{appointment.doctor}</h4>
              <p className="text-sm text-gray-500">{appointment.specialty}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(appointment.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {appointment.time}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
