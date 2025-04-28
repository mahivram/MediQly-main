import { Coordinate } from "recharts/types/util/types";

interface UserProps {
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
}
interface cardsProps {
  title: string;
  value: string;
  trend: string;
  icon: undefined;
  trendDirection: undefined;
}
type locationProp = {
  coordinates: [number, number];
};
interface profileProps {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dob?: string;
  gender?: string;
  isOnline?: boolean;
  location?: locationProp;
}

interface doctorProfileProps {
  _id?:string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isOnline?: boolean;
  location?: locationProp;
  specialization?: string;
  experience? : number;
}
export type { UserProps, cardsProps, profileProps, doctorProfileProps };
