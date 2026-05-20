import { useEffect, useState } from "react";
import "./EditorPage.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";

declare global {
  interface Window {
    daum: any;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Mood = "Natural" | "Romantic";
type MenuKey = "mood" | "greeting" | "basic" | "date" | "location" | "gallery" | "nearby";
type Transport = "지하철" | "버스" | "자가용" | "도보";

interface InvitationData {
  mood: Mood;
  greetingTitle: string;
  greetingBody: string;
  groomName: string;
  groomRelation: string;
  brideName: string;
  brideRelation: string;
  weddingDate: string;
  weddingTime: string;
  dateBlockTitle: string;
  venueName: string;
  venueDetail: string;
  venueAddress: string;
  transport: Transport;
  transportGuide: string;
  nearbyPlaces: string[];
  nearbyInput: string;
  nearbyDesc: string;
}

const MENU_ITEMS: { key: MenuKey; icon: string; label: string }[] = [
  { key: "mood", icon: "🎨", label: "무드 선택" },
  { key: "greeting", icon: "✉️", label: "인사말" },
  { key: "basic", icon: "🤍", label: "기본 정보" },
  { key: "date", icon: "📅", label: "예식 일시" },
  { key: "location", icon: "📍", label: "오시는 길" },
  { key: "gallery", icon: "🖼️", label: "갤러리" },
  { key: "nearby", icon: "✨", label: "주변 즐길 거리" },
];

const MOODS: { key: Mood; label: string; accent: string; bg: string }[] = [
  { key: "Natural", label: "Natural", accent: "#6b7c5e", bg: "#f5f2ed" },
  { key: "Romantic", label: "Romantic", accent: "#b8748a", bg: "#fdf0f3" }
];

const TRANSPORTS: Transport[] = ["지하철", "버스", "자가용", "도보"];

const DEFAULT_DATA: InvitationData = {
  mood: "Natural",
  greetingTitle: "소중한 분들을 초대합니다",
  greetingBody:
    "저희 두사람의 작은 만남이\n사랑의 결실을 이루어\n소중한 결혼식을 올리게 되었습니다.\n\n첫 마음 그대로 존중하고 배려하며 살겠습니다.",
  groomName: "김미림",
  groomRelation: "아들",
  brideName: "이미림",
  brideRelation: "딸",
  weddingDate: "2026-06-20",
  weddingTime: "12:00",
  dateBlockTitle: "예식 안내",
  venueName: "라마다 서울 신도림 호텔",
  venueDetail: "14층 하늘정원",
  venueAddress: "서울 구로구 경인로 65402-2162-2100",
  transport: "지하철",
  transportGuide: "신도림역 1번 출구에서 도보 10분",
  nearbyPlaces: ["영등포 타임스퀘어", "안양천"],
  nearbyInput: "영등포 타임스퀘어",
  nearbyDesc: "함께 가기 좋은 복합 쇼핑몰",
};

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="sec-title">
      <span>{icon}</span>
      <span>{title}</span>
    </div>
  );
}

function FG({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="fg">
      {label && <label className="fg-lbl">{label}</label>}
      {children}
    </div>
  );
}

function FRow({ children }: { children: React.ReactNode }) {
  return <div className="f-row">{children}</div>;
}

