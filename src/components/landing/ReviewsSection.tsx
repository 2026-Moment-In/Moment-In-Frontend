import { useRef } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "../common/AnimatedSection";
import { ChevronLeft, ChevronRight } from "lucide-react";

const useCases = [
  { title: "부모님께는 정중하게", text: "예식 정보와 오시는 길을 깔끔하게 정리해 격식 있는 청첩장으로 공유할 수 있어요." },
  { title: "친구들에게는 가볍게", text: "모바일 링크와 QR로 바로 전달하고, 하객은 휴대폰에서 필요한 정보를 확인할 수 있어요." },
  { title: "사진은 분위기에 맞게", text: "커버와 갤러리에 웨딩 사진을 넣고 레이아웃을 바꿔가며 미리볼 수 있어요." },
  { title: "문구는 직접 다듬기", text: "인사말, 안내사항, 마지막 문구까지 원하는 톤으로 수정할 수 있어요." },
  { title: "참석 응답 관리", text: "참석 여부, 식사 여부, 동행 인원 같은 하객 응답을 관리 화면에서 볼 수 있어요." },
  { title: "예식장 주변 정보", text: "식장 주변의 소개하고 싶은 장소를 추가해 하객에게 함께 안내할 수 있어요." },
];

export default function ReviewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section id="reviews" className="py-28 bg-ivory overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Use Cases</p>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">이렇게 활용할 수 있어요</h2>
            <p className="text-muted text-sm">청첩장 제작 과정에서 자주 필요한 구성을 한곳에 모았습니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-divider flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
              aria-label="이전 활용 예시"
            >
              <ChevronLeft size={16} className="text-secondary" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-divider flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
              aria-label="다음 활용 예시"
            >
              <ChevronRight size={16} className="text-secondary" />
            </button>
          </div>
        </AnimatedSection>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {useCases.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex-shrink-0 w-72 bg-white rounded-2xl p-5 shadow-sm border border-surface"
            >
              <p className="text-xs text-gold tracking-[0.2em] uppercase mb-3">MomentIn</p>
              <h3 className="text-base font-medium text-charcoal mb-3">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
