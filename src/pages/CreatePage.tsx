import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  ChevronLeft, Check, Save, Plus, X, Eye,
  Copy, ChevronDown, ChevronUp, Trash2, MapPin,
  RotateCcw, Image as ImageIcon, Palette, Mail, Users,
  CalendarDays, CreditCard, Info, MessageCircle, Grid, Sparkles,
  Crop, Compass, Search, Loader2,
} from "lucide-react";
import type { MotionType } from "../types";
import { DEMO_COVER_IMAGES } from "../demo";
import { useInviteStore } from "../store/inviteStore";
import type { CoupleInfo, InvitationCover, ColorTheme, NoticeItem, NearbyItem } from "../types";
import KakaoMap from "../components/common/KakaoMap";
import { api } from "../api";
import { getAccessToken, getDisplayNameFromToken } from "../utils/auth";

type TabId =
  | "cover" | "style" | "greeting" | "basicinfo" | "ceremony"
  | "location" | "account" | "notice" | "nearby" | "gallery" | "message" | "ending";
type BasicInfoPreset = "simple" | "duo" | "poetic";
type GradientDir   = "bottom" | "top" | "full";
type GradientTone  = "strong" | "medium" | "light";
type FontId        = "pretendard" | "hahmlet" | "gowun" | "gmarket";
type GreetingAnim  = "none" | "fade" | "slide-up" | "slide-left" | "zoom";
type GreetingBgPos = "top" | "bottom";
type TransportTab  = "subway" | "bus" | "car" | "walk";
type GalleryLayout = "grid" | "slideshow";
type AnimVal = { scale?: number; x?: string | number; y?: string | number };
interface Account     { bank: string; holder: string; number: string; relation: string; }
interface LocalMessage{ id: string; name: string; content: string; likes: number; createdAt: string; }
interface NearbyRecommendation {
  id: string;
  placeName: string;
  addressName: string;
  roadAddressName: string;
  phone: string;
  categoryName: string;
  recommendationType: string;
  x: string;
  y: string;
  imageUrl?: string;
  naverMapUrl?: string;
}

const EDITOR_PINK = "#F4768A";
const EDITOR_PINK_BG = "#FFF0F2";

const NAV_TABS: { id: TabId; label: string; Icon: React.ElementType; desc: string }[] = [
  { id: "cover",    label: "커버",    Icon: ImageIcon,    desc: "청첩장이 로딩되는 동안 처음 5초간 보여지는 화면이에요." },
  { id: "style",    label: "스타일",  Icon: Palette,      desc: "색상, 폰트 등 청첩장 전체 스타일을 설정해요." },
  { id: "greeting", label: "인사말",  Icon: Mail,         desc: "소중한 분들께 보내는 초대 인사말을 작성해요." },
  { id: "basicinfo",label: "기본정보",Icon: Users,        desc: "신랑, 신부의 기본 정보를 입력해요." },
  { id: "ceremony", label: "예식정보",Icon: CalendarDays, desc: "예식 일시와 장소 정보를 입력해요." },
  { id: "location", label: "오시는길",Icon: MapPin,       desc: "예식장 위치와 교통 안내를 설정해요." },
  { id: "account",  label: "계좌정보",Icon: CreditCard,   desc: "축의금 계좌를 등록해요." },
  { id: "notice",   label: "안내사항",Icon: Info,         desc: "식사, 주차 등 안내사항을 추가해요." },
  { id: "nearby",   label: "주변정보",Icon: Compass,      desc: "예식장 주변 즐길 거리를 소개해요." },
  { id: "gallery",  label: "갤러리",  Icon: Grid,         desc: "웨딩 사진 갤러리를 구성해요." },
  { id: "message",  label: "메시지",  Icon: MessageCircle,desc: "하객들의 축하 메시지를 관리해요." },
  { id: "ending",   label: "엔딩",    Icon: Sparkles,     desc: "청첩장 마지막 화면을 꾸며요." },
];

const MOTIONS: { type: MotionType; label: string; icon: string; initial: AnimVal }[] = [
  { type: "zoom-in",     label: "줌인",   icon: "🔍", initial: { scale: 1.15 } },
  { type: "zoom-out",    label: "줌아웃", icon: "🔎", initial: { scale: 0.88 } },
  { type: "slide-right", label: "오른쪽", icon: "→",  initial: { x: "-8%" } },
  { type: "slide-left",  label: "왼쪽",   icon: "←",  initial: { x: "8%" } },
  { type: "slide-up",    label: "위로",   icon: "↑",  initial: { y: "8%" } },
];

const GRADIENT_MAP: Record<string, string> = {
  "bottom-strong": "bg-gradient-to-t from-black/85 via-black/30 to-black/10",
  "bottom-medium": "bg-gradient-to-t from-black/70 via-black/15 to-transparent",
  "bottom-light":  "bg-gradient-to-t from-black/40 via-transparent to-transparent",
  "top-strong":    "bg-gradient-to-b from-black/80 via-black/20 to-transparent",
  "top-medium":    "bg-gradient-to-b from-black/50 via-transparent to-transparent",
  "top-light":     "bg-gradient-to-b from-black/25 to-transparent",
  "full-strong":   "bg-gradient-to-b from-black/60 via-black/30 to-black/60",
  "full-medium":   "bg-gradient-to-b from-black/40 via-black/15 to-black/40",
  "full-light":    "bg-gradient-to-b from-black/20 via-transparent to-black/20",
};

const FONT_OPTIONS: { id: FontId; label: string; style: React.CSSProperties }[] = [
  { id: "pretendard", label: "Pretendard",  style: { fontFamily: "'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif" } },
  { id: "hahmlet",    label: "Hahmlet",     style: { fontFamily: "'Hahmlet', serif" } },
  { id: "gowun",      label: "고운돋움",    style: { fontFamily: "'Gowun Dodum', sans-serif" } },
  { id: "gmarket",    label: "지마켓산스",  style: { fontFamily: "'GmarketSans', 'Apple SD Gothic Neo', sans-serif" } },
];


const DEFAULT_NOTICES: NoticeItem[] = [
  { id: "n1", title: "식사 안내", content: "예식 후 피로연이 준비되어 있습니다. 많은 참석 바랍니다." },
  { id: "n2", title: "주차 안내", content: "건물 지하 주차장을 이용해 주세요. 3시간 무료 주차 가능합니다." },
];
const DEFAULT_MESSAGES: LocalMessage[] = [
  { id: "msg1", name: "서다영", content: "두 분 정말 잘 어울려요! 행복하게 사세요 💕", likes: 3, createdAt: "2025-10-01" },
  { id: "msg2", name: "이지원", content: "오래오래 행복하길 바랍니다 🥳",               likes: 1, createdAt: "2025-10-02" },
];

