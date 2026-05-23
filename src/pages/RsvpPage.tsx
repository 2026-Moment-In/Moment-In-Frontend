import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Heart } from "lucide-react";
import { api } from "../api";
import type { QrResponse } from "../types";
import type { Attendance, MealPreference } from "../types";

function isDark(hex: string) {
  const h = hex.replace("#", "").padStart(6, "0");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export default function RsvpPage() {
  const { code } = useParams<{ code: string }>();

  const [qr, setQr] = useState<QrResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [meal, setMeal] = useState<MealPreference>("한식");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!code) return;
    api
      .getQr(code)
      .then(setQr)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <p className="text-muted text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (!qr) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <p className="text-muted text-sm">청첩장을 찾을 수 없습니다</p>
      </div>
    );
  }

  const data = qr.data ?? {};
  const bgColor = (data.bgColor as string) || "#faf8f5";
  const fontColor = (data.fontColor as string) || "#3a3535";
  const groomName = (data.groomName as string) || "";
  const brideName = (data.brideName as string) || "";

  const buttonText = isDark(fontColor) ? "#ffffff" : "#1a1a1a";
  const t = {
    bg: bgColor,
    text: fontColor,
    accent: "#b89a6a",
    button: fontColor,
    buttonText,
  };

  const handleSubmit = async () => {
    if (!name.trim() || !attendance) return;
    setSubmitting(true);
    try {
      await api.createRsvp({
        weddingId: qr.wedding.id,
        name: name.trim(),
        attendance,
        guestCount: attendance === "no" ? 0 : guestCount,
        mealPreference: meal,
        message: message.trim() || undefined,
      });
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors bg-white";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ backgroundColor: t.bg }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            to={`/show/${code}`}
            className="font-serif text-lg tracking-widest block mb-3"
            style={{ color: t.text }}
          >
            {groomName} ♥ {brideName}
          </Link>
          <p className="text-xs tracking-widest uppercase" style={{ color: t.accent }}>
            RSVP
          </p>
          <p className="font-serif text-xl mt-1" style={{ color: t.text }}>
            참석 여부 응답
          </p>
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center flex flex-col items-center gap-5 py-10"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: t.button }}
              >
                <Check size={28} style={{ color: t.buttonText }} />
              </div>
              <div>
                <p className="font-serif text-xl mb-2" style={{ color: t.text }}>
                  응답 완료!
                </p>
                <p className="text-sm" style={{ color: t.text, opacity: 0.7 }}>
                  {name}님의 응답이 전달되었습니다.
                </p>
                {attendance === "yes" && (
                  <p className="text-sm mt-1" style={{ color: t.accent }}>
                    <Heart size={12} className="inline mr-1" />
                    두 분의 결혼을 진심으로 축하해요!
                  </p>
                )}
              </div>
              <Link
                to={`/show/${code}`}
                className="px-6 py-3 rounded-full text-sm mt-2"
                style={{ backgroundColor: t.button, color: t.buttonText }}
              >
                청첩장으로 돌아가기
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.text }}>
                  이름 *
                </label>
                <input
                  className={inputCls}
                  style={{ borderColor: t.accent + "50", color: t.text }}
                  placeholder="성함을 입력해주세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.text }}>
                  참석 여부 *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { val: "yes" as Attendance, label: "참석", emoji: "😊" },
                      { val: "no" as Attendance, label: "불참", emoji: "😢" },
                      { val: "undecided" as Attendance, label: "미정", emoji: "🤔" },
                    ] as const
                  ).map(({ val, label, emoji }) => (
                    <button
                      key={val}
                      onClick={() => setAttendance(val)}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs transition-all"
                      style={{
                        borderColor:
                          attendance === val ? t.button : t.accent + "30",
                        backgroundColor:
                          attendance === val ? t.button + "15" : "white",
                        color: attendance === val ? t.button : t.text,
                      }}
                    >
                      <span>{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {attendance === "yes" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-col gap-1.5 overflow-hidden"
                >
                  <label className="text-xs font-medium" style={{ color: t.text }}>
                    참석 인원
                  </label>
                  <div
                    className="flex items-center gap-3 bg-white border rounded-xl px-4 py-2"
                    style={{ borderColor: t.accent + "50" }}
                  >
                    <button
                      onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                      className="w-8 h-8 rounded-full border flex items-center justify-center text-base"
                      style={{ borderColor: t.accent + "50", color: t.text }}
                    >
                      −
                    </button>
                    <span
                      className="flex-1 text-center text-sm font-medium"
                      style={{ color: t.text }}
                    >
                      {guestCount}명
                    </span>
                    <button
                      onClick={() => setGuestCount((c) => Math.min(10, c + 1))}
                      className="w-8 h-8 rounded-full border flex items-center justify-center text-base"
                      style={{ borderColor: t.accent + "50", color: t.text }}
                    >
                      +
                    </button>
                  </div>
                </motion.div>
              )}

              {attendance === "yes" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-col gap-1.5 overflow-hidden"
                >
                  <label className="text-xs font-medium" style={{ color: t.text }}>
                    식사 선택
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["한식", "양식", "없음"] as MealPreference[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMeal(m)}
                        className="py-2.5 rounded-xl border text-xs transition-all"
                        style={{
                          borderColor: meal === m ? t.button : t.accent + "30",
                          backgroundColor: meal === m ? t.button + "15" : "white",
                          color: meal === m ? t.button : t.text,
                          fontWeight: meal === m ? "600" : "400",
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: t.text }}>
                  축하 메시지 (선택)
                </label>
                <textarea
                  className={`${inputCls} resize-none`}
                  style={{ borderColor: t.accent + "50", color: t.text }}
                  rows={3}
                  placeholder="두 분에게 전하고 싶은 말을 남겨주세요"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !attendance || submitting}
                className="w-full py-4 rounded-2xl text-sm font-medium transition-colors disabled:opacity-40"
                style={{ backgroundColor: t.button, color: t.buttonText }}
              >
                {submitting ? "전송 중..." : "응답 전송하기"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
