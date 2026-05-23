import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { Guestbook, Photo, Wedding } from "../types";
import "./DashboardPage.css";

type Invitation = {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  weddingTime?: string;
  venueName?: string;
  venueAddress?: string;
};

function getInvitation(wedding?: Wedding | null): Invitation {
  if (!wedding) return {};
  if ((wedding as any).invitation) return (wedding as any).invitation as Invitation;

  try {
    return wedding.invitation_json ? JSON.parse(wedding.invitation_json) : {};
  } catch {
    return {};
  }
}

function getCode(wedding?: Wedding | null) {
  return wedding?.theme_code ?? wedding?.id ?? "";
}

function formatDate(value?: string | null) {
  if (!value) return "날짜 미정";
  return value.slice(0, 10);
}

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selected, setSelected] = useState<Wedding | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedInvitation = useMemo(() => getInvitation(selected), [selected]);
  const selectedCode = getCode(selected);

  const ensureDevLogin = useCallback(async () => {
    if (localStorage.getItem("momentin_access_token")) return;
    const result = await api.devLogin();
    localStorage.setItem("momentin_access_token", result.access_token);
    localStorage.setItem("momentin_user", JSON.stringify(result.user));
  }, []);

  const loadList = useCallback(async () => {
    await ensureDevLogin();
    const list = await api.getMyWeddings();
    setWeddings(list);
  }, [ensureDevLogin]);

  const loadDetail = useCallback(
    async (weddingId: string) => {
      await ensureDevLogin();
      const [wedding, nextPhotos, nextGuestbooks] = await Promise.all([
        api.getMyWedding(weddingId),
        api.getAdminPhotos(weddingId),
        api.getAdminGuestbooks(weddingId),
      ]);
      setSelected(wedding);
      setPhotos(nextPhotos);
      setGuestbooks(nextGuestbooks);
    },
    [ensureDevLogin],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await loadList();
      if (id) {
        await loadDetail(id);
      } else {
        setSelected(null);
        setPhotos([]);
        setGuestbooks([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "관리자 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id, loadDetail, loadList]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(weddingId: string) {
    if (!confirm("이 웨딩 페이지를 삭제 상태로 변경할까요?")) return;
    await api.deleteMyWedding(weddingId);
    navigate("/admin");
    await loadList();
  }

  async function togglePhoto(photo: Photo) {
    const updated = photo.is_hidden ? await api.showPhoto(photo.id) : await api.hidePhoto(photo.id);
    setPhotos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function toggleGuestbook(guestbook: Guestbook) {
    const updated = guestbook.is_hidden
      ? await api.showGuestbook(guestbook.id)
      : await api.hideGuestbook(guestbook.id);
    setGuestbooks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  if (loading) {
    return <main className="admin-page">불러오는 중...</main>;
  }

  if (error) {
    return (
      <main className="admin-page">
        <p className="admin-error">{error}</p>
        <button onClick={load}>다시 시도</button>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">MomentIn Admin</p>
          <h1>웨딩 관리</h1>
        </div>
        <div className="admin-actions">
          <Link to="/editor" className="admin-primary">
            새 웨딩 만들기
          </Link>
          {selected && (
            <>
              <Link to={`/editor?weddingId=${selected.id}`}>수정</Link>
              <button onClick={() => handleDelete(selected.id)} className="admin-danger">
                삭제
              </button>
            </>
          )}
        </div>
      </header>

      <section className="admin-layout">
        <aside className="admin-list">
          <div className="admin-panel-title">
            <h2>내 웨딩</h2>
            <span>{weddings.length}</span>
          </div>

          {weddings.length === 0 ? (
            <p className="admin-muted">아직 만든 웨딩이 없습니다.</p>
          ) : (
            weddings.map((wedding) => {
              const invitation = getInvitation(wedding);
              const title = `${invitation.groomName ?? "신랑"} ♥ ${invitation.brideName ?? "신부"}`;
              return (
                <Link
                  key={wedding.id}
                  to={`/admin/dashboard/${wedding.id}`}
                  className={`admin-wedding-item ${selected?.id === wedding.id ? "active" : ""}`}
                >
                  <strong>{title}</strong>
                  <span>{formatDate(wedding.wedding_date ?? undefined)}</span>
                  <small>
                    사진 {wedding._count?.photos ?? 0} · 방명록 {wedding._count?.guestbooks ?? 0}
                  </small>
                </Link>
              );
            })
          )}
        </aside>

        {!selected ? (
          <section className="admin-empty">
            <h2>관리할 웨딩을 선택하세요.</h2>
            <p>새 웨딩을 만들면 QR, 사진, 방명록을 여기서 관리할 수 있습니다.</p>
          </section>
        ) : (
          <section className="admin-detail">
            <section className="admin-summary">
              <div>
                <p className="admin-eyebrow">Dashboard</p>
                <h2>
                  {selectedInvitation.groomName ?? "신랑"} ♥ {selectedInvitation.brideName ?? "신부"}
                </h2>
                <p>
                  {formatDate(selected.wedding_date)} {selected.wedding_time ?? selectedInvitation.weddingTime}
                </p>
                <p>
                  {selected.location_name ?? selectedInvitation.venueName}
                  {selected.location_address ?? selectedInvitation.venueAddress
                    ? ` · ${selected.location_address ?? selectedInvitation.venueAddress}`
                    : ""}
                </p>
              </div>
              <div className="admin-code-box">
                <span>입장 코드</span>
                <strong>{selectedCode}</strong>
                <button onClick={() => copy(selectedCode)}>코드 복사</button>
              </div>
            </section>

            <section className="admin-links">
              <Link to={`/qr/${selectedCode}`}>QR 확인</Link>
              <Link to={`/wedding/${selectedCode}`}>하객 화면</Link>
              <Link to={`/wedding/${selectedCode}/photos`}>사진 업로드 화면</Link>
              <Link to={`/live/${selectedCode}`}>라이브 화면</Link>
            </section>

            <section className="admin-content-grid">
              <div className="admin-content-panel">
                <div className="admin-panel-title">
                  <h2>사진 관리</h2>
                  <span>{photos.length}</span>
                </div>
                <div className="admin-photo-grid">
                  {photos.length === 0 ? (
                    <p className="admin-muted">업로드된 사진이 없습니다.</p>
                  ) : (
                    photos.map((photo) => (
                      <article className={photo.is_hidden ? "hidden" : ""} key={photo.id}>
                        <img src={photo.image_url} alt={photo.user?.display_name ?? "guest photo"} />
                        <div>
                          <strong>{photo.user?.display_name ?? "Guest"}</strong>
                          <span>♥ {photo.like_count}</span>
                        </div>
                        <button onClick={() => togglePhoto(photo)}>
                          {photo.is_hidden ? "블라인드 해제" : "블라인드"}
                        </button>
                      </article>
                    ))
                  )}
                </div>
              </div>

              <div className="admin-content-panel">
                <div className="admin-panel-title">
                  <h2>방명록 관리</h2>
                  <span>{guestbooks.length}</span>
                </div>
                <div className="admin-guestbook-list">
                  {guestbooks.length === 0 ? (
                    <p className="admin-muted">작성된 방명록이 없습니다.</p>
                  ) : (
                    guestbooks.map((guestbook) => (
                      <article className={guestbook.is_hidden ? "hidden" : ""} key={guestbook.id}>
                        <div>
                          <strong>{guestbook.user?.display_name ?? "Guest"}</strong>
                          <time>{formatDate(guestbook.created_at)}</time>
                        </div>
                        <p>{guestbook.message}</p>
                        <button onClick={() => toggleGuestbook(guestbook)}>
                          {guestbook.is_hidden ? "블라인드 해제" : "블라인드"}
                        </button>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>
          </section>
        )}
      </section>
    </main>
  );
}