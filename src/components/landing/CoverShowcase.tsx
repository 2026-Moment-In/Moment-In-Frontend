import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import AnimatedSection from "../common/AnimatedSection";
import type { MotionType } from "../../types";

const MOTIONS: { type: MotionType; label: string }[] = [
  { type: "zoom-in", label: "줌인" },
  { type: "zoom-out", label: "줌아웃" },
  { type: "slide-right", label: "오른쪽" },
  { type: "slide-left", label: "왼쪽" },
  { type: "slide-up", label: "위로" },
];

type AnimTarget = { scale?: number; x?: number | string; y?: number | string };
const MOTION_VARIANTS: Record<MotionType, { initial: AnimTarget; animate: AnimTarget }> = {
  "zoom-in": { initial: { scale: 1.15 }, animate: { scale: 1 } },
  "zoom-out": { initial: { scale: 0.88 }, animate: { scale: 1 } },
  "slide-right": { initial: { x: "-8%" }, animate: { x: 0 } },
  "slide-left": { initial: { x: "8%" }, animate: { x: 0 } },
  "slide-up": { initial: { y: "8%" }, animate: { y: 0 } },
};

const COVER_IMG = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=90";

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-44 md:w-52">
      <div className="bg-[#1a1a1a] rounded-[36px] p-2.5 shadow-2xl">
        <div className="bg-black rounded-[28px] overflow-hidden relative" style={{ aspectRatio: "9/19.5" }}>
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-[#1a1a1a] rounded-full z-20" />
          {children}
        </div>
      </div>
    </div>
  );
}

export default function CoverShowcase() {
  const [selected, setSelected] = useState<MotionType>("zoom-in");
  const [key, setKey] = useState(0);

  const handleSelect = (m: MotionType) => {
    setSelected(m);
    setKey((k) => k + 1);
  };

  const { initial, animate } = MOTION_VARIANTS[selected];

  return (
    <section className="py-28 bg-ivory overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Cover Design</p>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
            첫 화면을 감성적으로
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
            커버 레이아웃과 모션을 선택해 청첩장의 첫인상을 만들어보세요.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <AnimatedSection direction="left">
            <div className="flex justify-center gap-6 md:gap-8">
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-muted tracking-widest uppercase">스타일 1</p>
                <PhoneMockup>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={key}
                      initial={initial}
                      animate={animate}
                      transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      <img src={COVER_IMG} alt="커버 미리보기" className="absolute inset-0 w-full h-full object-cover" />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-center">
                    <p className="font-serif text-base text-white tracking-widest">이도윤 & 박서아</p>
                    <p className="text-white/60 text-xs mt-1">2025.10.18</p>
                  </div>
                </PhoneMockup>
              </div>

              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-muted tracking-widest uppercase">스타일 2</p>
                <PhoneMockup>
                  <div className="absolute inset-0 bg-white">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={key + 100}
                        initial={initial}
                        animate={animate}
                        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute"
                        style={{ left: 0, top: "6%", width: "65%", height: "88%", overflow: "hidden" }}
                      >
                        <img src={COVER_IMG} alt="커버 미리보기" className="absolute inset-0 w-full h-full object-cover" />
                      </motion.div>
                    </AnimatePresence>
                    <div
                      className="absolute flex flex-col items-center justify-center gap-2"
                      style={{ right: 0, top: 0, bottom: 0, width: "38%" }}
                    >
                      {["26", "06", "20"].map((n, i) => (
                        <p
                          key={i}
                          className="font-serif leading-none"
                          style={{ fontSize: 26, color: "#3a1a0a", fontWeight: 300 }}
                        >
                          {n}
                        </p>
                      ))}
                    </div>
                    <div className="absolute inset-x-0 z-10 text-center" style={{ bottom: 20 }}>
                      <p className="tracking-widest font-serif" style={{ fontSize: 8, color: "#3a1a0a" }}>
                        이도윤 & 박서아
                      </p>
                      <p style={{ fontSize: 7, color: "#3a1a0a80", marginTop: 3 }}>Wedding Invitation</p>
                    </div>
                  </div>
                </PhoneMockup>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" className="flex flex-col gap-6">
            <div>
              <h3 className="font-serif text-2xl text-charcoal mb-2">커버 모션 선택</h3>
              <p className="text-muted text-sm leading-relaxed">
                에디터에서 커버 사진, 모션, 텍스트, 그라데이션을 조정할 수 있어요.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {MOTIONS.map((m) => (
                <button
                  key={m.type}
                  onClick={() => handleSelect(m.type)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    selected === m.type
                      ? "bg-charcoal text-white shadow-md"
                      : "bg-white border border-divider text-secondary hover:border-gold hover:text-gold"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {[
                "풀스크린과 분할형 커버 레이아웃",
                "커버 문구와 날짜 표시 설정",
                "사진 위 그라데이션 강도 조정",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3 text-sm text-secondary">
                  <span className="text-gold text-xs">•</span>
                  {text}
                </div>
              ))}
            </div>

            <Link
              to="/create"
              className="self-start px-6 py-3 bg-gold text-white rounded-full text-sm hover:bg-gold-dark transition-colors"
            >
              커버 만들기 시작
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
