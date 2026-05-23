import "./LandingPage.css";

export default function LandingPage() {
  function handleStart() {
    const clientId = "7417088f1abcfd3269d7b42b6a933f81";
    const redirectUri = "http://localhost:3000/auth/kakao/callback";
    
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&prompt=login`;
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