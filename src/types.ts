export type MotionType = "zoom-in" | "zoom-out" | "slide-right" | "slide-left" | "slide-up";
export type ColorPreset = "classic" | "garden" | "ocean" | "forest";
export type Attendance = "yes" | "no" | "undecided";
export type MealPreference = "한식" | "양식" | "없음";

export interface ColorTheme {
  bg: string;
  text: string;
  accent: string;
  button: string;
  buttonText: string;
  preset: ColorPreset;
}

export interface InvitationCover {
  imageUrl: string;
  motion: MotionType;
  letteringText: string;
  showGradient: boolean;
}

export interface CoupleInfo {
  groomName: string;
  brideName: string;
  groomFamily: string;
  brideFamily: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  venueAddress: string;
  venueDetail?: string;
  message: string;
}

export interface RSVPEntry {
  id: string;
  name: string;
  attendance: Attendance;
  guestCount: number;
  mealPreference: MealPreference;
  message: string;
  createdAt: string;
}

export interface GuestMessage {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface LocationInfo {
  subwayInfo: string;
  busInfo: string;
  carInfo: string;
  walkInfo: string;
  markerTitle: string;
  markerIconIdx: number;
}

export interface NearbyItem {
  id: string;
  title: string;
  desc: string;
  imageUrl: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
}

export interface Invitation {
  id: string;
  entryCode: string;
  couple: CoupleInfo;
  cover: InvitationCover;
  colorTheme: ColorTheme;
  gallery: string[];
  rsvpList: RSVPEntry[];
  messages: GuestMessage[];
  viewCount: number;
  createdAt: string;
  location?: LocationInfo;
  noticeItems?: NoticeItem[];
  noticeTitle?: string;
  nearbyItems?: NearbyItem[];
  nearbyTitle?: string;
  nearbySubtitle?: string;
  msgTitle?: string;
}

export interface User {
  name: string;
  avatar: string;
}

export interface Template {
  id: string;
  name: string;
  tags: string[];
  previewUrl: string;
  colorPreset: ColorPreset;
  motionType: MotionType;
}

export const COLOR_PRESETS: Record<ColorPreset, Omit<ColorTheme, "preset">> = {
  classic: { bg: "#faf8f5", text: "#3a3535", accent: "#b89a6a", button: "#3a3535", buttonText: "#ffffff" },
  garden:  { bg: "#f0f4ef", text: "#2d3a2d", accent: "#8a9e8a", button: "#4a6b4a", buttonText: "#ffffff" },
  ocean:   { bg: "#eff5f8", text: "#1a2f3a", accent: "#6a9eb5", button: "#2a5f7a", buttonText: "#ffffff" },
  forest:  { bg: "#ede8e0", text: "#2a2218", accent: "#7a6a4a", button: "#4a3a28", buttonText: "#ffffff" },
};


// 임시!!!!!
export interface Photo {
  id: string;
  image_url: string;
  like_count: number;
  user?: { display_name: string };
  [key: string]: unknown;
}
export interface Guestbook {
  id: string;
  message: string;
  user?: { display_name: string };
  [key: string]: unknown;
}
export interface Wedding {
  id: string;
  wedding_date?: string;
  wedding_time?: string;
  location_name?: string;
  location_address?: string;
  [key: string]: unknown;
}