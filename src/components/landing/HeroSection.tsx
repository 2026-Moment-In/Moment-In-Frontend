import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="min-h-screen bg-white flex items-center pt-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center w-full">
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-5"
          >
            <span className="inline-flex items-center gap-2 text-xs text-gold tracking-[0.3em] uppercase font-medium">
              <span className="w-8 h-px bg-gold" />
              MomentIn
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-charcoal leading-tight">
              우리의 시간을<br />
              가장 아름답게<br />
              <span className="text-gold">기록하는 방법</span>
            </h1>
            <p className="text-muted text-base leading-relaxed max-w-sm">
              MomentIn으로 우리의 시작을<br />
              모바일 청첩장에 담아보세요.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              to="/create"
              className="px-8 py-4 bg-charcoal text-white rounded-full text-sm font-medium hover:bg-charcoal-dark transition-colors"
            >
              청첩장 만들기
            </Link>
            <Link
              to="/guest"
              className="px-8 py-4 bg-white border border-divider text-charcoal rounded-full text-sm font-medium hover:bg-surface transition-colors"
            >
              샘플 보기
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-wrap items-center gap-2 pt-2"
          >
            {["모바일 미리보기", "사진 업로드", "문구 수정", "하객 RSVP"].map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-full bg-surface text-xs text-secondary border border-divider"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="flex justify-center relative"
          style={{ transform: "rotate(3deg)" }}
        >
          <div className="relative w-56 md:w-64 lg:w-72">
            <div className="bg-[#1a1a1a] rounded-[40px] p-3 shadow-2xl">
              <div className="bg-[#1a1a1a] rounded-[32px] overflow-hidden" style={{ aspectRatio: "9/19.5" }}>
                <div className="relative w-full h-full">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1a1a1a] rounded-full z-10" />
                  <img
                    src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=90"
                    alt="청첩장 미리보기"
                    className="absolute inset-0 w-full h-full object-cover scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
                    <p className="font-serif text-lg tracking-widest mb-1">이도윤 & 박서아</p>
                    <p className="text-white/70 text-xs tracking-widest">2025.10.18 SAT</p>
                    <p className="text-white/60 text-xs mt-1">그랜드웨딩홀 서울</p>
                    <div className="mt-4 w-full py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-xs text-white tracking-wider text-center">
                      청첩장 보기
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -left-10 top-1/4 bg-white rounded-2xl shadow-xl px-4 py-3"
            >
              <p className="text-charcoal font-medium text-xs">커버 사진</p>
              <p className="text-muted text-xs">첫 화면 분위기 설정</p>
            </motion.div>
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ repeat: Infinity, duration: 3.5 }}
              className="absolute -right-8 bottom-1/3 bg-white rounded-2xl shadow-xl px-4 py-3"
            >
              <p className="text-charcoal font-medium text-xs">주변 정보</p>
              <p className="text-muted text-xs">예식장 주변 장소 소개</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
