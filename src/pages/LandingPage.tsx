import "./LandingPage.css";
import { api } from "../api";

export default function LandingPage() {
  async function handleStart() {
    const result = await api.devLogin();
    localStorage.setItem("momentin_access_token", result.access_token);
    localStorage.setItem("momentin_user", JSON.stringify(result.user));
    window.location.href = "/admin";
  }

  return (
    <main className="landing">
      <div className="overlay" />

      <section className="landing-content">
        <img src="/images/logo.png" alt="logo" className="logo"/>

        <h1>MomentIn</h1>

        <p>
          결혼식의 순간들이 하나의 이야기로 남도록,
          <br />
          순간을 남기고 기억을 남기는
        </p>

        <button onClick={handleStart}>
          모먼트인 시작하기
        </button>
      </section>
    </main>
  );
}
