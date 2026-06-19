import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QR.css';



export default function QR() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [qrImg, setQrImg] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [copied, setCopied] = useState(false);
  const inviteUrl = code
    ? `${import.meta.env.VITE_FRONT_URL || window.location.origin}/show/${code}`
    : '';

  useEffect(() => {
    if (!inviteUrl) return;

    QRCode.toDataURL(inviteUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#2c1a0e', light: '#ffffff' },
    }).then(setQrImg);
  }, [inviteUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* 배경 */}
      <div className="qr-bg">
        <img src="/images/QRbackground.png" alt="" className="qr-bg-img" />        <div className="qr-bg-overlay" />
      </div>

      {/* 헤더 */}
      <header className="qr-header">
        <span className="qr-logo">MomentIn</span>
      </header>

      {/* 메인 카드 */}
      <main className="qr-main">
        <div className="qr-card">
          {/* QR 이미지 */}
          <div className="qr-img-wrap">
            {qrImg && <img src={qrImg} alt="QR Code" className="qr-img" />}
          </div>

          {/* 코드 */}
          <button className="qr-code-row" onClick={handleCopy} title="클릭하여 복사">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>CODE : {code}</span>
            {copied && <span className="qr-copied">복사됨!</span>}
          </button>

          {/* 안내 텍스트 */}
          <p className="qr-title">웨딩 페이지가 완성 되었습니다!</p>
          <p className="qr-sub">QR코드나 접속 코드를 하객들에게 전달해주세요!</p>

          {/* 버튼 */}
          <button className="qr-btn" onClick={() => navigate(`/manage?code=${code}`)}>
            관리 페이지로 이동
          </button>
          <button className="qr-btn" style={{ background: 'transparent', color: '#3b2010', border: '1.5px solid #3b2010' }} onClick={() => navigate(`/qrview/${code}`)}>
            화면에 코드 띄우기
          </button>
        </div>
      </main>

      {/* 화면에 코드 띄우기 오버레이 */}
      {showOverlay && (
        <div className="qr-overlay" onClick={() => setShowOverlay(false)}>
          <div className="qr-overlay-card" onClick={e => e.stopPropagation()}>
            {/* 왼쪽: 텍스트 */}
            <div className="qr-overlay-left">
              <p className="qr-overlay-guide">
                모먼트인에 접속하고 신랑<span className="heart">♥</span>신부를<br />축하해주세요!
              </p>
            </div>

            {/* 가운데: 코드 */}
            <div className="qr-overlay-center">
              <p className="qr-overlay-label">접속 코드 :</p>
              <p className="qr-overlay-code">{code}</p>
            </div>

            {/* 오른쪽: QR */}
            <div className="qr-overlay-right">
              {qrImg && <img src={qrImg} alt="QR" className="qr-overlay-img" />}
            </div>

            <button className="qr-overlay-close" onClick={() => setShowOverlay(false)}>✕</button>
          </div>

          {/* We're getting married 텍스트 */}
          <p className="qr-overlay-script">We're getting married</p>
        </div>
      )}
    </>
  );
}
