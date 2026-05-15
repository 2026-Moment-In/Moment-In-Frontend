import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Heart, ImagePlus, LogIn, MapPin, Send, Sparkles, Upload } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import { api, SOCKET_URL } from './api';
import { defaultWedding, demoGuestbooks, demoPhotos } from './demo';
import type { Guestbook, Photo, View, Wedding } from './types';
import { formatWeddingDate, getWeddingTitle } from './utils';

const liveUrl = `${window.location.origin}${window.location.pathname}?view=guest&code=4JIQ56L`;

function App() {
  const [view, setView] = useState<View>('login');
  const [wedding, setWedding] = useState<Wedding>(defaultWedding);
  const [photos, setPhotos] = useState<Photo[]>(demoPhotos);
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>(demoGuestbooks);
  const [code, setCode] = useState('4JIQ56L');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const weddingId = wedding.id || code;
  const title = getWeddingTitle(wedding.admin?.display_name);
  const topPhotoId = useMemo(
    () => [...photos].sort((a, b) => b.like_count - a.like_count)[0]?.id,
    [photos],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextView = params.get('view') as View | null;
    const nextCode = params.get('code');
    if (nextCode) setCode(nextCode);
    if (nextView) setView(nextView);
  }, []);

  useEffect(() => {
    if (!weddingId || view === 'login' || view === 'create') return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.emit('joinWedding', { weddingId });
    socket.on('newPhoto', (photo: Photo) => {
      setPhotos((current) => [photo, ...current.filter((item) => item.id !== photo.id)]);
    });
    socket.on(
      'updateRanking',
      (payload: { photoId: string; likeCount: number; topRankedPhotoId?: string }) => {
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === payload.photoId ? { ...photo, like_count: payload.likeCount } : photo,
          ),
        );
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [view, weddingId]);

  async function loadWedding(nextCode = code) {
    setNotice('');
    try {
      const data = await api.getWeddingByCode(nextCode.trim());
      if (data) setWedding(data);
    } catch {
      setWedding({ ...defaultWedding, id: nextCode.trim() || defaultWedding.id });
      setNotice('백엔드 조회가 아직 안 되어서 샘플 정보로 열었어요.');
    }
  }

  async function loadGuestbooks(id = weddingId) {
    try {
      const [guestbookData, photoData] = await Promise.all([api.getGuestbooks(id), api.getPhotos(id)]);
      setGuestbooks(guestbookData.length ? guestbookData : demoGuestbooks);
      setPhotos(photoData.length ? photoData : demoPhotos);
    } catch {
      setGuestbooks(demoGuestbooks);
    }
  }

  async function handleJoin(event: FormEvent) {
    event.preventDefault();
    await loadWedding(code);
    await loadGuestbooks(code);
    setView('guest');
  }

  async function handleReady() {
    await loadWedding(code);
    await loadGuestbooks(code);
    setView('ready');
  }

  async function handleLike(photoId: string) {
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === photoId ? { ...photo, like_count: photo.like_count + 1 } : photo,
      ),
    );
    try {
      const updated = await api.likePhoto(photoId);
      setPhotos((current) =>
        current.map((photo) => (photo.id === photoId ? { ...photo, ...updated } : photo)),
      );
    } catch {
      setNotice('좋아요는 화면에 반영했고, 백엔드 연결은 확인이 필요해요.');
    }
  }

  async function handleMessage(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;

    const optimistic: Guestbook = {
      id: crypto.randomUUID(),
      message: message.trim(),
      created_at: new Date().toISOString(),
      user: { display_name: '하객' },
    };
    setGuestbooks((current) => [optimistic, ...current]);
    setMessage('');

    try {
      const saved = await api.createGuestbook(weddingId, optimistic.message);
      setGuestbooks((current) => [saved, ...current.filter((item) => item.id !== optimistic.id)]);
    } catch {
      setNotice('방명록은 임시로 표시했어요. 백엔드 사용자 ID 연결이 필요할 수 있어요.');
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview: Photo = {
      id: crypto.randomUUID(),
      image_url: URL.createObjectURL(file),
      like_count: 0,
      created_at: new Date().toISOString(),
      user: { display_name: '하객' },
    };
    setPhotos((current) => [preview, ...current]);
    setIsUploading(true);

    try {
      const saved = await api.uploadPhoto(weddingId, file);
      setPhotos((current) => [saved, ...current.filter((item) => item.id !== preview.id)]);
      setNotice('사진을 보냈어요.');
    } catch {
      setNotice('사진은 미리보기로 올렸어요. S3/사용자 ID 설정 후 백엔드 저장돼요.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  if (view === 'login') {
    return (
      <Shell tone="soft">
        <div className="auth-card">
          <Logo />
          <a className="kakao-button" href="http://localhost:3000/auth/kakao">
            <LogIn size={15} />
            카카오톡으로 계속하기
          </a>
          <button className="ghost-link" onClick={() => setView('create')}>
            로그인 없이 화면 둘러보기
          </button>
        </div>
      </Shell>
    );
  }

  if (view === 'create') {
    return (
      <Shell tone="soft">
        <div className="brand-float">
          <Logo inverted />
        </div>
        <section className="create-card">
          <div className="icon-badge">
            <Sparkles size={24} />
          </div>
          <h1>웨딩 페이지 생성하기</h1>
          <p>우리만의 특별한 웨딩 페이지를 직접 만들고 꾸며보세요.</p>
          <div className="code-row">
            <input value={code} onChange={(event) => setCode(event.target.value)} />
            <button onClick={handleReady}>시작하기</button>
          </div>
        </section>
      </Shell>
    );
  }

  if (view === 'join') {
    return (
      <Shell tone="photo">
        <TopBar />
        <form className="join-card" onSubmit={handleJoin}>
          <span>접속 코드</span>
          <input value={code} onChange={(event) => setCode(event.target.value)} />
          <button>입장하기</button>
        </form>
      </Shell>
    );
  }

  if (view === 'ready') {
    return (
      <Shell tone="photo">
        <TopBar />
        <div className="ticket">
          <div>
            <strong>모바일에 접속하고 신랑신부를 축하해주세요!</strong>
            <span>접속 코드:</span>
          </div>
          <b>{code}</b>
          <QRCodeSVG value={liveUrl.replace('4JIQ56L', code)} size={74} />
        </div>
        <p className="script-title">We're getting married</p>
        <button className="screen-button" onClick={() => setView('gallery')}>
          실시간 갤러리 열기
        </button>
      </Shell>
    );
  }

  if (view === 'gallery') {
    return (
      <main className="gallery-screen">
        <TopBar />
        <header className="gallery-header">
          <strong>{title}</strong>
          <Heart size={16} fill="currentColor" />
          <span>오시온</span>
          <i />
          <span>{formatWeddingDate(wedding.wedding_date)}</span>
        </header>
        <Masonry photos={photos} topPhotoId={topPhotoId} onLike={handleLike} />
        <aside className="qr-panel">
          <h2>오늘 찍은 사진을 보내주세요!</h2>
          <p>모바일로 스캔해서 바로 업로드할 수 있어요.</p>
          <QRCodeSVG value={liveUrl.replace('4JIQ56L', code)} size={116} />
          <b>{code}</b>
        </aside>
      </main>
    );
  }

  return (
    <main className="guest-screen">
      <section className="guest-hero">
        <Logo inverted />
        <h1>{title}</h1>
        <p>{formatWeddingDate(wedding.wedding_date)}</p>
        <span>
          <MapPin size={15} />
          {wedding.location_name ?? 'Moment Hall'}
        </span>
      </section>
      <section className="guest-actions">
        <label className="upload-box">
          <ImagePlus size={24} />
          <strong>{isUploading ? '사진 보내는 중' : '사진 업로드'}</strong>
          <span>jpeg, png, webp</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} />
        </label>
        <form className="message-form" onSubmit={handleMessage}>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="축하 메시지를 남겨주세요"
          />
          <button>
            <Send size={16} />
            보내기
          </button>
        </form>
      </section>
      {notice && <p className="notice">{notice}</p>}
      <Masonry photos={photos} topPhotoId={topPhotoId} onLike={handleLike} compact />
      <section className="guestbook-list">
        {guestbooks.map((item) => (
          <article key={item.id}>
            <strong>{item.user?.display_name ?? '하객'}</strong>
            <p>{item.message}</p>
          </article>
        ))}
      </section>
      <button className="floating-upload" onClick={() => setView('gallery')}>
        <Upload size={18} />
        스크린 보기
      </button>
    </main>
  );
}

function Shell({ children, tone }: { children: React.ReactNode; tone: 'soft' | 'photo' }) {
  return <main className={`shell ${tone}`}>{children}</main>;
}

function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className={`logo ${inverted ? 'inverted' : ''}`} aria-label="MomentIn">
      <span>순간을 남기고 기억을 새기는</span>
      <strong>MomentIn</strong>
    </div>
  );
}

function TopBar() {
  return (
    <nav className="topbar">
      <strong>MomentIn</strong>
    </nav>
  );
}

function Masonry({
  photos,
  topPhotoId,
  onLike,
  compact = false,
}: {
  photos: Photo[];
  topPhotoId?: string;
  onLike: (photoId: string) => void;
  compact?: boolean;
}) {
  return (
    <section className={compact ? 'masonry compact' : 'masonry'}>
      {photos.map((photo) => (
        <article className="photo-card" key={photo.id}>
          <img src={photo.image_url} alt={photo.user?.display_name ?? 'wedding photo'} />
          <footer>
            <span>{photo.user?.display_name ?? '하객'}</span>
            <button onClick={() => onLike(photo.id)} aria-label="좋아요">
              <Heart size={14} fill={photo.id === topPhotoId ? 'currentColor' : 'none'} />
              {photo.like_count}
            </button>
          </footer>
        </article>
      ))}
    </section>
  );
}

export default App;
