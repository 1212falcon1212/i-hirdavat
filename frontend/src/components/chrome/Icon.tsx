"use client";

import {
  AlertTriangle,
  Bell,
  Bolt,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  FileText,
  Filter,
  Heart,
  Info,
  Lightbulb,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tag,
  Trophy,
  Truck,
  User,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons = {
  alert: AlertTriangle,
  bell: Bell,
  bolt: Bolt,
  cart: ShoppingCart,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  clock: Clock,
  doc: FileText,
  download: Download,
  filter: Filter,
  heart: Heart,
  "heart-fill": Heart,
  info: Info,
  menu: Menu,
  minus: Minus,
  package: Package,
  phone: Phone,
  pin: MapPin,
  plus: Plus,
  search: Search,
  shield: ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  store: Store,
  tag: Tag,
  trophy: Trophy,
  truck: Truck,
  user: User,
  wallet: Wallet,
  wrench: Wrench,
  x: X,
  chat: MessageCircle,
  drill: Wrench,
  trending: Trophy,
  light: Lightbulb,
  box: Box,
} satisfies Record<string, LucideIcon>;

export type ChromeIconName = keyof typeof icons;

export function ChromeIcon({
  name,
  size = 16,
  className,
}: {
  name: ChromeIconName | string | null | undefined;
  size?: number;
  className?: string;
}) {
  const Icon = icons[(name || "box") as ChromeIconName] ?? Box;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