function MoodPanel({ data, onChange }: { data: InvitationData; onChange: (d: Partial<InvitationData>) => void }) {
  return (
    <div className="panel">
      <SectionTitle icon="🎨" title="무드 선택" />
      <div className="mood-grid">
        {MOODS.map(m => (
          <button
            key={m.key}
            className={`mood-card ${data.mood === m.key ? "active" : ""}`}
            style={{ "--ma": m.accent, "--mb": m.bg } as React.CSSProperties}
            onClick={() => onChange({ mood: m.key })}
          >
            <div className="mood-thumb">
              <span className="mood-txt">our<br />wedding<br />day</span>
            </div>
            <span className="mood-lbl">{m.label}</span>
            {data.mood === m.key && <span className="mood-chk">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function GreetingPanel({ data, onChange }: { data: InvitationData; onChange: (d: Partial<InvitationData>) => void }) {
  return (
    <div className="panel">
      <SectionTitle icon="✉️" title="인사말" />
      <FG label="블록 제목">
        <input className="f-input" value={data.greetingTitle} onChange={e => onChange({ greetingTitle: e.target.value })} />
      </FG>
      <FG label="인사말 본문">
        <textarea className="f-textarea" rows={7} value={data.greetingBody} onChange={e => onChange({ greetingBody: e.target.value })} />
      </FG>
    </div>
  );
}

function BasicPanel({ data, onChange }: { data: InvitationData; onChange: (d: Partial<InvitationData>) => void }) {
  return (
    <div className="panel">
      <SectionTitle icon="🤍" title="기본 정보" />
      <FG label="블록 제목">
        <input className="f-input" defaultValue="우리의 소개" />
      </FG>
      <p className="sub-label">신랑 &amp; 신부 정보</p>
      <FRow>
        <FG label="신랑 정보">
          <input className="f-input" value={data.groomName} onChange={e => onChange({ groomName: e.target.value })} />
        </FG>
        <FG label="신부 정보">
          <input className="f-input" value={data.brideName} onChange={e => onChange({ brideName: e.target.value })} />
        </FG>
      </FRow>
      <FRow>
        <FG label="부모님과의 관계">
          <input className="f-input" value={data.groomRelation} onChange={e => onChange({ groomRelation: e.target.value })} />
        </FG>
        <FG label="부모님과의 관계">
          <input className="f-input" value={data.brideRelation} onChange={e => onChange({ brideRelation: e.target.value })} />
        </FG>
      </FRow>
    </div>
  );
}

function DatePanel({ data, onChange }: { data: InvitationData; onChange: (d: Partial<InvitationData>) => void }) {
  return (
    <div className="panel">
      <SectionTitle icon="📅" title="예식 일시" />
      <FG label="블록 제목">
        <input className="f-input" value={data.dateBlockTitle} onChange={e => onChange({ dateBlockTitle: e.target.value })} />
      </FG>
      <p className="sub-label">예식 기본정보</p>
      <FRow>
        <FG label="예식 날짜">
          <input className="f-input" type="date" value={data.weddingDate} onChange={e => onChange({ weddingDate: e.target.value })} />
        </FG>
        <FG label="예식 시간">
          <input className="f-input" type="time" value={data.weddingTime} onChange={e => onChange({ weddingTime: e.target.value })} />
        </FG>
      </FRow>
    </div>
  );
}

function LocationPanel({ data, onChange }: { data: InvitationData; onChange: (d: Partial<InvitationData>) => void }) {
  function openPostcode() {
    new window.daum.Postcode({
      oncomplete: function (result: any) {
        onChange({ venueAddress: result.address });
      },
    }).open();
  }

  return (
    <div className="panel">
      <SectionTitle icon="📍" title="오시는 길" />
      <FG label="블록 제목">
        <input className="f-input" defaultValue="오시는 길" />
      </FG>
      <p className="sub-label">예식 기본정보</p>
      <FRow>
        <FG label="예식 장소">
          <input className="f-input" value={data.venueName} onChange={e => onChange({ venueName: e.target.value })} />
        </FG>
        <FG label="세부 장소">
          <input className="f-input" value={data.venueDetail} onChange={e => onChange({ venueDetail: e.target.value })} />
        </FG>
      </FRow>
      <FG label="식장 주소">
        <div className="addr-row">
          <input className="f-input" value={data.venueAddress} onChange={e => onChange({ venueAddress: e.target.value })} />
          <button className="addr-btn" onClick={openPostcode} type="button">우편번호 검색</button>
        </div>
      </FG>

      <p className="sub-label">교통수단 안내</p>
      <p className="sub-label-2">교통수단 선택</p>
      <div className="transport-tabs">
        {TRANSPORTS.map(t => (
          <button
            key={t}
            className={`t-tab ${data.transport === t ? "active" : ""}`}
            onClick={() => onChange({ transport: t })}
          >
            {t}
          </button>
        ))}
      </div>
      <FG label="오시는 길 안내">
        <textarea className="f-textarea" rows={3} value={data.transportGuide} onChange={e => onChange({ transportGuide: e.target.value })} />
      </FG>
    </div>
  );
}

function GalleryPanel() {
  return (
    <div className="panel">
      <SectionTitle icon="🖼️" title="갤러리" />
      <div className="gallery-grid">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="g-cell" />
        ))}
        <button className="g-add">
          <span className="g-plus">+</span>
          <span className="g-add-lbl">사진 추가</span>
        </button>
      </div>
    </div>
  );
}

function NearbyPanel({ data, onChange }: { data: InvitationData; onChange: (d: Partial<InvitationData>) => void }) {
  const add = () => {
    if (!data.nearbyInput.trim()) return;
    onChange({ nearbyPlaces: [...data.nearbyPlaces, data.nearbyInput.trim()], nearbyInput: "", nearbyDesc: "" });
  };
  const remove = (i: number) => {
    onChange({ nearbyPlaces: data.nearbyPlaces.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="panel">
      <SectionTitle icon="✨" title="주변 즐길 거리" />
      <FG label="장소 이름">
        <input className="f-input" value={data.nearbyInput} onChange={e => onChange({ nearbyInput: e.target.value })} placeholder="영등포 타임스퀘어" />
      </FG>
      <FG label="장소 설명">
        <div className="addr-row">
          <input className="f-input" value={data.nearbyDesc} onChange={e => onChange({ nearbyDesc: e.target.value })} placeholder="함께 가기 좋은 복합 쇼핑몰" />
          <button className="addr-btn" onClick={add}>장소 추가</button>
        </div>
      </FG>
      {data.nearbyPlaces.length > 0 && (
        <div className="tag-list">
          {data.nearbyPlaces.map((p, i) => (
            <span key={i} className="tag">
              <button className="tag-x" onClick={() => remove(i)}>✕</button>
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MobilePreview({ data }: { data: InvitationData }) {
  const mood = MOODS.find(m => m.key === data.mood)!;
  const d = new Date(data.weddingDate);
  const mo = d.getMonth() + 1;
  const dy = d.getDate();
  const yr = d.getFullYear();
  const wd = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d.getDay()];

  return (
    <div className="mobile-preview" style={{ "--pa": mood.accent, "--pb": mood.bg } as React.CSSProperties}>
      <div className="p-hero">
        <p className="p-eyebrow">our wedding day</p>
        <div className="p-names">
          <span>{data.groomName}</span>
          <span className="p-amp">&amp;</span>
          <span>{data.brideName}</span>
        </div>
        <p className="p-herodate">{yr}.{String(mo).padStart(2, "0")}.{String(dy).padStart(2, "0")} {wd}</p>
      </div>

      <div className="p-dots"><span /><span /><span /></div>

      <div className="p-sec">
        <h3 className="p-sec-title">{data.greetingTitle}</h3>
        <p className="p-body">{data.greetingBody}</p>
      </div>

      <div className="p-sec p-dateblock">
        <div className="p-bigdate">
          <span>{String(mo).padStart(2, "0")}</span>
          <span className="p-sl">/</span>
          <span>{String(dy).padStart(2, "0")}</span>
        </div>
        <p className="p-time">{data.weddingTime} · {wd}</p>
      </div>

      <div className="p-sec">
        <p className="p-venue">{data.venueName}</p>
        <p className="p-small">{data.venueAddress}</p>
        <p className="p-small">{data.venueDetail}</p>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function EditorPage() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("basic");
  const [data, setData] = useState<InvitationData>(DEFAULT_DATA);
  const onChange = (p: Partial<InvitationData>) => setData(prev => ({ ...prev, ...p }));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const weddingId = searchParams.get("weddingId");

  useEffect(() => {
    if (!weddingId) return;
    api.getMyWedding(weddingId).then((wedding) => {
      const invitation = wedding.invitation ?? {};
      if (invitation && typeof invitation === "object") {
        setData((prev) => ({
          ...prev,
          ...invitation,
        }));
      }
    });
  }, [weddingId]);

  async function handleStart() {
    if (weddingId) {
      await api.updateMyWedding(weddingId, data);
      navigate(`/admin/dashboard/${weddingId}`);
      return;
    }
    const result = await api.createMyWedding(data);
    navigate(`/admin/dashboard/${result.wedding.id}`);
  }

  const panel = () => {
    switch (activeMenu) {
      case "mood": return <MoodPanel data={data} onChange={onChange} />;
      case "greeting": return <GreetingPanel data={data} onChange={onChange} />;
      case "basic": return <BasicPanel data={data} onChange={onChange} />;
      case "date": return <DatePanel data={data} onChange={onChange} />;
      case "location": return <LocationPanel data={data} onChange={onChange} />;
      case "gallery": return <GalleryPanel />;
      case "nearby": return <NearbyPanel data={data} onChange={onChange} />;
    }
  };

  return (
    <div className="editor-root">
      <header className="editor-nav">
        <span className="editor-logo">MomentIn</span>
        <button className="editor-done-btn" onClick={handleStart}>완성하기</button>
      </header>
      <div className="editor-body">
        <aside className="editor-sidebar">
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              className={`si ${activeMenu === item.key ? "active" : ""}`}
              onClick={() => setActiveMenu(item.key)}
            >
              <span className="si-icon">{item.icon}</span>
              <span className="si-label">{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="editor-center">
          <div className="preview-shell">
            <MobilePreview data={data} />
          </div>
        </main>

        <aside className="editor-detail">{panel()}</aside>
      </div>
    </div>
  );
}