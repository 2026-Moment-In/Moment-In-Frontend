import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { api, SOCKET_URL } from "../api";
import type { Photo, Wedding } from "../types";
import "./LiveScreenPage.css";

export default function LiveScreenPage() {
  const { code } = useParams<{ code: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [ranking, setRanking] = useState<Photo[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!code) return;

    try {
      const qr = await api.getQr(code);
      setWedding(qr.wedding);

      const [nextPhotos, nextRanking] = await Promise.all([
        api.getPhotos(qr.wedding.id),
        api.getRanking(qr.wedding.id),
      ]);

      setPhotos(nextPhotos.slice(0, 12));
      setRanking(nextRanking.slice(0, 5));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "라이브 화면을 불러오지 못했습니다.");
    }
  }, [code]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (photos.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [photos.length]);

  useEffect(() => {
    if (!wedding?.id) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.emit("join-wedding", { weddingId: wedding.id });

    socket.on("photo-uploaded", (photo: Photo) => {
      setPhotos((current) => [photo, ...current.filter((item) => item.id !== photo.id)].slice(0, 12));
      setRanking((current) =>
        [photo, ...current.filter((item) => item.id !== photo.id)]
          .sort((a, b) => b.like_count - a.like_count)
          .slice(0, 5),
      );
      setActiveIndex(0);
    });

    socket.on("photo-hidden", ({ photoId }: { photoId: string }) => {
      setPhotos((current) => current.filter((photo) => photo.id !== photoId));
      setRanking((current) => current.filter((photo) => photo.id !== photoId));
    });

    socket.on("like-updated", ({ photoId, likeCount }: { photoId: string; likeCount: number }) => {
      const update = (items: Photo[]) =>
        items
          .map((photo) => (photo.id === photoId ? { ...photo, like_count: likeCount } : photo))
          .sort((a, b) => b.like_count - a.like_count);

      setPhotos((current) => update(current));
      setRanking((current) => update(current).slice(0, 5));
    });

    return () => {
      socket.disconnect();
    };
  }, [wedding?.id]);

  const displayPhotos = useMemo(() => {
    if (photos.length === 0) return [];

    const slotCount = Math.min(12, Math.max(photos.length, 6));
    return Array.from({ length: slotCount }, (_, index) => {
      return photos[(activeIndex + index) % photos.length];
    });
  }, [activeIndex, photos]);

  if (error) {
    return <main className="live-page live-page--center">{error}</main>;
  }

  return (
    <main className="live-page">
      <section className="live-grid">
        {photos.length === 0 ? (
          <div className="live-empty">
            <strong>MomentIn Live</strong>
            <span>하객 사진을 기다리는 중입니다.</span>
          </div>
        ) : (
          displayPhotos.map((photo, index) => (
            <article
              className={index === 0 ? "live-photo live-photo--featured" : "live-photo"}
              key={`${photo.id}-${activeIndex}-${index}`}
            >
              <img src={photo.image_url} alt={photo.user?.display_name || "live photo"} />
              <span>
                {photo.user?.display_name || "Guest"} · ♥ {photo.like_count}
              </span>
            </article>
          ))
        )}
      </section>

      <footer className="live-footer">
        <div className="live-rank">
          <strong>랭킹</strong>
          {ranking.length === 0 ? (
            <span>좋아요 랭킹을 기다리는 중</span>
          ) : (
            <div className="live-rank-mask">
              <div className="live-rank-track">
                {[...ranking, ...ranking].map((photo, index) => (
                  <span key={`${photo.id}-${index}`}>
                    {(index % ranking.length) + 1}위 {photo.user?.display_name || "Guest"} ♥ {photo.like_count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="live-code">
          <strong>MomentIn</strong>
          <span>CODE: {wedding?.theme_code || code}</span>
        </div>
      </footer>
    </main>
  );
}
