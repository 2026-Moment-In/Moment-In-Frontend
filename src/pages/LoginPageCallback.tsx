import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";

export default function LoginCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function completeLogin() {
      const error = searchParams.get("error");
      const token = searchParams.get("token");

      if (error) {
        console.error("로그인에 실패했습니다.", error);
        navigate("/login", { replace: true });
        return;
      }

      if (!token) {
        console.error("토큰을 찾을 수 없습니다.");
        navigate("/login", { replace: true });
        return;
      }

      localStorage.setItem("momentin_access_token", token);
      window.dispatchEvent(new Event("momentin_auth_changed"));

      const returnUrl = sessionStorage.getItem("momentin_return_url");
      if (returnUrl) {
        sessionStorage.removeItem("momentin_return_url");
        if (!cancelled) navigate(returnUrl, { replace: true });
        return;
      }

      try {
        const weddings = await api.getMyWeddings();
        if (!cancelled) {
          navigate(weddings.length > 0 ? "/manage" : "/create", { replace: true });
        }
      } catch (error) {
        console.error("로그인 후 내 청첩장 조회에 실패했습니다.", error);
        if (!cancelled) navigate("/create", { replace: true });
      }
    }

    completeLogin();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ivory">
      <p className="text-charcoal/50 text-sm animate-pulse">로그인 처리 중입니다...</p>
    </div>
  );
}
