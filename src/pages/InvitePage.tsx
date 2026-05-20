import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import { useInviteStore } from "../store/inviteStore";
import { useAuthStore } from "../store/authStore";
import KakaoLoginModal from "../components/common/KakaoLoginModal";
import KakaoMap from "../components/common/KakaoMap";
import type { MotionType } from "../types";

type MotionInitial = { scale?: number; x?: string; y?: string };
const MOTION_INITIAL: Record<MotionType, MotionInitial> = {
  "zoom-in":     { scale: 1.15 },
  "zoom-out":    { scale: 0.88 },
  "slide-right": { x: "-8%" },
  "slide-left":  { x: "8%" },
  "slide-up":    { y: "8%" },
};

function useDDay(dateStr: string) {
  const match = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (!match) return null;
  const weddingDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "D-Day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const { invitation, incrementViewCount, addMessage, deleteMessage } = useInviteStore();
  const { isLoggedIn, user, openModal } = useAuthStore();
  const [msgText, setMsgText] = useState("");
  const [activeGallery, setActiveGallery] = useState<string | null>(null);
  const [activeNoticeTab, setActiveNoticeTab] = useState(0);
  const [showMsgForm, setShowMsgForm] = useState(false);

  useEffect(() => {
    if (invitation && invitation.entryCode === code?.toUpperCase()) {
      incrementViewCount();
    }
  }, []);

  if (!invitation || invitation.entryCode !== code?.toUpperCase()) {
    return <Navigate to="/" replace />;
  }

  const { couple, cover, colorTheme: t, gallery, rsvpList, messages } = invitation;
  const dday = useDDay(couple.weddingDate);

  const handleSendMessage = () => {
    if (!msgText.trim()) return;
    if (!isLoggedIn) { openModal(); return; }
    addMessage({
      authorName: user!.name,
      authorAvatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${user!.name}`,
      content: msgText.trim(),
    });
    setMsgText("");
    setShowMsgForm(false);
  };

  return (
    <>
      <KakaoLoginModal />
      <div className="min-h-screen" style={{ backgroundColor: t.bg, color: t.text }}>

        <section className="relative w-full overflow-hidden" style={{ height: "100svh" }}>
          <motion.div
            initial={MOTION_INITIAL[cover.motion]}
            animate={{ scale: 1, x: 0, y: 0 }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img src={cover.imageUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
          </motion.div>

          {cover.showGradient && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/20" />
          )}

          {dday && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs px-4 py-1.5 rounded-full tracking-wider"
            >
              {dday}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9 }}
            className="absolute bottom-0 left-0 right-0 p-8 text-center text-white pb-20"
          >
            <p className="text-white/60 text-xs tracking-[0.4em] uppercase mb-3">Wedding Invitation</p>
            <p className="font-serif text-3xl tracking-widest mb-2">{couple.groomName} ♥ {couple.brideName}</p>
            <p className="text-white/70 text-sm tracking-wider">{couple.weddingDate}</p>
            <p className="text-white/50 text-xs mt-1">{couple.venue}</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50"
          >
            <ChevronDown size={18} />
          </motion.div>
        </section>

        <section className="py-20 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-6 max-w-sm mx-auto"
          >
            <div className="divider-ornament w-40 text-xs" style={{ color: t.accent }}>✦</div>
            <div className="flex flex-col gap-1 text-sm" style={{ color: t.text }}>
              <p className="font-medium">{couple.groomFamily}</p>
              <p className="font-medium">{couple.brideFamily}</p>
            </div>
            <p className="font-serif text-2xl" style={{ color: t.text }}>
              {couple.groomName} · {couple.brideName}
            </p>
            <p className="text-sm leading-loose whitespace-pre-line" style={{ color: t.text, opacity: 0.75 }}>
              {couple.message}
            </p>
            <div className="divider-ornament w-40 text-xs" style={{ color: t.accent }}>✦</div>
          </motion.div>
        </section>

        {/* 오시는 길 */}
        <section className="py-16 px-6" style={{ backgroundColor: t.accent + "12" }}>
          <div className="max-w-sm mx-auto flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <p className="text-xs tracking-[0.4em] uppercase mb-1" style={{ color: t.accent }}>Location</p>
              <p className="font-serif text-xl" style={{ color: t.text }}>오시는 길</p>
            </motion.div>

            {/* 예식 기본정보 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="text-sm font-medium mb-0.5" style={{ color: t.text }}>{couple.venueAddress}</p>
              {couple.venueDetail && (
                <p className="text-xs" style={{ color: t.text, opacity: 0.6 }}>{couple.venue}, {couple.venueDetail}</p>
              )}
            </motion.div>

            {/* 카카오 지도 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <KakaoMap
                address={couple.venueAddress}
                markerTitle={invitation.location?.markerTitle ?? `${couple.groomName} ❤ ${couple.brideName}`}
                markerIconIdx={invitation.location?.markerIconIdx ?? 2}
                height={220}
                accentColor={t.accent}
              />
            </motion.div>

            {/* 네비게이션 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-4 pt-2"
            >
              <div className="text-center">
                <p className="font-serif text-lg mb-1" style={{ color: t.text }}>네비게이션</p>
                <p className="text-xs" style={{ color: t.text, opacity: 0.5 }}>앱 열어 길 안내를 시작해 보세요.</p>
              </div>
              <a
                href={`https://map.naver.com/v5/search/${encodeURIComponent(couple.venueAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* Naver green N logo */}
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-black" style={{ backgroundColor: "#03C75A" }}>N</span>
                <span className="text-sm font-medium text-gray-700">네이버 지도</span>
              </a>
            </motion.div>
          </div>
        </section>

        {/* 교통수단 안내 */}
        {invitation.location && (
          <section className="py-12 px-6">
            <div className="max-w-sm mx-auto flex flex-col gap-6">
              {[
                { key: "subway", icon: "🚇", label: "지하철", info: invitation.location.subwayInfo },
                { key: "bus",    icon: "🚌", label: "버스",   info: invitation.location.busInfo },
                { key: "car",    icon: "🚗", label: "자가용", info: invitation.location.carInfo },
                { key: "walk",   icon: "🚶", label: "도보",   info: invitation.location.walkInfo },
              ].filter(({ info }) => info.trim()).map(({ key, icon, label, info }, i, arr) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{icon}</span>
                    <p className="text-sm font-semibold" style={{ color: t.text }}>{label}</p>
                  </div>
                  <div className="pl-7 flex flex-col gap-1">
                    {info.split("\n").filter(Boolean).map((line, li) => (
                      <p key={li} className="text-sm leading-relaxed" style={{ color: t.text, opacity: 0.7 }}>
                        · {line}
                      </p>
                    ))}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="mt-4" style={{ borderTop: `1px solid ${t.accent}20` }} />
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* 안내사항 */}
        {invitation.noticeItems && invitation.noticeItems.length > 0 && (
          <section className="py-14 px-6">
            <div className="max-w-sm mx-auto flex flex-col gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-center"
              >
                <p className="text-xs tracking-[0.4em] uppercase mb-1" style={{ color: t.accent }}>Notice</p>
                <p className="font-serif text-xl" style={{ color: t.text }}>{invitation.noticeTitle ?? "안내사항"}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-col gap-3"
              >
                {/* pill tabs */}
                <div className="flex gap-2 flex-wrap justify-center">
                  {invitation.noticeItems.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveNoticeTab(i)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                      style={
                        activeNoticeTab === i
                          ? { backgroundColor: t.accent, color: "#fff" }
                          : { backgroundColor: t.accent + "18", color: t.text }
                      }
                    >
                      {item.title}
                    </button>
                  ))}
                </div>

                {/* content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeNoticeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl px-5 py-4 text-sm leading-relaxed text-center whitespace-pre-line"
                    style={{ backgroundColor: t.accent + "12", color: t.text, opacity: 1 }}
                  >
                    <span style={{ opacity: 0.75 }}>
                      {invitation.noticeItems[activeNoticeTab]?.content}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </section>
        )}

        {/* 주변정보 */}
        {invitation.nearbyItems && invitation.nearbyItems.length > 0 && (
          <section className="py-14 px-6">
            <div className="max-w-sm mx-auto flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="text-center"
              >
                <p className="text-xs tracking-[0.4em] uppercase mb-1" style={{ color: t.accent }}>Activities</p>
                <p className="font-serif text-xl mb-2" style={{ color: t.text }}>{invitation.nearbyTitle ?? "주변 즐길 거리"}</p>
                {invitation.nearbySubtitle && (
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: t.text, opacity: 0.65 }}>{invitation.nearbySubtitle}</p>
                )}
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                {invitation.nearbyItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: t.accent + "10" }}
                  >
                    {item.imageUrl && (
                      <div className="w-full aspect-[4/3] overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold leading-tight" style={{ color: t.text }}>{item.title}</p>
                      {item.desc && <p className="text-xs mt-1 leading-snug" style={{ color: t.text, opacity: 0.6 }}>{item.desc}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {gallery.length > 0 && (
          <section className="py-16 px-6">
            <div className="max-w-sm mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <p className="text-xs tracking-[0.4em] uppercase mb-1" style={{ color: t.accent }}>Gallery</p>
                <p className="font-serif text-xl" style={{ color: t.text }}>갤러리</p>
              </motion.div>
              <div className="grid grid-cols-3 gap-1.5">
                {gallery.map((url, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    onClick={() => setActiveGallery(url)}
                    className="relative aspect-square rounded-xl overflow-hidden"
                  >
                    <img src={url} alt={`gallery ${i}`} className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 px-6 text-center" style={{ backgroundColor: t.button + "12" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-sm mx-auto flex flex-col items-center gap-5"
          >
            <div>
              <p className="text-xs tracking-[0.4em] uppercase mb-1" style={{ color: t.accent }}>RSVP</p>
              <p className="font-serif text-xl mb-2" style={{ color: t.text }}>참석 여부 알려주세요</p>
              <p className="text-sm" style={{ color: t.text, opacity: 0.65 }}>
                {rsvpList.filter((r) => r.attendance === "yes").reduce((s, r) => s + r.guestCount, 0)}명이 참석 예정입니다
              </p>
            </div>
            <Link
              to={`/rsvp/${invitation.entryCode}`}
              className="px-8 py-4 rounded-full text-sm font-medium w-full max-w-xs text-center transition-colors"
              style={{ backgroundColor: t.button, color: t.buttonText }}
            >
              참석 여부 응답하기
            </Link>
          </motion.div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-sm mx-auto flex flex-col gap-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <p className="text-xs tracking-[0.4em] uppercase mb-4" style={{ color: t.accent }}>MESSAGE</p>
              <p className="font-serif text-2xl leading-snug whitespace-pre-line" style={{ color: t.text }}>
                {invitation.msgTitle ?? "신랑 신부에게\n축하인사를 남겨주세요"}
              </p>
            </motion.div>

            {/* Write button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <button
                onClick={() => { if (!isLoggedIn) { openModal(); return; } setShowMsgForm((v) => !v); }}
                className="w-full py-4 rounded-2xl text-sm font-medium transition-colors"
                style={{ backgroundColor: t.button, color: t.buttonText }}
              >
                축하메시지 남기기
              </button>
            </motion.div>

            {/* Inline form */}
            <AnimatePresence>
              {showMsgForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-2">
                    <textarea
                      autoFocus
                      rows={3}
                      placeholder="축하 메시지를 남겨주세요"
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      className="w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none"
                      style={{ borderColor: t.accent + "60", backgroundColor: "white", color: t.text }}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setShowMsgForm(false); setMsgText(""); }}
                        className="px-5 py-2.5 rounded-xl text-sm border transition-colors"
                        style={{ borderColor: t.accent + "40", color: t.text, opacity: 0.6 }}
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!msgText.trim()}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
                        style={{ backgroundColor: t.button, color: t.buttonText }}
                      >
                        등록
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message list */}
            <div className="flex flex-col">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="py-4"
                    style={{ borderTop: i > 0 ? `1px solid ${t.accent}20` : undefined }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium" style={{ color: t.text }}>{msg.authorName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: t.text, opacity: 0.4 }}>{msg.createdAt}</span>
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="text-xs leading-none transition-colors hover:opacity-100"
                          style={{ color: t.text, opacity: 0.3 }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: t.text, opacity: 0.7 }}>{msg.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <footer className="py-10 text-center text-xs" style={{ color: t.text, opacity: 0.4 }}>
          <p className="font-serif text-sm mb-1" style={{ color: t.accent, opacity: 1 }}>MomentIn</p>
        </footer>
      </div>

      <AnimatePresence>
        {activeGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveGallery(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md aspect-square">
              <img src={activeGallery} alt="gallery" className="absolute inset-0 w-full h-full object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        img { -webkit-user-drag: none; user-drag: none; pointer-events: none; }
        * { -webkit-touch-callout: none; }
      `}</style>
    </>
  );
}
