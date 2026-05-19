import React, { useState } from 'react';
import './MobileHomePage.css';

const MobileHomePage: React.FC = () => {
  const [entryCode, setEntryCode] = useState<string>('');

  const handleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    // 현재는 프론트엔드 전용이므로 코드 입력 여부와 상관없이 통과
    console.log('입장 코드:', entryCode);
    alert('웨딩 페이지로 입장합니다!'); 
    // TODO: 여기에 다음 페이지로 이동하는 라우팅 로직(예: useNavigate)을 추가하세요.
  };

  return (
    <div className="mobile-home-container">
      <header className="home-header">
        <p className="slogan">순간을 남기고 기억을 남기는</p>
        <img src="/images/logo2.png" alt="logo" className="logo" />
        <h1 className="brand-name">MomentIn</h1>
      </header>

      <main className="entry-card">
        <div className="qr-icon-container">
          <img src="/images/qr_icon.png" alt="qr-icon" className="qr-icon"/>
        </div>

        <h2 className="card-title">웨딩 페이지 입장하기</h2>
        <p className="card-subtitle">
          신랑 신부에게 받은<br />코드를 입력하고 입장하세요.
        </p>

        <form onSubmit={handleEntry} className="entry-form">
          <input
            type="text"
            placeholder="예: WED2026"
            value={entryCode}
            onChange={(e) => setEntryCode(e.target.value)}
            className="code-input"
          />
          <button type="submit" className="submit-button">
            입장하기
          </button>
        </form>
      </main>
    </div>
  );
};

export default MobileHomePage;