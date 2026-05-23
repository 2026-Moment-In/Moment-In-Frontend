import { useState, useEffect, useCallback, useRef } from "react";
import "./GalleryPage.css";

export interface Photo {
  id: string;
  name: string;
  src: string;
  likes: number;
  likedBy: string[];
  timestamp: number;
}

const STORAGE_KEY = "momentin_gallery";

function loadPhotos(): Photo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePhotos(photos: Photo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  window.dispatchEvent(new Event("gallery_updated"));
}

export { loadPhotos, savePhotos, STORAGE_KEY };

function PolaroidCard({ photo, tilt }: { photo: Photo; tilt: number }) {
  return (
    <div
      className="gallery-card"
      style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
    >
      <div className="gallery-card__img-wrap">
        <img
          src={photo.src}
          alt={`${photo.name}님의 사진`}
          className="gallery-card__img"
        />
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
        className={`scroll-track ${
          direction === "up"
            ? "scroll-up"
            : "scroll-down"
        }`}
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        {duplicated.map((photo, i) => (
          <PolaroidCard
            key={`${photo.id}_${i}`}
            photo={photo}
            tilt={0}
          />
        ))}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>(loadPhotos);

  const sync = useCallback(() => setPhotos(loadPhotos()), []);

  useEffect(() => {
    window.addEventListener("gallery_updated", sync);
    window.addEventListener("storage", sync);
    const interval = setInterval(sync, 2000);
    return () => {
      window.removeEventListener("gallery_updated", sync);
      window.removeEventListener("storage", sync);
      clearInterval(interval);
    };
  }, [sync]);

  const sorted = [...photos].sort((a, b) => b.timestamp - a.timestamp);
  const col0 = sorted.filter((_, i) => i % 3 === 0);
  const col1 = sorted.filter((_, i) => i % 3 === 1);
  const col2 = sorted.filter((_, i) => i % 3 === 2);

  return (
    <div className="gallery-root">
      <header className="gallery-header">
        <div className="gallery-header__inner">
          <span className="gallery-header__names">
            김미림 <span className="gallery-header__heart">♥</span> 이미림
          </span>
          <div className="gallery-header__divider" />
          <span className="gallery-header__date">2026.06.20</span>
        </div>
      </header>

      {photos.length === 0 ? (
        <div className="gallery-empty">
          <p>하객분들의 소중한 순간을 기다리고 있어요 📷</p>
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