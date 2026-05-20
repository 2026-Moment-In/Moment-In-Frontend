import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Camera, Image, MapPin, MessageCircle, Navigation, Users } from 'lucide-react';
import { api } from '../api';
import './showQR.css';

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

function formatDate(value?: string) {
  if (!value) return '날짜 미정';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
}

function InfoSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="invite-section">
      <div className="invite-section__title">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="invite-section__body">{children}</div>
    </section>
  );
}

export default function ShowQR() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<InvitationData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) {
      setError('입장 코드가 없습니다.');
      return;
    }

    api
      .getQr(code)
      .then((res) => setData((res.data ?? {}) as InvitationData))
      .catch((err) => setError(err instanceof Error ? err.message : '초대장을 불러오지 못했습니다.'));
  }, [code]);

  const displayDate = useMemo(() => formatDate(data?.weddingDate), [data?.weddingDate]);

  if (error) {
    return (
      <main className="invite-page invite-page--center">
        <section className="invite-state">{error}</section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="invite-page invite-page--center">
        <section className="invite-state">초대장을 불러오는 중입니다.</section>
      </main>
    );
  }

  return (
    <main className="invite-page">
      <section className="invite-hero">
        <p className="invite-eyebrow">Wedding Invitation</p>
        <h1>
          {data.groomName || '신랑'}
          <span>&</span>
          {data.brideName || '신부'}
        </h1>
        <p className="invite-date">
          {displayDate}
          {data.weddingTime ? ` · ${data.weddingTime}` : ''}
        </p>
      </section>

      <div className="invite-content">
        <InfoSection icon={<Users size={18} />} title="초대의 글">
          <h2>{data.greetingTitle || '소중한 분들을 초대합니다'}</h2>
          <p className="invite-preline">{data.greetingBody || '두 사람의 새로운 시작을 함께 축복해주세요.'}</p>
        </InfoSection>

        <InfoSection icon={<MapPin size={18} />} title="예식 장소">
          <strong>{data.venueName || '장소 미정'}</strong>
          {data.venueDetail && <p>{data.venueDetail}</p>}
          {data.venueAddress && <p>{data.venueAddress}</p>}
        </InfoSection>

        <InfoSection icon={<Navigation size={18} />} title="오시는 길">
          {data.transport && <strong>{data.transport}</strong>}
          <p className="invite-preline">{data.transportGuide || '교통 안내가 준비 중입니다.'}</p>
        </InfoSection>

        {data.nearbyPlaces && data.nearbyPlaces.length > 0 && (
          <InfoSection icon={<MessageCircle size={18} />} title="주변 장소">
            <ul className="invite-place-list">
              {data.nearbyPlaces.map((place, i) => (
                <li key={`${place}-${i}`}>{place}</li>
              ))}
            </ul>
          </InfoSection>
        )}
      </div>

      <nav className="invite-actions" aria-label="하객 메뉴">
        <Link to={`/wedding/${code}/photos`} className="invite-action invite-action--primary">
          <Camera size={18} />
          사진 올리러 가기
        </Link>
        <Link to={`/live/${code}`} className="invite-action">
          <Image size={18} />
          실시간 갤러리 보기
        </Link>
      </nav>
    </main>
  );
}
