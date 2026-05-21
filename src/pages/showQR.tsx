<<<<<<< Updated upstream
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
=======
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Camera, Image, MapPin, MessageCircle, Navigation, Users } from 'lucide-react';
import { api } from '../api';
import './showQR.css';

type InvitationData = {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  weddingTime?: string;
  greetingTitle?: string;
  greetingBody?: string;
  venueName?: string;
  venueAddress?: string;
  venueDetail?: string;
  transport?: string;
  transportGuide?: string;
  nearbyPlaces?: string[];
};

function formatDate(value?: string | null) {
  if (!value) return '날짜 미정';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
}

function InfoSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="invite-section">
      <div className="invite-section__title">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="invite-section__body">{children}</div>
    </section>
  );
}
>>>>>>> Stashed changes

export default function ShowQR() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!code) {
      console.log("code 없음");
      return;
    }

    console.log("API 호출:", code);

    fetch(`${import.meta.env.VITE_API_URL}/qr/${code}`).then(r => r.json())
      .then(d => {
        console.log("응답:", d);
        setData(d.data);
        console.log(import.meta.env.VITE_API_URL);
      })
      .catch(err => console.error("fetch 실패:", err));
  }, [code]);

  if (!data) return <h1>로딩 중...</h1>;

  const card: React.CSSProperties = {
    padding: 16,
    border: "1px solid #ddd",
    borderRadius: 10,
    marginBottom: 12,
    background: "#fff",
  };
  return (

    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>

      <h2>💌 웨딩 초대장</h2>

      <section style={card}>
        <h3>👰🤵 신랑 & 신부</h3>
        <p>{data.groomName} ♥ {data.brideName}</p>
      </section>

      <section style={card}>
        <h3>📅 예식 정보</h3>
        <p>{data.weddingDate} {data.weddingTime}</p>
      </section>

      <section style={card}>
        <h3>💌 인사말</h3>
        <p style={{ whiteSpace: "pre-line" }}>
          {data.greetingBody}
        </p>
      </section>

      <section style={card}>
        <h3>📍 장소</h3>
        <p>{data.venueName}</p>
        <p>{data.venueAddress}</p>
        <p>{data.venueDetail}</p>
      </section>

      <section style={card}>
        <h3>🚇 교통</h3>
        <p>{data.transport}</p>
        <p>{data.transportGuide}</p>
      </section>

      <section style={card}>
        <h3>✨ 주변 장소</h3>
        <ul>
          {data.nearbyPlaces?.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

    </div>
  );
}