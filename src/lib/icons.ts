/*  Curated icon set (tree-shakeable). Used by the site renderers and the admin icon picker. */
import {
  Award, BadgeCheck, Banknote, Bath, Blocks, BrickWall, Briefcase, Building, Building2, Bus, Calculator, Calendar, CalendarCheck, Car, Castle, ChartBar, CircleCheck, CircleCheckBig, CircleHelp, ClipboardCheck, ClipboardList, Clock, Code, Compass, Construction, Cog, Crown, DoorOpen, DraftingCompass, Drill, Droplets, Factory, FileBadge, FileCheck, FileText, Files, Flame, Gauge, Gem, Globe, GraduationCap, HandCoins, Handshake, HardHat, Heading1, Heart, Home, Hospital, Hotel, House, HousePlus, Image, Images, KeyRound, Landmark, Layers, LayoutGrid, LayoutList, Lightbulb, ListOrdered, Lock, Mail, Map, MapPin, MessageCircle, MoveHorizontal, Package, PaintRoller, Paintbrush, PanelsTopLeft, Pencil, PencilRuler, Phone, PhoneCall, Plug, Quote, Ruler, School, ScrollText, SeparatorHorizontal, Settings, Shield, ShieldCheck, Shovel, Sparkles, Star, Store, Sun, Target, ThumbsUp, Timer, TrendingUp, Trophy, Truck, Type, Users, Video, Warehouse, Wrench, Zap, Bed, Trees, Waves, Fence, Anchor, Sofa, Lamp, Wind, Thermometer, Hammer, Bolt, CircleDollarSign, Percent, TriangleAlert, Eye, Search, Send, Smile, BookOpen, Info, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check, X, Menu, Plus, Minus, ExternalLink, Play, Ghost, Music2, Printer, Copy, Download,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string; absoluteStrokeWidth?: boolean }>;

export const ICONS: Record<string, IconComponent> = {
  Award, BadgeCheck, Banknote, Bath, Blocks, BrickWall, Briefcase, Building, Building2, Bus, Calculator, Calendar, CalendarCheck, Car, Castle, ChartBar, CircleCheck, CircleCheckBig, CircleHelp, ClipboardCheck, ClipboardList, Clock, Code, Compass, Construction, Cog, Crown, DoorOpen, DraftingCompass, Drill, Droplets, Factory, FileBadge, FileCheck, FileText, Files, Flame, Gauge, Gem, Globe, GraduationCap, HandCoins, Handshake, HardHat, Heading1, Heart, Home, Hospital, Hotel, House, HousePlus, Image, Images, KeyRound, Landmark, Layers, LayoutGrid, LayoutList, Lightbulb, ListOrdered, Lock, Mail, Map, MapPin, MessageCircle, MoveHorizontal, Package, PaintRoller, Paintbrush, PanelsTopLeft, Pencil, PencilRuler, Phone, PhoneCall, Plug, Quote, Ruler, School, ScrollText, SeparatorHorizontal, Settings, Shield, ShieldCheck, Shovel, Sparkles, Star, Store, Sun, Target, ThumbsUp, Timer, TrendingUp, Trophy, Truck, Type, Users, Video, Warehouse, Wrench, Zap, Bed, Trees, Waves, Fence, Anchor, Sofa, Lamp, Wind, Thermometer, Hammer, Bolt, CircleDollarSign, Percent, TriangleAlert, Eye, Search, Send, Smile, BookOpen, Info, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check, X, Menu, Plus, Minus, ExternalLink, Play, Ghost, Music2, Printer, Copy, Download,
};

/** Icons offered in the admin picker (the rest are UI-only) */
export const PICKER_ICONS = [
  "Hammer", "HardHat", "Shovel", "DraftingCompass", "PencilRuler", "Ruler", "Compass", "PaintRoller", "Paintbrush", "Drill", "Wrench", "Construction", "BrickWall", "Blocks", "Layers", "Cog", "Bolt",
  "Building", "Building2", "House", "Home", "HousePlus", "Store", "Landmark", "Warehouse", "Factory", "Hotel", "Hospital", "School", "Castle", "Fence", "DoorOpen", "Bed", "Bath", "Sofa", "Lamp", "Trees", "Waves", "Sun", "Wind", "Thermometer", "Droplets", "Flame", "Plug", "Anchor",
  "FileCheck", "FileText", "FileBadge", "Files", "ScrollText", "ClipboardCheck", "ClipboardList", "Calculator", "Calendar", "CalendarCheck", "Clock", "Timer", "Gauge", "ChartBar", "TrendingUp", "Target", "Zap",
  "ShieldCheck", "Shield", "BadgeCheck", "CircleCheck", "CircleCheckBig", "Award", "Trophy", "Crown", "Gem", "Star", "Heart", "ThumbsUp", "Smile", "Handshake", "Users", "Briefcase", "GraduationCap", "Lightbulb", "Sparkles", "KeyRound", "Lock", "Eye", "Search", "Globe", "Map", "MapPin",
  "Phone", "PhoneCall", "MessageCircle", "Mail", "Send", "Info", "CircleHelp", "Quote", "Banknote", "HandCoins", "CircleDollarSign", "Percent", "Truck", "Car", "Bus", "Package", "Printer", "Video", "Image", "Images", "Play", "BookOpen",
];

export function getIcon(name: string | undefined | null): IconComponent | null {
  if (!name) return null;
  return ICONS[name] || null;
}
