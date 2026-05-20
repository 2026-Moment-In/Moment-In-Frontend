import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './QRview.css';

export default function QRview() {
  const { code } = useParams();
  const [qrImg, setQrImg] = useState('');

  useEffect(() => {
    const frontUrl = import.meta.env.VITE_FRONT_URL ?? window.location.origin;
    QRCode.toDataURL(`${frontUrl}/enter?code=${code}`, {
      width: 160,
      margin: 2,
      color: { dark: '#2c1a0e', light: '#ffffff' },
    }).then(setQrImg);
  }, [code]);

  return (
    <div className="qrview-root">
      <img src="/images/QRbackground.png" alt="" className="qrview-bg" />
      <div className="qrview-bg-overlay" />
      <header className="qrview-header">
        <span className="qrview-logo">MomentIn</span>
      </header>
      <div className="qrview-card">
        <div className="qrview-left">
          <p>모먼트인에 접속하고 신랑<span className="heart">♥</span>신부를<br />축하해주세요!</p>
        </div>
        <div className="qrview-center">
          <p className="qrview-label">접속 코드 :</p>
          <p className="qrview-code">{code}</p>
        </div>
        <div className="qrview-right">
          {qrImg && <img src={qrImg} alt="QR" className="qrview-qr" />}
        </div>
      </div>
      <p className="qrview-script">We're getting married</p>
    </div>
  );
}