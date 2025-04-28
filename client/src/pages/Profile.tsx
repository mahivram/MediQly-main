import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { profileProps, UserProps } from "@/lib/user.type";
import { useAuth } from "@/auth/AuthProvider";
import MainLayout from "@/components/layout/MainLayout";
import { MapPin, Wifi, WifiOff } from "lucide-react";
import { Switch } from "@radix-ui/react-switch";
import axios from "axios";
import api from "@/utils/api";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
});

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState({ longitude: null, latitude: null });
  const [isLocating, setIsLocating] = useState(false);

  const { currentDoctor, currentUser, isLoading, userType } = useAuth();

  useEffect(() => {
    // Initialize online status from user data
    if (userType === "user" && currentUser) {
      setIsOnline(currentUser.isOnline || false);
    } else if (userType === "doctor" && currentDoctor) {
      setIsOnline(currentDoctor.isOnline || false);
    }

    // Initialize location if available
    if (userType === "user" && currentUser?.location?.coordinates) {
      setLocation({
        longitude: currentUser.location.coordinates[0],
        latitude: currentUser.location.coordinates[1],
      });
    } else if (userType === "doctor" && currentDoctor?.location?.coordinates) {
      setLocation({
        longitude: currentDoctor.location.coordinates[0],
        latitude: currentDoctor.location.coordinates[1],
      });
    }
  }, [currentUser, currentDoctor, userType]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName:
        userType === "user" ? currentUser?.firstName : currentDoctor?.firstName,
      lastName:
        userType === "user" ? currentUser?.lastName : currentDoctor?.lastName,
      email: userType === "user" ? currentUser?.email : currentDoctor?.email,
      phoneNumber:
        userType === "user"
          ? currentUser?.phoneNumber
          : currentDoctor?.phoneNumber,
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    console.log(values);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
    setIsEditing(false);
  };

  // Function to get current location
  const getCurrentLocation = () => {
    setIsLocating(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          };
          setLocation(newLocation);

          // Update location in backend
          updateLocationInBackend(newLocation);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location.",
            variant: "destructive",
          });
          setIsLocating(false);
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      setIsLocating(false);
    }
  };

  // Function to update location in backend
  const updateLocationInBackend = async (locationData) => {
    try {
      const endpoint =
        userType === "user" ? "/users/location" : "/doctors/location";
      const response = await api.put(endpoint, {
        location: {
          type: "Point",
          coordinates: [locationData.longitude, locationData.latitude],
        },
      });
      console.log(response,'location data');

      if (response.status === 200) {
        toast({
          title: "Location Updated",
          description: "Your location has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your location.",
        variant: "destructive",
      });
    }
  };

  // Function to toggle online status
  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    try {
      const endpoint =
        userType === "user" ? "/users/status" : "/doctors/status";
      const response = await api.put(endpoint, {
        isOnline: newStatus,
        lastActive: new Date(),
      });
      console.log(response, "status data");

      if (response.status === 200) {
        toast({
          title: `Status: ${newStatus ? "Online" : "Offline"}`,
          description: `You are now ${newStatus ? "online" : "offline"}.`,
        });
      }
    } catch (error) {
      console.error("Error updating online status:", error);
      // Revert UI state if update fails
      setIsOnline(!newStatus);
      toast({
        title: "Status Update Failed",
        description: "Failed to update your online status.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="animate-in">
        <div className="mb-8">
          <h1 className="primary-grad text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your profile settings</p>
        </div>

        <div className="grid gap-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">
                    {form.getValues("firstName")} {form.getValues("lastName")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {form.getValues("email")}
                  </p>
                </div>
              </div>

              {isEditing ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">
                            Phone
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter your phone number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save Changes</Button>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label className="text-lg font-semibold">
                        First Name
                      </Label>
                      <p className="mt-1 text-base">
                        {form.getValues("firstName")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-lg font-semibold">Last Name</Label>
                      <p className="mt-1 text-base">
                        {form.getValues("lastName")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">Email</Label>
                    <p className="mt-1 text-base">{form.getValues("email")}</p>
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">Phone</Label>
                    <p className="mt-1 text-base">
                      {form.getValues("phoneNumber")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Card for Location and Online Status */}
          <Card>
            <CardHeader>
              <CardTitle>Availability & Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Online/Offline Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Online Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Toggle your online availability
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="online-status">
                      {isOnline ? (
                        <span className="flex items-center text-green-500">
                          <Wifi className="mr-1 h-4 w-4" /> Online
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-500">
                          <WifiOff className="mr-1 h-4 w-4" /> Offline
                        </span>
                      )}
                    </Label>
                    <Switch
                      id="online-status"
                      checked={isOnline}
                      onCheckedChange={toggleOnlineStatus}
                    />
                  </div>
                </div>

                {/* Geolocation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Your Location</h3>
                      <p className="text-sm text-muted-foreground">
                        Used to find nearby services
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isLocating}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {isLocating ? "Getting Location..." : "Update Location"}
                    </Button>
                  </div>

                  <div className="rounded-md bg-muted p-3 text-sm">
                    {location.latitude && location.longitude ? (
                      <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">Latitude:</span>{" "}
                            {location.latitude.toFixed(6)}
                          </div>
                          <div>
                            <span className="font-medium">Longitude:</span>{" "}
                            {location.longitude.toFixed(6)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date().toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <p>
                        No location data available. Please update your location.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 bg-muted/50">
              <p className="text-xs text-muted-foreground">
                Your location is only used to find nearby services and will be
                updated only when you click "Update Location".
                {userType === "doctor" &&
                  " When online, patients can see your availability for consultations."}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
