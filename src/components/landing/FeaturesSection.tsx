import AnimatedSection from "../common/AnimatedSection";
import { motion } from "framer-motion";

const features = [
  {
    icon: "✍",
    title: "간편한 제작",
    desc: "예식 정보, 사진, 문구를 입력하면서 모바일 청첩장을 바로 구성할 수 있어요.",
    stats: [
      { label: "사진 업로드", value: "지원" },
      { label: "문구 수정", value: "가능" },
      { label: "모바일 미리보기", value: "제공" },
    ],
  },
  {
    icon: "🎬",
    title: "커버 에디터",
    desc: "커버 레이아웃과 모션을 선택하고 첫 화면의 분위기를 직접 조정할 수 있어요.",
    stats: [
      { label: "모션 효과", value: "선택" },
      { label: "커버 레이아웃", value: "2가지" },
      { label: "그라데이션", value: "조정" },
    ],
  },
  {
    icon: "🔗",
    title: "공유 기능",
    desc: "완성한 청첩장을 링크로 전달하고 하객이 모바일에서 편하게 확인할 수 있어요.",
    stats: [
      { label: "공유 링크", value: "지원" },
      { label: "카카오 로그인", value: "지원" },
      { label: "QR 보기", value: "제공" },
    ],
  },
  {
    icon: "📋",
    title: "하객 RSVP",
    desc: "참석 여부, 식사 여부, 동행 인원 같은 응답을 관리 화면에서 확인할 수 있어요.",
    stats: [
      { label: "참석 응답", value: "관리" },
      { label: "식사 선택", value: "지원" },
      { label: "관리 화면", value: "제공" },
    ],
  },
  {
    icon: "📍",
    title: "오시는 길",
    desc: "예식장 주소, 지도, 교통 안내를 넣어 하객에게 필요한 위치 정보를 전달해요.",
    stats: [
      { label: "주소 검색", value: "지원" },
      { label: "지도 표시", value: "제공" },
      { label: "교통 안내", value: "작성" },
    ],
  },
  {
    icon: "🖼",
    title: "갤러리 구성",
    desc: "웨딩 사진을 업로드하고 그리드나 슬라이드 형태로 보여줄 수 있어요.",
    stats: [
      { label: "이미지 업로드", value: "지원" },
      { label: "그리드", value: "선택" },
      { label: "슬라이드", value: "선택" },
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
            필요한 기능을 한 화면에서
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            청첩장 제작부터 공유, 하객 응답 관리까지 MomentIn에서 이어집니다.
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
