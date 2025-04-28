import { createContext, useContext, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom"; // 🔹 Added `useLocation`
import api from "@/utils/api";
import { getToken, getUserType } from "@/hooks/auth";
import { profileProps, doctorProfileProps } from "@/lib/user.type";
import { LoaderIcon } from "lucide-react";
import "@/App.css";

interface AuthContextType {
  currentUser: profileProps | null;
  currentDoctor: doctorProfileProps | null;
  userType: "user" | "doctor" | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation(); // 🔹 Get current route
  const token = getToken();
  const userType = getUserType();

  // 🔹 Fetch User Profile (For Users)
  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      if (!token || userType !== "user") return null;
      const { data } = await api.get("/users/profile");
      return data;
    },
    enabled: !!token && userType === "user",
    staleTime: 5 * 60 * 1000,
  });

  // 🔹 Fetch Doctor Profile (For Doctors)
  const { data: currentDoctor, isLoading: isDoctorLoading } = useQuery({
    queryKey: ["currentDoctor"],
    queryFn: async () => {
      if (!token || userType !== "doctor") return null;
      const { data } = await api.get("/doctors/profile");
      navigate("/");
      return data;
    },
    enabled: !!token && userType === "doctor",
    staleTime: 5 * 60 * 1000,
  });
  console.log(currentUser, currentDoctor, "data calling");

  // 🔹 Compute Authentication State
  const isLoading = isUserLoading || isDoctorLoading;
  const isAuthenticated = useMemo(
    () => !!(currentUser || currentDoctor),
    [currentUser, currentDoctor]
  );

  // 🔹 Redirect Only on **Protected Routes**
  useEffect(() => {
    console.log("render auth provider");

    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // 🔹 Show Loading While Fetching Data
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-screen h-[100vh]">
        <span className="loader"></span>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, currentDoctor, userType, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
