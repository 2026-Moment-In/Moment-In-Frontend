import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Camera, Heart, Image, MapPin, MessageSquare, Trophy } from "lucide-react";
import { api, DEMO_USER_ID } from "../api";
import type { Guestbook, Photo, Wedding } from "../types";
import "./WeddingPage.css";

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

type TabKey = "info" | "photos" | "ranking" | "guestbook";

function getGuestUserId() {
  const key = "momentin_guest_user_id";
  const saved = localStorage.getItem(key);
  if (saved) return saved;

  const id = crypto.randomUUID?.() ?? DEMO_USER_ID;
  localStorage.setItem(key, id);
  return id;
}

function formatDate(value?: string) {
  if (!value) return "날짜 미정";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function getActiveTab(pathname: string): TabKey {
  if (pathname.endsWith("/photos")) return "photos";
  if (pathname.endsWith("/ranking")) return "ranking";
  if (pathname.endsWith("/guestbook")) return "guestbook";
  return "info";
}

export default function WeddingPage() {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [invitation, setInvitation] = useState<InvitationData>({});
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [ranking, setRanking] = useState<Photo[]>([]);
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([]);
  const [guestbookMessage, setGuestbookMessage] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeTab = getActiveTab(location.pathname);
  const basePath = `/wedding/${code}`;

  const title = useMemo(
    () => `${invitation.groomName || "신랑"} ♥ ${invitation.brideName || "신부"}`,
    [invitation.brideName, invitation.groomName],
  );

  const load = useCallback(async () => {
    if (!code) {
      setError("입장 코드가 없습니다.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const qr = await api.getQr(code);
      const weddingData = qr.wedding;
      setWedding(weddingData);
      setInvitation((qr.data ?? {}) as InvitationData);

      const [nextPhotos, nextRanking, nextGuestbooks] = await Promise.all([
        api.getPhotos(weddingData.id),
        api.getRanking(weddingData.id),
        api.getGuestbooks(weddingData.id),
      ]);
      setPhotos(nextPhotos);
      setRanking(nextRanking);
      setGuestbooks(nextGuestbooks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "웨딩 페이지를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleUpload() {
    if (!wedding || !file) return;

    const saved = await api.uploadPhoto(wedding.id, file, getGuestUserId(), uploadName.trim());
    setPhotos((current) => [saved, ...current]);
    setRanking((current) => [saved, ...current].sort((a, b) => b.like_count - a.like_count).slice(0, 10));
    setFile(null);
    setPreview(null);
    setUploadName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleLike(photo: Photo) {
    const updated = await api.likePhoto(photo.id);
    setPhotos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    if (wedding) {
      setRanking(await api.getRanking(wedding.id));
    }
  }

  async function handleGuestbookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wedding || !guestbookMessage.trim()) return;

    const saved = await api.createGuestbook(wedding.id, guestbookMessage.trim(), getGuestUserId());
    setGuestbooks((current) => [saved, ...current]);
    setGuestbookMessage("");
  }

  if (loading) {
    return <main className="wedding-page wedding-page--center">불러오는 중...</main>;
  }

  if (error || !wedding) {
    return <main className="wedding-page wedding-page--center">{error || "웨딩을 찾을 수 없습니다."}</main>;
  }

  return (
    <main className="wedding-page">
      <header className="wedding-header">
        <p>MomentIn</p>
        <h1>{title}</h1>
        <span>
          {formatDate(invitation.weddingDate || wedding.wedding_date)} {invitation.weddingTime || wedding.wedding_time}
        </span>
      </header>

      {activeTab === "info" && (
        <section className="wedding-panel wedding-info">
          <div className="wedding-cover">
            <p>Wedding Day</p>
            <strong>{title}</strong>
          </div>

          <article>
            <h2>{invitation.greetingTitle || "소중한 분들을 초대합니다"}</h2>
            <p className="preline">{invitation.greetingBody || "두 사람의 시작을 함께 축복해주세요."}</p>
          </article>

          <article>
            <h2>
              <MapPin size={18} /> 예식 장소
            </h2>
            <strong>{invitation.venueName || wedding.location_name || "장소 미정"}</strong>
            <p>{invitation.venueDetail}</p>
            <p>{invitation.venueAddress || wedding.location_address}</p>
          </article>

          {invitation.nearbyPlaces && invitation.nearbyPlaces.length > 0 && (
            <article>
              <h2>주변 장소</h2>
              <div className="nearby-list">
                {invitation.nearbyPlaces.map((place, index) => (
                  <span key={`${place}-${index}`}>{place}</span>
                ))}
              </div>
            </article>
          )}
        </section>
      )}

      {activeTab === "photos" && (
        <section className="wedding-panel">
          <div className="tab-head">
            <h2>하객 사진</h2>
            <button onClick={() => inputRef.current?.click()}>
              <Camera size={18} /> 업로드
            </button>
          </div>

          <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
          {(preview || file) && (
            <div className="upload-box">
              {preview && <img src={preview} alt="preview" />}
              <input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="이름을 남겨주세요"
              />
              <button onClick={handleUpload}>사진 올리기</button>
            </div>
          )}

          <div className="photo-feed-grid">
            {photos.map((photo) => (
              <article key={photo.id}>
                <img src={photo.image_url} alt={photo.user?.display_name || "guest photo"} />
                <div>
                  <span>{photo.user?.display_name || "Guest"}</span>
                  <button onClick={() => handleLike(photo)}>
                    <Heart size={16} /> {photo.like_count}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "ranking" && (
        <section className="wedding-panel ranking-panel">
          <h2>좋아요 랭킹</h2>
          {ranking.length === 0 ? (
            <p className="empty-text">아직 랭킹에 오른 사진이 없습니다.</p>
          ) : (
            ranking.map((photo, index) => (
              <article className={index === 0 ? "rank-card rank-card--top" : "rank-card"} key={photo.id}>
                <span className="rank-number">{index + 1}</span>
                <img src={photo.image_url} alt={photo.user?.display_name || "ranked photo"} />
                <div>
                  <strong>{photo.user?.display_name || "Guest"}</strong>
                  <p>♥ {photo.like_count}</p>
                </div>
              </article>
            ))
          )}
        </section>
      )}

      {activeTab === "guestbook" && (
        <section className="wedding-panel guestbook-panel">
          <h2>방명록</h2>
          <form onSubmit={handleGuestbookSubmit} className="guestbook-form">
            <textarea
              value={guestbookMessage}
              onChange={(e) => setGuestbookMessage(e.target.value)}
              placeholder="축하 메시지를 남겨주세요"
              maxLength={200}
            />
            <button type="submit">작성하기</button>
          </form>

          <div className="guestbook-list">
            {guestbooks.map((guestbook) => (
              <article key={guestbook.id}>
                <strong>{guestbook.user?.display_name || "Guest"}</strong>
                <p>{guestbook.message}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <nav className="bottom-tabs">
        <Link className={activeTab === "info" ? "active" : ""} to={basePath}>
          <MapPin size={18} /> 정보
        </Link>
        <Link className={activeTab === "photos" ? "active" : ""} to={`${basePath}/photos`}>
          <Image size={18} /> 사진
        </Link>
        <Link className={activeTab === "ranking" ? "active" : ""} to={`${basePath}/ranking`}>
          <Trophy size={18} /> 랭킹
        </Link>
        <Link className={activeTab === "guestbook" ? "active" : ""} to={`${basePath}/guestbook`}>
          <MessageSquare size={18} /> 방명록
        </Link>
      </nav>
    </main>
  );
}
