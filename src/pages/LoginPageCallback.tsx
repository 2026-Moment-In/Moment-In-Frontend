import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function LoginCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. 주소창에 매달려온 token=xxxx 값을 쏙 빼옵니다.
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("momentin_access_token", token);

      // 게스트 페이지에서 로그인 유도된 경우 원래 페이지로 복귀
      const returnUrl = sessionStorage.getItem("momentin_return_url");
      if (returnUrl) {
        sessionStorage.removeItem("momentin_return_url");
        navigate(returnUrl, { replace: true });
      } else {
        navigate("/create", { replace: true });
      }
    } else {
      console.error("토큰을 찾을 수 없습니다.");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ivory">
      <p className="text-charcoal/50 text-sm animate-pulse">로그인 처리 중입니다...</p>
    </div>
  );
}