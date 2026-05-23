import { type ReactNode, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { api } from '../api';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function getJwtPayload(): { sub: string; displayName: string } | null {
  const token = localStorage.getItem('momentin_access_token');
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
import type { Guestbook, Photo, QrResponse } from '../types';
import KakaoMap from '../components/common/KakaoMap';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const FONT_MAP: Record<string, string> = {
  pretendard: "'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif",
  hahmlet:    "'Hahmlet', serif",
  gowun:      "'Gowun Dodum', sans-serif",
  gmarket:    "'GmarketSans', 'Apple SD Gothic Neo', sans-serif",
};

const TEXTURE_MAP: Record<string, string | null> = {
  none:   null,
  linen:  "repeating-linear-gradient(45deg,rgba(0,0,0,0.06),rgba(0,0,0,0.06) 2px,transparent 2px,transparent 4px)",
  cotton: "repeating-linear-gradient(0deg,transparent,transparent 5px,rgba(0,0,0,0.04) 5px,rgba(0,0,0,0.04) 6px),repeating-linear-gradient(90deg,transparent,transparent 5px,rgba(0,0,0,0.04) 5px,rgba(0,0,0,0.04) 6px)",
  grain:  "radial-gradient(ellipse at 30% 40%,rgba(255,255,255,0.4) 0%,transparent 55%),radial-gradient(ellipse at 70% 65%,rgba(180,160,140,0.2) 0%,transparent 50%)",
  ivory:  "linear-gradient(160deg,rgba(255,252,245,0.6) 0%,rgba(235,220,200,0.5) 100%)",
  marble: "repeating-linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.12) 4px,rgba(0,0,0,0.04) 4px,rgba(0,0,0,0.04) 8px)",
};

const GRADIENT_MAP: Record<string, string> = {
  "bottom-strong": "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3), rgba(0,0,0,0.1))",
  "bottom-medium": "linear-gradient(to top, rgba(0,0,0,0.70), rgba(0,0,0,0.15), transparent)",
  "bottom-light":  "linear-gradient(to top, rgba(0,0,0,0.40), transparent, transparent)",
  "top-strong":    "linear-gradient(to bottom, rgba(0,0,0,0.80), rgba(0,0,0,0.20), transparent)",
  "top-medium":    "linear-gradient(to bottom, rgba(0,0,0,0.50), transparent, transparent)",
  "top-light":     "linear-gradient(to bottom, rgba(0,0,0,0.25), transparent)",
  "full-strong":   "linear-gradient(to bottom, rgba(0,0,0,0.60), rgba(0,0,0,0.30), rgba(0,0,0,0.60))",
  "full-medium":   "linear-gradient(to bottom, rgba(0,0,0,0.40), rgba(0,0,0,0.15), rgba(0,0,0,0.40))",
  "full-light":    "linear-gradient(to bottom, rgba(0,0,0,0.20), transparent, rgba(0,0,0,0.20))",
};

function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  );
}

function Divider({ fontColor }: { fontColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: fontColor, opacity: 0.12 }} />
      <span style={{ color: fontColor, opacity: 0.3, fontSize: 10 }}>✦</span>
      <div style={{ flex: 1, height: 1, background: fontColor, opacity: 0.12 }} />
    </div>
  );
}

