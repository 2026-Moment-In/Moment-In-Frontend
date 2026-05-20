import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './MobileHomePage.css';

const MobileHomePage: React.FC = () => {
  const [entryCode, setEntryCode] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code')?.trim();
    if (code) {
      setEntryCode(code);
      navigate(`/wedding/${encodeURIComponent(code)}`);
    }
  }, [navigate, searchParams]);

  const handleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const code = entryCode.trim();

    if (!code) {
      return;
    }

    navigate(`/wedding/${encodeURIComponent(code)}`);
  };

  return (
    <div className="mobile-home-container">
      <header className="home-header">
        <p className="slogan">시간을 담고 기억을 나누는 순간</p>
        <img src="/images/logo2.png" alt="logo" className="logo" />
        <h1 className="brand-name">MomentIn</h1>
      </header>

      <main className="entry-card">
        <div className="qr-icon-container">
          <img src="/images/qr_icon.png" alt="qr-icon" className="qr-icon" />
        </div>

        <h2 className="card-title">웨딩 페이지 입장하기</h2>
        <p className="card-subtitle">
          신랑 신부에게 받은
          <br />
          코드를 입력하고 입장하세요
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