// ─── Color utilities ────────────────────────────────────────────────────────
function hexToHsv(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  if (c.length !== 6) return [0, 0, 100];
  const r = parseInt(c.slice(0,2),16)/255, g = parseInt(c.slice(2,4),16)/255, b = parseInt(c.slice(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = 60 * (((g-b)/d) % 6);
    else if (max === g) h = 60 * ((b-r)/d + 2);
    else h = 60 * ((r-g)/d + 4);
  }
  if (h < 0) h += 360;
  return [Math.round(h), max === 0 ? 0 : Math.round(d/max*100), Math.round(max*100)];
}
function hsvToHex(h: number, s: number, v: number): string {
  const s1 = s/100, v1 = v/100, c = v1*s1, x = c*(1-Math.abs((h/60)%2-1)), m = v1-c;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}
  else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
  const hex=(n:number)=>Math.round((n+m)*255).toString(16).padStart(2,'0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

// ─── Color Picker ────────────────────────────────────────────────────────────
function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hue, setHue]     = useState(() => hexToHsv(value)[0]);
  const [sat, setSat]     = useState(() => hexToHsv(value)[1]);
  const [bri, setBri]     = useState(() => hexToHsv(value)[2]);
  const [hexVal, setHexVal] = useState(value.toUpperCase());
  const areaRef  = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const hRef = useRef(hue); hRef.current = hue;
  const sRef = useRef(sat); sRef.current = sat;
  const bRef = useRef(bri); bRef.current = bri;

  useEffect(() => {
    const [h,s,v] = hexToHsv(value);
    setHue(h); setSat(s); setBri(v); setHexVal(value.toUpperCase());
  }, [value]);

  const pick = useCallback((cx: number, cy: number) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const ns = Math.round(Math.max(0,Math.min(1,(cx-rect.left)/rect.width))*100);
    const nv = Math.round(Math.max(0,Math.min(1,1-(cy-rect.top)/rect.height))*100);
    setSat(ns); setBri(nv);
    const hex = hsvToHex(hRef.current, ns, nv);
    setHexVal(hex.toUpperCase()); onChange(hex);
  }, [onChange]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (dragging.current) pick(e.clientX, e.clientY); };
    const onUp   = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [pick]);

  const hueColor   = `hsl(${hue},100%,50%)`;
  const currentHex = hsvToHex(hue, sat, bri);

  return (
    <div className="flex flex-col gap-3">
      {/* 2D gradient */}
      <div ref={areaRef}
        className="relative rounded-xl overflow-hidden cursor-crosshair select-none"
        style={{ height: 160, background: `linear-gradient(to bottom,transparent,#000),linear-gradient(to right,#fff,${hueColor})` }}
        onMouseDown={(e) => { dragging.current = true; pick(e.clientX, e.clientY); }}>
        <div className="absolute w-4 h-4 rounded-full border-2 border-white shadow pointer-events-none"
          style={{ left:`${sat}%`, top:`${100-bri}%`, transform:'translate(-50%,-50%)', backgroundColor: currentHex }} />
      </div>
      {/* Hue slider */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full border border-gray-200 shadow-sm flex-shrink-0" style={{ backgroundColor: currentHex }} />
        <input type="range" min={0} max={360} value={hue}
          onChange={(e) => {
            const h = Number(e.target.value); setHue(h);
            const hex = hsvToHex(h, sRef.current, bRef.current);
            setHexVal(hex.toUpperCase()); onChange(hex);
          }}
          className="flex-1 h-3 rounded-full cursor-pointer appearance-none"
          style={{ background:'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
        />
      </div>
      {/* Alpha slider (visual only) */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full border border-gray-200 flex-shrink-0 overflow-hidden"
          style={{ background:'conic-gradient(#ccc 25%,#fff 0 50%,#ccc 0 75%,#fff 0) 0 0/8px 8px' }} />
        <div className="flex-1 h-3 rounded-full overflow-hidden relative"
          style={{ background:'conic-gradient(#ccc 25%,#fff 0 50%,#ccc 0 75%,#fff 0) 0 0/8px 8px' }}>
          <div className="absolute inset-0 rounded-full" style={{ background:`linear-gradient(to right,transparent,${currentHex})` }} />
        </div>
      </div>
      {/* HEX input */}
      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
        <span className="text-xs text-gray-400 font-medium w-8">HEX</span>
        <input value={hexVal} maxLength={7}
          onChange={(e) => {
            const v = e.target.value.toUpperCase(); setHexVal(v);
            if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
              const [h,s,bv] = hexToHsv(v); setHue(h); setSat(s); setBri(bv); onChange(v);
            }
          }}
          className="flex-1 text-sm text-gray-800 outline-none bg-transparent font-mono"
        />
      </div>
    </div>
  );
}

// ─── Greeting animation variants ────────────────────────────────────────────
const GREETING_ANIMS: { id: GreetingAnim; label: string }[] = [
  { id: "none",        label: "없음" },
  { id: "fade",        label: "페이드" },
  { id: "slide-up",    label: "슬라이드↑" },
  { id: "slide-left",  label: "슬라이드←" },
  { id: "zoom",        label: "줌인" },
];
const GREETING_ANIM_VARIANTS = {
  none:          { hidden: {},                           visible: {} },
  fade:          { hidden: { opacity: 0 },               visible: { opacity: 1 } },
  "slide-up":    { hidden: { opacity: 0, y: 30 },        visible: { opacity: 1, y: 0 } },
  "slide-left":  { hidden: { opacity: 0, x: 30 },        visible: { opacity: 1, x: 0 } },
  zoom:          { hidden: { opacity: 0, scale: 0.82 },  visible: { opacity: 1, scale: 1 } },
};
const PREVIEW_SECTION = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// ─── Texture options ─────────────────────────────────────────────────────────
const TEXTURE_OPTIONS = [
  { id: "none",    label: "없음",    bgImage: null },
  { id: "linen",   label: "딴또레또", bgImage: "repeating-linear-gradient(45deg,rgba(0,0,0,0.06),rgba(0,0,0,0.06) 2px,transparent 2px,transparent 4px)" },
  { id: "cotton",  label: "리넨",    bgImage: "repeating-linear-gradient(0deg,transparent,transparent 5px,rgba(0,0,0,0.04) 5px,rgba(0,0,0,0.04) 6px),repeating-linear-gradient(90deg,transparent,transparent 5px,rgba(0,0,0,0.04) 5px,rgba(0,0,0,0.04) 6px)" },
  { id: "grain",   label: "그레인",  bgImage: "radial-gradient(ellipse at 30% 40%,rgba(255,255,255,0.4) 0%,transparent 55%),radial-gradient(ellipse at 70% 65%,rgba(180,160,140,0.2) 0%,transparent 50%)" },
  { id: "ivory",   label: "아이보리", bgImage: "linear-gradient(160deg,rgba(255,252,245,0.6) 0%,rgba(235,220,200,0.5) 100%)" },
  { id: "marble",  label: "마블",    bgImage: "repeating-linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.12) 4px,rgba(0,0,0,0.04) 4px,rgba(0,0,0,0.04) 8px)" },
];

function CountdownTimer({ weddingDate, weddingTime, fontColor, bgColor }: { weddingDate: string; weddingTime: string; fontColor: string; bgColor: string }) {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const [y, mo, dd] = weddingDate.split("-").map(Number);
      const [hh, mm] = weddingTime.split(":").map(Number);
      const diff = Math.max(0, new Date(y, mo - 1, dd, hh, mm).getTime() - Date.now());
      setCd({ d: Math.floor(diff / 86400000), h: Math.floor(diff % 86400000 / 3600000), m: Math.floor(diff % 3600000 / 60000), s: Math.floor(diff % 60000 / 1000) });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [weddingDate, weddingTime]);
  return (
    <>
      <div className="flex items-end justify-center gap-3 pt-1">
        {([["일", cd.d], ["시간", cd.h], ["분", cd.m], ["초", cd.s]] as [string, number][]).map(([label, val], i) => (
          <div key={label} className="flex flex-col items-center">
            {i > 0 && <span className="text-[10px] font-semibold absolute -ml-3 mt-2.5" style={{ color: fontColor, opacity: 0.4 }}>:</span>}
            <span className="text-[8px] mb-0.5" style={{ color: fontColor, opacity: 0.5 }}>{label}</span>
            <span className="text-[14px] font-bold leading-none" style={{ color: fontColor }}>{String(val).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[8px] mt-1.5" style={{ color: fontColor, opacity: 0.55 }}>{cd.d}일 남았습니다</p>
    </>
  );
}

function SectionBlock({ title, children, large }: { title: string; children: React.ReactNode; large?: boolean }) {
  return (
    <div className="flex flex-col gap-3 py-8 border-b border-gray-100 first:pt-0 last:border-0 last:pb-0">
      <p className={large ? "text-base font-bold text-gray-800" : "text-sm font-semibold text-gray-700"}>{title}</p>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
      style={{ backgroundColor: value ? EDITOR_PINK : "#E5E7EB" }}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function SegRow<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className="py-2 rounded-xl text-xs font-medium transition-all border"
          style={value === v
            ? { backgroundColor: EDITOR_PINK, color: "#fff", borderColor: EDITOR_PINK }
            : { backgroundColor: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AdjSlider({ label, value, onChange, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs text-gray-700 font-medium tabular-nums">{value.toFixed(2)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full cursor-pointer appearance-none"
        style={{ accentColor: EDITOR_PINK }}
      />
    </div>
  );
}

function ToastBanner({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg z-[60] pointer-events-none whitespace-nowrap"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white transition-colors placeholder-gray-300 text-gray-800";

export default function CreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editWeddingId = searchParams.get("weddingId");
  const isEditMode = !!editWeddingId;
  const { createInvitation } = useInviteStore();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 1. 주소창에 백엔드가 달아놓은 ?token=... 파라미터 확인
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("momentin_access_token", token);
      setIsLoggedIn(true);
      setKakaoUser(getDisplayNameFromToken(token));
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("✅ 카카오 인증 로그인이 완료되었습니다!");
    } else {
      const storedToken = getAccessToken();
      if (storedToken) {
        setIsLoggedIn(true);
        setKakaoUser(getDisplayNameFromToken(storedToken));
      }
    }
  }, []);

  const [activeTab, setActiveTab]           = useState<TabId>("cover");
  const [submitting, setSubmitting]         = useState(false);
  const [saved, setSaved]                   = useState(false);
  const [kakaoUser, setKakaoUser]           = useState<string | null>(() => getDisplayNameFromToken());
  const [motionKey, setMotionKey]           = useState(0);
  const [previewMode, setPreviewMode]       = useState<"cover" | "full">("cover");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [toast, setToast]                   = useState("");
  const [toastVisible, setToastVisible]     = useState(false);

  const showToast = (msg: string) => {
    setToast(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500);
  };

  const [coverImage, setCoverImage]         = useState(DEMO_COVER_IMAGES[0]);
  const [coverImage2, setCoverImage2]       = useState(DEMO_COVER_IMAGES[1]);
  const [motionType, setMotionType]         = useState<MotionType>("zoom-in");
  const [showGradient, setShowGradient]     = useState(true);
  const [gradientDir, setGradientDir]       = useState<GradientDir>("bottom");
  const [gradientTone, setGradientTone]     = useState<GradientTone>("medium");
  const [showCountdown, setShowCountdown]   = useState(true);
  const [coverTextColor, setCoverTextColor] = useState("#ffffff");
  const [brightness, setBrightness]         = useState(1.0);
  const [contrast, setContrast]             = useState(1.0);
  const [saturation, setSaturation]         = useState(1.0);
  const [grayscale, setGrayscale]           = useState(0.0);
  const [temperature, setTemperature]       = useState(0.0);

  const [fontFamily, setFontFamily]         = useState<FontId>("pretendard");
  const [bgTexture, setBgTexture]           = useState("none");
  const [bgColor, setBgColor]               = useState("#ffffff");
  const [fontColor, setFontColor]           = useState("#3a3535");
  const [colorPaletteTab, setColorPaletteTab] = useState<"bg" | "font">("bg");

  const [greetingTitle, setGreetingTitle]   = useState("함께하는 시작");
  const [greetingMsg, setGreetingMsg]       = useState("서로가 서로에게 세상 전부가 되어\n새로운 시작의 문을 열려 합니다.\n저희의 시작을 따뜻하게 축복해 주세요.");
  const [greetingBgPos, setGreetingBgPos]   = useState<GreetingBgPos>("top");
  const [greetingAnim, setGreetingAnim]     = useState<GreetingAnim>("fade");

  const [basicInfoTitle, setBasicInfoTitle]   = useState("우리의 소개");
  const [groomFirst, setGroomFirst]           = useState(true);
  const [hideParents, setHideParents]         = useState(false);
  const [basicInfoPreset, setBasicInfoPreset] = useState<BasicInfoPreset>("simple");
  const [groomName, setGroomName]             = useState("이준호");
  const [groomIntro, setGroomIntro]           = useState("다정하고 따뜻한 사람");
  const [groomRelation, setGroomRelation]     = useState("아들");
  const [groomContact, setGroomContact]       = useState("");
  const [brideName, setBrideName]             = useState("박서연");
  const [brideIntro, setBrideIntro]           = useState("밝고 사랑스러운 사람");
  const [brideRelation, setBrideRelation]     = useState("딸");
  const [brideContact, setBrideContact]       = useState("");
  const [showContact, setShowContact]         = useState(false);
  const [groomDadName, setGroomDadName]       = useState("이상훈");
  const [groomMomName, setGroomMomName]       = useState("최미영");
  const [brideDadName, setBrideDadName]       = useState("박철수");
  const [brideMomName, setBrideMomName]       = useState("김혜진");
  const [groomDadDeceased, setGroomDadDeceased] = useState(false);
  const [groomMomDeceased, setGroomMomDeceased] = useState(false);
  const [brideDadDeceased, setBrideDadDeceased] = useState(false);
  const [brideMomDeceased, setBrideMomDeceased] = useState(false);

  const [ceremonyTitle, setCeremonyTitle]     = useState("예식 안내");
  const [showCeremonySubtitle]                = useState(true);
  const [ceremonySubtitleLang]                = useState<"ko"|"en"|"ja"|"zh">("en");
  const [showDDay, setShowDDay]               = useState(true);
  const [weddingDate, setWeddingDate]       = useState("2025-10-18");
  const [weddingTime, setWeddingTime]       = useState("14:00");
  const [venueName, setVenueName]           = useState("더 플라자 호텔 서울");
  const [hallName, setHallName]             = useState("그랜드볼룸 2층");
  const [address, setAddress]               = useState("서울특별시 중구 태평로1가 23");
  const [rsvpEnabled]                       = useState(true);

  const [locationTitle, setLocationTitle]   = useState("오시는 길");
  const [lat, setLat]                       = useState("37.5665");
  const [lng, setLng]                       = useState("126.9780");
  const [subwayInfo, setSubwayInfo]         = useState("1호선 시청역 2번 출구 도보 5분");
  const [busInfo, setBusInfo]               = useState("간선버스 103, 401 / 시청앞 하차");
  const [carInfo, setCarInfo]               = useState("강남 방면: 남산 1호 터널 → 을지로 → 시청");
  const [walkInfo, setWalkInfo]             = useState("");
  const [transportTab, setTransportTab]     = useState<TransportTab>("subway");
  const [nearbyRecommendCount, setNearbyRecommendCount] = useState(6);
  const [nearbyRecommendations, setNearbyRecommendations] = useState<NearbyRecommendation[]>([]);
  const [nearbyRecommendLoading, setNearbyRecommendLoading] = useState(false);
  const [selectedNearbyIds, setSelectedNearbyIds] = useState<string[]>([]);

  const [groomAccounts, setGroomAccounts]   = useState<Account[]>([{ bank: "국민은행", holder: "이준호", number: "123-456-789012", relation: "신랑" }]);
  const [brideAccounts, setBrideAccounts]   = useState<Account[]>([{ bank: "신한은행", holder: "박서연", number: "110-123-456789", relation: "신부" }]);
  const [accountTitle, setAccountTitle]     = useState("마음 전하실 곳");
  const [accountMsgEnabled, setAccountMsgEnabled] = useState(true);
  const [accountMsg, setAccountMsg]         = useState("참석이 어려우신 분들을 위해\n계좌 정보를 함께 안내드립니다.\n\n마음을 전해주시는 모든 분들께\n진심으로 감사드립니다.");
  const [accountGroomFirst, setAccountGroomFirst] = useState(true);
  const [accountPersonTab, setAccountPersonTab]   = useState<"groom" | "bride">("groom");
  const [previewAccTab, setPreviewAccTab]   = useState<"groom" | "bride">("groom");

  const [noticeItems, setNoticeItems]       = useState<NoticeItem[]>(DEFAULT_NOTICES);
  const [noticeTitle, setNoticeTitle]       = useState("안내사항");
  const [noticeEditorTab, setNoticeEditorTab] = useState(0);
  const [nearbyTitle, setNearbyTitle]       = useState("주변 즐길 거리");
  const [nearbySubtitle, setNearbySubtitle] = useState("식이 끝나고 오랜만에 만난 사람들과\n함께 즐겨보세요!");
  const [nearbyItems, setNearbyItems]       = useState<NearbyItem[]>([]);
  const nearbyImageRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [msgTitle, setMsgTitle] = useState("신랑 신부에게\n축하인사를 남겨주세요");
  const [moderationEnabled, setModerationEnabled] = useState(false);
  const [messageMaxLen, setMessageMaxLen]   = useState(200);
  const [messages, setMessages]             = useState<LocalMessage[]>(DEFAULT_MESSAGES);

  const [galleryLayout, setGalleryLayout]   = useState<GalleryLayout>("grid");
  const [requireKakaoAuth, setRequireKakaoAuth] = useState(false);
  const [gallery, setGallery]               = useState<string[]>(DEMO_COVER_IMAGES.slice(0, 4));
  const [lightboxIdx, setLightboxIdx]       = useState<number | null>(null);

  const [endingMsg, setEndingMsg]           = useState("두 사람의 새로운 시작을 축복해 주셔서 감사합니다.");
  const [showPetals, setShowPetals]         = useState(true);

  const [coverLayout, setCoverLayout]       = useState<"style1" | "style2">("style1");
  const [groomPhoto, setGroomPhoto]         = useState("");
  const [bridePhoto, setBridePhoto]         = useState("");
  const [greetingPhoto, setGreetingPhoto]   = useState("");

  const coverInput1Ref     = useRef<HTMLInputElement>(null);
  const coverInput2Ref     = useRef<HTMLInputElement>(null);
  const greetingPhotoRef   = useRef<HTMLInputElement>(null);
  const groomPhotoRef      = useRef<HTMLInputElement>(null);
  const bridePhotoRef      = useRef<HTMLInputElement>(null);

  const fileToUrl = (file: File) => URL.createObjectURL(file);
  const handleCoverImage1Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) { setCoverImage(fileToUrl(f)); replayMotion(); } e.target.value = "";
  };
  const handleCoverImage2Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) setCoverImage2(fileToUrl(f)); e.target.value = "";
  };
  const handleGroomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) setGroomPhoto(fileToUrl(f)); e.target.value = "";
  };
  const handleBridePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) setBridePhoto(fileToUrl(f)); e.target.value = "";
  };
  const handleGreetingPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) setGreetingPhoto(fileToUrl(f)); e.target.value = "";
  };

  const handleRecommendNearby = async () => {
    if (!address.trim() && !venueName.trim()) {
      showToast("먼저 예식장 주소나 장소명을 입력해 주세요.");
      return;
    }

    setNearbyRecommendLoading(true);
    try {
      const result = await api.recommendNearbyFacilities({
        venueName,
        venueAddress: address,
        count: nearbyRecommendCount,
      });
      const picked = result.items as NearbyRecommendation[];
      setNearbyRecommendations(picked);
      setSelectedNearbyIds([]);
      if (picked.length === 0) showToast("주변 추천 장소를 찾지 못했습니다.");
    } catch {
      showToast("주변 장소 추천을 불러오지 못했습니다.");
    } finally {
      setNearbyRecommendLoading(false);
    }
  };

  const handleToggleRecommendedNearby = (placeId: string) => {
    setSelectedNearbyIds((ids) =>
      ids.includes(placeId) ? ids.filter((id) => id !== placeId) : [...ids, placeId],
    );
  };

  const handleConfirmRecommendedNearby = () => {
    if (selectedNearbyIds.length === 0) {
      showToast("먼저 원하는 장소를 선택해 주세요.");
      return;
    }

    const selected = nearbyRecommendations.filter((place) => selectedNearbyIds.includes(place.id));
    setNearbyItems((items) => [
      ...items,
      ...selected.map((place) => {
        const placeAddress = place.roadAddressName || place.addressName;
        return {
          id: `nb${place.id}`,
          title: place.placeName,
          desc: [place.recommendationType, placeAddress, place.phone].filter(Boolean).join(" · "),
          imageUrl: place.imageUrl ?? "",
        };
      }),
    ]);
    setNearbyRecommendations([]);
    setSelectedNearbyIds([]);
    showToast("선택한 주변 장소를 추가했습니다.");
  };

  // 수정 모드: 기존 청첩장 데이터 로드
  useEffect(() => {
    if (!editWeddingId) return;
    api.getMyWedding(editWeddingId).then((wedding) => {
      const d = wedding.invitation_json ? JSON.parse(wedding.invitation_json) : {};
      if (d.bgColor) setBgColor(d.bgColor);
      if (d.fontColor) setFontColor(d.fontColor);
      if (d.fontFamily) setFontFamily(d.fontFamily);
      if (d.bgTexture !== undefined) setBgTexture(d.bgTexture);
      if (d.coverImage) setCoverImage(d.coverImage);
      if (d.coverImage2) setCoverImage2(d.coverImage2);
      if (d.coverLayout) setCoverLayout(d.coverLayout);
      if (d.motionType) setMotionType(d.motionType);
      if (d.showGradient !== undefined) setShowGradient(d.showGradient);
      if (d.gradientDir) setGradientDir(d.gradientDir);
      if (d.gradientTone) setGradientTone(d.gradientTone);
      if (d.coverTextColor) setCoverTextColor(d.coverTextColor);
      if (d.showCountdown !== undefined) setShowCountdown(d.showCountdown);
      if (d.brightness !== undefined) setBrightness(d.brightness);
      if (d.contrast !== undefined) setContrast(d.contrast);
      if (d.saturation !== undefined) setSaturation(d.saturation);
      if (d.grayscale !== undefined) setGrayscale(d.grayscale);
      if (d.greetingTitle) setGreetingTitle(d.greetingTitle);
      if (d.greetingBody) setGreetingMsg(d.greetingBody);
      if (d.greetingPhoto) setGreetingPhoto(d.greetingPhoto);
      if (d.greetingAnim) setGreetingAnim(d.greetingAnim);
      if (d.greetingBgPos) setGreetingBgPos(d.greetingBgPos);
      if (d.groomName) setGroomName(d.groomName);
      if (d.brideName) setBrideName(d.brideName);
      if (d.groomRelation) setGroomRelation(d.groomRelation);
      if (d.brideRelation) setBrideRelation(d.brideRelation);
      if (d.groomIntro) setGroomIntro(d.groomIntro);
      if (d.brideIntro) setBrideIntro(d.brideIntro);
      if (d.groomDadName) setGroomDadName(d.groomDadName);
      if (d.groomMomName) setGroomMomName(d.groomMomName);
      if (d.brideDadName) setBrideDadName(d.brideDadName);
      if (d.brideMomName) setBrideMomName(d.brideMomName);
      if (d.groomDadDeceased !== undefined) setGroomDadDeceased(d.groomDadDeceased);
      if (d.groomMomDeceased !== undefined) setGroomMomDeceased(d.groomMomDeceased);
      if (d.brideDadDeceased !== undefined) setBrideDadDeceased(d.brideDadDeceased);
      if (d.brideMomDeceased !== undefined) setBrideMomDeceased(d.brideMomDeceased);
      if (d.groomPhoto) setGroomPhoto(d.groomPhoto);
      if (d.bridePhoto) setBridePhoto(d.bridePhoto);
      if (d.basicInfoPreset) setBasicInfoPreset(d.basicInfoPreset);
      if (d.basicInfoTitle) setBasicInfoTitle(d.basicInfoTitle);
      if (d.groomFirst !== undefined) setGroomFirst(d.groomFirst);
      if (d.hideParents !== undefined) setHideParents(d.hideParents);
      if (d.showContact !== undefined) setShowContact(d.showContact);
      if (d.groomContact) setGroomContact(d.groomContact);
      if (d.brideContact) setBrideContact(d.brideContact);
      if (d.dateBlockTitle) setCeremonyTitle(d.dateBlockTitle);
      if (d.showDDay !== undefined) setShowDDay(d.showDDay);
      if (d.weddingDate) setWeddingDate(d.weddingDate);
      if (d.weddingTime) setWeddingTime(d.weddingTime);
      if (d.venueName) setVenueName(d.venueName);
      if (d.venueDetail) setHallName(d.venueDetail);
      if (d.venueAddress) setAddress(d.venueAddress);
      if (d.lat) setLat(d.lat);
      if (d.lng) setLng(d.lng);
      if (d.locationTitle) setLocationTitle(d.locationTitle);
      if (d.subwayInfo) setSubwayInfo(d.subwayInfo);
      if (d.busInfo) setBusInfo(d.busInfo);
      if (d.carInfo) setCarInfo(d.carInfo);
      if (d.walkInfo) setWalkInfo(d.walkInfo);
      if (d.accountTitle) setAccountTitle(d.accountTitle);
      if (d.accountMsg) setAccountMsg(d.accountMsg);
      if (d.accountMsgEnabled !== undefined) setAccountMsgEnabled(d.accountMsgEnabled);
      if (d.accountGroomFirst !== undefined) setAccountGroomFirst(d.accountGroomFirst);
      if (d.groomAccounts?.length) setGroomAccounts(d.groomAccounts);
      if (d.brideAccounts?.length) setBrideAccounts(d.brideAccounts);
      if (d.noticeTitle) setNoticeTitle(d.noticeTitle);
      if (d.noticeItems?.length) setNoticeItems(d.noticeItems);
      if (d.nearbyTitle) setNearbyTitle(d.nearbyTitle);
      if (d.nearbySubtitle) setNearbySubtitle(d.nearbySubtitle);
      if (d.nearbyItems?.length) setNearbyItems(d.nearbyItems);
      if (d.gallery?.length) setGallery(d.gallery);
      if (d.galleryLayout) setGalleryLayout(d.galleryLayout);
      if (d.msgTitle) setMsgTitle(d.msgTitle);
      if (d.messageMaxLen) setMessageMaxLen(d.messageMaxLen);
      if (d.endingMsg) setEndingMsg(d.endingMsg);
      if (d.showPetals !== undefined) setShowPetals(d.showPetals);
    }).catch(() => showToast("❌ 청첩장 데이터를 불러오지 못했습니다."));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editWeddingId]);

  const replayMotion = useCallback(() => setMotionKey((k) => k + 1), []);
  const handleSelectMotion = (m: MotionType) => { setMotionType(m); setMotionKey((k) => k + 1); };
  const motionCfg     = MOTIONS.find((m) => m.type === motionType)!;
  const gradientClass = GRADIENT_MAP[`${gradientDir}-${gradientTone}`] ?? GRADIENT_MAP["bottom-medium"];
  const fontStyle     = FONT_OPTIONS.find((f) => f.id === fontFamily)?.style ?? {};

  const dDay = (() => {
    const diff = Math.ceil((new Date(weddingDate).getTime() - Date.now()) / 86400000);
    if (diff === 0) return "D-DAY";
    return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
  })();


  const korDate = (() => {
    const [y, mo, dd] = weddingDate.split("-").map(Number);
    const dow = ["일","월","화","수","목","금","토"][new Date(y, mo - 1, dd).getDay()];
    return `${y}년 ${mo}월 ${dd}일 ${dow}요일`;
  })();
  const korTime = (() => {
    const [hh, mm] = weddingTime.split(":").map(Number);
    return `${hh >= 12 ? "오후" : "오전"} ${hh % 12 || 12}시${mm ? ` ${mm}분` : ""}`;
  })();
  const ceremonySubtitleMap = { ko: "예식 정보", en: "Date & Venue", ja: "式場案内", zh: "婚礼信息" };

  const imgFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) grayscale(${grayscale})`;

  const buildInvitationPayload = () => {
    const transportInfo: Record<string, string> = {};
    if (subwayInfo.trim()) transportInfo["지하철"] = subwayInfo.trim();
    if (busInfo.trim()) transportInfo["버스"] = busInfo.trim();
    if (carInfo.trim()) transportInfo["자가용"] = carInfo.trim();
    if (walkInfo.trim()) transportInfo["도보"] = walkInfo.trim();

    const safeUrl = (url: string) => (url && !url.startsWith("blob:") ? url : null);

    return {
        // 스타일
        bgColor, fontColor, fontFamily, bgTexture,
        // 커버
        coverImage: safeUrl(coverImage),
        coverImage2: safeUrl(coverImage2),
        coverLayout, motionType,
        showGradient, gradientDir, gradientTone,
        coverTextColor, showCountdown,
        brightness, contrast, saturation, grayscale,
        // 인사말
        greetingTitle, greetingBody: greetingMsg,
        greetingPhoto: safeUrl(greetingPhoto),
        greetingAnim, greetingBgPos,
        // 기본 정보
        groomName,  brideName,
        groomRelation, brideRelation,
        groomIntro, brideIntro,
        groomDadName, groomMomName, brideDadName, brideMomName,
        groomDadDeceased, groomMomDeceased, brideDadDeceased, brideMomDeceased,
        groomPhoto: safeUrl(groomPhoto),
        bridePhoto: safeUrl(bridePhoto),
        basicInfoPreset, basicInfoTitle, groomFirst, hideParents,
        showContact, groomContact, brideContact,
        // 예식
        dateBlockTitle: ceremonyTitle, showDDay,
        weddingDate, weddingTime,
        // 장소
        venueName, venueDetail: hallName, venueAddress: address, lat, lng,
        // 오시는 길
        locationTitle, transportInfo,
        subwayInfo, busInfo, carInfo, walkInfo,
        // 계좌
        accountTitle, accountMsg, accountMsgEnabled, accountGroomFirst,
        groomAccounts, brideAccounts,
        // 안내사항
        noticeTitle, noticeItems,
        // 주변
        nearbyTitle, nearbySubtitle,
        nearbyItems: nearbyItems.map(({ id: _id, ...rest }) => ({
          ...rest, imageUrl: safeUrl(rest.imageUrl ?? "") ?? rest.imageUrl,
        })),
        // 갤러리
        gallery: gallery.filter((url) => !url.startsWith("blob:")),
        galleryLayout,
        // 메시지
        msgTitle, messageMaxLen,
        // 엔딩
        endingMsg, showPetals,
    };
  };

  const requireLoginForSave = () => {
    if (getAccessToken()) return true;

    sessionStorage.setItem("momentin_return_url", window.location.pathname + window.location.search);
    window.location.href = `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/auth/kakao`;
    return false;
  };

  const handleSaveDraft = async () => {
    if (!requireLoginForSave()) return;

    setSubmitting(true);
    try {
      const requestData = buildInvitationPayload();
      if (isEditMode && editWeddingId) {
        await api.updateMyWedding(editWeddingId, requestData as any);
      } else {
        const result = await api.createMyWedding(requestData as any);
        navigate(`/create?weddingId=${result.wedding.id}`, { replace: true });
      }

      setSaved(true);
      showToast("✅ 시안이 DB에 저장되었습니다.");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("시안 저장 실패:", err);
      showToast("❌ 시안 저장에 실패했습니다. 로그인을 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!requireLoginForSave()) return;

    setSubmitting(true);
    try {
      const requestData = buildInvitationPayload();

      if (isEditMode && editWeddingId) {
        await api.updateMyWedding(editWeddingId, requestData as any);
        showToast("✅ 청첩장이 수정되었습니다!");
        setTimeout(() => navigate(`/manage`), 1000);
      } else {
        const result = await api.createMyWedding(requestData as any);
        const generatedCode = result.code;
        if (!generatedCode) throw new Error("접속 코드가 없습니다.");
        showToast("🎉 청첩장이 성공적으로 발행되었습니다!");
        setTimeout(() => navigate(`/qr/${generatedCode}`), 1000);
      }
    } catch (err) {
      console.error("청첩장 발행 실패:", err);
      showToast("❌ 서버 저장에 실패했습니다. 로그인을 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const PhonePreview = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full px-1">
        <span className="text-xs font-medium text-gray-500">미리보기</span>
        <div className="flex items-center bg-white rounded-full p-0.5 shadow-sm border border-gray-200">
          {(["cover","full"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setPreviewMode(m)}
              className="px-3.5 py-1 rounded-full text-[11px] font-medium transition-all"
              style={previewMode === m ? { backgroundColor: "#1F2937", color: "#fff" } : { color: "#6B7280" }}
            >
              {m === "cover" ? "커버" : "전체"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative" style={{ width: 260 }}>
        <div className="rounded-[48px] shadow-2xl" style={{ background: "linear-gradient(145deg, #e0e0e0, #c8c8c8)", padding: 3 }}>
          <div className="rounded-[45px] overflow-hidden bg-black relative" style={{ aspectRatio: "390/844" }}>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-full bg-black" style={{ width: 110, height: 32 }} />

            {previewMode === "cover" ? (
              <>
                {coverLayout === "style1" ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div key={motionKey} initial={motionCfg.initial} animate={{ scale: 1, x: 0, y: 0 }} transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                        <img src={coverImage} alt="cover" className="absolute inset-0 w-full h-full object-cover" style={{ filter: imgFilter }} />
                      </motion.div>
                    </AnimatePresence>
                    {showGradient && <div className={`absolute inset-0 ${gradientClass} z-10`} />}
                    <div className="absolute inset-x-0 bottom-16 z-20 text-center px-4">
                      <p className="font-serif tracking-widest leading-snug drop-shadow-lg" style={{ fontSize: 14, color: coverTextColor, ...fontStyle }}>{groomName} ♥ {brideName}</p>
                      {showCountdown && <p className="text-[11px] mt-1 font-semibold" style={{ color: coverTextColor + "cc" }}>{dDay}</p>}
                    </div>
                    <div className="absolute bottom-0 inset-x-0 z-20 p-3 text-center">
                      
                      <p className="text-[8px] tracking-[0.2em]" style={{ color: coverTextColor + "99" }}>{weddingDate} {weddingTime}</p>
                      <p className="text-[7px] mt-0.5" style={{ color: coverTextColor + "60" }}>{venueName}</p>
                    </div>
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 rounded-full bg-white/30" style={{ width: 100, height: 3 }} />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
                    <AnimatePresence mode="wait">
                      <motion.div key={motionKey} initial={motionCfg.initial} animate={{ scale: 1, x: 0, y: 0 }} transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute" style={{ left: 0, top: "6%", width: "65%", height: "88%", overflow: "hidden" }}>
                        <img src={coverImage} alt="cover" className="absolute inset-0 w-full h-full object-cover" style={{ filter: imgFilter }} />
                        {showGradient && <div className={`absolute inset-0 ${gradientClass}`} />}
                      </motion.div>
                    </AnimatePresence>
                    <div className="absolute flex flex-col items-center justify-center gap-1" style={{ right: 0, top: 0, bottom: 0, width: "38%" }}>
                      {[weddingDate.split("-")[0].slice(-2), weddingDate.split("-")[1], weddingDate.split("-")[2]].map((n, i) => (
                        <p key={i} className="font-serif leading-none" style={{ fontSize: 28, color: coverTextColor, fontWeight: 300 }}>{n}</p>
                      ))}
                    </div>
                    <div className="absolute inset-x-0 z-10 text-center" style={{ bottom: 20 }}>
                      <p className="tracking-widest" style={{ fontSize: 8, color: coverTextColor, ...fontStyle }}>{groomName} ♥ {brideName}</p>
                      <p style={{ fontSize: 7, color: coverTextColor + "99", marginTop: 2 }}>Wedding Invitation</p>
                    </div>
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 rounded-full bg-gray-300/60" style={{ width: 100, height: 3 }} />
                  </>
                )}
              </>
            ) : (
              <motion.div
                key={previewMode}
                className="absolute inset-0 overflow-y-auto"
                style={{
                  backgroundColor: bgColor,
                  backgroundImage: bgTexture !== "none" ? TEXTURE_OPTIONS.find(t => t.id === bgTexture)?.bgImage ?? undefined : undefined,
                  ...fontStyle,
                }}
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } }}
              >

                {/* 커버 썸네일 */}
                <div className="relative flex-shrink-0 z-10" style={{ height: 190 }}>
                  <img src={coverImage} alt="cover" className="absolute inset-0 w-full h-full object-cover" style={{ filter: imgFilter }} />
                  {showGradient && <div className={`absolute inset-0 ${gradientClass}`} />}
                  <div className="absolute inset-x-0 bottom-8 z-10 text-center px-4">
                    <p className="tracking-widest text-[12px]" style={{ color: coverTextColor, ...fontStyle }}>{groomName} ♥ {brideName}</p>
                    {showCountdown && <p className="text-[9px] mt-0.5" style={{ color: coverTextColor + "cc" }}>{dDay}</p>}
                  </div>
                </div>

                {/* 인사말 배경 이미지 — 위쪽 */}
                {greetingPhoto && greetingBgPos === "top" && (
                  <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 px-3 mt-6 mb-2">
                    <div className="w-full rounded-2xl overflow-hidden" style={{ height: 72 }}>
                      <img src={greetingPhoto} alt="" className="w-full h-full object-cover" />
                    </div>
                  </motion.div>
                )}

                
                <motion.div
                  variants={{
                    hidden:   GREETING_ANIM_VARIANTS[greetingAnim].hidden,
                    visible:  { ...GREETING_ANIM_VARIANTS[greetingAnim].visible, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  className="relative z-10 px-4 py-8 text-center"
                >
                  <p className="text-[9px] mb-1" style={{ color: fontColor + "88" }}>✦ ✦ ✦</p>
                  {greetingTitle && (
                    <p className="text-[11px] font-semibold mb-2 tracking-wider" style={{ color: fontColor, ...fontStyle }}>{greetingTitle}</p>
                  )}
                  <p className="text-[8px] leading-relaxed whitespace-pre-line" style={{ color: fontColor, opacity: 0.9 }}>{greetingMsg}</p>
                </motion.div>

                {/* 인사말 배경 이미지 — 아래쪽 */}
                {greetingPhoto && greetingBgPos === "bottom" && (
                  <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 px-3 mt-2 mb-10">
                    <div className="w-full rounded-2xl overflow-hidden" style={{ height: 72 }}>
                      <img src={greetingPhoto} alt="" className="w-full h-full object-cover" />
                    </div>
                  </motion.div>
                )}

                <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 px-3 py-2 mb-10">
                  {(() => {
                    const people = groomFirst
                      ? [{ label: "신랑", name: groomName, intro: groomIntro, relation: groomRelation, photo: groomPhoto, dad: groomDadName, dadD: groomDadDeceased, mom: groomMomName, momD: groomMomDeceased },
                         { label: "신부", name: brideName, intro: brideIntro, relation: brideRelation, photo: bridePhoto, dad: brideDadName, dadD: brideDadDeceased, mom: brideMomName, momD: brideMomDeceased }]
                      : [{ label: "신부", name: brideName, intro: brideIntro, relation: brideRelation, photo: bridePhoto, dad: brideDadName, dadD: brideDadDeceased, mom: brideMomName, momD: brideMomDeceased },
                         { label: "신랑", name: groomName, intro: groomIntro, relation: groomRelation, photo: groomPhoto, dad: groomDadName, dadD: groomDadDeceased, mom: groomMomName, momD: groomMomDeceased }];

                    /* ── 듀오: 이미지 카드 + 부모·관계·이름 ── */
                    if (basicInfoPreset === "duo") return (
                      <div className="text-center py-2">
                        <p className="text-[7px] tracking-[0.3em] uppercase mb-0.5" style={{ color: fontColor, opacity: 0.45 }}>Basic Information</p>
                        <p className="font-serif text-[13px] mb-4" style={{ color: fontColor }}>{basicInfoTitle}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {people.map((p) => (
                            <div key={p.name} className="flex flex-col items-center gap-1.5">
                              <p className="text-[8px]" style={{ color: fontColor, opacity: 0.55 }}>{p.label}</p>
                              {/* 이미지 카드 */}
                              <div className="w-full rounded-2xl overflow-hidden flex items-center justify-center relative" style={{ aspectRatio: "1/1", backgroundColor: "rgba(255,255,255,0.75)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                                {p.photo
                                  ? <img src={p.photo} alt="" className="w-full h-full object-cover" />
                                  : <>
                                      <p className="text-[9px] z-10 relative" style={{ color: fontColor, opacity: 0.3 }}>이미지</p>
                                      {[["18%","30%","10px","#e8c87a","0.6"],["65%","20%","7px","#f0a860","0.5"],["45%","62%","12px","#e8c87a","0.4"],["75%","55%","8px","#f0a860","0.55"]].map(([l,t,s,c,o],i) => (
                                        <div key={i} className="absolute rounded-full pointer-events-none" style={{ left:l, top:t, width:s, height:s, backgroundColor:c, opacity:Number(o), filter:"blur(3px)" }} />
                                      ))}
                                    </>
                                }
                              </div>
                              {/* 부모·관계·이름 */}
                              {!hideParents && (
                                <div className="text-center leading-tight">
                                  <p className="text-[8px]" style={{ color: fontColor, opacity: 0.6 }}>{(p.dadD ? "故 " : "") + p.dad}·{(p.momD ? "故 " : "") + p.mom}</p>
                                  <p className="text-[8px]" style={{ color: fontColor, opacity: 0.6 }}>의 {p.relation}</p>
                                </div>
                              )}
                              <p className="font-serif text-[13px]" style={{ color: fontColor }}>{p.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );

                    /* ── 심플: 텍스트만, 이미지 없음 ── */
                    if (basicInfoPreset === "simple") return (
                      <div className="text-center py-2">
                        <p className="text-[7px] tracking-[0.3em] uppercase mb-0.5" style={{ color: fontColor, opacity: 0.45 }}>Basic Information</p>
                        <p className="font-serif text-[13px] mb-4" style={{ color: fontColor }}>{basicInfoTitle}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {people.map((p) => (
                            <div key={p.name} className="flex flex-col items-center gap-1">
                              <p className="text-[8px]" style={{ color: fontColor, opacity: 0.5 }}>{p.label}</p>
                              {!hideParents && (
                                <div className="text-center leading-snug">
                                  <p className="text-[8px]" style={{ color: fontColor, opacity: 0.6 }}>{(p.dadD ? "故 " : "") + p.dad}·{(p.momD ? "故 " : "") + p.mom}</p>
                                  <p className="text-[8px]" style={{ color: fontColor, opacity: 0.6 }}>의 {p.relation}</p>
                                </div>
                              )}
                              <p className="font-serif text-[13px] mt-0.5" style={{ color: fontColor }}>{p.name}</p>
                              {p.intro && <p className="text-[7px] mt-0.5" style={{ color: fontColor, opacity: 0.5 }}>{p.intro}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );

                    /* ── 포엣틱 ── */
                    return (
                      <div className="py-3 px-2 text-center rounded-xl" style={{ backgroundColor: fontColor + "08" }}>
                        <p className="text-[7px] tracking-[0.3em] uppercase mb-0.5" style={{ color: fontColor, opacity: 0.45 }}>Basic Information</p>
                        <p className="font-serif text-[12px] mb-3" style={{ color: fontColor }}>{basicInfoTitle}</p>
                        {people.map((p) => (
                          <div key={p.name} className="mb-2 last:mb-0">
                            {!hideParents && <p className="text-[7px]" style={{ color: fontColor, opacity: 0.5 }}>{(p.dadD ? "故 " : "") + p.dad} · {(p.momD ? "故 " : "") + p.mom}의 {p.relation}</p>}
                            <p className="font-serif text-[12px] tracking-widest" style={{ color: fontColor }}>{p.name}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </motion.div>

                <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 mx-3 mb-10 rounded-2xl overflow-hidden" style={{ backgroundColor: bgColor }}>
                  {/* 장소·날짜·시간 */}
                  <div className="px-3 pt-4 pb-2 text-center">
                    {showCeremonySubtitle && (
                      <p className="text-[7px] tracking-[0.3em] uppercase mb-0.5" style={{ color: fontColor, opacity: 0.45 }}>{ceremonySubtitleMap[ceremonySubtitleLang]}</p>
                    )}
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: fontColor }}>{ceremonyTitle}</p>
                    <div className="my-2" style={{ borderTop: `1px solid ${fontColor}20` }} />
                    <p className="text-[10px] font-semibold" style={{ color: fontColor }}>{venueName}</p>
                    {hallName && <p className="text-[8px] mt-0.5" style={{ color: fontColor, opacity: 0.6 }}>{hallName}</p>}
                    <p className="text-[9px] mt-2" style={{ color: fontColor, opacity: 0.75 }}>{korDate}</p>
                    <p className="text-[8px] mt-0.5" style={{ color: fontColor, opacity: 0.6 }}>{korTime}</p>
                  </div>

                  {/* 달력 */}
                  {showDDay && (() => {
                    const [y, mo, dd] = weddingDate.split("-").map(Number);
                    const firstDow = new Date(y, mo - 1, 1).getDay();
                    const daysInMonth = new Date(y, mo, 0).getDate();
                    const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
                    while (cells.length % 7 !== 0) cells.push(null);
                    return (
                      <div className="px-3 pb-3">
                        <div className="my-2" style={{ borderTop: `1px solid ${fontColor}20` }} />
                        <div className="grid grid-cols-7 mb-1">
                          {["일","월","화","수","목","금","토"].map((d, i) => (
                            <div key={d} className="text-center text-[7px] font-medium py-0.5"
                              style={{ color: i === 0 ? "#e06b6b" : i === 6 ? "#6b8fe0" : fontColor, opacity: 0.7 }}>
                              {d}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-0.5">
                          {cells.map((n, i) => {
                            const col = i % 7;
                            const isWedding = n === dd;
                            return (
                              <div key={i} className="flex items-center justify-center" style={{ height: 16 }}>
                                {n && (
                                  <div className="w-5 h-5 flex items-center justify-center rounded-full"
                                    style={isWedding ? { backgroundColor: fontColor } : {}}>
                                    <span className="text-[7px]"
                                      style={{ color: isWedding ? bgColor : col === 0 ? "#e06b6b" : col === 6 ? "#6b8fe0" : fontColor, opacity: isWedding ? 1 : 0.75 }}>
                                      {n}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {/* 카운트다운 */}
                        <div className="my-2" style={{ borderTop: `1px solid ${fontColor}20` }} />
                        <CountdownTimer weddingDate={weddingDate} weddingTime={weddingTime} fontColor={fontColor} bgColor={bgColor} />
                      </div>
                    );
                  })()}
                </motion.div>

                <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 mx-3 py-2 mb-10">
                  <div className="text-center mb-2">
                    <p className="text-[7px] tracking-[0.3em] uppercase mb-0.5" style={{ color: fontColor, opacity: 0.45 }}>Location</p>
                    <p className="text-[11px] font-semibold" style={{ color: fontColor }}>{locationTitle}</p>
                  </div>
                  {address && <p className="text-[7px] text-center mb-2" style={{ color: fontColor, opacity: 0.6 }}>{address}</p>}
                  {/* 카카오 지도 */}
                  <div className="rounded-xl overflow-hidden mb-2">
                    <KakaoMap
                      address={address}
                      markerTitle=""
                      height={110}
                      accentColor={fontColor}
                    />
                  </div>
                  {/* 네이버 지도 버튼 */}
                  {address && (
                    <a
                      href={`https://map.naver.com/v5/search/${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 w-full py-1.5 rounded-xl text-[8px] font-semibold mb-2 shadow-sm"
                    >
                      <span className="w-3.5 h-3.5 rounded flex items-center justify-center text-white text-[6px] font-black" style={{ backgroundColor: "#03C75A" }}>N</span>
                      <span className="text-gray-700">네이버 지도</span>
                    </a>
                  )}
                  {/* 교통수단 안내 */}
                  {[
                    { key: "subway",  label: "지하철", info: subwayInfo },
                    { key: "bus",     label: "버스",   info: busInfo },
                    { key: "car",    label: "자가용", info: carInfo },
                    { key: "walk",   label: "도보",   info: walkInfo },
                  ].filter(({ info }) => info.trim()).map(({ key, label, info }) => (
                    <div key={key} className="mb-1.5 pt-1.5" style={{ borderTop: `1px solid ${fontColor}14` }}>
                      <p className="text-[8px] font-semibold mb-0.5" style={{ color: fontColor }}>{label}</p>
                      <p className="text-[7px] leading-relaxed whitespace-pre-wrap" style={{ color: fontColor, opacity: 0.65 }}>{info}</p>
                    </div>
                  ))}
                </motion.div>

                {/* 계좌 정보 미리보기 — 오시는 길 바로 아래 */}
                {(groomAccounts.some(a => a.bank) || brideAccounts.some(a => a.bank)) && (
                  <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 mx-3 py-2 mb-10">
                    <p className="font-serif text-[13px] text-center mb-1" style={{ color: fontColor }}>{accountTitle}</p>
                    {accountMsgEnabled && accountMsg && (
                      <p className="text-[7px] leading-relaxed text-center whitespace-pre-line mb-2.5" style={{ color: fontColor, opacity: 0.7 }}>{accountMsg}</p>
                    )}
                    <div className="flex rounded-xl overflow-hidden border mb-2" style={{ borderColor: fontColor + "20" }}>
                      {(accountGroomFirst
                        ? [{ id: "groom" as const, label: "신랑측" }, { id: "bride" as const, label: "신부측" }]
                        : [{ id: "bride" as const, label: "신부측" }, { id: "groom" as const, label: "신랑측" }]
                      ).map(({ id, label }) => (
                        <button key={id} onClick={() => setPreviewAccTab(id)}
                          className="flex-1 py-1.5 text-[8px] font-medium transition-colors"
                          style={previewAccTab === id ? { backgroundColor: fontColor, color: bgColor } : { backgroundColor: "transparent", color: fontColor, opacity: 0.5 }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {(() => {
                      const accs = (previewAccTab === "groom" ? groomAccounts : brideAccounts).filter(a => a.bank);
                      return (
                        <div className="flex flex-col gap-1.5">
                          {accs.slice(0, 2).map((acc, i) => (
                            <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-xl" style={{ backgroundColor: fontColor + "08" }}>
                              <Copy size={9} style={{ color: fontColor, opacity: 0.5, flexShrink: 0 }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[8px] font-semibold leading-tight" style={{ color: fontColor }}>
                                  {acc.relation ? `[${acc.relation}] ` : ""}{acc.holder}
                                </p>
                                <p className="text-[7px] mt-0.5 truncate" style={{ color: fontColor, opacity: 0.6 }}>
                                  {acc.number}{acc.bank ? ` / ✦ ${acc.bank}` : ""}
                                </p>
                              </div>
                            </div>
                          ))}
                          {accs.length > 2 && (
                            <p className="text-[7px] text-center mt-0.5" style={{ color: fontColor, opacity: 0.5 }}>더보기</p>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {noticeItems.length > 0 && (
                  <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 px-3 py-2 mb-10">
                    <p className="font-serif text-[13px] text-center mb-2" style={{ color: fontColor }}>{noticeTitle}</p>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {noticeItems.map((item, i) => (
                        <span
                          key={item.id}
                          className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[7px] font-medium"
                          style={i === noticeEditorTab
                            ? { backgroundColor: fontColor, color: bgColor }
                            : { backgroundColor: fontColor + "18", color: fontColor }}
                        >
                          {item.title}
                        </span>
                      ))}
                    </div>
                    <div className="px-2.5 py-2 rounded-xl text-[7px] leading-snug" style={{ backgroundColor: fontColor + "0a", color: fontColor, opacity: 0.75 }}>
                      {noticeItems[noticeEditorTab]?.content || "내용을 입력해 주세요"}
                    </div>
                  </motion.div>
                )}

                {nearbyItems.length > 0 && (
                  <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 px-3 py-2 mb-10">
                    <p className="text-[6px] tracking-[0.3em] uppercase text-center mb-1" style={{ color: fontColor, opacity: 0.45 }}>Activities</p>
                    <p className="font-serif text-[13px] text-center mb-1" style={{ color: fontColor }}>{nearbyTitle}</p>
                    {nearbySubtitle && (
                      <p className="text-[7px] text-center leading-snug whitespace-pre-line mb-2.5" style={{ color: fontColor, opacity: 0.6 }}>{nearbySubtitle}</p>
                    )}
                    <div className="grid grid-cols-2 gap-1.5">
                      {nearbyItems.slice(0, 4).map((item) => (
                        <div key={item.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: fontColor + "08" }}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-full aspect-[4/3] object-cover" />
                          ) : (
                            <div className="w-full aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: fontColor + "12" }}>
                              <ImageIcon size={12} style={{ color: fontColor, opacity: 0.3 }} />
                            </div>
                          )}
                          <div className="px-2 py-1.5">
                            <p className="text-[8px] font-semibold leading-tight" style={{ color: fontColor }}>{item.title || "장소명"}</p>
                            {item.desc && <p className="text-[6px] mt-0.5 leading-snug" style={{ color: fontColor, opacity: 0.55 }}>{item.desc}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {gallery.length > 0 && (
                  <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 px-3 py-2 mb-10">
                    <p className="text-[8px] font-semibold mb-1.5 tracking-widest uppercase text-center" style={{ color: fontColor }}>Gallery</p>
                    {galleryLayout === "grid" ? (
                      <>
                        <div className="grid grid-cols-3 gap-0.5 rounded-xl overflow-hidden">
                          {gallery.slice(0, 9).map((url, i) => (
                            <div key={i} className="relative aspect-square">
                              <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                        <div className="mt-1.5 flex justify-center">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-[7px]" style={{ borderColor: fontColor + "30", color: fontColor }}>
                            <span>🖼</span><span>갤러리 바로가기</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-1">
                          <img src={gallery[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-between px-1.5">
                            <div className="w-4 h-4 rounded-full bg-white/70 flex items-center justify-center text-[8px] font-bold" style={{ color: fontColor }}>‹</div>
                            <div className="w-4 h-4 rounded-full bg-white/70 flex items-center justify-center text-[8px] font-bold" style={{ color: fontColor }}>›</div>
                          </div>
                          <div className="absolute bottom-1.5 left-2 text-[6px] bg-black/40 text-white px-1.5 py-0.5 rounded-full">1 / {gallery.length}</div>
                          <div className="absolute bottom-1.5 right-2 text-[6px] bg-white/80 px-1.5 py-0.5 rounded-full" style={{ color: fontColor }}>전체보기</div>
                        </div>
                        <div className="flex gap-0.5">
                          {gallery.slice(0, 4).map((url, i) => (
                            <div key={i} className="relative flex-1 aspect-square rounded-md overflow-hidden" style={{ opacity: i === 0 ? 1 : 0.6 }}>
                              <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {(messages.length > 0 || msgTitle) && (
                  <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 px-3 py-2 mb-10">
                    <p className="text-[6px] tracking-[0.3em] uppercase text-center mb-1" style={{ color: fontColor, opacity: 0.45 }}>Message</p>
                    <p className="font-serif text-[13px] text-center leading-snug whitespace-pre-line mb-2.5" style={{ color: fontColor }}>{msgTitle}</p>
                    <div className="w-full py-1.5 rounded-lg text-center text-[7px] font-medium mb-2" style={{ backgroundColor: fontColor, color: bgColor }}>
                      축하메시지 남기기
                    </div>
                    {messages.slice(0, 2).map((msg, i, arr) => (
                      <div key={msg.id} className="py-1.5" style={{ borderTop: i > 0 ? `1px solid ${fontColor}18` : undefined }}>
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[8px] font-semibold" style={{ color: fontColor }}>{msg.name}</p>
                          <p className="text-[6px]" style={{ color: fontColor, opacity: 0.4 }}>{msg.createdAt}</p>
                        </div>
                        <p className="text-[7px] leading-tight" style={{ color: fontColor, opacity: 0.65 }}>{msg.content}</p>
                      </div>
                    ))}
                  </motion.div>
                )}


                <motion.div variants={PREVIEW_SECTION} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 px-4 pb-10 text-center overflow-hidden" style={{ minHeight: 80 }}>
                  {showPetals && ["🌸","🌺","🌸","🌷","🌸"].map((p, i) => (
                    <motion.span key={i} className="absolute text-sm pointer-events-none"
                      style={{ left: `${10 + i * 20}%`, top: 0 }}
                      animate={{ y: [0, 80], opacity: [1, 0] }}
                      transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.6, ease: "linear" }}
                    >{p}</motion.span>
                  ))}
                  <p className="text-[8px] leading-relaxed pt-6" style={{ color: fontColor, opacity: 0.65 }}>{endingMsg}</p>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
        <div className="absolute right-[-4px] top-24 w-[3px] h-10 bg-gray-300 rounded-full" />
        <div className="absolute left-[-4px] top-20 w-[3px] h-7 bg-gray-300 rounded-full" />
        <div className="absolute left-[-4px] top-32 w-[3px] h-7 bg-gray-300 rounded-full" />
        <div className="absolute left-[-4px] top-44 w-[3px] h-7 bg-gray-300 rounded-full" />
      </div>
    </div>
  );

  const currentTab = NAV_TABS.find((t) => t.id === activeTab)!;

  return (
    <>
      <ToastBanner message={toast} visible={toastVisible} />

      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white"><X size={24} /></button>
          <button className="absolute left-4 text-white/60 hover:text-white text-4xl px-2" onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => Math.max(0, (i ?? 1) - 1)); }}>‹</button>
          <div className="relative w-[80vw] max-w-xl aspect-square" onClick={(e) => e.stopPropagation()}>
            <img src={gallery[lightboxIdx]} alt="" className="absolute inset-0 w-full h-full object-contain" />
          </div>
          <button className="absolute right-4 text-white/60 hover:text-white text-4xl px-2" onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => Math.min(gallery.length - 1, (i ?? 0) + 1)); }}>›</button>
        </div>
      )}

      <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "#F7F7F7" }}>

        <header className="flex items-center justify-between px-5 h-14 bg-white border-b border-gray-200 flex-shrink-0 z-10">
          <Link to="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft size={16} />
            <span className="hidden sm:inline text-sm">홈으로</span>
          </Link>
          <p className="font-serif text-base text-gray-800 tracking-widest absolute left-1/2 -translate-x-1/2">MomentIn</p>
          <div className="flex items-center gap-2">
            {kakaoUser ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-600">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: "#3C1E1E" }}>K</span>
                <span className="hidden sm:inline max-w-[80px] truncate">{kakaoUser}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  sessionStorage.setItem("momentin_return_url", window.location.pathname + window.location.search);
                  window.location.href = `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/auth/kakao`;
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: "#FEE500", color: "#191919" }}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "#3C1E1E", color: "#FEE500" }}>K</span>
                <span className="hidden sm:inline">카카오 로그인</span>
              </button>
            )}
            <button
              onClick={handleSaveDraft}
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              {saved ? <Check size={11} className="text-green-500" /> : <Save size={11} />}
              <span className="hidden sm:inline">{saved ? "저장됨" : "임시저장"}</span>
            </button>
            <button
              onClick={() => setShowMobilePreview(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Eye size={11} /> 미리보기
            </button>
            <button
              onClick={handlePublish}
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg text-white text-xs transition-colors disabled:opacity-60"
              style={{ backgroundColor: EDITOR_PINK }}
            >
              {submitting ? (isEditMode ? "저장 중..." : "생성 중...") : (isEditMode ? "수정 저장 →" : "완성하기 →")}
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">

          <div className="hidden lg:flex flex-col justify-center p-6 overflow-hidden flex-shrink-0" style={{ width: 360, backgroundColor: "#EBEBEB" }}>
            {PhonePreview()}
          </div>

          <div className="flex flex-col items-center py-3 bg-white border-r border-l border-gray-100 flex-shrink-0 overflow-y-auto" style={{ width: 76, scrollbarWidth: "none" }}>
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-0.5 py-2.5 px-1 w-full rounded-xl transition-all relative"
                style={activeTab === tab.id ? { backgroundColor: EDITOR_PINK_BG } : {}}
              >
                <tab.Icon size={20} style={{ color: activeTab === tab.id ? EDITOR_PINK : "#9CA3AF" }} />
                <span className="text-[9px] font-medium leading-none" style={{ color: activeTab === tab.id ? EDITOR_PINK : "#9CA3AF" }}>
                  {tab.label}
                </span>
              </button>
            ))}

          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-3xl mx-auto px-8 py-6">

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{currentTab.label}</h2>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                  <Info size={13} className="flex-shrink-0" />
                  {currentTab.desc}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-8"
                >

                  {activeTab === "cover" && (
                    <>
                      <SectionBlock title="커버 디자인 타입">
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { id: "style1", label: "풀블리드", desc: "사진 위 텍스트 오버레이" },
                            { id: "style2", label: "스플릿", desc: "사진 + 날짜 분할 레이아웃" },
                          ] as const).map((s) => (
                            <button key={s.id} onClick={() => setCoverLayout(s.id)}
                              className="p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2"
                              style={{ borderColor: coverLayout === s.id ? EDITOR_PINK : "#E5E7EB", backgroundColor: coverLayout === s.id ? EDITOR_PINK_BG : "#fff" }}>
                              <div className="w-full h-14 rounded-xl overflow-hidden flex gap-0.5" style={{ backgroundColor: "#f0f0f0" }}>
                                {s.id === "style1" ? (
                                  <div className="w-full h-full relative rounded-xl overflow-hidden bg-gray-300">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <p className="absolute bottom-1 inset-x-0 text-center text-white text-[7px] tracking-widest">our wedding day</p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="h-full bg-gray-300 rounded-l-xl" style={{ width: "65%" }} />
                                    <div className="h-full bg-white rounded-r-xl flex flex-col items-center justify-center gap-0.5" style={{ width: "35%" }}>
                                      {["26","06","20"].map((n) => <p key={n} className="font-serif text-[8px] leading-none text-gray-700">{n}</p>)}
                                    </div>
                                  </>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold" style={{ color: coverLayout === s.id ? EDITOR_PINK : "#374151" }}>{s.label}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </SectionBlock>

                      <SectionBlock title="커버 이미지 선택">
                        <p className="text-sm text-gray-500">커버 대표 이미지(최대 2장)</p>
                        <div className="flex gap-5">
                          <div className="relative rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer group" style={{ width: 280, height: 340 }}
                            onClick={() => coverInput1Ref.current?.click()}>
                            <img src={coverImage} alt="cover" className="absolute inset-0 w-full h-full object-cover" style={{ filter: imgFilter }} />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium text-gray-700 transition-opacity">
                                <ImageIcon size={13} /> 사진 변경
                              </div>
                            </div>
                            <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold z-10" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>1</div>
                            <div className="absolute top-2.5 right-2.5 w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-lg z-10 cursor-pointer group/img2"
                              onClick={(e) => { e.stopPropagation(); coverInput2Ref.current?.click(); }}>
                              <img src={coverImage2} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover/img2:bg-black/30 transition-colors flex items-center justify-center">
                                <Plus size={12} className="text-white opacity-0 group-hover/img2:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            <div className="absolute bottom-3 left-3 flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                              {[
                                { icon: RotateCcw, label: "rotate" },
                                { icon: Crop, label: "crop" },
                              ].map(({ icon: Icon, label }) => (
                                <button key={label} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                                  <Icon size={15} className="text-gray-700" />
                                </button>
                              ))}
                              <button onClick={() => setCoverImage(DEMO_COVER_IMAGES[0])} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                                <Trash2 size={15} style={{ color: EDITOR_PINK }} />
                              </button>
                            </div>
                          </div>
                          <input ref={coverInput1Ref} type="file" accept="image/*" className="hidden" onChange={handleCoverImage1Upload} />
                          <input ref={coverInput2Ref} type="file" accept="image/*" className="hidden" onChange={handleCoverImage2Upload} />

                          <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-700">사진1 이미지 조정</p>
                              <button
                                onClick={() => { setBrightness(1); setContrast(1); setSaturation(1); setGrayscale(0); setTemperature(0); }}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <RotateCcw size={10} /> 초기화
                              </button>
                            </div>
                            <AdjSlider label="밝기(brightness)"  value={brightness}  onChange={setBrightness}  min={0} max={2} step={0.01} />
                            <AdjSlider label="대조(contrast)"    value={contrast}    onChange={setContrast}    min={0} max={2} step={0.01} />
                            <AdjSlider label="채도(Saturation)"  value={saturation}  onChange={setSaturation}  min={0} max={2} step={0.01} />
                            <AdjSlider label="명도(grayscale)"   value={grayscale}   onChange={setGrayscale}   min={0} max={1} step={0.01} />
                            <AdjSlider label="온도(temperature)" value={temperature} onChange={setTemperature} min={-1} max={1} step={0.01} />
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-2">샘플 이미지에서 선택</p>
                          <div className="grid grid-cols-6 gap-2">
                            {DEMO_COVER_IMAGES.map((url, i) => (
                              <button
                                key={i}
                                onClick={() => { setCoverImage(url); replayMotion(); }}
                                className="relative aspect-square rounded-xl overflow-hidden border-2 transition-all"
                                style={{ borderColor: coverImage === url ? EDITOR_PINK : "transparent" }}
                              >
                                <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                {coverImage === url && (
                                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: EDITOR_PINK + "33" }}>
                                    <Check size={12} className="text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                            <button onClick={() => coverInput1Ref.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                              <Plus size={16} className="text-gray-300" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                          각 20MB 이하의 이미지로 배경 여백이 넉넉한 사진이 더 자연스러운 애니메이션 연출에 적합합니다.
                        </p>
                      </SectionBlock>

                      <SectionBlock title="커버 모션">
                        <div className="grid grid-cols-5 gap-2">
                          {MOTIONS.map((m) => (
                            <button
                              key={m.type}
                              onClick={() => handleSelectMotion(m.type)}
                              className="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all"
                              style={motionType === m.type
                                ? { borderColor: EDITOR_PINK, backgroundColor: EDITOR_PINK_BG, color: EDITOR_PINK }
                                : { borderColor: "#E5E7EB", color: "#6B7280" }}
                            >
                              <span className="text-base">{m.icon}</span>
                              <span>{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </SectionBlock>

                      <SectionBlock title="그라데이션 & 텍스트">
                        <div className="flex items-center justify-between py-1">
                          <p className="text-sm text-gray-700">그라데이션 사용</p>
                          <Toggle value={showGradient} onChange={setShowGradient} />
                        </div>
                        {showGradient && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <p className="text-xs text-gray-500">방향</p>
                              <SegRow<GradientDir> options={[["bottom","아래↑"],["top","위↓"],["full","전체"]]} value={gradientDir} onChange={setGradientDir} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <p className="text-xs text-gray-500">강도</p>
                              <SegRow<GradientTone> options={[["strong","강하게"],["medium","보통"],["light","약하게"]]} value={gradientTone} onChange={setGradientTone} />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 pt-1">
                          <p className="text-sm text-gray-700">텍스트 색상</p>
                          <div className="flex gap-2 flex-wrap">
                            {["#ffffff","#f5e6d3","#3a3535","#b89a6a","#c9a0a0"].map((c) => (
                              <button key={c} onClick={() => setCoverTextColor(c)}
                                className="w-7 h-7 rounded-full border-2 transition-all"
                                style={{ backgroundColor: c, borderColor: coverTextColor === c ? EDITOR_PINK : "#fff", transform: coverTextColor === c ? "scale(1.2)" : "none" }}
                              />
                            ))}
                            <label className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden relative">
                              <input type="color" value={coverTextColor} onChange={(e) => setCoverTextColor(e.target.value)} className="opacity-0 absolute inset-0 cursor-pointer" />
                              <Plus size={10} className="text-gray-400 pointer-events-none" />
                            </label>
                          </div>
                        </div>
                      </SectionBlock>

                      <SectionBlock title="D-day 카운트다운">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-700">카운트다운 표시</p>
                            <p className="text-xs text-gray-400 mt-0.5">커버에 D-day를 보여줘요</p>
                          </div>
                          <Toggle value={showCountdown} onChange={setShowCountdown} />
                        </div>
                        {showCountdown && (
                          <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-serif text-gray-800">{dDay}</p>
                            <p className="text-xs text-gray-400 mt-1">예식까지</p>
                          </div>
                        )}
                      </SectionBlock>
                    </>
                  )}

                  {activeTab === "style" && (
                    <>
                      <SectionBlock title="색상 팔레트">
                        {/* Tab switcher */}
                        <div className="grid grid-cols-2 rounded-2xl overflow-hidden border border-gray-200">
                          {(["bg","font"] as const).map((tab) => (
                            <button key={tab} onClick={() => setColorPaletteTab(tab)}
                              className="py-3 text-sm font-medium transition-all"
                              style={colorPaletteTab === tab
                                ? { backgroundColor: "#fff", color: "#1F2937", boxShadow: "inset 0 0 0 2px " + EDITOR_PINK }
                                : { backgroundColor: "#F9FAFB", color: "#9CA3AF" }}
                            >
                              {tab === "bg" ? "배경 텍스처 및 컬러" : "폰트 컬러"}
                            </button>
                          ))}
                        </div>

                        {colorPaletteTab === "bg" ? (
                          <div className="grid grid-cols-2 gap-4 items-start">
                            {/* Texture grid */}
                            <div className="border border-gray-200 rounded-2xl p-3 overflow-y-auto" style={{ maxHeight: 320 }}>
                              <div className="grid grid-cols-2 gap-2">
                                {TEXTURE_OPTIONS.map((tx) => (
                                  <button key={tx.id} onClick={() => setBgTexture(tx.id)}
                                    className="flex flex-col items-center gap-1.5 rounded-xl border-2 overflow-hidden transition-all"
                                    style={{ borderColor: bgTexture === tx.id ? EDITOR_PINK : "transparent" }}
                                  >
                                    <div className="w-full aspect-square rounded-lg flex items-center justify-center"
                                      style={{ backgroundColor: "#f5f0ea", backgroundImage: tx.bgImage ?? undefined }}>
                                      {tx.id === "none" && (
                                        <div className="w-8 h-8 rounded-full border-2 border-red-400 flex items-center justify-center">
                                          <div className="w-5 h-0.5 bg-red-400 rotate-45" />
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-gray-600 pb-1">{tx.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* BG Color picker */}
                            <div className="border border-gray-200 rounded-2xl p-4">
                              <ColorPicker value={bgColor} onChange={setBgColor} />
                            </div>
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-2xl p-4">
                            <ColorPicker value={fontColor} onChange={setFontColor} />
                          </div>
                        )}
                      </SectionBlock>

                      <SectionBlock title="폰트 스타일 선택">
                        <div className="grid grid-cols-2 gap-3">
                          {FONT_OPTIONS.map((f) => (
                            <button key={f.id} onClick={() => setFontFamily(f.id)}
                              className="flex flex-col items-start px-5 py-4 rounded-2xl border-2 text-left transition-all gap-2"
                              style={{ borderColor: fontFamily === f.id ? EDITOR_PINK : "#E5E7EB", backgroundColor: fontFamily === f.id ? EDITOR_PINK_BG : "#fff" }}
                            >
                              <span className="text-sm font-semibold" style={{ color: fontFamily === f.id ? EDITOR_PINK : "#1F2937" }}>{f.label}</span>
                              <span className="text-xs text-gray-500 leading-relaxed" style={f.style}>너와 나, 이제 우리의 이야기</span>
                            </button>
                          ))}
                        </div>
                      </SectionBlock>
                    </>
                  )}

                  {activeTab === "greeting" && (
                    <>
                      <SectionBlock title="인사말 대표 제목">
                        <input
                          className={inputCls}
                          value={greetingTitle}
                          onChange={(e) => setGreetingTitle(e.target.value)}
                          placeholder="예) 함께하는 시작"
                          maxLength={40}
                        />
                        <p className="text-xs text-gray-400">청첩장 인사말 섹션 상단에 표시되는 한 줄 제목이에요</p>
                      </SectionBlock>

                      <SectionBlock title="인사말 본문">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <label className="text-xs text-gray-500">본문 (최대 400자)</label>
                            <span className="text-xs" style={{ color: greetingMsg.length > 380 ? EDITOR_PINK : "#9CA3AF" }}>
                              {greetingMsg.length} / 400
                            </span>
                          </div>
                          <textarea
                            className={`${inputCls} resize-none`}
                            rows={6}
                            maxLength={400}
                            value={greetingMsg}
                            onChange={(e) => setGreetingMsg(e.target.value)}
                            placeholder="두 분의 결혼을 알리는 메시지를 작성해 주세요"
                          />
                        </div>
                      </SectionBlock>

                      <SectionBlock title="대표 배경 이미지">
                        <input ref={greetingPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleGreetingPhotoUpload} />
                        {greetingPhoto ? (
                          <div className="flex flex-col gap-3">
                            <div className="w-full h-36 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => greetingPhotoRef.current?.click()}>
                              <img src={greetingPhoto} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 transition-opacity flex items-center gap-1.5">
                                  <ImageIcon size={12} /> 이미지 변경
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-1">
                                <p className="text-xs font-medium text-gray-700">배치 위치</p>
                                <p className="text-[11px] text-gray-400">인사말 본문을 기준으로 이미지 위치를 설정해요</p>
                              </div>
                              <div className="flex gap-2">
                                {(["top", "bottom"] as GreetingBgPos[]).map((pos) => (
                                  <button
                                    key={pos}
                                    onClick={() => setGreetingBgPos(pos)}
                                    className="px-4 py-2 rounded-xl text-xs font-medium border-2 transition-all"
                                    style={greetingBgPos === pos
                                      ? { borderColor: EDITOR_PINK, backgroundColor: EDITOR_PINK_BG, color: EDITOR_PINK }
                                      : { borderColor: "#E5E7EB", color: "#6B7280" }}
                                  >
                                    {pos === "top" ? "위쪽" : "아래쪽"}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => setGreetingPhoto("")}
                              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs transition-colors"
                              style={{ borderColor: EDITOR_PINK + "40", color: EDITOR_PINK }}
                            >
                              <Trash2 size={12} /> 이미지 삭제
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => greetingPhotoRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-2 hover:border-gray-400 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                              <Plus size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">배경 이미지 추가</p>
                            <p className="text-xs text-gray-400">인사말 위쪽 또는 아래쪽에 배치됩니다</p>
                          </button>
                        )}
                      </SectionBlock>

                      <SectionBlock title="애니메이션 효과">
                        <p className="text-xs text-gray-400">전체 미리보기에서 인사말 섹션이 등장할 때의 효과를 설정해요</p>
                        <div className="grid grid-cols-5 gap-2">
                          {GREETING_ANIMS.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => setGreetingAnim(a.id)}
                              className="py-2.5 rounded-xl text-xs font-medium border-2 transition-all"
                              style={greetingAnim === a.id
                                ? { borderColor: EDITOR_PINK, backgroundColor: EDITOR_PINK_BG, color: EDITOR_PINK }
                                : { borderColor: "#E5E7EB", color: "#6B7280" }}
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </SectionBlock>
                    </>
                  )}

                  {activeTab === "basicinfo" && (
                    <>
                      <input ref={groomPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleGroomPhotoUpload} />
                      <input ref={bridePhotoRef} type="file" accept="image/*" className="hidden" onChange={handleBridePhotoUpload} />

                      {/* 블록 제목 */}
                      <SectionBlock title="기본정보 제목">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">블록 제목</label>
                          <input className={inputCls} value={basicInfoTitle} onChange={(e) => setBasicInfoTitle(e.target.value)} />
                        </div>
                      </SectionBlock>

                      {/* 표시 방식 */}
                      <SectionBlock title="정보 표시 방식">
                        <div className="flex flex-col gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-2.5">표시 순서</p>
                            <div className="flex gap-6">
                              {[{ val: true, label: "신랑측 먼저" }, { val: false, label: "신부측 먼저" }].map(({ val, label }) => (
                                <button key={label} onClick={() => setGroomFirst(val)} className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                                    style={groomFirst === val ? { borderColor: EDITOR_PINK } : { borderColor: "#D1D5DB" }}>
                                    {groomFirst === val && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EDITOR_PINK }} />}
                                  </div>
                                  <span className="text-sm text-gray-700">{label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-2">미표시 정보</p>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={hideParents} onChange={(e) => setHideParents(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: EDITOR_PINK }} />
                              <span className="text-sm text-gray-700">부모님 정보 숨기기</span>
                            </label>
                          </div>
                        </div>
                      </SectionBlock>

                      {/* 신랑 & 신부 정보 */}
                      <SectionBlock title="신랑 & 신부 정보">
                        <div className="grid grid-cols-2 gap-4">
                          {(groomFirst
                            ? [{ label: "신랑 정보", name: groomName, setName: setGroomName, intro: groomIntro, setIntro: setGroomIntro, relation: groomRelation, setRelation: setGroomRelation, photo: groomPhoto, inputRef: groomPhotoRef, icon: "🤵" },
                               { label: "신부 정보", name: brideName, setName: setBrideName, intro: brideIntro, setIntro: setBrideIntro, relation: brideRelation, setRelation: setBrideRelation, photo: bridePhoto, inputRef: bridePhotoRef, icon: "👰" }]
                            : [{ label: "신부 정보", name: brideName, setName: setBrideName, intro: brideIntro, setIntro: setBrideIntro, relation: brideRelation, setRelation: setBrideRelation, photo: bridePhoto, inputRef: bridePhotoRef, icon: "👰" },
                               { label: "신랑 정보", name: groomName, setName: setGroomName, intro: groomIntro, setIntro: setGroomIntro, relation: groomRelation, setRelation: setGroomRelation, photo: groomPhoto, inputRef: groomPhotoRef, icon: "🤵" }]
                          ).map(({ label, name, setName, intro, setIntro, relation, setRelation, photo, inputRef, icon }) => (
                            <div key={label} className="flex flex-col gap-3">
                              <p className="text-xs font-medium text-gray-600">{label}</p>
                              <div onClick={() => inputRef.current?.click()} className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden relative group mx-auto hover:border-gray-400 transition-colors">
                                {photo
                                  ? <><img src={photo} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"><ImageIcon size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" /></div></>
                                  : <span className="text-3xl">{icon}</span>}
                              </div>
                              <div className="flex flex-col gap-1">
                                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">부모님과의 관계</label>
                                <input className={inputCls} value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="아들 / 딸" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between">
                                  <label className="text-xs text-gray-500">한줄 소개</label>
                                  <span className="text-xs text-gray-400">{intro.length}/30</span>
                                </div>
                                <input className={inputCls} value={intro} onChange={(e) => setIntro(e.target.value.slice(0, 30))} placeholder="한줄 소개" />
                              </div>
                            </div>
                          ))}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer pt-2">
                          <input type="checkbox" checked={showContact} onChange={(e) => setShowContact(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: EDITOR_PINK }} />
                          <span className="text-sm text-gray-700">연락처 추가</span>
                        </label>
                        {showContact && (
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">신랑 연락처</label><input className={inputCls} value={groomContact} onChange={(e) => setGroomContact(e.target.value)} placeholder="010-0000-0000" /></div>
                            <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">신부 연락처</label><input className={inputCls} value={brideContact} onChange={(e) => setBrideContact(e.target.value)} placeholder="010-0000-0000" /></div>
                          </div>
                        )}
                      </SectionBlock>

                      {/* 프리셋 */}
                      <SectionBlock title="신랑/신부 정보 프리셋">
                        <div className="grid grid-cols-3 gap-3">
                          {([
                            { id: "simple",  label: "심플(Simple)",   desc: "필요한 정보만\n또렷하게 담은 스타일" },
                            { id: "duo",     label: "듀오(Duo)",       desc: "신랑·신부의 얼굴이\n먼저 보이는 스타일" },
                            { id: "poetic",  label: "포엣틱(Poetic)", desc: "감성적인 문구로\n분위기를 전하는 스타일" },
                          ] as { id: BasicInfoPreset; label: string; desc: string }[]).map(({ id, label, desc }) => (
                            <button key={id} onClick={() => setBasicInfoPreset(id)}
                              className="flex flex-col gap-1.5 p-3 rounded-2xl border-2 text-left transition-all"
                              style={basicInfoPreset === id ? { borderColor: EDITOR_PINK, backgroundColor: EDITOR_PINK_BG } : { borderColor: "#E5E7EB", backgroundColor: "white" }}>
                              <p className="text-xs font-semibold" style={{ color: basicInfoPreset === id ? EDITOR_PINK : "#374151" }}>{label}</p>
                              <p className="text-[11px] leading-relaxed whitespace-pre-line" style={{ color: basicInfoPreset === id ? EDITOR_PINK + "bb" : "#9CA3AF" }}>{desc}</p>
                            </button>
                          ))}
                        </div>
                      </SectionBlock>

                      {/* 듀오 사진 입력 */}
                      {basicInfoPreset === "duo" && (
                        <SectionBlock title="Duo - 사진 입력">
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: "신랑 썸네일(20MB 이하)", photo: groomPhoto, inputRef: groomPhotoRef },
                              { label: "신부 썸네일(20MB 이하)", photo: bridePhoto, inputRef: bridePhotoRef },
                            ].map(({ label, photo, inputRef }) => (
                              <div key={label} className="flex flex-col gap-2">
                                <p className="text-sm text-gray-600">{label}</p>
                                <div
                                  onClick={() => inputRef.current?.click()}
                                  className="w-full aspect-square rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center cursor-pointer relative group hover:border-gray-400 transition-colors"
                                >
                                  {photo ? (
                                    <>
                                      <img src={photo} alt="" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 transition-opacity flex items-center gap-1.5">
                                          <ImageIcon size={12} /> 이미지 변경
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-sm text-gray-400 text-center px-4">클릭하여 이미지를<br />선택하세요</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </SectionBlock>
                      )}

                      {/* 부모님 정보 */}
                      {!hideParents && (
                        <SectionBlock title="부모님 정보">
                          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                            {([
                              { label: "신랑측 아버지 성함", value: groomDadName, setValue: setGroomDadName, deceased: groomDadDeceased, setDeceased: setGroomDadDeceased },
                              { label: "신부측 아버지 성함", value: brideDadName, setValue: setBrideDadName, deceased: brideDadDeceased, setDeceased: setBrideDadDeceased },
                              { label: "신랑측 어머니 성함", value: groomMomName, setValue: setGroomMomName, deceased: groomMomDeceased, setDeceased: setGroomMomDeceased },
                              { label: "신부측 어머니 성함", value: brideMomName, setValue: setBrideMomName, deceased: brideMomDeceased, setDeceased: setBrideMomDeceased },
                            ] as { label: string; value: string; setValue: (v: string) => void; deceased: boolean; setDeceased: (v: boolean) => void }[]).map(({ label, value, setValue, deceased, setDeceased }) => (
                              <div key={label} className="flex flex-col gap-1">
                                <label className="text-xs text-gray-500">{label}</label>
                                <div className="flex items-center gap-1.5">
                                  <input className={`${inputCls} flex-1 min-w-0`} value={value} onChange={(e) => setValue(e.target.value)} />
                                  <button onClick={() => setDeceased(!deceased)}
                                    className="px-2.5 py-2 rounded-xl border text-xs font-medium flex-shrink-0 transition-all"
                                    style={deceased ? { borderColor: EDITOR_PINK, backgroundColor: EDITOR_PINK_BG, color: EDITOR_PINK } : { borderColor: "#E5E7EB", color: "#9CA3AF" }}>
                                    故
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </SectionBlock>
                      )}
                    </>
                  )}

                  {activeTab === "ceremony" && (
                    <>
                      {/* 제목 */}
                      <SectionBlock title="예식 정보 제목">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">블록 제목</label>
                          <input className={inputCls} value={ceremonyTitle} onChange={(e) => setCeremonyTitle(e.target.value)} />
                        </div>
                      </SectionBlock>

                      {/* 예식 기본정보 */}
                      <SectionBlock title="예식 기본정보">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">예식 날짜</label><input type="date" className={inputCls} value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} /></div>
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">예식 시간</label><input type="time" className={inputCls} value={weddingTime} onChange={(e) => setWeddingTime(e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">예식 장소</label><input className={inputCls} value={venueName} onChange={(e) => setVenueName(e.target.value)} /></div>
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">세부 장소</label><input className={inputCls} value={hallName} onChange={(e) => setHallName(e.target.value)} /></div>
                        </div>
                      </SectionBlock>

                      {/* D-Day 위젯 */}
                      <SectionBlock title="예식 정보 위젯">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-700 font-medium">D-Day 카운트다운</p>
                            <p className="text-xs text-gray-400 mt-0.5">달력·디데이·카운터 위젯 표시</p>
                          </div>
                          <Toggle value={showDDay} onChange={setShowDDay} />
                        </div>
                      </SectionBlock>
                    </>
                  )}

                  {activeTab === "location" && (
                    <>
                      {/* 오시는 길 제목 */}
                      <SectionBlock title="오시는 길 제목" large>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">블록 제목</label>
                          <input className={inputCls} value={locationTitle} onChange={(e) => setLocationTitle(e.target.value)} />
                        </div>
                      </SectionBlock>

                      {/* 예식 기본정보 */}
                      <SectionBlock title="예식 기본정보">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">예식 장소</label><input className={inputCls} value={venueName} onChange={(e) => setVenueName(e.target.value)} /></div>
                          <div className="flex flex-col gap-1"><label className="text-xs text-gray-500">세부 장소</label><input className={inputCls} value={hallName} onChange={(e) => setHallName(e.target.value)} /></div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">식장 주소</label>
                          <div className="flex gap-2">
                            <input className={`${inputCls} flex-1`} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="도로명 주소" readOnly />
                            <button
                              onClick={() => {
                                new (window as any).daum.Postcode({
                                  oncomplete: (data: any) => {
                                    setAddress(data.roadAddress || data.autoRoadAddress || data.jibunAddress);
                                  },
                                }).open();
                              }}
                              className="px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-medium whitespace-nowrap hover:bg-gray-700 transition-colors"
                            >
                              우편번호 검색
                            </button>
                          </div>
                        </div>
                      </SectionBlock>

                      {/* 교통수단 안내 */}
                      <SectionBlock title="교통수단 안내">
                        <div>
                          <p className="text-xs text-gray-500 mb-2">교통수단 선택</p>
                          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                            {([
                              { id: "subway", label: "지하철", },
                              { id: "bus",    label: "버스",   },
                              { id: "car",    label: "자가용", },
                              { id: "walk",   label: "도보",   },
                            ] as { id: TransportTab; label: string }[]).map(({ id, label }) => (
                              <button key={id} onClick={() => setTransportTab(id)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all whitespace-nowrap"
                                style={transportTab === id ? { borderColor: "#111", backgroundColor: "#111", color: "#fff" } : { borderColor: "#E5E7EB", color: "#6B7280", backgroundColor: "white" }}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs text-gray-500">오시는 길 안내</label>
                            <button className="text-xs text-blue-500 hover:text-blue-700 transition-colors">기차로 타이틀 변경</button>
                          </div>
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
                              <button className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">B</button>
                              <button className="w-6 h-6 flex items-center justify-center rounded text-sm underline text-gray-600 hover:bg-gray-200 transition-colors">U</button>
                              <button className="w-6 h-6 flex items-center justify-center rounded text-sm italic text-gray-600 hover:bg-gray-200 transition-colors">I</button>
                            </div>
                            {transportTab === "subway" && <textarea className="w-full px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none" rows={4} value={subwayInfo} onChange={(e) => setSubwayInfo(e.target.value)} placeholder="지하철 오시는 길을 입력하세요" />}
                            {transportTab === "bus"    && <textarea className="w-full px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none" rows={4} value={busInfo}    onChange={(e) => setBusInfo(e.target.value)}    placeholder="버스 오시는 길을 입력하세요" />}
                            {transportTab === "car"    && <textarea className="w-full px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none" rows={4} value={carInfo}    onChange={(e) => setCarInfo(e.target.value)}    placeholder="자가용 오시는 길을 입력하세요" />}
                            {transportTab === "walk"   && <textarea className="w-full px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none" rows={4} value={walkInfo}   onChange={(e) => setWalkInfo(e.target.value)}   placeholder="도보 오시는 길을 입력하세요" />}
                          </div>
                          <div className="flex items-start gap-2 mt-2 p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-400 flex-shrink-0 text-sm">ℹ</span>
                            <p className="text-xs text-gray-500">오시는 길 안내에 아무것도 입력하지 않으면 해당 필드는 보여지지 않습니다.</p>
                          </div>
                        </div>
                      </SectionBlock>

                    </>
                  )}

                  {activeTab === "account" && (
                    <>
                      {/* 계좌정보 제목 */}
                      <SectionBlock title="계좌정보 제목">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-500">블록 제목</label>
                          <input className={inputCls} value={accountTitle} onChange={(e) => setAccountTitle(e.target.value)} />
                        </div>
                      </SectionBlock>

                      {/* 계좌정보 문구 */}
                      <SectionBlock title="계좌정보 문구">
                        <div>
                          <p className="text-xs text-gray-500 mb-2">문구 추가</p>
                          <div className="flex gap-6">
                            {[{ val: true, label: "사용" }, { val: false, label: "미사용" }].map(({ val, label }) => (
                              <button key={label} onClick={() => setAccountMsgEnabled(val)} className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                                  style={accountMsgEnabled === val ? { borderColor: EDITOR_PINK } : { borderColor: "#D1D5DB" }}>
                                  {accountMsgEnabled === val && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EDITOR_PINK }} />}
                                </div>
                                <span className="text-sm text-gray-700">{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        {accountMsgEnabled && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
                              <button className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">B</button>
                              <button className="w-6 h-6 flex items-center justify-center rounded text-sm underline text-gray-600 hover:bg-gray-200 transition-colors">U</button>
                              <button className="w-6 h-6 flex items-center justify-center rounded text-sm italic text-gray-600 hover:bg-gray-200 transition-colors">I</button>
                            </div>
                            <textarea
                              className="w-full px-3 py-2.5 text-sm text-gray-700 bg-white resize-none focus:outline-none text-center"
                              rows={5}
                              value={accountMsg}
                              onChange={(e) => setAccountMsg(e.target.value)}
                              placeholder="계좌 안내 문구를 입력해 주세요"
                            />
                          </div>
                        )}
                      </SectionBlock>

                      {/* 표시 순서 */}
                      <SectionBlock title="표시 순서">
                        <div>
                          <p className="text-xs text-gray-500 mb-2.5">계좌정보 표시 순서</p>
                          <div className="flex gap-6">
                            {[{ val: true, label: "신랑측 먼저" }, { val: false, label: "신부측 먼저" }].map(({ val, label }) => (
                              <button key={label} onClick={() => setAccountGroomFirst(val)} className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                                  style={accountGroomFirst === val ? { borderColor: EDITOR_PINK } : { borderColor: "#D1D5DB" }}>
                                  {accountGroomFirst === val && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EDITOR_PINK }} />}
                                </div>
                                <span className="text-sm text-gray-700">{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </SectionBlock>

                      {/* 계좌정보 입력 */}
                      <SectionBlock title="계좌정보 입력">
                        {/* 신랑님/신부님 탭 */}
                        <div className="flex bg-gray-100 rounded-xl p-1">
                          {[{ id: "groom" as const, label: "신랑님" }, { id: "bride" as const, label: "신부님" }].map(({ id, label }) => (
                            <button key={id} onClick={() => setAccountPersonTab(id)}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${accountPersonTab === id ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
                              {label}
                            </button>
                          ))}
                        </div>

                        {/* 선택된 탭의 계좌 */}
                        {(() => {
                          const isGroom = accountPersonTab === "groom";
                          const accounts = isGroom ? groomAccounts : brideAccounts;
                          const setAccounts = isGroom ? setGroomAccounts : setBrideAccounts;
                          const personLabel = isGroom ? "신랑님" : "신부님";
                          const primaryRelation = isGroom ? "신랑" : "신부";
                          const primary = accounts[0] ?? { bank: "", holder: "", number: "", relation: primaryRelation };
                          const additional = accounts.slice(1);

                          return (
                            <div className="flex flex-col gap-4">
                              {/* 주 계좌 */}
                              <div>
                                <div className="grid grid-cols-4 gap-2">
                                  {[
                                    { key: "holder", label: "예금주", placeholder: "이름" },
                                    { key: "number", label: "계좌번호", placeholder: "0000-0000-00" },
                                    { key: "bank",   label: "은행명",  placeholder: "국민은행" },
                                    { key: "relation", label: "관계", placeholder: "신랑" },
                                  ].map(({ key, label, placeholder }) => (
                                    <div key={key} className="flex flex-col gap-1">
                                      <label className="text-xs text-gray-500">{label}</label>
                                      <input
                                        className={inputCls}
                                        value={(primary as any)[key] ?? ""}
                                        placeholder={placeholder}
                                        onChange={(e) => setAccounts((a) => {
                                          const next = [...a];
                                          if (!next[0]) next[0] = { bank: "", holder: "", number: "", relation: primaryRelation };
                                          next[0] = { ...next[0], [key]: e.target.value };
                                          return next;
                                        })}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 추가 계좌 (index 1~2) */}
                              {additional.length > 0 && (
                                <p className="text-xs text-gray-400 text-right -mb-2">추가 계좌는 최대 2개까지 추가 가능합니다.</p>
                              )}
                              {additional.map((acc, idx) => (
                                <div key={idx} className="flex flex-col gap-3 p-4 rounded-2xl border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-700">{personLabel} 측 추가 계좌 {idx + 1}</p>
                                    <button
                                      onClick={() => setAccounts((a) => a.filter((_, j) => j !== idx + 1))}
                                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 size={13} />삭제
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {[
                                      { key: "holder", label: "예금주", placeholder: "이름" },
                                      { key: "number", label: "계좌번호", placeholder: "0000-0000-00" },
                                      { key: "bank",   label: "은행명",  placeholder: "국민은행" },
                                      { key: "relation", label: "관계", placeholder: "아버지" },
                                    ].map(({ key, label, placeholder }) => (
                                      <div key={key} className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">{label}</label>
                                        <input
                                          className={inputCls}
                                          value={(acc as any)[key] ?? ""}
                                          placeholder={placeholder}
                                          onChange={(e) => setAccounts((a) => a.map((x, j) => j === idx + 1 ? { ...x, [key]: e.target.value } : x))}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}

                              {/* 계좌 추가 버튼 (최대 3개 = 주1 + 추가2) */}
                              {accounts.length < 3 && (
                                <button
                                  onClick={() => setAccounts((a) => [...a, { bank: "", holder: "", number: "", relation: "" }])}
                                  className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all"
                                >
                                  <Plus size={14} /> 계좌 추가
                                </button>
                              )}
                              {accounts.length >= 3 && (
                                <p className="text-xs text-gray-400 text-center">추가 계좌는 최대 2개까지 추가 가능합니다.</p>
                              )}
                            </div>
                          );
                        })()}
                      </SectionBlock>
                    </>
                  )}

                  {activeTab === "notice" && (
                    <>
                      <SectionBlock title="안내사항 제목 & 서브제목">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-500">블록 제목</label>
                          <input className={inputCls} value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="안내사항" />
                        </div>
                      </SectionBlock>

                      <SectionBlock title="안내종류 선택">
                        <div className="flex flex-col gap-3">
                          {/* Tab pills */}
                          <div className="flex gap-2 flex-wrap">
                            {noticeItems.map((item, i) => (
                              <button
                                key={item.id}
                                onClick={() => setNoticeEditorTab(i)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                                style={noticeEditorTab === i
                                  ? { backgroundColor: EDITOR_PINK + "18", borderColor: EDITOR_PINK, color: EDITOR_PINK }
                                  : { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB", color: "#6B7280" }}
                              >
                                <span>{item.title || "제목 없음"}</span>
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                setNoticeItems((ns) => [...ns, { id: `n${Date.now()}`, title: "새 항목", content: "" }]);
                                setNoticeEditorTab(noticeItems.length);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-400 transition-all"
                            >
                              <Plus size={12} /> 추가
                            </button>
                          </div>

                          {/* Selected tab editor */}
                          {noticeItems[noticeEditorTab] && (
                            <div className="border border-gray-200 rounded-2xl overflow-hidden">
                              {/* Title + delete row */}
                              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
                                <input
                                  className="flex-1 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 transition-colors"
                                  value={noticeItems[noticeEditorTab].title}
                                  onChange={(e) => setNoticeItems((ns) => ns.map((n, j) => j === noticeEditorTab ? { ...n, title: e.target.value } : n))}
                                  placeholder="탭 제목"
                                />
                                {noticeItems.length > 1 && (
                                  <button
                                    onClick={() => {
                                      setNoticeItems((ns) => ns.filter((_, j) => j !== noticeEditorTab));
                                      setNoticeEditorTab(Math.max(0, noticeEditorTab - 1));
                                    }}
                                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                              {/* Toolbar */}
                              <div className="flex items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-100">
                                {(["B", "U", "I", "≡"] as const).map((fmt) => (
                                  <button
                                    key={fmt}
                                    className="w-7 h-7 flex items-center justify-center text-sm rounded hover:bg-gray-200 transition-colors text-gray-500"
                                    style={{ fontWeight: fmt === "B" ? 700 : 400, textDecoration: fmt === "U" ? "underline" : "none", fontStyle: fmt === "I" ? "italic" : "normal" }}
                                  >
                                    {fmt}
                                  </button>
                                ))}
                              </div>
                              {/* Content textarea */}
                              <textarea
                                className="w-full px-3 py-3 text-sm text-gray-800 outline-none resize-none bg-white placeholder-gray-300"
                                rows={4}
                                value={noticeItems[noticeEditorTab].content}
                                onChange={(e) => setNoticeItems((ns) => ns.map((n, j) => j === noticeEditorTab ? { ...n, content: e.target.value } : n))}
                                placeholder="내용을 입력해 주세요"
                              />
                            </div>
                          )}
                        </div>
                      </SectionBlock>
                    </>
                  )}

                  {activeTab === "message" && (
                    <>
                      <SectionBlock title="메시지 제목">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-500">블록 제목</label>
                          <textarea
                            className={`${inputCls} resize-none`}
                            rows={2}
                            value={msgTitle}
                            onChange={(e) => setMsgTitle(e.target.value)}
                            placeholder={"신랑 신부에게\n축하인사를 남겨주세요"}
                          />
                        </div>
                      </SectionBlock>
                      <SectionBlock title="설정">
                        <div className="flex items-center justify-between">
                          <div><p className="text-sm text-gray-700">댓글 승인 후 게시</p><p className="text-xs text-gray-400 mt-0.5">관리자 확인 후 공개</p></div>
                          <Toggle value={moderationEnabled} onChange={setModerationEnabled} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between"><label className="text-xs text-gray-500">최대 글자 수</label><span className="text-xs text-gray-700 font-medium">{messageMaxLen}자</span></div>
                          <input type="range" min={50} max={500} step={50} value={messageMaxLen} onChange={(e) => setMessageMaxLen(Number(e.target.value))} className="w-full cursor-pointer" style={{ accentColor: EDITOR_PINK }} />
                        </div>
                      </SectionBlock>
                    </>
                  )}

                  {activeTab === "nearby" && (
                    <>
                      <SectionBlock title="제목">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-500">블록 제목</label>
                            <input className={inputCls} value={nearbyTitle} onChange={(e) => setNearbyTitle(e.target.value)} placeholder="주변 즐길 거리" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-500">소개 문구</label>
                            <textarea className={`${inputCls} resize-none`} rows={2} value={nearbySubtitle} onChange={(e) => setNearbySubtitle(e.target.value)} placeholder="예식 후 함께 즐길 수 있는 곳을 소개해요" />
                          </div>
                        </div>
                      </SectionBlock>

                      <SectionBlock title="AI 주변 편의시설 추천">
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-[1fr_92px] gap-2">
                            <div className="flex flex-col gap-1.5 min-w-0">
                              <label className="text-xs text-gray-500">추천 기준</label>
                              <input
                                className={inputCls}
                                value={address || venueName}
                                readOnly
                                placeholder="오시는길에서 식장 주소를 먼저 입력해 주세요"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-500">추천 개수</label>
                              <input
                                type="number"
                                min={1}
                                max={12}
                                className={inputCls}
                                value={nearbyRecommendCount}
                                onChange={(e) => setNearbyRecommendCount(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
                              />
                            </div>
                          </div>
                          <button
                            onClick={handleRecommendNearby}
                            disabled={nearbyRecommendLoading}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-60 transition-colors"
                          >
                            {nearbyRecommendLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            {nearbyRecommendLoading ? "주변 찾는 중" : "주변 편의시설 추천 받기"}
                          </button>

                          {nearbyRecommendations.length > 0 && (
                            <div className="flex flex-col gap-2">
                              {nearbyRecommendations.map((place) => {
                                const isSelected = selectedNearbyIds.includes(place.id);
                                const placeAddress = place.roadAddressName || place.addressName;
                                const category = place.categoryName.split(">").map((part) => part.trim()).filter(Boolean).pop();
                                return (
                                  <button
                                    key={place.id}
                                    onClick={() => handleToggleRecommendedNearby(place.id)}
                                    className="text-left p-3 rounded-xl border transition-all bg-white"
                                    style={isSelected
                                      ? { borderColor: EDITOR_PINK, backgroundColor: EDITOR_PINK_BG }
                                      : { borderColor: "#E5E7EB" }}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      {place.imageUrl && (
                                        <img src={place.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                                      )}
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{place.placeName}</p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{[place.recommendationType, category, placeAddress].filter(Boolean).join(" · ")}</p>
                                        {place.phone && <p className="text-[11px] text-gray-400 mt-1">{place.phone}</p>}
                                      </div>
                                      <span
                                        className="px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap"
                                        style={isSelected
                                          ? { backgroundColor: EDITOR_PINK, color: "#fff" }
                                          : { backgroundColor: "#F3F4F6", color: "#6B7280" }}
                                      >
                                        {isSelected ? "선택됨" : "선택"}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                              <button
                                onClick={handleConfirmRecommendedNearby}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium transition-colors"
                                style={{ backgroundColor: EDITOR_PINK }}
                              >
                                <Check size={16} />
                                선택한 장소 추가
                              </button>
                            </div>
                          )}
                        </div>
                      </SectionBlock>

                      <SectionBlock title="장소 추가">
                        <div className="flex flex-col gap-2">
                          {nearbyItems.map((item, i) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                              {/* 이미지 */}
                              <input
                                ref={(el) => { nearbyImageRefs.current[i] = el; }}
                                type="file" accept="image/*" className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) setNearbyItems((ns) => ns.map((n, j) => j === i ? { ...n, imageUrl: URL.createObjectURL(f) } : n));
                                  e.target.value = "";
                                }}
                              />
                              <button
                                onClick={() => nearbyImageRefs.current[i]?.click()}
                                className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-400 transition-all flex items-center justify-center bg-white"
                              >
                                {item.imageUrl
                                  ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                  : <ImageIcon size={16} className="text-gray-300" />}
                              </button>
                              {/* 텍스트 입력 */}
                              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                                <input className={inputCls} value={item.title} onChange={(e) => setNearbyItems((ns) => ns.map((n, j) => j === i ? { ...n, title: e.target.value } : n))} placeholder="장소명" />
                                <input className={inputCls} value={item.desc} onChange={(e) => setNearbyItems((ns) => ns.map((n, j) => j === i ? { ...n, desc: e.target.value } : n))} placeholder="간단한 설명" />
                              </div>
                              <button onClick={() => setNearbyItems((ns) => ns.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={14} /></button>
                            </div>
                          ))}
                          <button
                            onClick={() => setNearbyItems((ns) => [...ns, { id: `nb${Date.now()}`, title: "", desc: "", imageUrl: "" }])}
                            className="flex items-center justify-center gap-1.5 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 hover:border-gray-400 transition-all"
                          >
                            <Plus size={14} /> 장소 추가
                          </button>
                        </div>
                      </SectionBlock>
                    </>
                  )}

                  {activeTab === "gallery" && (
                    <>
                      <SectionBlock title="레이아웃">
                        <div className="grid grid-cols-2 gap-3">
                          {([
                            { id: "grid",      label: "그리드",    desc: "3×3 격자 사진 배열" },
                            { id: "slideshow", label: "슬라이드쇼", desc: "큰 사진 + 썸네일 슬라이드" },
                          ] as const).map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setGalleryLayout(s.id)}
                              className="p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2"
                              style={{ borderColor: galleryLayout === s.id ? EDITOR_PINK : "#E5E7EB", backgroundColor: galleryLayout === s.id ? EDITOR_PINK_BG : "#fff" }}
                            >
                              <div className="w-full h-20 rounded-xl overflow-hidden p-1.5" style={{ backgroundColor: "#f0f0f0" }}>
                                {s.id === "grid" ? (
                                  <div className="w-full h-full grid grid-cols-3 gap-0.5">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                      <div key={i} className="rounded-sm" style={{ backgroundColor: "#d1d5db" }} />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex flex-col gap-0.5">
                                    <div className="flex-1 rounded-sm relative flex items-center justify-between px-1.5" style={{ backgroundColor: "#d1d5db" }}>
                                      <span className="text-[9px] font-bold text-white/80">‹</span>
                                      <span className="text-[9px] font-bold text-white/80">›</span>
                                    </div>
                                    <div className="flex gap-0.5 h-4">
                                      {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex-1 rounded-sm" style={{ backgroundColor: i === 0 ? "#9ca3af" : "#d1d5db" }} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold" style={{ color: galleryLayout === s.id ? EDITOR_PINK : "#374151" }}>{s.label}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </SectionBlock>
                      <SectionBlock title="업로드 설정">
                        <div className="flex items-center justify-between py-1">
                          <div><p className="text-sm text-gray-700">카카오 로그인 필요</p><p className="text-xs text-gray-400 mt-0.5">카카오 인증 후 업로드 가능</p></div>
                          <Toggle value={requireKakaoAuth} onChange={setRequireKakaoAuth} />
                        </div>
                      </SectionBlock>
                    </>
                  )}

                  {activeTab === "ending" && (
                    <>
                      <SectionBlock title="마무리 메시지">
                        <textarea className={`${inputCls} resize-none`} rows={4} value={endingMsg} onChange={(e) => setEndingMsg(e.target.value)} placeholder="청첩장 마지막에 표시할 메시지" />
                      </SectionBlock>
                      <SectionBlock title="꽃잎 애니메이션">
                        <div className="flex items-center justify-between"><div><p className="text-sm text-gray-700">꽃잎 효과</p><p className="text-xs text-gray-400 mt-0.5">엔딩에서 꽃잎이 떨어져요</p></div><Toggle value={showPetals} onChange={setShowPetals} /></div>
                        {showPetals && (
                          <div className="bg-gray-50 rounded-xl h-24 overflow-hidden relative flex items-center justify-center">
                            {["🌸","🌺","🌸","🌷","🌸","🌺","🌸"].map((p, i) => (
                              <motion.span key={i} className="absolute text-xl" style={{ left: `${8 + i * 13}%` }}
                                animate={{ y: [0, 88], opacity: [1, 0] }}
                                transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.35, ease: "linear" }}
                              >{p}</motion.span>
                            ))}
                          </div>
                        )}
                      </SectionBlock>
                    </>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMobilePreview && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowMobilePreview(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-gray-100 rounded-t-3xl p-6 lg:hidden overflow-y-auto" style={{ maxHeight: "90vh" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-800">미리보기</p>
                <button onClick={() => setShowMobilePreview(false)} className="text-gray-400"><X size={20} /></button>
              </div>
              <div className="flex justify-center">{PhonePreview()}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
