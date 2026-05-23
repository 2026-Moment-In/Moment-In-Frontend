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
              우리의 순간을<br />
              가장 아름답게<br />
              <span className="text-gold">기록하는 방법</span>
            </h1>
            <p className="text-muted text-base leading-relaxed max-w-sm">
              MomentIn으로 우리의 시작을<br />
              특별하게 알리기
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
              무료 시안 제작
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex items-center gap-6 pt-2"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-charcoal">10분</span>
              <span className="text-xs text-muted">평균 제작 시간</span>
            </div>
            <div className="w-px h-8 bg-divider" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-charcoal">4.8★</span>
              <span className="text-xs text-muted">이용자 만족도</span>
            </div>
            <div className="w-px h-8 bg-divider" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-charcoal">∞</span>
              <span className="text-xs text-muted">무제한 수정</span>
            </div>
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
                    alt="invitation preview"
                    className="absolute inset-0 w-full h-full object-cover scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
                    <p className="font-serif text-lg tracking-widest mb-1">이준호 ♥ 박서연</p>
                    <p className="text-white/70 text-xs tracking-widest">2025.10.18 SAT</p>
                    <p className="text-white/60 text-xs mt-1">더 플라자 호텔 서울</p>
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
              <p className="text-charcoal font-medium text-xs">✨ 제일 잘나온 사진은?</p>
              <p className="text-muted text-xs">유미님의 사진!</p>
            </motion.div>
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ repeat: Infinity, duration: 3.5 }}
              className="absolute -right-8 bottom-1/3 bg-white rounded-2xl shadow-xl px-4 py-3"
            >
              <p className="text-charcoal font-medium text-xs">💌 주변 놀거리</p>
              <p className="text-muted text-xs">투썸플레이스 신월점</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
