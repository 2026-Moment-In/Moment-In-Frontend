import { useEffect, useRef, useState } from "react";
import "./GalleryPage.css";

interface Photo {
  id: string;
  name: string;
  src: string;
  likes: number;
}

const STORAGE_KEY = "momentin_gallery";

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [open, setOpen] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setPhotos(JSON.parse(saved));
    }
  }, []);

  function save(next: Photo[]) {
    setPhotos(next);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    );
  }

  async function handleImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
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
    if (!file || !name.trim() || !preview) return;

    const newPhoto: Photo = {
      id: crypto.randomUUID(),
      name,
      src: preview,
      likes: 0,
    };

    save([newPhoto, ...photos]);

    setOpen(false);

    setPreview(null);
    setFile(null);
    setName("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleLike(id: string) {
    const updated = photos.map((photo) =>
      photo.id === id
        ? {
            ...photo,
            likes: photo.likes + 1,
          }
        : photo
    );

    save(updated);
  }

  return (
    <main className="m-gallery">
      <header className="m-gallery-header">
        <div className="m-gallery-header-content">
            <span className="m-gallery-header-left">
            김미림 <span className="heart">♥</span> 이미림
            </span>

            <span className="m-gallery-divider">|</span>

            <span className="m-gallery-date">
            2026.06.20
            </span>
        </div>

        <button className="m-gallery-top3">
            TOP 3
        </button>
      </header>

      <section className="m-gallery-grid">
        {photos.map((photo) => (
          <article
            className="photo-card"
            key={photo.id}
          >
            <img
              src={photo.src}
              alt={photo.name}
            />

            <div className="photo-footer">
              <span>{photo.name}</span>

              <button
                onClick={() =>
                  handleLike(photo.id)
                }
              >
                ♡ {photo.likes}
              </button>
            </div>
          </article>
        ))}
      </section>

      <button
        className="floating-upload"
        onClick={() => setOpen(true)}
      >
        <div className="floating-icon">
          <img src="/images/camera_icon.png" alt="icon" className="icon"/>
        </div>

        <span>사진 전달하기</span>
      </button>

      {open && (
        <div className="upload-modal-backdrop">
          <div className="upload-modal">
            <div
              className="upload-preview"
              onClick={() =>
                inputRef.current?.click()
              }
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                />
              ) : (
                <>
                  <div className="upload-icon">
                    <img src="/images/upload_icon.png" alt="icon" className="icon"/>
                  </div>

                  <button>
                    파일 업로드
                  </button>
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
              onChange={(e) =>
                setName(e.target.value)
              }
              className="name-input"
            />

            <div className="mission">
              <strong>
                📸 미션: 우리만의
                사진작가가 되어주세요!
              </strong>

              <p>
                사진을 갤러리에 업로드 해주시고
                <br />
                저희 결혼식의 추억을 함께
                남겨주세요 💛
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() =>
                  setOpen(false)
                }
              >
                닫기
              </button>

              <button
                className="submit-btn"
                onClick={handleUpload}
              >
                완료하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}