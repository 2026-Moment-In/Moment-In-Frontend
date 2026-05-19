import "./LoginPage.css";

export default function LoginPage() {
  function handleStart() {
    window.location.href = "http://localhost:3000/auth/kakao?prompt=login"; //로그인 할 때마다 로그인 창 다시 보여주기
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
            <img src="../../images/kakao_login.png" alt="kakao login" className="kakao-login"/>
        </button>
      </section>
    </main>
  );
}