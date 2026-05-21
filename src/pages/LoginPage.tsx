<<<<<<< Updated upstream
=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 페이지가 열릴 때, 이미 로그인한 유저인지 체크
  useEffect(() => {
    const token = localStorage.getItem("momentin_access_token");
    if (token) {
      setIsLoggedIn(true);
      // 이미 로그인이 되어 있다면 첫 화면에 머물지 않고 바로 제작 페이지로 보내버립니다!
      navigate("/create");
    }
  }, [navigate]);

  const handleKakaoLogin = () => {
    const BACKEND_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
    window.location.href = `${BACKEND_URL}/auth/kakao`;
  };

  // 로그아웃 기능 (테스트용)
  const handleLogout = () => {
    localStorage.removeItem("momentin_access_token");
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <img
        src="/images/startscreen.svg"
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
        <p className="text-charcoal/50 text-sm tracking-wide mb-8">순간을 남기고 기억을 남기는</p>

        <img src="/images/logo.svg" alt="MomentIn Logo" width={180} height={100} />

        <p
          className="font-bold text-[26px] text-[#3C1E1E] tracking-wider mt-4 mb-16"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          MomentIn
        </p>

        {/* ⭐️ 에러 해결 구간: 삼항 연산자 내부를 빈 태그(<></>)로 확실히 감싸주었습니다. */}
        {isLoggedIn ? (
          <>
            <p className="text-[#3C1E1E] font-semibold text-lg text-center mb-6">
              ✨ 이미 로그인되어 있습니다!
            </p>
            <button
              onClick={() => navigate("/create")}
              className="w-full bg-charcoal text-white hover:bg-charcoal/90 transition-all rounded-2xl py-4 font-semibold text-base mb-4"
            >
              청첩장 만들러 가기
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 underline text-center block w-full"
            >
              다른 계정으로 로그인 (로그아웃)
            </button>
          </>
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
>>>>>>> Stashed changes
