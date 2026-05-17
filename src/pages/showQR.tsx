import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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