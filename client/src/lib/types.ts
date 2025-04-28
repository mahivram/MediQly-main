export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  currentUser: User | null;
  currentDoctor: Doctor | null;
  userType: "user" | "doctor" | null;
}
