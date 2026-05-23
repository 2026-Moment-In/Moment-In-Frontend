import { useRef } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "../common/AnimatedSection";
import { ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  { name: "김**", date: "2025.10.13", stars: 5, text: "정말 예쁘고 감성적인 청첩장이 나왔어요! 친구들이 다 부러워했답니다. 제작도 생각보다 간단해서 10분 만에 완성했어요." },
  { name: "박**", date: "2025.10.13", stars: 5, text: "카카오톡으로 공유했는데 템플릿이 상황에 맞게 달라져서 정말 편했어요. 부모님께는 정중하게, 친구들에게는 친근하게 보내니까 반응이 좋았어요." },
  { name: "이**", date: "2025.10.14", stars: 5, text: "에디터 기능이 정말 다양해서 우리만의 특별한 청첩장을 만들 수 있었어요. 특히 모션 애니메이션이 너무 예뻐요!" },
  { name: "한**", date: "2025.10.15", stars: 5, text: "가격도 합리적이고 서비스도 빠르네요. 청첩장 수정도 무제한으로 가능해서 마음에 들어요. 추천합니다!" },
  { name: "최**", date: "2025.10.16", stars: 5, text: "사진 업로드하면 자동으로 색상 추천해주는 기능이 신기했어요. 우리 사진 톤에 맞는 색상이 나와서 정말 만족스러웠습니다." },
  { name: "정**", date: "2025.10.17", stars: 5, text: "보안 기능이 정말 철저해서 안심이에요. 캡쳐 방지, 다운로드 금지 등 우리 사진을 보호해주니까 마음이 편했어요." },
  { name: "조**", date: "2025.10.17", stars: 5, text: "모바일에서도 편하게 제작할 수 있어서 좋았어요. 출퇴근 시간에 틈틈이 만들다 보니 금방 완성했어요." },
  { name: "윤**", date: "2025.10.17", stars: 5, text: "템플릿이 다양해서 선택의 폭이 넓어요. 우리 스타일에 맞는 디자인을 찾을 수 있어서 만족스러웠습니다." },
  { name: "강**", date: "2025.10.16", stars: 5, text: "친구들이 모두 극찬했어요! 디자인도 예쁘고 사용하기도 쉬워서 정말 만족합니다." },
  { name: "송**", date: "2025.10.16", stars: 5, text: "결혼 준비 중에 가장 만족스러운 선택이었어요. 시간도 절약되고 결과물도 예쁘네요." },
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
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-3">Reviews</p>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">실제 사용자 후기</h2>
            <p className="text-muted text-sm">우리의 시작을 더 특별하게 만들어준 MomentIn의 진짜 후기를 확인해보세요</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="font-serif text-3xl text-charcoal font-light">4.8</span>
              <div className="flex gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-gold text-sm">★</span>
                ))}
              </div>
              <span className="text-xs text-muted mt-1">전체 평점</span>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => scroll("left")}
                className="w-10 h-10 rounded-full border border-divider flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronLeft size={16} className="text-secondary" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-full border border-divider flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
              >
                <ChevronRight size={16} className="text-secondary" />
              </button>
            </div>
          </div>
        </AnimatedSection>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex-shrink-0 w-72 bg-white rounded-2xl p-5 shadow-sm border border-surface"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(r.stars)].map((_, j) => (
                  <span key={j} className="text-gold text-xs">★</span>
                ))}
              </div>
              <p className="text-sm text-charcoal leading-relaxed mb-4 line-clamp-4">{r.text}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-charcoal">{r.name}</span>
                <span className="text-xs text-muted">{r.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
