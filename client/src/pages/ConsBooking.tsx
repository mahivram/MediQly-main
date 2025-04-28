import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, startOfToday, isWeekend } from "date-fns";
import {
  Calendar,
  Clock,
  Video,
  CalendarCheck,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { dummyDoctors } from "@/pages/Consultation";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

// Generate next 7 available dates (excluding weekends if needed)
const getAvailableDates = () => {
  const dates = [];
  let currentDate = startOfToday();
  let daysToAdd = 0;

  while (dates.length < 7) {
    const nextDate = addDays(currentDate, daysToAdd);
    // Skip weekends
    if (!isWeekend(nextDate)) {
      dates.push({
        date: nextDate,
        formatted: format(nextDate, "dd MMM, EEE"), // "15 Feb, Mon"
        dayName: format(nextDate, "EEEE"), // "Monday"
      });
    }
    daysToAdd++;
  }
  return dates;
};

const timeSlots: TimeSlot[] = [
  { time: "09:00 AM", isAvailable: true },
  { time: "09:30 AM", isAvailable: true },
  { time: "10:00 AM", isAvailable: true },
  { time: "10:30 AM", isAvailable: true },
  { time: "11:00 AM", isAvailable: true },
  { time: "11:30 AM", isAvailable: true },
  { time: "02:00 PM", isAvailable: true },
  { time: "02:30 PM", isAvailable: true },
  { time: "03:00 PM", isAvailable: true },
  { time: "03:30 PM", isAvailable: true },
  { time: "04:00 PM", isAvailable: true },
  { time: "04:30 PM", isAvailable: true },
];

const ConsultationBooking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [doctor, setDoctor] = useState(
    dummyDoctors.find((d) => d._id === doctorId)
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [availableDates] = useState(getAvailableDates());

  useEffect(() => {
    if (!doctor) {
      toast({
        title: "Error",
        description: "Doctor not found",
        variant: "destructive",
      });
      navigate("/consultation");
    }
  }, [doctor, navigate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBooking = () => {
    setShowConfirmDialog(true);
  };

  const confirmBooking = () => {
    // Here we would normally make an API call to save the booking
    const booking = {
      id: Math.random().toString(36).substr(2, 9),
      doctorId: doctor?._id,
      doctorName: `Dr. ${doctor?.firstName} ${doctor?.lastName}`,
      specialization: doctor?.specialization,
      date: selectedDate,
      time: selectedTime,
      status: "scheduled",
      type: "video",
      createdAt: new Date().toISOString(),
    };

    // For now, we'll store it in localStorage
    const existingBookings = JSON.parse(
      localStorage.getItem("myBookings") || "[]"
    );
    localStorage.setItem(
      "myBookings",
      JSON.stringify([...existingBookings, booking])
    );

    toast({
      title: "Success",
      description: "Consultation booked successfully! Redirecting to chat...",
    });

    setShowConfirmDialog(false);
    // Redirect to chat with the doctor
    navigate(`/chat?doctorId=${doctor?._id}`);
  };

  const handleInstantChat = () => {
    navigate(`/chat?doctorId=${doctor?._id}&instant=true`);
  };

  if (!doctor) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Book Video Consultation</h1>

          <Card className="p-6 mb-8">
            <div className="flex items-start gap-6">
              <img
                src={doctor.profileImage || "/default-doctor.png"}
                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h2>
                    <p className="text-gray-600">{doctor.specialization}</p>
                    <p className="text-gray-600">
                      {doctor.experience} years experience
                    </p>
                    <p className="text-gray-600">
                      Consultation Fee: ₹{doctor.consultationFees}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleInstantChat}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat Now
                  </Button>
                </div>
                {doctor.availability?.status === "Available" && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    Available for Instant Consultation
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Date Selection */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Date
              </h3>
              <div className="space-y-2">
                {availableDates.map((date) => (
                  <Button
                    key={date.formatted}
                    variant={
                      selectedDate === date.formatted ? "default" : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => handleDateSelect(date.formatted)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{date.formatted}</span>
                      <span className="text-sm text-gray-500">
                        {date.dayName}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Time Selection */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Select Time
              </h3>
              {selectedDate ? (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={
                        selectedTime === slot.time ? "default" : "outline"
                      }
                      className="w-full"
                      disabled={!slot.isAvailable}
                      onClick={() => handleTimeSelect(slot.time)}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Please select a date first</p>
              )}
            </Card>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              size="lg"
              disabled={!selectedDate || !selectedTime}
              onClick={handleBooking}
            >
              <Video className="h-5 w-5 mr-2" />
              Book Video Consultation
            </Button>
          </div>

          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose Consultation Type</DialogTitle>
                <DialogDescription>
                  How would you like to proceed with Dr. {doctor.firstName}{" "}
                  {doctor.lastName}?
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto p-4"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    handleInstantChat();
                  }}
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="font-semibold">Start Chat Now</span>
                  <span className="text-sm text-muted-foreground">
                    Begin instant text consultation
                  </span>
                </Button>
                <Button
                  className="flex flex-col items-center gap-2 h-auto p-4"
                  onClick={confirmBooking}
                >
                  <Video className="h-6 w-6" />
                  <span className="font-semibold">Schedule Video Call</span>
                  <span className="text-sm text-muted-foreground">
                    Book for {selectedDate} at {selectedTime}
                  </span>
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MainLayout>
  );
};

export default ConsultationBooking;
