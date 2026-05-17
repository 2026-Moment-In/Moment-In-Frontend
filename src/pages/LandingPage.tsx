import { useEffect, useState } from "react";
import { api } from "../api";
import type { Guestbook, Photo, Wedding } from "../types";
import "./LandingPage.css";

const DEMO_WEDDING_ID = "4JIQ56L";

export default function LandingPage() {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("백엔드 연결 확인 중");

  async function loadData() {
    const [weddingData, photoData, guestbookData] = await Promise.all([
      api.getWeddingById(DEMO_WEDDING_ID),
      api.getPhotos(DEMO_WEDDING_ID),
      api.getGuestbooks(DEMO_WEDDING_ID),
    ]);

    setWedding(weddingData);
    setPhotos(photoData);
    setGuestbooks(guestbookData);
    setStatus("백엔드 연결 완료");
  }

  useEffect(() => {
    loadData().catch((error) => {
      console.error(error);
      setStatus("백엔드 연결 실패");
    });
  }, []);

  async function handleGuestbookSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    await api.createGuestbook(DEMO_WEDDING_ID, trimmed);
    setMessage("");
    await loadData();
  }

  async function handleLike(photoId: string) {
    await api.likePhoto(photoId);
    await loadData();
  }

  return (
    <main className="landing">
      <div className="overlay" />

      <section className="landing-content">
        <img src="/images/logo.png" alt="MomentIn" className="logo" />

        <h1>MomentIn</h1>

        <p>
          결혼식의 순간들이 하나의 이야기로 남도록
          <br />
          사진과 축하 메시지를 실시간으로 함께 모아요.
        </p>

        <div className="status-pill">{status}</div>

        <div className="demo-panel">
          <div>
            <span>예식</span>
            <strong>{wedding?.location_name ?? "불러오는 중"}</strong>
          </div>
          <div>
            <span>사진</span>
            <strong>{photos.length}장</strong>
          </div>
          <div>
            <span>방명록</span>
            <strong>{guestbooks.length}개</strong>
          </div>
        </div>

        {photos[0] ? (
          <button type="button" onClick={() => handleLike(photos[0].id)}>
            대표 사진 좋아요 {photos[0].like_count}
          </button>
        ) : null}

        <form className="guestbook-form" onSubmit={handleGuestbookSubmit}>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="축하 메시지를 남겨보세요"
          />
          <button type="submit">등록</button>
        </form>
      </section>
    </main>
  );
}
