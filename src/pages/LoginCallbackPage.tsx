import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. 주소창에 매달려온 token=xxxx 값을 쏙 빼옵니다.
    const token = searchParams.get("token");

    if (token) {
      // 2. 브라우저 저장소에 'momentin_access_token'이라는 이름으로 심어줍니다! (이게 있어야 로그인 성공 판정)
      localStorage.setItem("momentin_access_token", token);
      
      // 3. 🚀 드디어 대망의 청첩장 제작 페이지로 강제 텔레포트!!
      navigate("/create");
    } else {
      console.error("토큰을 찾을 수 없습니다.");
      navigate("/login"); // 실패하면 다시 로그인 페이지로
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ivory">
      <p className="text-charcoal/50 text-sm animate-pulse">로그인 처리 중입니다...</p>
    </div>
  );
}