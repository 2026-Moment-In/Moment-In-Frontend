import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api, DEMO_USER_ID } from "../../api";
import type { Photo as ApiPhoto, Wedding } from "../../types";
import "./GalleryPage.css";

type Photo = {
  id: string;
  name: string;
  src: string;
  likes: number;
};

function toPhoto(photo: ApiPhoto): Photo {
  return {
    id: photo.id,
    name: photo.user?.display_name ?? "Guest",
    src: photo.image_url,
    likes: photo.like_count,
  };
}

function getGuestUserId() {
  const key = "momentin_guest_user_id";
  const saved = localStorage.getItem(key);

  if (saved) {
    return saved;
  }

  const id = crypto.randomUUID?.() ?? DEMO_USER_ID;
  localStorage.setItem(key, id);
  return id;
}

export default function GalleryPage() {
  const { code } = useParams<{ code: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const weddingId = wedding?.id;

  const title = useMemo(() => {
    const groom = invitation?.groomName ?? "신랑";
    const bride = invitation?.brideName ?? "신부";
    return `${groom} ♥ ${bride}`;
  }, [invitation]);

  async function load() {
    if (!code) {
      setError("입장 코드가 없습니다.");
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [code]);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];

    if (!selected) return;

    setFile(selected);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selected);
  }

  async function handleUpload() {
    if (!file || !name.trim() || !weddingId) return;

    try {
      const saved = await api.uploadPhoto(weddingId, file, getGuestUserId(), name.trim());
      setPhotos((current) => [toPhoto(saved), ...current]);
      setOpen(false);
      setPreview(null);
      setFile(null);
      setName("");

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "사진 업로드에 실패했습니다.");
    }
  }

  async function handleLike(id: string) {
    const previous = photos;
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === id ? { ...photo, likes: photo.likes + 1 } : photo,
      ),
    );

    try {
      const updated = await api.likePhoto(id);
      setPhotos((current) =>
        current.map((photo) => (photo.id === id ? toPhoto(updated) : photo)),
      );
    } catch {
      setPhotos(previous);
    }
  }

  return (
    <main className="m-gallery">
      <header className="m-gallery-header">
        <div className="m-gallery-header-content">
          <span className="m-gallery-header-left">{title}</span>
          <span className="m-gallery-divider">|</span>
          <span className="m-gallery-date">
            {wedding?.wedding_date?.slice(0, 10) ?? "MomentIn"}
          </span>
        </div>

        <button className="m-gallery-top3">TOP 3</button>
      </header>

      {loading ? (
        <section className="m-gallery-grid">불러오는 중...</section>
      ) : error ? (
        <section className="m-gallery-grid">{error}</section>
      ) : (
        <section className="m-gallery-grid">
          {photos.map((photo) => (
            <article className="photo-card" key={photo.id}>
              <img src={photo.src} alt={photo.name} />

              <div className="photo-footer">
                <span>{photo.name}</span>

                <button onClick={() => handleLike(photo.id)}>♥ {photo.likes}</button>
              </div>
            </article>
          ))}
        </section>
      )}

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

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImage}
            />

            <input
              type="text"
              placeholder="이름을 작성해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="name-input"
            />

            <div className="mission">
              <strong>미션: 우리만의 사진 작가가 되어주세요</strong>

              <p>
                사진을 갤러리에 업로드해주시고
                <br />
                소중한 결혼식의 추억을 함께 남겨주세요.
              </p>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setOpen(false)}>
                닫기
              </button>

              <button className="submit-btn" onClick={handleUpload}>
                완료하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
