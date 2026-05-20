import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ExternalLink, Trash2, Eye, Users, MessageSquare } from "lucide-react";
import QRCodeLib from "react-qr-code";
import NavBar from "../components/common/NavBar";
import { useInviteStore } from "../store/inviteStore";
import type { Attendance } from "../types";

const TABS = ["대시보드", "참석 현황", "메시지 관리", "공유하기"];

const attendanceLabel: Record<Attendance, { label: string; color: string; bg: string }> = {
  yes:       { label: "참석",  color: "#4a6b4a", bg: "#e8f0e8" },
  no:        { label: "불참",  color: "#9a4a4a", bg: "#f0e8e8" },
  undecided: { label: "미정",  color: "#6b6464", bg: "#ede8e2" },
};

export default function ManagePage() {
  const [searchParams] = useSearchParams();
  const { invitation, deleteMessage, deleteRSVP } = useInviteStore();
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const code = searchParams.get("code") || invitation?.entryCode || "";
  const inviteUrl = `${window.location.origin}/invite/${code}`;

  if (!invitation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted">청첩장이 없습니다</p>
        <Link to="/create" className="px-6 py-3 bg-charcoal text-white rounded-full text-sm">
          청첩장 만들기
        </Link>
      </div>
    );
  }

  const { couple, rsvpList, messages, viewCount } = invitation;

  const yesCount = rsvpList.filter((r) => r.attendance === "yes").reduce((s, r) => s + r.guestCount, 0);
  const noCount = rsvpList.filter((r) => r.attendance === "no").length;
  const undecidedCount = rsvpList.filter((r) => r.attendance === "undecided").length;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(inviteUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const shareTemplates = [
    {
      label: "회사용",
      text: `[결혼식 초대] 안녕하세요. ${couple.groomName}·${couple.brideName}의 결혼식이 ${couple.weddingDate} ${couple.weddingTime}에 ${couple.venue}에서 진행됩니다. 청첩장 → ${inviteUrl}`,
    },
    {
      label: "지인용",
      text: `${couple.groomName} ♥ ${couple.brideName} 결혼합니다 🥳 ${couple.weddingDate} ${couple.weddingTime} ${couple.venue} 청첩장 → ${inviteUrl}`,
    },
    {
      label: "부모님용",
      text: `아들/딸 ${couple.groomName}(${couple.brideName})의 결혼식에 초대합니다. 일시: ${couple.weddingDate} ${couple.weddingTime} / 장소: ${couple.venue} 청첩장 주소: ${inviteUrl}`,
    },
  ];

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-ivory pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-5">

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted text-xs mb-0.5">청첩장 관리</p>
              <h1 className="font-serif text-2xl text-charcoal">{couple.groomName} ♥ {couple.brideName}</h1>
              <p className="text-muted text-sm mt-0.5">{couple.weddingDate}</p>
            </div>
            <Link
              to={`/invite/${code}`}
              target="_blank"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-charcoal text-white rounded-full text-xs hover:bg-charcoal-dark transition-colors"
            >
              <ExternalLink size={13} />
              청첩장 보기
            </Link>
          </div>

          <div className="flex gap-0 bg-white rounded-2xl p-1 mb-6 shadow-sm border border-surface overflow-x-auto">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  tab === i ? "bg-charcoal text-white shadow-sm" : "text-secondary hover:text-charcoal"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {tab === 0 && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Eye, label: "조회수", value: viewCount, color: "#6a9eb5" },
                      { icon: Users, label: "참석 예정", value: `${yesCount}명`, color: "#4a6b4a" },
                      { icon: Users, label: "불참", value: `${noCount}명`, color: "#9a4a4a" },
                      { icon: MessageSquare, label: "메시지", value: messages.length, color: "#b89a6a" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="bg-white rounded-2xl p-4 border border-surface shadow-sm">
                        <Icon size={18} style={{ color }} className="mb-2" />
                        <p className="text-xl font-bold text-charcoal">{value}</p>
                        <p className="text-xs text-muted mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-surface shadow-sm">
                    <p className="text-xs text-muted mb-2">입장 코드</p>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-xl font-bold text-charcoal tracking-widest flex-1">{code}</p>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ivory border border-divider text-xs text-secondary hover:bg-surface transition-colors"
                      >
                        {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        {copied ? "복사됨" : "복사"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-surface shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-charcoal">최근 RSVP</p>
                      <button onClick={() => setTab(1)} className="text-xs text-gold">전체보기</button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {rsvpList.slice(0, 4).map((r) => {
                        const s = attendanceLabel[r.attendance];
                        return (
                          <div key={r.id} className="flex items-center gap-3 py-2 border-b border-surface-warm last:border-0">
                            <span className="text-sm font-medium text-charcoal flex-1">{r.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                            <span className="text-xs text-muted">{r.guestCount > 0 ? `${r.guestCount}명` : "-"}</span>
                          </div>
                        );
                      })}
                      {rsvpList.length === 0 && <p className="text-xs text-muted py-3 text-center">아직 RSVP가 없습니다</p>}
                    </div>
                  </div>
                </div>
              )}

              {tab === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-charcoal">총 {rsvpList.length}명 응답</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full" style={{ backgroundColor: "#e8f0e8", color: "#4a6b4a" }}>참석 {yesCount}명</span>
                      <span className="px-2.5 py-1 rounded-full" style={{ backgroundColor: "#f0e8e8", color: "#9a4a4a" }}>불참 {noCount}명</span>
                      <span className="px-2.5 py-1 rounded-full" style={{ backgroundColor: "#ede8e2", color: "#6b6464" }}>미정 {undecidedCount}명</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {rsvpList.map((r) => {
                      const s = attendanceLabel[r.attendance];
                      return (
                        <div key={r.id} className="bg-white rounded-2xl p-4 border border-surface shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-charcoal text-sm">{r.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                                {r.guestCount > 0 && <span className="text-xs text-muted">{r.guestCount}명</span>}
                                {r.mealPreference !== "없음" && <span className="text-xs text-muted">{r.mealPreference}</span>}
                              </div>
                              {r.message && <p className="text-xs text-muted leading-relaxed">{r.message}</p>}
                              <p className="text-xs text-subtle mt-1">{r.createdAt}</p>
                            </div>
                            <button onClick={() => deleteRSVP(r.id)} className="p-2 text-rose hover:text-rose-light transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {rsvpList.length === 0 && (
                      <div className="text-center py-16 text-muted text-sm">아직 RSVP 응답이 없습니다</div>
                    )}
                  </div>
                </div>
              )}

              {tab === 2 && (
                <div className="flex flex-col gap-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="bg-white rounded-2xl p-4 border border-surface shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-charcoal text-sm">{msg.authorName}</span>
                            <span className="text-xs text-muted">{msg.createdAt}</span>
                          </div>
                          <p className="text-sm text-secondary leading-relaxed">{msg.content}</p>
                        </div>
                        <button onClick={() => deleteMessage(msg.id)} className="p-2 text-rose hover:text-rose-light transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center py-16 text-muted text-sm">아직 메시지가 없습니다</div>
                  )}
                </div>
              )}

              {tab === 3 && (
                <div className="flex flex-col gap-5">
                  <div className="bg-white rounded-2xl p-6 border border-surface shadow-sm flex flex-col items-center gap-4">
                    <p className="text-sm font-medium text-charcoal">QR 코드</p>
                    <div className="p-4 bg-white rounded-xl border border-surface">
                      <QRCodeLib value={inviteUrl} size={160} fgColor="#3a3535" />
                    </div>
                    <p className="text-xs text-muted text-center">QR코드를 스캔하면 청첩장이 열립니다</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-surface shadow-sm">
                    <p className="text-xs text-muted mb-2">청첩장 링크</p>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 text-xs text-charcoal bg-ivory rounded-xl px-3 py-2 truncate font-mono">{inviteUrl}</p>
                      <button
                        onClick={handleCopyUrl}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-charcoal text-white text-xs whitespace-nowrap hover:bg-charcoal-dark transition-colors"
                      >
                        {urlCopied ? <Check size={12} /> : <Copy size={12} />}
                        {urlCopied ? "복사됨" : "복사"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-charcoal">맞춤형 공유 템플릿</p>
                    <p className="text-xs text-muted">상황에 맞는 템플릿으로 센스있게 공유하세요</p>
                    {shareTemplates.map((t) => (
                      <div key={t.label} className="bg-white rounded-2xl p-4 border border-surface shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gold bg-ivory px-3 py-1 rounded-full">{t.label}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(t.text)}
                            className="flex items-center gap-1 text-xs text-muted hover:text-charcoal transition-colors"
                          >
                            <Copy size={11} />
                            복사
                          </button>
                        </div>
                        <p className="text-xs text-secondary leading-relaxed whitespace-pre-wrap">{t.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-charcoal rounded-2xl p-5 text-white flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm mb-0.5">라이브 슬라이드쇼</p>
                      <p className="text-white/60 text-xs">사진을 자동 슬라이드쇼로 상영</p>
                    </div>
                    <Link to="/admin/live" className="px-4 py-2 bg-gold rounded-xl text-xs hover:bg-gold-light transition-colors whitespace-nowrap">
                      열기
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
