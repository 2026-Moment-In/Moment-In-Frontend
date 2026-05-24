import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { loadKakaoMapsSdk } from "../../utils/kakaoMapSdk";

const MARKER_ICONS = ["🍭", "💝", "🌸", "❤️", "🎁", "💒", "🥂"];

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

    loadKakaoMapsSdk()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result: any[], geoStatus: string) => {
          if (cancelled || !containerRef.current) return;

          if (geoStatus !== window.kakao.maps.services.Status.OK) {
            setStatus("error");
            return;
          }

          const coords = new window.kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
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

    return () => {
      cancelled = true;
    };
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
