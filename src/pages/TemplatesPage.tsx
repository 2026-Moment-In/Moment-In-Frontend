import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import NavBar from "../components/common/NavBar";
import { mockTemplates } from "../demo";
import { COLOR_PRESETS } from "../types";
import AnimatedSection from "../components/common/AnimatedSection";

const ALL_TAGS = ["전체", "클래식", "로맨틱", "자연", "미니멀", "모던", "따뜻한", "시원한"];

export default function TemplatesPage() {
  const [activeTag, setActiveTag] = useState("전체");

  const filtered = activeTag === "전체"
    ? mockTemplates
    : mockTemplates.filter((t) => t.tags.includes(activeTag));

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-ivory pt-20 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center py-12">
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Templates</p>
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-3">템플릿 갤러리</h1>
            <p className="text-muted text-sm max-w-sm mx-auto">
              우리 스타일에 맞는 디자인을 골라보세요
            </p>
          </AnimatedSection>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  activeTag === tag
                    ? "bg-charcoal text-white shadow-sm"
                    : "bg-white border border-divider text-secondary hover:border-gold hover:text-gold"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {filtered.map((template, i) => {
              const theme = COLOR_PRESETS[template.colorPreset];
              return (
                <AnimatedSection key={template.id} delay={i * 0.06}>
                  <motion.div whileHover={{ y: -4 }} className="cursor-pointer group">
                    <div className="rounded-2xl overflow-hidden shadow-sm border border-white aspect-[3/4] relative mb-3">
                      <img
                        src={template.previewUrl}
                        alt={template.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {[theme.accent, theme.button, theme.bg].map((c, j) => (
                          <div key={j} className="w-3 h-3 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: c }} />
                        ))}
                      </div>

                      <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                        {template.motionType === "zoom-in" ? "줌인" :
                         template.motionType === "zoom-out" ? "줌아웃" :
                         template.motionType === "slide-right" ? "→" :
                         template.motionType === "slide-left" ? "←" : "↑"}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <Link
                          to="/create"
                          className="px-5 py-2.5 bg-white text-charcoal rounded-full text-xs font-medium hover:bg-ivory transition-colors shadow-lg"
                        >
                          이 템플릿으로 제작
                        </Link>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-medium text-sm">{template.name}</p>
                      </div>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: theme.bg, color: theme.accent }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatedSection>
              );
            })}
          </div>

          <AnimatedSection className="text-center mt-16 py-10">
            <p className="font-serif text-2xl text-charcoal mb-3">원하는 디자인이 없나요?</p>
            <p className="text-muted text-sm mb-6">직접 커스터마이즈해서 세상에 하나뿐인 청첩장을 만들어보세요</p>
            <Link
              to="/create"
              className="inline-block px-8 py-4 bg-charcoal text-white rounded-full text-sm hover:bg-charcoal-dark transition-colors"
            >
              직접 만들기
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </>
  );
}