function SectionLabel({ fontColor, children }: { fontColor: string; children: string }) {
  return (
    <p style={{ fontSize: 10, letterSpacing: 5, color: fontColor, opacity: 0.45, marginBottom: 12, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
      {children}
    </p>
  );
}

function formatKorDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`;
}

function CountdownTimer({ weddingDate, weddingTime, fontColor, bgColor }: {
  weddingDate: string; weddingTime: string; fontColor: string; bgColor: string;
}) {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const [y, mo, dd] = weddingDate.split('-').map(Number);
      const [hh, mm] = (weddingTime || '12:00').split(':').map(Number);
      const diff = Math.max(0, new Date(y, mo - 1, dd, hh, mm).getTime() - Date.now());
      setCd({ d: Math.floor(diff / 86400000), h: Math.floor(diff % 86400000 / 3600000), m: Math.floor(diff % 3600000 / 60000), s: Math.floor(diff % 60000 / 1000) });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [weddingDate, weddingTime]);

  const items: [string, number][] = [['일', cd.d], ['시간', cd.h], ['분', cd.m], ['초', cd.s]];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 4, padding: '8px 0' }}>
      {items.map(([label, val], i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          {i > 0 && <span style={{ color: fontColor, opacity: 0.35, fontSize: 18, paddingBottom: 8 }}>:</span>}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: fontColor, lineHeight: 1, fontFamily: 'sans-serif' }}>{String(val).padStart(2, '0')}</span>
            <span style={{ fontSize: 10, color: fontColor, opacity: 0.5, marginTop: 3, fontFamily: 'sans-serif' }}>{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarWidget({ weddingDate, fontColor, bgColor }: {
  weddingDate: string; fontColor: string; bgColor: string;
}) {
  if (!weddingDate) return null;
  const [y, mo, dd] = weddingDate.split('-').map(Number);
  const firstDow = new Date(y, mo - 1, 1).getDay();
  const daysInMonth = new Date(y, mo, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 500, padding: '4px 0', color: i === 0 ? '#e06b6b' : i === 6 ? '#6b8fe0' : fontColor, opacity: 0.7, fontFamily: 'sans-serif' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((n, i) => {
          const col = i % 7;
          const isWedding = n === dd;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32 }}>
              {n && (
                <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: isWedding ? fontColor : 'transparent' }}>
                  <span style={{ fontSize: 12, fontFamily: 'sans-serif', color: isWedding ? bgColor : col === 0 ? '#e06b6b' : col === 6 ? '#6b8fe0' : fontColor, opacity: isWedding ? 1 : 0.8 }}>{n}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Account = { bank: string; holder: string; number: string; relation: string };

export default function ShowQR() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [qrData, setQrData]   = useState<QrResponse | null>(null);
  const [error, setError]     = useState('');
  const [accTab, setAccTab]   = useState<'groom' | 'bride'>('groom');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [noticeTab, setNoticeTab] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [slideshowIdx, setSlideshowIdx] = useState(0);
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([]);
  const [guestPhotos, setGuestPhotos] = useState<Photo[]>([]);
  const [authUser, setAuthUser] = useState<{ id: string; display_name: string } | null>(() => {
    try {
      const cached = localStorage.getItem('momentin_user');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [msgContent, setMsgContent]   = useState('');
  const [msgSubmitting, setMsgSubmitting] = useState(false);
  const [showMsgForm, setShowMsgForm]     = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('momentin_access_token');
    if (!token) {
      localStorage.removeItem('momentin_user');
      setAuthUser(null);
      return;
    }
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(u => {
        if (u?.id) {
          const userData = { id: u.id, display_name: u.display_name ?? '' };
          localStorage.setItem('momentin_user', JSON.stringify(userData));
          setAuthUser(userData);
        } else {
          localStorage.removeItem('momentin_access_token');
          localStorage.removeItem('momentin_user');
          setAuthUser(null);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!code) { setError('입장 코드가 없습니다.'); return; }
    api.getQr(code)
      .then(res => {
        setQrData(res);
        if (res.wedding?.id) {
          api.getGuestbooks(res.wedding.id).then(setGuestbooks).catch(() => {});
          api.getPhotos(res.wedding.id)
            .then(photos => setGuestPhotos(photos.filter(p => !p.is_hidden)))
            .catch(() => {});
        }
        if (res.data?.accountGroomFirst === false) setAccTab('bride');
      })
      .catch(err => setError(err instanceof Error ? err.message : '초대장을 불러오지 못했습니다.'));
  }, [code]);

  const data    = (qrData?.data ?? {}) as Record<string, any>;
  const wedding = qrData?.wedding;

  // ── Theme ──
  const bg          = data.bgColor   ?? '#faf8f5';
  const fontColor   = data.fontColor ?? '#2a2a1e';
  const fontFamily  = FONT_MAP[data.fontFamily ?? 'pretendard'] ?? FONT_MAP.pretendard;
  const textureImg  = TEXTURE_MAP[data.bgTexture ?? 'none'] ?? null;

  // ── Cover ──
  const coverImage     = (data.coverImage as string)  ?? '';
  const coverLayout    = (data.coverLayout as string) ?? 'style1';
  const showGradient   = data.showGradient !== false;
  const gradientStyle  = showGradient ? (GRADIENT_MAP[`${data.gradientDir ?? 'bottom'}-${data.gradientTone ?? 'medium'}`] ?? GRADIENT_MAP['bottom-medium']) : null;
  const coverTextColor = (data.coverTextColor as string) ?? '#ffffff';
  const imgFilter      = `brightness(${data.brightness ?? 1}) contrast(${data.contrast ?? 1}) saturate(${data.saturation ?? 1}) grayscale(${data.grayscale ?? 0})`;
  const showCountdown  = data.showCountdown !== false;

  // ── Couple ──
  const groomName      = (data.groomName as string)  ?? '신랑';
  const brideName      = (data.brideName as string)  ?? '신부';
  const weddingDate    = (data.weddingDate as string) ?? '';
  const weddingTime    = (data.weddingTime as string) ?? '';

  const dDay = (() => {
    if (!weddingDate) return '';
    const [y, mo, dd] = weddingDate.split('-').map(Number);
    const diff = Math.floor((new Date(y, mo - 1, dd).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000);
    if (diff === 0) return 'D-Day';
    return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
  })();

  // ── Accounts ──
  const groomAccounts = (data.groomAccounts as Account[]) ?? [];
  const brideAccounts = (data.brideAccounts as Account[]) ?? [];

  // ── Transport ──
  const transportEntries: [string, string][] = (() => {
    const ti = data.transportInfo as Record<string, string> | undefined;
    if (ti && typeof ti === 'object') return Object.entries(ti).filter(([, v]) => v?.trim());
    const r: [string, string][] = [];
    if (data.subwayInfo?.trim()) r.push(['지하철', data.subwayInfo]);
    if (data.busInfo?.trim())    r.push(['버스',   data.busInfo]);
    if (data.carInfo?.trim())    r.push(['자가용', data.carInfo]);
    if (data.walkInfo?.trim())   r.push(['도보',   data.walkInfo]);
    return r;
  })();

  // ── Notices / Nearby / Gallery ──
  const noticeItems = (data.noticeItems as { id: string; title: string; content: string }[]) ?? [];
  const nearbyItems = (data.nearbyItems as { title: string; desc?: string; imageUrl?: string }[]) ?? [];
  const staticGallery  = (data.gallery as string[]) ?? [];
  const galleryLayout  = (data.galleryLayout as string) ?? 'grid';
  const hasGuestPhotos = guestPhotos.length > 0;
  const gallery        = hasGuestPhotos ? guestPhotos.map(p => p.image_url) : staticGallery;

  // ── Basic info people ──
  const groomFirst     = data.groomFirst !== false;
  const basicInfoPreset = (data.basicInfoPreset as string) ?? 'simple';
  const hideParents    = !!data.hideParents;
  const people = (groomFirst
    ? [{ label: '신랑', name: groomName,  intro: data.groomIntro, relation: data.groomRelation, photo: data.groomPhoto, dad: data.groomDadName, dadD: !!data.groomDadDeceased, mom: data.groomMomName, momD: !!data.groomMomDeceased, contact: data.groomContact },
       { label: '신부', name: brideName,  intro: data.brideIntro, relation: data.brideRelation, photo: data.bridePhoto, dad: data.brideDadName, dadD: !!data.brideDadDeceased, mom: data.brideMomName, momD: !!data.brideMomDeceased, contact: data.brideContact }]
    : [{ label: '신부', name: brideName,  intro: data.brideIntro, relation: data.brideRelation, photo: data.bridePhoto, dad: data.brideDadName, dadD: !!data.brideDadDeceased, mom: data.brideMomName, momD: !!data.brideMomDeceased, contact: data.brideContact },
       { label: '신랑', name: groomName,  intro: data.groomIntro, relation: data.groomRelation, photo: data.groomPhoto, dad: data.groomDadName, dadD: !!data.groomDadDeceased, mom: data.groomMomName, momD: !!data.groomMomDeceased, contact: data.groomContact }]
  );

  const copyAccount = (acc: Account, key: string) => {
    navigator.clipboard.writeText(acc.number).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const submitGuestbook = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!wedding?.id || !msgContent.trim()) return;
    setMsgSubmitting(true);
    try {
      const newMsg = await api.createGuestbook(wedding.id, msgContent.trim(), authUser!.id);
      setGuestbooks(prev => [...prev, {
        ...newMsg,
        user: { display_name: authUser!.display_name },
      }]);
      setMsgContent(''); setShowMsgForm(false);
    } catch { /* fail silently */ }
    finally { setMsgSubmitting(false); }
  };

  if (error) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#999', fontFamily: 'sans-serif', fontSize: 14 }}>{error}</p>
    </main>
  );
  if (!qrData) return (
    <main style={{ minHeight: '100vh', backgroundColor: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#bbb', fontFamily: 'sans-serif', fontSize: 14 }}>초대장을 불러오는 중입니다...</p>
    </main>
  );

  const D = () => <Divider fontColor={fontColor} />;
  const SL = ({ children }: { children: string }) => <SectionLabel fontColor={fontColor}>{children}</SectionLabel>;

  return (
    <main style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', backgroundColor: bg, backgroundImage: textureImg ?? undefined, color: fontColor, fontFamily }}>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setLightboxIdx(null)}>
            <button style={{ position: 'absolute', top: 16, right: 20, color: 'rgba(255,255,255,0.7)', fontSize: 26, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            <button style={{ position: 'absolute', left: 12, color: 'rgba(255,255,255,0.7)', fontSize: 44, background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.max(0, (i ?? 1) - 1)); }}>‹</button>
            <div style={{ width: '85vw', maxWidth: 540, aspectRatio: '1/1' }} onClick={e => e.stopPropagation()}>
              <img src={gallery[lightboxIdx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <button style={{ position: 'absolute', right: 12, color: 'rgba(255,255,255,0.7)', fontSize: 44, background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => Math.min(gallery.length - 1, (i ?? 0) + 1)); }}>›</button>
            <p style={{ position: 'absolute', bottom: 16, color: 'rgba(255,255,255,0.45)', fontSize: 12, fontFamily: 'sans-serif' }}>{(lightboxIdx ?? 0) + 1} / {gallery.length}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COVER ── */}
      <section style={{ position: 'relative', height: '100vh', touchAction: 'pan-y' }}>
        {/* clip wrapper: overflow hidden 이미지에만 적용, 섹션 자체에는 적용 안 함 */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {coverLayout !== 'style2' && coverImage && (
            <motion.img src={coverImage} alt="" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imgFilter }} />
          )}
          {coverLayout !== 'style2' && !coverImage && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: fontColor + '18' }} />
          )}
          {coverLayout !== 'style2' && showGradient && gradientStyle && (
            <div style={{ position: 'absolute', inset: 0, background: gradientStyle }} />
          )}
        </div>

        {coverLayout === 'style2' ? (
          <>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: bg, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: 0, top: '6%', width: '65%', height: '88%', overflow: 'hidden', pointerEvents: 'none' }}>
              {coverImage && <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: imgFilter }} />}
              {showGradient && gradientStyle && <div style={{ position: 'absolute', inset: 0, background: gradientStyle }} />}
            </div>
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '38%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, pointerEvents: 'none' }}>
              {weddingDate.split('-').map((n, i) => (
                <p key={i} style={{ fontSize: 30, color: coverTextColor, fontWeight: 300, lineHeight: 1, margin: 0 }}>{i === 0 ? n.slice(-2) : n}</p>
              ))}
            </div>
            <div style={{ position: 'absolute', inset: 'auto 0 28px 0', textAlign: 'center', zIndex: 10, pointerEvents: 'none' }}>
              <p style={{ fontSize: 14, color: coverTextColor, letterSpacing: 5, fontFamily }}>
                {groomName} ♥ {brideName}
              </p>
              <p style={{ fontSize: 11, color: coverTextColor + '70', marginTop: 4, fontFamily: 'sans-serif' }}>Wedding Invitation</p>
            </div>
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 'auto 0 100px 0', textAlign: 'center', zIndex: 10, padding: '0 24px', pointerEvents: 'none' }}>
            <p style={{ fontSize: 26, fontWeight: 300, letterSpacing: 4, color: coverTextColor, fontFamily, lineHeight: 1.4 }}>
              {groomName} <span style={{ fontStyle: 'italic', opacity: 0.8 }}>♥</span> {brideName}
            </p>
            {showCountdown && dDay && (
              <p style={{ fontSize: 15, marginTop: 10, color: coverTextColor + 'cc', fontFamily: 'sans-serif', letterSpacing: 1 }}>{dDay}</p>
            )}
            {weddingDate && (
              <p style={{ fontSize: 12, marginTop: 6, color: coverTextColor + '80', fontFamily: 'sans-serif' }}>
                {weddingDate}{weddingTime ? ` · ${weddingTime}` : ''}
              </p>
            )}
            {data.venueName && (
              <p style={{ fontSize: 11, marginTop: 4, color: coverTextColor + '60', fontFamily: 'sans-serif' }}>{data.venueName}</p>
            )}
          </div>
        )}
      </section>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px 160px' }}>

        {/* 인사말 */}
        {(data.greetingTitle || data.greetingBody) && (
          <FadeIn>
            {data.greetingPhoto && data.greetingBgPos === 'top' && (
              <div style={{ margin: '40px 0 16px', borderRadius: 20, overflow: 'hidden' }}>
                <img src={data.greetingPhoto} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <section style={{ textAlign: 'center', padding: '60px 0 44px' }}>
              <p style={{ fontSize: 11, opacity: 0.3, letterSpacing: 3, marginBottom: 20 }}>✦ ✦ ✦</p>
              {data.greetingTitle && <h2 style={{ fontSize: 18, fontWeight: 400, letterSpacing: 1, marginBottom: 20 }}>{data.greetingTitle}</h2>}
              {data.greetingBody && <p style={{ fontSize: 14, lineHeight: 2.2, opacity: 0.75, whiteSpace: 'pre-line' }}>{data.greetingBody}</p>}
            </section>
            {data.greetingPhoto && data.greetingBgPos === 'bottom' && (
              <div style={{ margin: '16px 0 40px', borderRadius: 20, overflow: 'hidden' }}>
                <img src={data.greetingPhoto} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <D />
          </FadeIn>
        )}

        {/* 기본정보 */}
        <FadeIn>
          <section style={{ padding: '50px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontSize: 10, letterSpacing: 5, opacity: 0.45, marginBottom: 8, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Basic Information</p>
              {data.basicInfoTitle && <p style={{ fontSize: 17, fontWeight: 400 }}>{data.basicInfoTitle}</p>}
            </div>

            {basicInfoPreset === 'duo' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {people.map(p => (
                  <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <p style={{ fontSize: 12, opacity: 0.5, fontFamily: 'sans-serif' }}>{p.label}</p>
                    <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 18, overflow: 'hidden', backgroundColor: fontColor + '0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.photo ? <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ opacity: 0.2, fontSize: 32 }}>👤</span>}
                    </div>
                    {!hideParents && (p.dad || p.mom) && (
                      <div style={{ textAlign: 'center', lineHeight: 1.6 }}>
                        <p style={{ fontSize: 12, opacity: 0.5, fontFamily: 'sans-serif' }}>{(p.dadD ? '故 ' : '') + (p.dad || '')} · {(p.momD ? '故 ' : '') + (p.mom || '')}</p>
                        <p style={{ fontSize: 12, opacity: 0.5, fontFamily: 'sans-serif' }}>의 {p.relation}</p>
                      </div>
                    )}
                    <p style={{ fontSize: 19, fontWeight: 400, letterSpacing: 1 }}>{p.name}</p>
                    {data.showContact && p.contact && (
                      <a href={`tel:${p.contact}`} style={{ fontSize: 12, color: fontColor, opacity: 0.55, fontFamily: 'sans-serif', textDecoration: 'none' }}>📞 {p.contact}</a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {basicInfoPreset === 'simple' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {people.map(p => (
                  <div key={p.name} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 8, fontFamily: 'sans-serif' }}>{p.label}</p>
                    {!hideParents && (p.dad || p.mom) && (
                      <div style={{ marginBottom: 8, lineHeight: 1.6 }}>
                        <p style={{ fontSize: 12, opacity: 0.5, fontFamily: 'sans-serif' }}>{(p.dadD ? '故 ' : '') + (p.dad || '')} · {(p.momD ? '故 ' : '') + (p.mom || '')}</p>
                        <p style={{ fontSize: 12, opacity: 0.5, fontFamily: 'sans-serif' }}>의 {p.relation}</p>
                      </div>
                    )}
                    <p style={{ fontSize: 19, fontWeight: 400 }}>{p.name}</p>
                    {p.intro && <p style={{ fontSize: 12, opacity: 0.5, marginTop: 4, fontFamily: 'sans-serif' }}>{p.intro}</p>}
                    {data.showContact && p.contact && (
                      <a href={`tel:${p.contact}`} style={{ fontSize: 12, color: fontColor, opacity: 0.55, fontFamily: 'sans-serif', textDecoration: 'none', display: 'block', marginTop: 4 }}>📞 {p.contact}</a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {basicInfoPreset === 'poetic' && (
              <div style={{ padding: '20px', borderRadius: 16, backgroundColor: fontColor + '08', textAlign: 'center' }}>
                {people.map((p, i) => (
                  <div key={p.name} style={{ marginBottom: i < people.length - 1 ? 18 : 0 }}>
                    {!hideParents && (p.dad || p.mom) && (
                      <p style={{ fontSize: 12, opacity: 0.5, fontFamily: 'sans-serif', marginBottom: 4 }}>
                        {(p.dadD ? '故 ' : '') + (p.dad || '')} · {(p.momD ? '故 ' : '') + (p.mom || '')}의 {p.relation}
                      </p>
                    )}
                    <p style={{ fontSize: 20, letterSpacing: 3 }}>{p.name}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
          <D />
        </FadeIn>

        {/* 예식정보 */}
        {weddingDate && (
          <FadeIn>
            <section style={{ padding: '50px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <SL>{(data.dateBlockTitle as string) || '예식 안내'}</SL>
                {data.venueName && <p style={{ fontSize: 20, fontWeight: 400, marginBottom: 8 }}>{data.venueName}</p>}
                {data.venueDetail && <p style={{ fontSize: 13, opacity: 0.55, marginBottom: 6, fontFamily: 'sans-serif' }}>{data.venueDetail}</p>}
                {data.venueAddress && <p style={{ fontSize: 13, opacity: 0.45, marginBottom: 8, fontFamily: 'sans-serif' }}>{data.venueAddress}</p>}
                <p style={{ fontSize: 14, opacity: 0.65, fontFamily: 'sans-serif' }}>{formatKorDate(weddingDate)}</p>
                {weddingTime && <p style={{ fontSize: 14, opacity: 0.65, marginTop: 4, fontFamily: 'sans-serif' }}>{weddingTime}</p>}
              </div>

              {data.showDDay && (
                <>
                  <div style={{ borderTop: `1px solid ${fontColor}15`, marginBottom: 16 }} />
                  <CalendarWidget weddingDate={weddingDate} fontColor={fontColor} bgColor={bg} />
                  <div style={{ borderTop: `1px solid ${fontColor}15`, margin: '16px 0' }} />
                  <CountdownTimer weddingDate={weddingDate} weddingTime={weddingTime || '12:00'} fontColor={fontColor} bgColor={bg} />
                </>
              )}
            </section>
            <D />
          </FadeIn>
        )}

        {/* 오시는 길 */}
        {(data.venueAddress || transportEntries.length > 0) && (
          <FadeIn>
            <section style={{ padding: '50px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <SL>{(data.locationTitle as string) || 'Location'}</SL>
                {data.venueAddress && <p style={{ fontSize: 13, opacity: 0.55, fontFamily: 'sans-serif' }}>{data.venueAddress}</p>}
              </div>

              {data.venueAddress && (
                <>
                  <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
                    <KakaoMap
                      address={data.venueAddress}
                      markerTitle=""
                      height={220}
                      accentColor={fontColor}
                    />
                  </div>
                  <a href={`https://map.naver.com/v5/search/${encodeURIComponent(data.venueAddress)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: `1px solid ${fontColor}20`, borderRadius: 12, padding: '10px', fontSize: 13, fontFamily: 'sans-serif', color: fontColor, textDecoration: 'none', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: '#03C75A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 900 }}>N</span>
                    네이버 지도 열기
                  </a>
                </>
              )}

              {transportEntries.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {transportEntries.map(([mode, info]) => (
                    <div key={mode} style={{ borderTop: `1px solid ${fontColor}14`, paddingTop: 14 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: 'sans-serif' }}>{mode}</p>
                      <p style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.8, whiteSpace: 'pre-line', fontFamily: 'sans-serif' }}>{info}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <D />
          </FadeIn>
        )}

        {/* 계좌정보 */}
        {(groomAccounts.some(a => a.bank) || brideAccounts.some(a => a.bank)) && (
          <FadeIn>
            <section style={{ padding: '50px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 18, fontWeight: 400, marginBottom: 10 }}>{data.accountTitle || '마음 전하실 곳'}</p>
                {data.accountMsgEnabled && data.accountMsg && (
                  <p style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.8, whiteSpace: 'pre-line', fontFamily: 'sans-serif' }}>{data.accountMsg}</p>
                )}
              </div>

              <div style={{ display: 'flex', border: `1px solid ${fontColor}20`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                {(data.accountGroomFirst !== false
                  ? [{ id: 'groom' as const, label: '신랑측' }, { id: 'bride' as const, label: '신부측' }]
                  : [{ id: 'bride' as const, label: '신부측' }, { id: 'groom' as const, label: '신랑측' }]
                ).map(({ id, label }) => (
                  <button key={id} onClick={() => setAccTab(id)}
                    style={{ flex: 1, padding: '11px', fontSize: 14, fontWeight: 500, backgroundColor: accTab === id ? fontColor : 'transparent', color: accTab === id ? bg : fontColor, opacity: accTab === id ? 1 : 0.5, border: 'none', cursor: 'pointer', fontFamily: 'sans-serif' }}>
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(accTab === 'groom' ? groomAccounts : brideAccounts).filter(a => a.bank).map((acc, i) => {
                  const key = `${accTab}-${i}`;
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, backgroundColor: fontColor + '0a' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, fontFamily: 'sans-serif' }}>{acc.relation ? `[${acc.relation}] ` : ''}{acc.holder}</p>
                        <p style={{ fontSize: 13, opacity: 0.6, marginTop: 2, fontFamily: 'sans-serif' }}>{acc.bank} · {acc.number}</p>
                      </div>
                      <button onClick={() => copyAccount(acc, key)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 20, border: `1px solid ${fontColor}30`, backgroundColor: copiedKey === key ? fontColor : 'transparent', color: copiedKey === key ? bg : fontColor, fontSize: 12, fontFamily: 'sans-serif', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                        {copiedKey === key ? <Check size={12} /> : <Copy size={12} />}
                        {copiedKey === key ? '복사됨' : '복사'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
            <D />
          </FadeIn>
        )}

        {/* 안내사항 */}
        {noticeItems.length > 0 && (
          <FadeIn>
            <section style={{ padding: '50px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 18, fontWeight: 400 }}>{data.noticeTitle || '안내사항'}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {noticeItems.map((item, i) => (
                  <button key={item.id} onClick={() => setNoticeTab(i)}
                    style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontFamily: 'sans-serif', cursor: 'pointer', border: 'none', backgroundColor: noticeTab === i ? fontColor : fontColor + '18', color: noticeTab === i ? bg : fontColor }}>
                    {item.title}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={noticeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: '16px', borderRadius: 14, backgroundColor: fontColor + '0a', fontSize: 14, lineHeight: 1.8, fontFamily: 'sans-serif', color: fontColor }}>
                  {noticeItems[noticeTab]?.content}
                </motion.div>
              </AnimatePresence>
            </section>
            <D />
          </FadeIn>
        )}

        {/* 주변 즐길거리 */}
        {nearbyItems.length > 0 && (
          <FadeIn>
            <section style={{ padding: '50px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <SL>Activities</SL>
                <p style={{ fontSize: 18, fontWeight: 400 }}>{data.nearbyTitle || 'Nearby'}</p>
                {data.nearbySubtitle && (
                  <p style={{ fontSize: 13, opacity: 0.55, marginTop: 10, lineHeight: 1.7, whiteSpace: 'pre-line', fontFamily: 'sans-serif' }}>{data.nearbySubtitle}</p>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {nearbyItems.map((item, i) => (
                  <div key={i} style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: fontColor + '0a' }}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.title} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', aspectRatio: '4/3', backgroundColor: fontColor + '10' }} />}
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, fontFamily: 'sans-serif' }}>{item.title}</p>
                      {item.desc && <p style={{ fontSize: 12, opacity: 0.55, marginTop: 4, fontFamily: 'sans-serif', lineHeight: 1.5 }}>{item.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <D />
          </FadeIn>
        )}

        {/* 갤러리 */}
        {(gallery.length > 0 || staticGallery.length > 0) && (
          <FadeIn>
            <section style={{ padding: '50px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <SL>Gallery</SL>
              </div>
              {galleryLayout === 'grid' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, borderRadius: 16, overflow: 'hidden' }}>
                    {gallery.slice(0, 9).map((url, i) => (
                      <div key={i} style={{ aspectRatio: '1/1', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setLightboxIdx(i)}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }} />
                      </div>
                    ))}
                  </div>
                  {gallery.length > 9 && (
                    <div style={{ textAlign: 'center', marginTop: 14 }}>
                      <Link to={`/gallery/${code}`} style={{ fontSize: 13, color: fontColor, opacity: 0.6, fontFamily: 'sans-serif', textDecoration: 'underline' }}>
                        +{gallery.length - 9}장 더 보기
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', marginBottom: 8 }}>
                    <AnimatePresence mode="wait">
                      <motion.img key={slideshowIdx} src={gallery[slideshowIdx]} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => setLightboxIdx(slideshowIdx)} />
                    </AnimatePresence>
                    <button style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: fontColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => setSlideshowIdx(i => Math.max(0, i - 1))}>‹</button>
                    <button style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: fontColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => setSlideshowIdx(i => Math.min(gallery.length - 1, i + 1))}>›</button>
                    <p style={{ position: 'absolute', bottom: 10, left: 14, fontSize: 11, backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', padding: '2px 8px', borderRadius: 10, fontFamily: 'sans-serif' }}>
                      {slideshowIdx + 1} / {gallery.length}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {gallery.slice(0, 5).map((url, i) => (
                      <div key={i} onClick={() => setSlideshowIdx(i)}
                        style={{ flex: 1, aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', opacity: i === slideshowIdx ? 1 : 0.5, cursor: 'pointer', outline: i === slideshowIdx ? `2px solid ${fontColor}` : 'none' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
            <D />
          </FadeIn>
        )}

        {/* 메시지 / 방명록 */}
        <FadeIn>
          <section style={{ padding: '50px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <SL>Message</SL>
              {data.msgTitle && <p style={{ fontSize: 18, fontWeight: 400, whiteSpace: 'pre-line', lineHeight: 1.7 }}>{data.msgTitle}</p>}
            </div>

            <button onClick={() => {
                if (!authUser) {
                  localStorage.removeItem('momentin_access_token');
                  sessionStorage.setItem('momentin_return_url', `/show/${code}`);
                  window.location.href = `${API_URL}/auth/kakao`;
                  return;
                }
                setShowMsgForm(v => !v);
              }}
              style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer', backgroundColor: fontColor, color: bg, fontSize: 14, fontWeight: 600, fontFamily: 'sans-serif', marginBottom: 16, letterSpacing: 0.3 }}>
              ✉️ 축하 메시지 남기기
            </button>

            <AnimatePresence>
              {showMsgForm && (
                <motion.form onSubmit={submitGuestbook} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '16px', backgroundColor: fontColor + '08', borderRadius: 14 }}>
                    <input type="text" value={authUser?.display_name ?? ''} readOnly
                      style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${fontColor}25`, backgroundColor: fontColor + '08', fontSize: 14, color: fontColor, fontFamily, outline: 'none', cursor: 'default' }} />
                    <textarea placeholder="축하 메시지를 남겨주세요" value={msgContent} onChange={e => setMsgContent(e.target.value)}
                      maxLength={data.messageMaxLen ?? 200} rows={4}
                      style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${fontColor}25`, backgroundColor: 'transparent', fontSize: 14, color: fontColor, fontFamily, outline: 'none', resize: 'none', lineHeight: 1.7 }} />
                    <button type="submit" disabled={msgSubmitting || !msgContent.trim()}
                      style={{ padding: '11px', borderRadius: 10, border: 'none', cursor: msgSubmitting || !msgContent.trim() ? 'not-allowed' : 'pointer', backgroundColor: fontColor, color: bg, fontSize: 14, fontWeight: 600, fontFamily: 'sans-serif', opacity: msgSubmitting || !msgContent.trim() ? 0.5 : 1 }}>
                      {msgSubmitting ? '전송 중...' : '메시지 전송'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {guestbooks.filter(g => !g.is_hidden).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {guestbooks.filter(g => !g.is_hidden).map((gb, i) => (
                  <div key={gb.id} style={{ padding: '14px 0', borderTop: i > 0 ? `1px solid ${fontColor}12` : undefined }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, fontFamily: 'sans-serif' }}>{gb.user?.display_name}</p>
                      <p style={{ fontSize: 11, opacity: 0.4, fontFamily: 'sans-serif' }}>{new Date(gb.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.7, fontFamily: 'sans-serif' }}>{gb.message}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
          <D />
        </FadeIn>

        {/* 엔딩 */}
        <FadeIn>
          <section style={{ padding: '40px 0 20px', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: 130 }}>
            {data.showPetals && ['🌸', '🌺', '🌸', '🌷', '🌸', '🌺', '🌸'].map((p, i) => (
              <motion.span key={i} style={{ position: 'absolute', left: `${7 + i * 13}%`, top: 0, fontSize: 18, pointerEvents: 'none' }}
                animate={{ y: [0, 130], opacity: [1, 0], rotate: [0, i % 2 === 0 ? 360 : -360] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.7, ease: 'linear' }}>{p}</motion.span>
            ))}
            {data.endingMsg && (
              <p style={{ fontSize: 14, opacity: 0.6, lineHeight: 2, whiteSpace: 'pre-line', paddingTop: 32, fontFamily: 'sans-serif' }}>{data.endingMsg}</p>
            )}
            <p style={{ fontSize: 10, letterSpacing: 5, opacity: 0.25, marginTop: 28, fontFamily: 'sans-serif' }}>MomentIn</p>
          </section>
        </FadeIn>

      </div>

      {/* ── 하단 고정 버튼 ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: bg + 'f2', backdropFilter: 'blur(14px)', borderTop: `1px solid ${fontColor}15`, padding: '12px 20px 28px', zIndex: 50 }}>
        <button
          onClick={() => {
            if (!authUser) {
              localStorage.removeItem('momentin_access_token');
              sessionStorage.setItem('momentin_return_url', `/show/${code}`);
              window.location.href = `${API_URL}/auth/kakao`;
              return;
            }
            navigate(`/gallery/${code}`);
          }}
          style={{ display: 'block', width: '100%', backgroundColor: fontColor, color: bg, textAlign: 'center', padding: '15px', borderRadius: 14, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'sans-serif', letterSpacing: 0.3 }}>
          📸 사진 올리기
        </button>
      </div>

    </main>
  );
}
