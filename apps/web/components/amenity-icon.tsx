import {
  Bath,
  Car,
  Droplets,
  Home,
  Mountain,
  PawPrint,
  Plug,
  ShowerHead,
  Signal,
  Sparkles,
  Users,
  Waves,
  Zap,
  Tent,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  toilet: Bath,
  shower: ShowerHead,
  electricity: Zap,
  power_outlet: Plug,
  phone_signal: Signal,
  car_access: Car,
  pet_friendly: PawPrint,
  beginner_friendly: Sparkles,
  family_friendly: Users,
  riverside: Waves,
  mountain_view: Mountain,
  cabin: Home,
  water: Droplets,
};

export function AmenityIcon({ keyName, className }: { keyName: string; className?: string }) {
  const Icon = MAP[keyName] ?? Tent;
  return <Icon className={className} />;
}
