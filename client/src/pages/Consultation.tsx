import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Award,
  CheckCircle,
  Calendar,
  DollarSign,
  Languages,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import MainLayout from "@/components/layout/MainLayout";

interface ServiceTier {
  name: "Basic" | "Standard" | "Premium";
  price: number;
  duration: number;
  description: string;
  features: string[];
  deliveryTime: string;
  revisions: number;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  specialization: string;
  experience: number;
  serviceTiers: ServiceTier[];
  availability: {
    status: "Available" | "Busy" | "Away";
    nextAvailableSlot: string;
    responseTime: string;
    workingHours: {
      day: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[];
    instantBooking: boolean;
  };
  clinicAddress: {
    city: string;
    state: string;
  };
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  expertise: string[];
  languages: string[];
  about: string;
  successRate: number;
  totalConsultations: number;
  completionRate: number;
  responseRate: number;
  reviews: {
    userId: {
      firstName: string;
      lastName: string;
    };
    rating: number;
    review: string;
    date: string;
    serviceTier: string;
  }[];
}

export const specializations = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic",
  "Neurologist",
  "Psychiatrist",
  "Gynecologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Dentist",
  "Urologist",
  "Endocrinologist",
  "Pulmonologist",
  "Oncologist",
];

export const dummyDoctors: Doctor[] = [
  {
    _id: "1",
    firstName: "John",
    lastName: "Smith",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    specialization: "Cardiologist",
    experience: 15,
    serviceTiers: [
      {
        name: "Basic",
        price: 1500,
        duration: 30,
        description: "Basic video consultation with preliminary assessment",
        features: [
          "30-minute video consultation",
          "Basic health assessment",
          "Digital prescription",
          "24-hour response time",
        ],
        deliveryTime: "1-2 days",
        revisions: 1,
      },
      {
        name: "Standard",
        price: 2500,
        duration: 45,
        description: "Comprehensive consultation with detailed assessment",
        features: [
          "45-minute video consultation",
          "Detailed health assessment",
          "Digital prescription",
          "Follow-up consultation",
          "Diet recommendations",
          "12-hour response time",
        ],
        deliveryTime: "1 day",
        revisions: 2,
      },
      {
        name: "Premium",
        price: 4000,
        duration: 60,
        description: "Premium care with extended support",
        features: [
          "60-minute video consultation",
          "Comprehensive health assessment",
          "Priority appointment scheduling",
          "2 Follow-up consultations",
          "Detailed health report",
          "Personalized care plan",
          "6-hour response time",
        ],
        deliveryTime: "Same day",
        revisions: 3,
      },
    ],
    availability: {
      status: "Available",
      nextAvailableSlot: "Today, 2:00 PM",
      responseTime: "Usually responds in 15 minutes",
      workingHours: [
        {
          day: "Monday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
        {
          day: "Wednesday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
        {
          day: "Friday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
      ],
      instantBooking: true,
    },
    clinicAddress: {
      city: "Mumbai",
      state: "Maharashtra",
    },
    averageRating: 4.8,
    totalReviews: 124,
    isVerified: true,
    expertise: [
      "Heart Surgery",
      "Cardiac Rehabilitation",
      "Preventive Cardiology",
    ],
    languages: ["English", "Hindi", "Marathi"],
    about:
      "Dr. John Smith is a renowned cardiologist with over 15 years of experience in treating heart conditions.",
    successRate: 98,
    totalConsultations: 1500,
    completionRate: 99,
    responseRate: 98,
    reviews: [
      {
        userId: { firstName: "Alice", lastName: "Johnson" },
        rating: 5,
        review: "Excellent doctor, very thorough and professional",
        date: "2024-02-15",
        serviceTier: "Premium",
      },
    ],
  },
  {
    _id: "2",
    firstName: "Sarah",
    lastName: "Patel",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    specialization: "Pediatrician",
    experience: 10,
    serviceTiers: [
      {
        name: "Basic",
        price: 1000,
        duration: 30,
        description: "One-time video consultation with basic health assessment",
        features: [
          "Video consultation",
          "Digital prescription",
          "Basic health assessment",
        ],
        deliveryTime: "1-2 days",
        revisions: 1,
      },
      {
        name: "Standard",
        price: 2000,
        duration: 45,
        description: "Detailed consultation with follow-ups",
        features: [
          "Extended consultation",
          "2 follow-ups",
          "Detailed health report",
          "Diet plan",
        ],
        deliveryTime: "1 day",
        revisions: 2,
      },
    ],
    availability: {
      status: "Available",
      nextAvailableSlot: "Today, 3:00 PM",
      responseTime: "Usually responds in 20 minutes",
      workingHours: [
        {
          day: "Tuesday",
          startTime: "10:00",
          endTime: "18:00",
          isAvailable: true,
        },
        {
          day: "Thursday",
          startTime: "10:00",
          endTime: "18:00",
          isAvailable: true,
        },
        {
          day: "Saturday",
          startTime: "09:00",
          endTime: "14:00",
          isAvailable: true,
        },
      ],
      instantBooking: false,
    },
    clinicAddress: {
      city: "Delhi",
      state: "Delhi",
    },
    averageRating: 4.9,
    totalReviews: 98,
    isVerified: true,
    expertise: ["Child Healthcare", "Vaccination", "Developmental Pediatrics"],
    languages: ["English", "Hindi", "Gujarati"],
    about:
      "Dr. Sarah Patel specializes in pediatric care with a focus on early childhood development.",
    successRate: 95,
    totalConsultations: 1000,
    completionRate: 96,
    responseRate: 95,
    reviews: [
      {
        userId: { firstName: "Raj", lastName: "Kumar" },
        rating: 5,
        review: "Great with kids, very patient and caring",
        date: "2024-02-10",
        serviceTier: "Standard",
      },
    ],
  },
  {
    _id: "3",
    firstName: "David",
    lastName: "Kumar",
    profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
    specialization: "Dermatologist",
    experience: 8,
    serviceTiers: [
      {
        name: "Basic",
        price: 1200,
        duration: 30,
        description: "One-time video consultation with basic health assessment",
        features: [
          "Video consultation",
          "Digital prescription",
          "Basic health assessment",
        ],
        deliveryTime: "1-2 days",
        revisions: 1,
      },
      {
        name: "Standard",
        price: 2000,
        duration: 45,
        description: "Detailed consultation with follow-ups",
        features: [
          "Extended consultation",
          "2 follow-ups",
          "Detailed health report",
          "Diet plan",
        ],
        deliveryTime: "1 day",
        revisions: 2,
      },
    ],
    availability: {
      status: "Available",
      nextAvailableSlot: "Today, 4:00 PM",
      responseTime: "Usually responds in 25 minutes",
      workingHours: [
        {
          day: "Monday",
          startTime: "11:00",
          endTime: "19:00",
          isAvailable: true,
        },
        {
          day: "Thursday",
          startTime: "11:00",
          endTime: "19:00",
          isAvailable: true,
        },
        {
          day: "Saturday",
          startTime: "10:00",
          endTime: "15:00",
          isAvailable: true,
        },
      ],
      instantBooking: false,
    },
    clinicAddress: {
      city: "Bangalore",
      state: "Karnataka",
    },
    averageRating: 4.7,
    totalReviews: 76,
    isVerified: true,
    expertise: ["Cosmetic Dermatology", "Skin Cancer", "Laser Treatment"],
    languages: ["English", "Hindi", "Kannada"],
    about:
      "Dr. David Kumar is an expert in treating various skin conditions and cosmetic procedures.",
    successRate: 90,
    totalConsultations: 800,
    completionRate: 88,
    responseRate: 87,
    reviews: [
      {
        userId: { firstName: "Priya", lastName: "Singh" },
        rating: 4,
        review: "Very knowledgeable and effective treatment",
        date: "2024-02-01",
        serviceTier: "Basic",
      },
    ],
  },
  {
    _id: "4",
    firstName: "Priya",
    lastName: "Sharma",
    profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
    specialization: "Neurologist",
    experience: 12,
    serviceTiers: [
      {
        name: "Basic",
        price: 1800,
        duration: 30,
        description: "One-time video consultation with basic health assessment",
        features: [
          "Video consultation",
          "Digital prescription",
          "Basic health assessment",
        ],
        deliveryTime: "1-2 days",
        revisions: 1,
      },
      {
        name: "Standard",
        price: 3000,
        duration: 45,
        description: "Detailed consultation with follow-ups",
        features: [
          "Extended consultation",
          "2 follow-ups",
          "Detailed health report",
          "Diet plan",
        ],
        deliveryTime: "1 day",
        revisions: 2,
      },
    ],
    availability: {
      status: "Available",
      nextAvailableSlot: "Today, 5:00 PM",
      responseTime: "Usually responds in 30 minutes",
      workingHours: [
        {
          day: "Tuesday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
        {
          day: "Wednesday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
        {
          day: "Friday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
      ],
      instantBooking: false,
    },
    clinicAddress: {
      city: "Chennai",
      state: "Tamil Nadu",
    },
    averageRating: 4.9,
    totalReviews: 112,
    isVerified: true,
    expertise: ["Stroke Treatment", "Epilepsy", "Movement Disorders"],
    languages: ["English", "Hindi", "Tamil"],
    about:
      "Dr. Priya Sharma is a leading neurologist specializing in stroke treatment and epilepsy management.",
    successRate: 92,
    totalConsultations: 1200,
    completionRate: 90,
    responseRate: 89,
    reviews: [
      {
        userId: { firstName: "John", lastName: "Doe" },
        rating: 5,
        review: "Excellent diagnosis and treatment plan",
        date: "2024-01-25",
        serviceTier: "Standard",
      },
    ],
  },
  {
    _id: "5",
    firstName: "Rahul",
    lastName: "Verma",
    profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
    specialization: "Orthopedic",
    experience: 14,
    serviceTiers: [
      {
        name: "Basic",
        price: 1600,
        duration: 30,
        description: "One-time video consultation with basic health assessment",
        features: [
          "Video consultation",
          "Digital prescription",
          "Basic health assessment",
        ],
        deliveryTime: "1-2 days",
        revisions: 1,
      },
      {
        name: "Standard",
        price: 2500,
        duration: 45,
        description: "Detailed consultation with follow-ups",
        features: [
          "Extended consultation",
          "2 follow-ups",
          "Detailed health report",
          "Diet plan",
        ],
        deliveryTime: "1 day",
        revisions: 2,
      },
    ],
    availability: {
      status: "Available",
      nextAvailableSlot: "Today, 6:00 PM",
      responseTime: "Usually responds in 35 minutes",
      workingHours: [
        {
          day: "Monday",
          startTime: "10:00",
          endTime: "18:00",
          isAvailable: true,
        },
        {
          day: "Wednesday",
          startTime: "10:00",
          endTime: "18:00",
          isAvailable: true,
        },
        {
          day: "Thursday",
          startTime: "10:00",
          endTime: "18:00",
          isAvailable: true,
        },
      ],
      instantBooking: false,
    },
    clinicAddress: {
      city: "Hyderabad",
      state: "Telangana",
    },
    averageRating: 4.6,
    totalReviews: 89,
    isVerified: true,
    expertise: ["Joint Replacement", "Sports Injuries", "Spine Surgery"],
    languages: ["English", "Hindi", "Telugu"],
    about:
      "Dr. Rahul Verma is specialized in joint replacement surgery and sports medicine.",
    successRate: 88,
    totalConsultations: 1000,
    completionRate: 86,
    responseRate: 85,
    reviews: [
      {
        userId: { firstName: "Sarah", lastName: "Wilson" },
        rating: 5,
        review: "Great surgeon, explained everything clearly",
        date: "2024-02-05",
        serviceTier: "Standard",
      },
    ],
  },
];

const Consultation = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialization, sortBy]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Simulate API call with dummy data
      setTimeout(() => {
        const filteredDocs = dummyDoctors.filter(
          (doc) =>
            selectedSpecialization === "all" ||
            doc.specialization === selectedSpecialization
        );

        // Sort doctors based on selected criteria
        const sortedDocs = [...filteredDocs].sort((a, b) => {
          switch (sortBy) {
            case "rating":
              return b.averageRating - a.averageRating;
            case "experience":
              return b.experience - a.experience;
            case "fees":
              return a.serviceTiers[0].price - b.serviceTiers[0].price;
            case "response":
              return b.responseRate - a.responseRate;
            default:
              return 0;
          }
        });

        setDoctors(sortedDocs);
        setLoading(false);
      }, 500); // Add a small delay to simulate network request
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch doctors. Please try again.",
        variant: "destructive",
      });
      setDoctors([]);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDoctors();
  };

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/consultation/${doctorId}`);
  };

  const handleDoctorClick = (doctorId: string) => {
    setSelectedDoctor(selectedDoctor === doctorId ? null : doctorId);
  };

  const handleCloseDetails = () => {
    setSelectedDoctor(null);
  };

  const filteredDoctors = Array.isArray(doctors)
    ? doctors.filter((doctor) => {
        const searchString = searchTerm.toLowerCase();
        return (
          doctor.firstName.toLowerCase().includes(searchString) ||
          doctor.lastName.toLowerCase().includes(searchString) ||
          doctor.specialization.toLowerCase().includes(searchString) ||
          doctor.expertise.some((exp) =>
            exp.toLowerCase().includes(searchString)
          )
        );
      })
    : [];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Find and Consult Top Doctors
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with the best healthcare professionals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 h-10">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="fees">Lowest Price</SelectItem>
                <SelectItem value="response">Fastest Response</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search by doctor name, specialization, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
                <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Select
              value={selectedSpecialization}
              onValueChange={setSelectedSpecialization}
            >
              <SelectTrigger className="w-[250px] h-12">
                <SelectValue placeholder="Select Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Doctors List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                No doctors found matching your criteria.
              </p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <div key={doctor._id} className="relative">
                {selectedDoctor === doctor._id ? (
                  // Simplified Detailed View
                  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
                    <div className="container mx-auto px-4 py-8 max-w-3xl">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4"
                        onClick={handleCloseDetails}
                      >
                        <X className="h-6 w-6" />
                      </Button>
                      <Card className="mt-8">
                        <div className="p-6">
                          {/* Doctor Header */}
                          <div className="flex items-start gap-6 mb-6">
                            <div className="relative">
                              <img
                                src={
                                  doctor.profileImage || "/default-doctor.png"
                                }
                                alt={`${doctor.firstName} ${doctor.lastName}`}
                                className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-md"
                              />
                              <div
                                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-background ${
                                  doctor.availability.status === "Available"
                                    ? "bg-green-500"
                                    : doctor.availability.status === "Busy"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-2xl font-semibold text-foreground">
                                  Dr. {doctor.firstName} {doctor.lastName}
                                </h2>
                                {doctor.isVerified && (
                                  <CheckCircle className="h-5 w-5 text-blue-500 fill-current" />
                                )}
                              </div>
                              <p className="text-lg text-muted-foreground">
                                {doctor.specialization}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                                  <span className="font-medium">
                                    {doctor.averageRating.toFixed(1)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    ({doctor.totalReviews} reviews)
                                  </span>
                                </div>
                                {doctor.availability.instantBooking && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                  >
                                    Instant Booking
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                              <div className="text-lg font-semibold text-foreground">
                                {doctor.experience}+ yrs
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Experience
                              </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                              <div className="text-lg font-semibold text-foreground">
                                {doctor.successRate}%
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Success Rate
                              </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                              <div className="text-lg font-semibold text-foreground">
                                {doctor.totalConsultations}+
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Consultations
                              </div>
                            </div>
                          </div>

                          {/* Expertise */}
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-foreground mb-2">
                              Expertise
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {doctor.expertise.map((exp, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                >
                                  {exp}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Service Tiers */}
                          <div>
                            <h3 className="text-sm font-medium text-foreground mb-4">
                              Consultation Options
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {doctor.serviceTiers.map((tier, index) => (
                                <div
                                  key={index}
                                  className={`p-4 rounded-lg border ${
                                    tier.name === "Premium"
                                      ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                                      : "border-border"
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium text-foreground">
                                      {tier.name}
                                    </h4>
                                    <Badge
                                      variant="secondary"
                                      className="text-base font-semibold"
                                    >
                                      ₹{tier.price}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {tier.duration} min consultation
                                  </p>
                                  <Button
                                    className="w-full"
                                    variant={
                                      tier.name === "Premium"
                                        ? "default"
                                        : "outline"
                                    }
                                    onClick={() =>
                                      handleBookAppointment(doctor._id)
                                    }
                                  >
                                    {doctor.availability.instantBooking
                                      ? "Book Instantly"
                                      : "Book Now"}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Next Available Slot */}
                          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-foreground">
                                  Next Available
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {doctor.availability.nextAvailableSlot}
                                </p>
                              </div>
                              <div className="text-right">
                                <h3 className="font-medium text-foreground">
                                  Response Time
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {doctor.availability.responseTime}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                ) : (
                  // Compact Card View
                  <Card
                    className="cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden group relative bg-background"
                    onClick={() => handleDoctorClick(doctor._id)}
                  >
                    {/* Availability Indicator */}
                    <div
                      className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                        doctor.availability.status === "Available"
                          ? "bg-green-500"
                          : doctor.availability.status === "Busy"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    />

                    <div className="p-6">
                      {/* Doctor Info Section */}
                      <div className="flex items-center gap-5 mb-5">
                        <div className="relative">
                          <img
                            src={doctor.profileImage || "/default-doctor.png"}
                            alt={`${doctor.firstName} ${doctor.lastName}`}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all"
                          />
                          {doctor.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 ring-1 ring-background">
                              <CheckCircle className="h-3 w-3 text-background" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {doctor.specialization}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">
                              {doctor.averageRating.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({doctor.totalReviews})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Key Info */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-5">
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span>{doctor.experience}+ years</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{doctor.clinicAddress.city}</span>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Next Available:
                          </span>
                          <p className="font-medium text-foreground">
                            {doctor.availability.nextAvailableSlot}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">
                            Starts from
                          </span>
                          <p className="font-semibold text-foreground">
                            ₹{doctor.serviceTiers[0].price}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Consultation;
