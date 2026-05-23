import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api";
import type { Photo, QrResponse } from "../../types";
import "./GalleryPage.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function getJwtPayload(): { sub: string; displayName: string } | null {
  const token = localStorage.getItem("momentin_access_token");
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function GalleryPage() {
  const { code } = useParams<{ code: string }>();
  const [qrData, setQrData] = useState<QrResponse | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState(() => getJwtPayload()?.displayName ?? "");
  const [uploading, setUploading] = useState(false);
  const [showTop3, setShowTop3] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("momentin_access_token");
    if (!token) {
      sessionStorage.setItem("momentin_return_url", `/gallery/${code ?? ""}`);
      window.location.href = `${API_URL}/auth/kakao`;
      return;
    }
    if (!code) return;

    api.getQr(code)
      .then((res) => {
        setQrData(res);
        if (res.wedding?.id) {
          api.getPhotos(res.wedding.id).then(setPhotos).catch(() => {});
        }
      })
      .catch(() => {});
  }, [code]);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleUpload() {
    if (!file || !qrData?.wedding?.id) return;
    setUploading(true);
    try {
      const jwt = getJwtPayload();
      const userId = jwt?.sub ?? "00000000-0000-0000-0000-000000000001";
      const newPhoto = await api.uploadPhoto(
        qrData.wedding.id,
        file,
        userId,
        name.trim() || undefined,
      );
      setPhotos((prev) => [newPhoto, ...prev]);
      setOpen(false);
      setPreview(null);
      setFile(null);
      setName("");
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      /* fail silently */
    } finally {
      setUploading(false);
    }
  }

  async function handleLike(photoId: string) {
    try {
      const updated = await api.likePhoto(photoId);
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? updated : p)));
    } catch {
      /* fail silently */
    }
  }

  const invData = (qrData?.data ?? {}) as Record<string, string>;
  const groomName = invData.groomName ?? "신랑";
  const brideName = invData.brideName ?? "신부";
  const weddingDate = (
    invData.weddingDate ??
    qrData?.wedding?.wedding_date ??
    ""
  ).replace(/-/g, ".");

  const visiblePhotos = photos.filter((p) => !p.is_hidden);
  const top3 = [...visiblePhotos]
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 3);

  return (
    <main className="m-gallery">
      <header className="m-gallery-header">
        <div className="m-gallery-header-content">
          <span className="m-gallery-header-left">
            {groomName} <span className="heart">♥</span> {brideName}
          </span>
          <span className="m-gallery-divider">|</span>
          <span className="m-gallery-date">{weddingDate}</span>
        </div>
        <button className="m-gallery-top3" onClick={() => setShowTop3((v) => !v)}>
          TOP 3
        </button>
      </header>

      {showTop3 && top3.length > 0 && (
        <div style={{ background: "#fff", padding: "16px", borderBottom: "1px solid #ddd" }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: "center", color: "#2c1800" }}>
            ❤️ TOP 3 인기 사진
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {top3.map((p, i) => (
              <div key={p.id} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={p.image_url}
                    alt=""
                    style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 8, display: "block" }}
                  />
                  <span style={{
                    position: "absolute", top: 4, left: 4,
                    background: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32",
                    color: "#fff", borderRadius: "50%", width: 20, height: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                  }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>♡ {p.like_count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="m-gallery-grid">
        {visiblePhotos.map((photo) => (
          <article className="photo-card" key={photo.id}>
            <img src={photo.image_url} alt={photo.user?.display_name ?? ""} />
            <div className="photo-footer">
              <span>{photo.user?.display_name ?? "익명"}</span>
              <button onClick={() => handleLike(photo.id)}>♡ {photo.like_count}</button>
            </div>
          </article>
        ))}
        {visiblePhotos.length === 0 && (
          <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#888", fontSize: 13, padding: "40px 0" }}>
            아직 업로드된 사진이 없습니다
          </p>
        )}
      </section>

      <button className="floating-upload" onClick={() => setOpen(true)}>
        <div className="floating-icon">
          <img src="/images/camera_icon.png" alt="icon" className="icon" />
        </div>
        <span>사진 전달하기</span>
      </button>

      {open && (
        <div className="upload-modal-backdrop">
          <div className="upload-modal">
            <div className="upload-preview" onClick={() => inputRef.current?.click()}>
              {preview ? (
                <img src={preview} alt="preview" />
              ) : (
                <>
                  <div className="upload-icon">
                    <img src="/images/upload_icon.png" alt="icon" className="icon" />
                  </div>
                  <button>파일 업로드</button>
                </>
              )}
            </div>

            <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleImage} />

            <input
              type="text"
              value={name}
              readOnly
              className="name-input"
              style={{ opacity: 0.75, cursor: "default" }}
            />

            <div className="mission">
              <strong>📸 미션: 우리만의 사진작가가 되어주세요!</strong>
              <p>
                사진을 갤러리에 업로드 해주시고
                <br />
                저희 결혼식의 추억을 함께 남겨주세요 💛
              </p>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setOpen(false)}>
                닫기
              </button>
              <button
                className="submit-btn"
                onClick={handleUpload}
                disabled={uploading || !file}
                style={{ opacity: uploading || !file ? 0.6 : 1 }}
              >
                {uploading ? "업로드 중..." : "완료하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
