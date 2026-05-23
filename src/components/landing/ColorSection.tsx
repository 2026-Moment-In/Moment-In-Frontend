import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "../common/AnimatedSection";
import type { ColorPreset } from "../../types";
import { COLOR_PRESETS } from "../../types";

const PRESETS: { preset: ColorPreset; label: string }[] = [
  { preset: "classic", label: "classic" },
  { preset: "garden",  label: "garden" },
  { preset: "ocean",   label: "ocean" },
  { preset: "forest",  label: "forest" },
];

export default function ColorSection() {
  const [selected, setSelected] = useState<ColorPreset>("classic");
  const theme = COLOR_PRESETS[selected];

  return (
    <section className="py-28 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Color Theme</p>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
            색감 하나하나 가장 잘 어울리게
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
            배경·글자·버튼·포인트 컬러까지<br />우리 사진에 맞춰 더 예쁘게
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <AnimatedSection direction="left" className="flex flex-col gap-8">
            <div>
              <p className="text-muted text-sm mb-4 leading-relaxed">
                에디터가 사진을 분석한 다음 최적의 색을 추천해줘요
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => {
                  const t = COLOR_PRESETS[p.preset];
                  return (
                    <button
                      key={p.preset}
                      onClick={() => setSelected(p.preset)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all ${
                        selected === p.preset
                          ? "shadow-md ring-2 ring-offset-2 ring-gold"
                          : "border border-divider hover:border-gold"
                      }`}
                      style={{
                        backgroundColor: selected === p.preset ? t.bg : "#fff",
                        color: selected === p.preset ? t.text : "#6b6464",
                      }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
                      {p.label}
                    </button>
                  );
                })}
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm border border-dashed border-gold-light text-gold hover:bg-ivory transition-colors">
                  + 사진 업로드
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm text-charcoal font-medium">색상 팔레트</p>
              <div className="flex gap-2">
                {["bg", "text", "accent", "button"].map((key) => (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <div
                      className="w-10 h-10 rounded-xl shadow-sm border border-white"
                      style={{ backgroundColor: theme[key as keyof typeof theme] as string }}
                    />
                    <span className="text-[10px] text-muted capitalize">{key}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted">프리셋을 선택하거나 웨딩 사진을 업로드해보세요</p>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right">
            <motion.div
              key={selected}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl overflow-hidden shadow-xl border border-white max-w-xs mx-auto"
              style={{ backgroundColor: theme.bg }}
            >
              <div className="h-48 bg-gradient-to-br from-gold-light/40 to-gold/20 flex items-center justify-center">
                <p className="font-serif text-2xl" style={{ color: theme.text }}>INVITATION</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: theme.accent }}>
                  INVITATION GREETING
                </p>
                <p className="font-serif text-xl mb-3" style={{ color: theme.text }}>우리의 시작</p>
                <p className="text-xs leading-relaxed" style={{ color: theme.text, opacity: 0.7 }}>
                  사랑하는 두 사람이 하나가 되어<br />새로운 시작을 알립니다.
                </p>
                <button
                  className="mt-5 px-6 py-2.5 rounded-full text-sm w-full transition-colors"
                  style={{ backgroundColor: theme.button, color: theme.buttonText }}
                >
                  청첩장 보기
                </button>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
