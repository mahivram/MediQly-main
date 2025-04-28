import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/MainLayout";
import { Phone, MapPin, Loader2, Locate } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone?: string;
  lat: number;
  lon: number;
  distance?: number;
  type: string;
  emergency: boolean;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface SMSResponse {
  success: boolean;
  message: string;
}

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Real hospital data
const hospitalData: Hospital[] = [
  {
    id: "1",
    name: "AIIMS Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029",
    phone: "011-26588500",
    lat: 28.5672,
    lon: 77.21,
    type: "Hospital",
    emergency: true,
  },
  {
    id: "2",
    name: "Fortis Hospital",
    address: "Sector B-1, Vasant Kunj, New Delhi, Delhi 110070",
    phone: "011-42776222",
    lat: 28.5231,
    lon: 77.1558,
    type: "Hospital",
    emergency: true,
  },
  {
    id: "3",
    name: "Max Super Speciality Hospital",
    address: "1, Press Enclave Road, Saket, New Delhi, Delhi 110017",
    phone: "011-26515050",
    lat: 28.5284,
    lon: 77.2157,
    type: "Hospital",
    emergency: true,
  },
  {
    id: "4",
    name: "Apollo Hospital",
    address: "Sarita Vihar, Delhi Mathura Road, New Delhi, Delhi 110076",
    phone: "011-71791090",
    lat: 28.5361,
    lon: 77.2833,
    type: "Hospital",
    emergency: true,
  },
  {
    id: "5",
    name: "Safdarjung Hospital",
    address: "Ansari Nagar East, New Delhi, Delhi 110029",
    phone: "011-26707444",
    lat: 28.5686,
    lon: 77.2066,
    type: "Hospital",
    emergency: true,
  },
  {
    id: "6",
    name: "Sir Ganga Ram Hospital",
    address: "Rajinder Nagar, New Delhi, Delhi 110060",
    phone: "011-25750000",
    lat: 28.6403,
    lon: 77.1897,
    type: "Hospital",
    emergency: true,
  },
];

