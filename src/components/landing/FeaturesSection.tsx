import AnimatedSection from "../common/AnimatedSection";
import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "빠른 제작",
    desc: "예쁜 사진만 골라주세요. 기본 정보만 넣으면 청첩장 완성",
    stats: [
      { label: "평균 제작 시간", value: "10분" },
      { label: "수정 가능 기간", value: "무제한" },
      { label: "제작 가능 시간", value: "24시간" },
    ],
  },
  {
    icon: "💎",
    title: "강력한 에디터",
    desc: "초강력 에디터로 레터링 및 무빙 애니메이션 커버 제작 가능",
    stats: [
      { label: "모션 이펙트", value: "5가지" },
      { label: "색상 테마", value: "4가지" },
      { label: "에디터 조합", value: "∞" },
    ],
  },
  {
    icon: "💬",
    title: "맞춤형 공유",
    desc: "상황에 맞는 다른 템플릿으로 센스있게 공유하세요",
    stats: [
      { label: "공유 템플릿", value: "3가지" },
      { label: "지원 플랫폼", value: "카카오" },
      { label: "링크 유지", value: "평생" },
    ],
  },
  {
    icon: "📋",
    title: "편리한 RSVP",
    desc: "청첩장을 확인하신 분들을 자동으로 집계해 스마트하게 보여드려요",
    stats: [
      { label: "엑셀 내보내기", value: "지원" },
      { label: "실시간 집계", value: "자동" },
      { label: "식사 선택", value: "지원" },
    ],
  },
  {
    icon: "🔔",
    title: "리마인드 알림",
    desc: "예식 일주일 전, 하루 전 하객들에게 자동으로 리마인드 알림 발송",
    stats: [
      { label: "D-7 알림", value: "자동" },
      { label: "D-1 알림", value: "자동" },
      { label: "하객 만족도", value: "↑높음" },
    ],
  },
  {
    icon: "🔒",
    title: "보안 강화",
    desc: "예쁜 우리 사진을 보시는 건 좋지만, 캡쳐하시는 건 방지합니다",
    stats: [
      { label: "드래그 확대 금지", value: "✓" },
      { label: "우클릭 방지", value: "✓" },
      { label: "다운로드 금지", value: "✓" },
    ],
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 bg-ivory">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Features</p>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
            간편하게 제작하고, 예쁘게 공유하기
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            필요한 기능은 모두 MomentIn 안에 담았어요
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-surface hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-medium text-charcoal text-base mb-2">{f.title}</h3>
                <p className="text-muted text-xs leading-relaxed mb-5">{f.desc}</p>
                <div className="flex flex-col gap-2 border-t border-surface pt-4">
                  {f.stats.map((s) => (
                    <div key={s.label} className="flex justify-between items-center">
                      <span className="text-xs text-muted">{s.label}</span>
                      <span className="text-xs font-medium text-gold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
