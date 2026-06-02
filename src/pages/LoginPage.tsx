import { useState } from "react";
import { motion } from "framer-motion";
import { clearAuth, getAccessToken, getDisplayNameFromToken } from "../utils/auth";

function KakaoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3C6.477 3 2 6.8 2 11.5c0 2.9 1.7 5.5 4.3 7.1l-1.1 4.1 4.7-3.1c.7.1 1.4.2 2.1.2 5.523 0 10-3.8 10-8.5S17.523 3 12 3z"
        fill="#3C1E1E"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAccessToken()));
  const [displayName, setDisplayName] = useState(() => getDisplayNameFromToken());

  const handleKakaoLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/auth/kakao`;
  };

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setDisplayName(null);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <img
        src="/images/background.png"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/20" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-ivory rounded-3xl w-full max-w-sm px-10 pt-14 pb-12 flex flex-col items-center"
      >
        <p className="text-charcoal/50 text-sm tracking-wide mb-8">
          시간을 담기고 기억을 남기는 순간
        </p>

        <img src="/images/logo2.png" alt="MomentIn Logo" width={180} height={100} />

        <p
          className="font-bold text-[26px] text-[#3C1E1E] tracking-wider mt-4 mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          MomentIn
        </p>

        <p className="h-10 text-center text-sm text-charcoal/60 mb-8">
          {isLoggedIn
            ? `${displayName ?? "사용자"}님으로 로그인되어 있습니다.`
            : "카카오 계정으로 간편하게 시작하세요."}
        </p>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="w-full bg-white hover:bg-[#f7f1e8] active:scale-[0.98] transition-all rounded-2xl py-4 flex items-center justify-center text-[#3C1E1E] font-semibold text-base border border-[#E7D8C5]"
          >
            로그아웃
          </button>
        ) : (
          <button
            onClick={handleKakaoLogin}
            className="w-full bg-[#FEE500] hover:bg-[#F0D800] active:scale-[0.98] transition-all rounded-2xl py-4 flex items-center justify-center gap-3 text-[#3C1E1E] font-semibold text-base"
          >
            <KakaoIcon />
            카카오톡으로 계속하기
          </button>
        )}
      </motion.div>
    </div>
  );
}