const Emergency = () => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showAllHospitals, setShowAllHospitals] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const { toast } = useToast();
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >(() => {
    const saved = localStorage.getItem("emergencyContacts");
    return saved ? JSON.parse(saved) : [];
  });
  const [isEditingContacts, setIsEditingContacts] = useState(false);
  const [newContact, setNewContact] = useState<EmergencyContact>({
    name: "",
    phone: "",
    relationship: "",
  });

  const saveEmergencyContacts = (contacts: EmergencyContact[]) => {
    localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
    setEmergencyContacts(contacts);
  };

  const addEmergencyContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Validation Error",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(newContact.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    const updatedContacts = [...emergencyContacts, newContact];
    saveEmergencyContacts(updatedContacts);
    setNewContact({ name: "", phone: "", relationship: "" });
    toast({
      title: "Contact Added",
      description: `${newContact.name} has been added to your emergency contacts.`,
    });
  };

  const removeEmergencyContact = (index: number) => {
    const updatedContacts = emergencyContacts.filter((_, i) => i !== index);
    saveEmergencyContacts(updatedContacts);
    toast({
      title: "Contact Removed",
      description: "Emergency contact has been removed.",
    });
  };

  const sendSOSMessage = async () => {
    if (!userLocation) return;

    const sosMessage = `EMERGENCY SOS ALERT!\nLocation: https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}\nThis person needs immediate assistance!`;

    try {
      // Show dummy success messages for each contact
      for (const contact of emergencyContacts) {
        toast({
          title: "SOS Message Sent",
          description: `Emergency message sent to ${contact.name} (Demo Mode)`,
        });
      }
    } catch (error) {
      console.error("Error in demo SMS:", error);
      toast({
        title: "Demo Mode",
        description: "SMS would be sent in production mode",
      });
    }
  };

  const handleSOS = async () => {
    setIsSOSActive(true);

    // Show emergency toast
    toast({
      title: "SOS Activated",
      description:
        "Sending emergency alerts and contacting emergency services...",
      variant: "destructive",
      duration: 5000,
    });

    // Send SOS messages to emergency contacts
    await sendSOSMessage();

    // Call emergency number
    setTimeout(() => {
      window.location.href = `tel:102`;
    }, 3000);

    // Reset SOS state after 5 seconds
    setTimeout(() => {
      setIsSOSActive(false);
    }, 5000);
  };

  const callHospital = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const showRoute = (hospital: Hospital) => {
    if (!userLocation || !mapRef.current) return;

    // Remove existing route if any
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
    }

    // Create new route
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(hospital.lat, hospital.lon),
      ],
      routeWhileDragging: false,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "#6366f1", weight: 6 }],
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      show: false,
      collapsible: true,
      collapsed: true,
      autoRoute: true,
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: function () {
        return null;
      },
    }).addTo(mapRef.current);

    // Add estimated time and distance to hospital info
    routingControlRef.current.on("routesfound", (e: any) => {
      const route = e.routes[0];
      const time = Math.round(route.summary.totalTime / 60);
      const distance = (route.summary.totalDistance / 1000).toFixed(1);

      toast({
        title: `Route to ${hospital.name}`,
        description: `Estimated time: ${time} minutes\nDistance: ${distance} km`,
      });

      // Hide routing container after route is found
      const routingContainer = document.querySelector(
        ".leaflet-routing-container"
      );
      if (routingContainer) {
        routingContainer.remove();
      }
    });
  };

  // Add this function after the showRoute function
  const openInGoogleMaps = (hospital: Hospital) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${hospital.lat},${hospital.lon}&travelmode=driving`;
    window.open(url, "_blank");
  };

  // Fetch nearby hospitals using Overpass API
  const fetchNearbyHospitals = async (lat: number, lon: number) => {
    try {
      // Search within a 25km radius and include more medical facilities
      const radius = 25000;
      const query = `
        [out:json][timeout:90];
        (
          // Hospitals
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          way["amenity"="hospital"](around:${radius},${lat},${lon});
          relation["amenity"="hospital"](around:${radius},${lat},${lon});
          
          // Clinics
          node["amenity"="clinic"](around:${radius},${lat},${lon});
          way["amenity"="clinic"](around:${radius},${lat},${lon});
          
          // Medical Centers
          node["healthcare"="centre"](around:${radius},${lat},${lon});
          way["healthcare"="centre"](around:${radius},${lat},${lon});
          
          // Doctors
          node["healthcare"="doctor"](around:${radius},${lat},${lon});
          way["healthcare"="doctor"](around:${radius},${lat},${lon});
          
          // Emergency Medical Services
          node["emergency"="ambulance_station"](around:${radius},${lat},${lon});
          node["healthcare"="emergency"](around:${radius},${lat},${lon});
          
          // Additional Healthcare Facilities
          node["healthcare"="hospital"](around:${radius},${lat},${lon});
          way["healthcare"="hospital"](around:${radius},${lat},${lon});
          
          // Nursing Homes
          node["healthcare"="nursing_home"](around:${radius},${lat},${lon});
          way["healthcare"="nursing_home"](around:${radius},${lat},${lon});
          
          // Medical Labs
          node["healthcare"="laboratory"](around:${radius},${lat},${lon});
          way["healthcare"="laboratory"](around:${radius},${lat},${lon});
          
          // Pharmacies (for emergency medicines)
          node["amenity"="pharmacy"](around:${radius},${lat},${lon});
          way["amenity"="pharmacy"](around:${radius},${lat},${lon});
        );
        out body center;
        >;
        out skel qt;
      `;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });

      const data = await response.json();

      // Process and filter the results
      const processedHospitals: Hospital[] = data.elements
        .filter((element: any) => element.tags && element.tags.name)
        .map((element: any, index: number) => {
          const distance = calculateDistance(
            lat,
            lon,
            element.lat || element.center?.lat,
            element.lon || element.center?.lon
          );
          let facilityType = "";
          if (element.tags.amenity === "hospital") facilityType = "Hospital";
          else if (element.tags.amenity === "clinic") facilityType = "Clinic";
          else if (element.tags.healthcare === "centre")
            facilityType = "Medical Center";
          else if (element.tags.emergency === "ambulance_station")
            facilityType = "Ambulance Station";
          else if (element.tags.healthcare === "emergency")
            facilityType = "Emergency Service";
          else if (element.tags.healthcare === "doctor")
            facilityType = "Doctor";
          else if (element.tags.healthcare === "nursing_home")
            facilityType = "Nursing Home";
          else if (element.tags.healthcare === "laboratory")
            facilityType = "Medical Lab";
          else if (element.tags.amenity === "pharmacy")
            facilityType = "Pharmacy";
          else facilityType = "Medical Facility";

          // Get the correct coordinates based on node or way type
          const latitude = element.lat || element.center?.lat;
          const longitude = element.lon || element.center?.lon;

          // Only return facilities with valid coordinates
          if (!latitude || !longitude) return null;

          return {
            id: element.id.toString(),
            name: element.tags.name,
            address: element.tags["addr:street"]
              ? `${element.tags["addr:street"]}${
                  element.tags["addr:housenumber"]
                    ? " " + element.tags["addr:housenumber"]
                    : ""
                }`
              : element.tags["addr:full"] ||
                element.tags.address ||
                "Address not available",
            phone:
              element.tags.phone ||
              element.tags["contact:phone"] ||
              element.tags["phone:emergency"] ||
              "Phone not available",
            lat: latitude,
            lon: longitude,
            distance: distance,
            type: facilityType,
            emergency:
              element.tags.emergency === "yes" ||
              element.tags.healthcare === "emergency" ||
              element.tags.amenity === "hospital" ||
              element.tags.opening_hours === "24/7",
          };
        })
        .filter(Boolean) // Remove null entries
        .sort(
          (a: Hospital, b: Hospital) => (a.distance || 0) - (b.distance || 0)
        );

      // Limit to first 50 results to prevent performance issues
      const limitedResults = processedHospitals.slice(0, 50);
      setHospitals(limitedResults);
      console.log("Fetched medical facilities:", limitedResults);

      // Show toast with total results
      toast({
        title: "Medical Facilities Found",
        description: `Found ${processedHospitals.length} facilities. Showing nearest 50.`,
      });
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch nearby hospitals. Using default list.",
        variant: "destructive",
      });
      // Use default hospital data if API fails
      const defaultHospitals = hospitalData
        .map((h) => ({
          ...h,
          distance: calculateDistance(lat, lon, h.lat, h.lon),
          type: "Hospital",
          emergency: true,
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setHospitals(defaultHospitals);
    }
  };

  // Get user location
  useEffect(() => {
    if (!userLocation && !locationError) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            await fetchNearbyHospitals(latitude, longitude);
            setLoading(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationError(
              "Unable to get your location. Please enable location services."
            );
            // Set default location to New Delhi
            const defaultLat = 28.6139;
            const defaultLng = 77.209;
            setUserLocation({ lat: defaultLat, lng: defaultLng });
            fetchNearbyHospitals(defaultLat, defaultLng);
            setLoading(false);
            toast({
              title: "Location Error",
              description:
                "Using default location. Please enable location services for accurate results.",
              variant: "destructive",
            });
          }
        );
      } else {
        setLocationError("Your browser does not support geolocation.");
        const defaultLat = 28.6139;
        const defaultLng = 77.209;
        setUserLocation({ lat: defaultLat, lng: defaultLng });
        fetchNearbyHospitals(defaultLat, defaultLng);
        setLoading(false);
        toast({
          title: "Browser Error",
          description:
            "Your browser doesn't support location services. Using default location.",
          variant: "destructive",
        });
      }
    }
  }, []);

  // Initialize map after component mounts and container is available
  useEffect(() => {
    if (userLocation && !mapInitialized && document.getElementById("map")) {
      console.log("Initializing map with user location:", userLocation);

      const container = document.getElementById("map");
      if (container && !mapRef.current) {
        try {
          // Clear any existing markers
          markersRef.current.forEach((marker) => marker.remove());
          markersRef.current = [];

          // Initialize map
          mapRef.current = L.map("map");

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors",
          }).addTo(mapRef.current);

          // Add user marker
          const userIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          });

          const userMarker = L.marker([userLocation.lat, userLocation.lng], {
            icon: userIcon,
          })
            .addTo(mapRef.current)
            .bindPopup("Your Location")
            .openPopup();
          markersRef.current.push(userMarker);

          // Add hospital markers
          const hospitalIcon = L.icon({
            iconUrl:
              "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          });

          // Add markers for hospitals
          hospitals.forEach((hospital) => {
            console.log(
              "Adding hospital marker:",
              hospital.name,
              hospital.lat,
              hospital.lon
            );

            const marker = L.marker([hospital.lat, hospital.lon], {
              icon: hospitalIcon,
            }).addTo(mapRef.current!);
            markersRef.current.push(marker);

            const popupContent = document.createElement("div");
            popupContent.innerHTML = `
              <div class="hospital-popup">
                <h3 class="font-bold">${hospital.name}</h3>
                <p class="text-sm text-purple-600">${hospital.type}</p>
                ${
                  hospital.address !== "Address not available"
                    ? `<p class="text-sm">${hospital.address}</p>`
                    : ""
                }
                <p class="text-sm">Phone: ${hospital.phone}</p>
                <p class="text-sm text-blue-600">Distance: ${hospital.distance?.toFixed(
                  1
                )} km</p>
                ${
                  hospital.emergency
                    ? '<p class="text-sm text-red-600">24/7 Emergency Services</p>'
                    : ""
                }
                <div class="flex gap-2 mt-2">
                  <button class="get-directions bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm flex-1">Map Route</button>
                  <button class="google-maps bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm flex-1">Google Maps</button>
                </div>
              </div>
            `;

            const mapRouteButton =
              popupContent.querySelector(".get-directions");
            const googleMapsButton = popupContent.querySelector(".google-maps");

            if (mapRouteButton) {
              mapRouteButton.addEventListener("click", () => {
                showRoute(hospital);
                marker.closePopup();
              });
            }

            if (googleMapsButton) {
              googleMapsButton.addEventListener("click", () => {
                openInGoogleMaps(hospital);
                marker.closePopup();
              });
            }

            marker.bindPopup(popupContent);
          });

          // Smart zoom level calculation
          if (hospitals.length > 0) {
            const bounds = L.latLngBounds([userLocation.lat, userLocation.lng]);

            // Get the 3 nearest hospitals
            const nearestHospitals = hospitals.slice(0, 3);

            // Add user location and nearest hospitals to bounds
            bounds.extend([userLocation.lat, userLocation.lng]);
            nearestHospitals.forEach((hospital) => {
              bounds.extend([hospital.lat, hospital.lon]);
            });

            // Calculate the maximum distance among the nearest hospitals
            const maxDistance = Math.max(
              ...nearestHospitals.map((h) => h.distance || 0)
            );

            if (maxDistance <= 2) {
              // If hospitals are very close (within 2km)
              mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
            } else if (maxDistance <= 5) {
              // If hospitals are moderately close (within 5km)
              mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
            } else {
              // If hospitals are spread out, fit bounds with padding
              mapRef.current.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15, // Don't zoom in too far
                minZoom: 13, // Don't zoom out too far
              });
            }

            // Ensure all 3 nearest hospitals are visible
            const currentBounds = mapRef.current.getBounds();
            let allVisible = nearestHospitals.every((hospital) =>
              currentBounds.contains([hospital.lat, hospital.lon])
            );

            if (!allVisible) {
              mapRef.current.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 14,
              });
            }
          } else {
            // If no hospitals found, zoom to user location
            mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
          }

          setMapInitialized(true);
          console.log(
            "Map initialized successfully with",
            hospitals.length,
            "hospitals"
          );
        } catch (error) {
          console.error("Error initializing map:", error);
          toast({
            title: "Map Error",
            description:
              "There was an error initializing the map. Please refresh the page.",
            variant: "destructive",
          });
        }
      }
    }
  }, [userLocation, mapInitialized, hospitals]);

  // Cleanup
  useEffect(() => {
    return () => {
      // Clear all markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (mapRef.current) {
        if (routingControlRef.current) {
          mapRef.current.removeControl(routingControlRef.current);
        }
        mapRef.current.remove();
        mapRef.current = null;
        setMapInitialized(false);
      }
    };
  }, []);

  // Get displayed hospitals based on showAllHospitals state
  const displayedHospitals = showAllHospitals
    ? hospitals
    : hospitals.slice(0, 5);

  // Add function to handle resetting map view to user location
  const resetMapToUserLocation = () => {
    if (!userLocation || !mapRef.current) return;

    mapRef.current.setView([userLocation.lat, userLocation.lng], 13);

    toast({
      title: "Location Reset",
      description: "Map view centered to your location",
    });
  };

  // Add phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    // Add your country-specific phone validation regex here
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ""));
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Emergency Services</h1>

        <div className="mb-8">
          <Button
            size="lg"
            variant={isSOSActive ? "destructive" : "default"}
            className={`w-full h-32 text-2xl font-bold relative overflow-hidden ${
              isSOSActive
                ? "animate-pulse bg-red-600 hover:bg-red-700"
                : "bg-red-500 hover:bg-red-600"
            }`}
            onClick={handleSOS}
            disabled={isSOSActive}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-3xl">
                {isSOSActive ? "SOS ACTIVATED" : "SOS"}
              </span>
              <span className="text-sm font-normal">
                {isSOSActive
                  ? "Contacting Emergency Services..."
                  : "Press for Emergency"}
              </span>
            </div>
            {isSOSActive && (
              <div className="absolute inset-0 bg-red-500 animate-ping opacity-75 rounded-lg"></div>
            )}
          </Button>
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsEditingContacts(true)}
          >
            Manage Emergency Contacts
          </Button>
        </div>

        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Nearby Hospitals</h2>
            {!loading && hospitals.length > 0 && (
              <span className="text-sm text-muted-foreground">
                Showing {hospitals.length} nearby hospitals
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Finding nearby hospitals...</span>
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="p-0 relative">
                  <div
                    id="map"
                    className="h-[400px] w-full rounded-lg z-0"
                    style={{
                      height: "400px",
                      width: "100%",
                      zIndex: 0,
                      borderRadius: "0.5rem",
                    }}
                  />
                  {/* Current Location Button */}
                  <Button
                    variant="default"
                    size="icon"
                    className="absolute bottom-4 left-4 rounded-full w-14 h-14 bg-white hover:bg-gray-100 shadow-lg transition-transform hover:scale-110 animate-pulse"
                    onClick={resetMapToUserLocation}
                  >
                    <Locate className="h-7 w-7 text-blue-600" />
                  </Button>
                  {locationError && (
                    <div className="absolute bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md">
                      {locationError}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hospital list */}
              <div className="grid gap-4 mt-4">
                {displayedHospitals.map((hospital) => (
                  <Card
                    key={hospital.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">
                              {hospital.name}
                            </h3>
                            {hospital.emergency && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                24/7
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {hospital.type}
                            </span>
                            {hospital.distance && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {hospital.distance.toFixed(1)} km away
                              </span>
                            )}
                          </div>
                          {hospital.address !== "Address not available" && (
                            <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                              <MapPin className="h-4 w-4" />
                              {hospital.address}
                            </p>
                          )}
                          {hospital.phone &&
                            hospital.phone !== "Phone not available" && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {hospital.phone}
                              </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {hospital.phone &&
                            hospital.phone !== "Phone not available" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => callHospital(hospital.phone!)}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                <span>Call</span>
                              </Button>
                            )}
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={() => showRoute(hospital)}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>Map Route</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                            onClick={() => openInGoogleMaps(hospital)}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>Google Maps</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Show More button */}
                {hospitals.length > 5 && (
                  <Button
                    variant="outline"
                    className="mt-2 w-full py-6 text-lg hover:bg-gray-100"
                    onClick={() => setShowAllHospitals(!showAllHospitals)}
                  >
                    {showAllHospitals
                      ? "Show Less"
                      : `Show More (${hospitals.length - 5} more facilities)`}
                  </Button>
                )}
              </div>
            </>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Emergency Numbers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                      <Phone className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="font-medium text-lg mb-1">Ambulance</span>
                    <span className="text-sm text-gray-600 mb-3">
                      Medical Emergency
                    </span>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full bg-red-50 hover:bg-red-100 border-red-200"
                      onClick={() => callHospital("102")}
                    >
                      <Phone className="h-4 w-4 mr-2 text-red-600" />
                      <span className="text-red-600 font-semibold">102</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="font-medium text-lg mb-1">Police</span>
                    <span className="text-sm text-gray-600 mb-3">
                      Law Enforcement
                    </span>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200"
                      onClick={() => callHospital("100")}
                    >
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-blue-600 font-semibold">100</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                      <Phone className="h-6 w-6 text-orange-600" />
                    </div>
                    <span className="font-medium text-lg mb-1">Fire</span>
                    <span className="text-sm text-gray-600 mb-3">
                      Fire Emergency
                    </span>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full bg-orange-50 hover:bg-orange-100 border-orange-200"
                      onClick={() => callHospital("101")}
                    >
                      <Phone className="h-4 w-4 mr-2 text-orange-600" />
                      <span className="text-orange-600 font-semibold">101</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditingContacts} onOpenChange={setIsEditingContacts}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Emergency Contacts</DialogTitle>
            <DialogDescription>
              Add or remove emergency contacts who will receive SOS messages
              with your location.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newContact.name}
                onChange={(e) =>
                  setNewContact({ ...newContact, name: e.target.value })
                }
                placeholder="Contact Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={newContact.phone}
                onChange={(e) =>
                  setNewContact({ ...newContact, phone: e.target.value })
                }
                placeholder="Phone Number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={newContact.relationship}
                onChange={(e) =>
                  setNewContact({ ...newContact, relationship: e.target.value })
                }
                placeholder="Relationship (e.g., Parent, Spouse)"
              />
            </div>
            <Button onClick={addEmergencyContact}>Add Contact</Button>

            <div className="mt-4">
              <h4 className="mb-2 font-semibold">Current Emergency Contacts</h4>
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                    <p className="text-sm text-gray-500">
                      {contact.relationship}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEmergencyContact(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Emergency;
