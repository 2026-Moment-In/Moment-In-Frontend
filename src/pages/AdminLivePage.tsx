import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Pause, Play, Heart } from "lucide-react";
import { useInviteStore } from "../store/inviteStore";

const INTERVAL_MS = 5000;

export default function AdminLivePage() {
  const navigate = useNavigate();
  const { invitation } = useInviteStore();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const photos = invitation?.gallery ?? [];
  const total = photos.length;
  const couple = invitation?.couple;

  useEffect(() => {
    if (paused || total === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, total]);

  useEffect(() => {
    if (!showControls) return;
    const t = setTimeout(() => setShowControls(false), 3500);
    return () => clearTimeout(t);
  }, [showControls]);

  if (total === 0) {
    return (
      <div className="min-h-screen bg-[#1a1612] flex flex-col items-center justify-center text-white gap-4">
        <p className="font-serif text-3xl text-gold-light tracking-widest">MomentIn</p>
        <p className="text-muted text-sm">아직 갤러리 사진이 없습니다</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-xs text-muted underline">
          돌아가기
        </button>
      </div>
    );
  }

  const photoUrl = photos[current];

  return (
    <div
      className="min-h-screen bg-black overflow-hidden relative cursor-none"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img src={photoUrl} alt={`slide ${current}`} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        </motion.div>
      </AnimatePresence>

      <motion.div
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 z-20 p-8 flex items-center justify-between"
      >
        <div className="flex flex-col">
          <span className="font-serif text-white text-3xl tracking-widest">
            {couple ? `${couple.groomName} ♥ ${couple.brideName}` : "MomentIn"}
          </span>
          {couple && (
            <span className="text-white/60 text-sm mt-1 tracking-widest">{couple.weddingDate}</span>
          )}
        </div>
        <button
          onClick={() => navigate("/manage")}
          className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </motion.div>

      <motion.div
        key={current + "-info"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="absolute bottom-0 left-0 right-0 z-20 p-8 flex items-end justify-between"
      >
        <div>
          <p className="text-white/60 text-sm">{current + 1} / {total}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
          <Heart size={16} className="text-rose-light fill-rose-light" />
          <span className="text-white font-medium text-sm">{current + 1}</span>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-30">
        <motion.div
          key={current}
          className="h-full bg-white/70"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
        />
      </div>

      <motion.div
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-1/2 right-8 -translate-y-1/2 z-20 flex flex-col items-center gap-4"
      >
        <button
          onClick={(e) => { e.stopPropagation(); setPaused(!paused); setShowControls(true); }}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors cursor-pointer"
        >
          {paused ? <Play size={18} /> : <Pause size={18} />}
        </button>
        <div className="flex flex-col items-center gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); setShowControls(true); }}
              className={`rounded-full transition-all cursor-pointer ${
                i === current ? "w-1.5 h-4 bg-white" : "w-1.5 h-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
