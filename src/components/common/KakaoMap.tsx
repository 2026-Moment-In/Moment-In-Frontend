import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

declare global {
  interface Window { kakao: any; }
}

const APP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY as string;
const MARKER_ICONS = ["🍭", "💝", "🌸", "❤️", "🎁", "💒", "🥂"];

function loadKakaoSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), 10000);
    const done = () => { clearTimeout(timer); resolve(); };

    // services까지 포함해 완전히 초기화됐으면 즉시 반환
    if (window.kakao?.maps?.services?.Geocoder) {
      done();
      return;
    }

    const runLoad = () => {
      window.kakao.maps.load(() => done());
    };

    // 스크립트 태그가 이미 삽입된 경우 — kakao.maps.load 등장을 폴링
    if (document.getElementById("kakao-maps-sdk")) {
      if (window.kakao?.maps?.load) {
        runLoad();
      } else {
        const wait = setInterval(() => {
          if (window.kakao?.maps?.load) { clearInterval(wait); runLoad(); }
        }, 50);
      }
      return;
    }

    // 최초 삽입 — autoload=false 로 스크립트 로드 후 kakao.maps.load() 호출
    const script = document.createElement("script");
    script.id = "kakao-maps-sdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${APP_KEY}&libraries=services&autoload=false`;
    script.onload = runLoad;
    script.onerror = () => { clearTimeout(timer); reject(new Error("script load failed")); };
    document.head.appendChild(script);
  });
}

interface Props {
  address: string;
  markerTitle: string;
  markerIconIdx?: number;
  height?: number;
  accentColor?: string;
}

export default function KakaoMap({
  address,
  markerTitle,
  markerIconIdx = 2,
  height = 200,
  accentColor = "#b89a6a",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  useEffect(() => {
    if (!containerRef.current) return;

    if (!address.trim()) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    containerRef.current.innerHTML = "";
    setStatus("loading");

    loadKakaoSDK()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result: any[], geoStatus: string) => {
          if (cancelled || !containerRef.current) return;

          if (geoStatus !== window.kakao.maps.services.Status.OK) {
            setStatus("error");
            return;
          }

          const coords = new window.kakao.maps.LatLng(+result[0].y, +result[0].x);

          const map = new window.kakao.maps.Map(containerRef.current, {
            center: coords,
            level: 3,
            draggable: false,
            scrollwheel: false,
            disableDoubleClickZoom: true,
          });

          new window.kakao.maps.Marker({ map, position: coords });

          if (markerTitle) {
            const icon = MARKER_ICONS[markerIconIdx] ?? "❤️";
            const content = `<div style="background:white;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.18);display:flex;align-items:center;gap:5px;font-family:sans-serif;"><span>${icon}</span><span style="color:#3a3535;">${markerTitle}</span></div>`;
            new window.kakao.maps.CustomOverlay({
              map,
              position: coords,
              content,
              yAnchor: 2.8,
            });
          }

          setStatus("ok");
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => { cancelled = true; };
  }, [address, markerTitle, markerIconIdx]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height }}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      {status !== "ok" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
          style={{ backgroundColor: accentColor + "12" }}
        >
          <MapPin size={20} style={{ color: accentColor }} />
          <p className="text-xs text-center px-4" style={{ color: accentColor, opacity: 0.7 }}>
            {status === "error"
              ? "주소를 찾을 수 없습니다"
              : status === "loading"
              ? "지도 불러오는 중..."
              : "주소를 입력해 주세요"}
          </p>
        </div>
      )}
    </div>
  );
}
