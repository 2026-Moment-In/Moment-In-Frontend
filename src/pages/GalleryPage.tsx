import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import type { Photo as ApiPhoto, Wedding } from "../types";
import "./GalleryPage.css";

export interface Photo {
  id: string;
  name: string;
  src: string;
  likes: number;
  timestamp: number;
}

function toPhoto(photo: ApiPhoto): Photo {
  return {
    id: photo.id,
    name: photo.user?.display_name ?? "Guest",
    src: photo.image_url,
    likes: photo.like_count,
    timestamp: photo.created_at ? new Date(photo.created_at).getTime() : Date.now(),
  };
}

function PolaroidCard({ photo, tilt }: { photo: Photo; tilt: number }) {
  return (
    <div
      className="gallery-card"
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
    >
      <div className="gallery-card__img-wrap">
        <img src={photo.src} alt={`${photo.name} photo`} className="gallery-card__img" />
      </div>
      <div className="gallery-card__footer">
        <span className="gallery-card__name">{photo.name}</span>
        <span className="gallery-card__likes">
          <span className="gallery-card__heart-icon">♥</span>
          {photo.likes}
        </span>
      </div>
    </div>
  );
}

function ScrollColumn({
  photos,
  direction,
  duration = 28,
}: {
  photos: Photo[];
  direction: "up" | "down";
  duration?: number;
}) {
  const duplicated = [...photos, ...photos];

  return (
    <div className="scroll-column">
      <div
        className={`scroll-track ${direction === "up" ? "scroll-up" : "scroll-down"}`}
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        {duplicated.map((photo, i) => (
          <PolaroidCard key={`${photo.id}_${i}`} photo={photo} tilt={0} />
        ))}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { code } = useParams<{ code: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!code) {
      setError("갤러리 코드가 없습니다.");
      return;
    }

    try {
      setError("");
      const qr = await api.getQr(code);
      setWedding(qr.wedding);
      setInvitation(qr.data);
      const nextPhotos = await api.getPhotos(qr.wedding.id);
      setPhotos(nextPhotos.map(toPhoto));
    } catch (err) {
      setError(err instanceof Error ? err.message : "갤러리를 불러오지 못했습니다.");
    }
  }, [code]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [load]);

  const title = useMemo(() => {
    const groom = invitation?.groomName ?? "신랑";
    const bride = invitation?.brideName ?? "신부";
    return `${groom} ♥ ${bride}`;
  }, [invitation]);

  const sorted = [...photos].sort((a, b) => b.timestamp - a.timestamp);
  const col0 = sorted.filter((_, i) => i % 3 === 0);
  const col1 = sorted.filter((_, i) => i % 3 === 1);
  const col2 = sorted.filter((_, i) => i % 3 === 2);

  return (
    <div className="gallery-root">
      <header className="gallery-header">
        <div className="gallery-header__inner">
          <span className="gallery-header__names">
            {title}
          </span>
          <div className="gallery-header__divider" />
          <span className="gallery-header__date">
            {wedding?.wedding_date?.slice(0, 10) ?? "MomentIn"}
          </span>
        </div>
      </header>

      {error ? (
        <div className="gallery-empty">
          <p>{error}</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="gallery-empty">
          <p>하객분들의 소중한 순간을 기다리고 있어요.</p>
        </div>
      ) : (
        <main className="gallery-columns">
          <ScrollColumn photos={col0} direction="up" duration={24} />
          <ScrollColumn photos={col1} direction="down" duration={30} />
          <ScrollColumn photos={col2} direction="up" duration={44} />
        </main>
      )}
    </div>
  );
}
