import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function KakaoLoginModal() {
  const { isModalOpen, closeModal, login } = useAuthStore();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    login(name.trim());
    setIsLoading(false);
    setName("");
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 pointer-events-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl text-charcoal">간편 로그인</h2>
                <button onClick={closeModal} className="text-muted hover:text-charcoal transition-colors">
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-muted mb-6 leading-relaxed">
                방명록 작성 및 사진 업로드를 위해
                <br />
                이름을 입력해 주세요.
              </p>

              <button
                onClick={handleLogin}
                disabled={isLoading || !name.trim()}
                className="w-full bg-[#FEE500] hover:bg-[#F0D800] disabled:opacity-50 disabled:cursor-not-allowed text-[#3C1E1E] font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-colors mb-4"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-[#3C1E1E]/30 border-t-[#3C1E1E] rounded-full"
                  />
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 3C6.477 3 2 6.8 2 11.5c0 2.9 1.7 5.5 4.3 7.1l-1.1 4.1 4.7-3.1c.7.1 1.4.2 2.1.2 5.523 0 10-3.8 10-8.5S17.523 3 12 3z"
                        fill="#3C1E1E"
                      />
                    </svg>
                    카카오로 간편 로그인
                  </>
                )}
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-divider" />
                </div>
                <div className="relative flex justify-center text-xs text-muted bg-white px-2">
                  또는 이름 입력
                </div>
              </div>

              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border border-divider rounded-xl px-4 py-3 text-sm text-charcoal placeholder-subtle focus:outline-none focus:border-gold transition-colors mb-3"
              />
              <button
                onClick={handleLogin}
                disabled={isLoading || !name.trim()}
                className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors text-sm"
              >
                {isLoading ? "로그인 중..." : "입장하기"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
