import {
  Sparkles,
  Palette,
  Code2,
  Search,
  Rocket,
  Smartphone,
  Globe,
  ShoppingBag,
  PenTool,
  BarChart3,
  Camera,
  Megaphone,
  Layers,
  Shield,
  Cloud,
  Cpu,
  Database,
  Mail,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  palette: Palette,
  code: Code2,
  search: Search,
  rocket: Rocket,
  smartphone: Smartphone,
  globe: Globe,
  shop: ShoppingBag,
  pen: PenTool,
  analytics: BarChart3,
  camera: Camera,
  megaphone: Megaphone,
  layers: Layers,
  shield: Shield,
  cloud: Cloud,
  cpu: Cpu,
  database: Database,
  mail: Mail,
  video: Video,
  zap: Zap,
};

export const SERVICE_ICON_KEYS = Object.keys(SERVICE_ICONS);

export function getServiceIcon(key: string): LucideIcon {
  return SERVICE_ICONS[key] ?? Sparkles;
}
