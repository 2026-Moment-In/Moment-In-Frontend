import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './QRview.css';
import { api } from "../api";
import { Wedding } from "../types";

export default function QRview() {
  const { code } = useParams<{ code: string }>();
  const [qrImg, setQrImg] = useState('');
  
  const [weddingData, setWeddingData] = useState<Wedding | null>(null);
  const [invitationData, setInvitationData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!code) return;

    const frontUrl = import.meta.env.VITE_FRONT_URL || window.location.origin;
    QRCode.toDataURL(`${frontUrl}/show/${code}`, {
      width: 160,
      margin: 2,
      color: { dark: '#2c1a0e', light: '#ffffff' },
    }).then(setQrImg);

    api.getQr(code)
      .then((res) => {
        console.log("백엔드가 보내준 데이터:", res);
        setWeddingData(res.wedding); // 백엔드의 wedding 객체 저장
        setInvitationData(res.data);   // 백엔드의 data 객체(신랑, 신부 이름 등) 저장
      })
      .catch((err) => {
        console.error("백엔드 데이터 로드 실패:", err);
      });

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
          <p>
            모먼트인에 접속하고 <br />
            {invitationData ? (
              <span className="font-bold">
                {invitationData.groomName} <span className="heart">♥</span> {invitationData.brideName}
              </span>
            ) : (
              "신랑 신부"
            )}
            의<br />결혼을 축하해주세요!
          </p>
          
          {weddingData && (
            <p className="text-sm mt-2 opacity-80">
              장소: {weddingData.location_name}
            </p>
          )}
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
