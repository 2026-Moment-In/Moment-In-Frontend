import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ExternalLink, Trash2, MessageSquare, Pencil } from "lucide-react";
import QRCodeLib from "react-qr-code";
import NavBar from "../components/common/NavBar";
import { api } from "../api";
import type { Guestbook, Wedding } from "../types";

const TABS = ["대시보드", "방명록 관리", "공유하기"];

interface WeddingData {
  wedding: Wedding;
  code: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venueName: string;
}

export default function ManagePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [guestbooks, setGuestbooks] = useState<Guestbook[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const urlCode = searchParams.get("code") ?? "";
      let wedding: Wedding;
      let code: string;
      let inv: Record<string, unknown> = {};

      if (urlCode) {
        const qr = await api.getQr(urlCode);
        wedding = qr.wedding;
        code = urlCode;
        inv = (qr.data ?? {}) as Record<string, unknown>;
      } else {
        const list = await api.getMyWeddings();
        if (list.length === 0) {
          setLoadError(true);
          return;
        }
        wedding = list[0];
        code = wedding.theme_code ?? wedding.id;
        inv = wedding.invitation_json ? JSON.parse(wedding.invitation_json) : {};
      }

      setWeddingData({
        wedding,
        code,
        groomName: (inv.groomName as string) || "신랑",
        brideName: (inv.brideName as string) || "신부",
        weddingDate: (inv.weddingDate as string) || wedding.wedding_date || "",
        venueName: (inv.venueName as string) || wedding.location_name || "",
      });

      try {
        const gbList = await api.getAdminGuestbooks(wedding.id);
        setGuestbooks(gbList);
      } catch { /* 인증 실패 시 무시 */ }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-ivory pt-20 flex items-center justify-center">
          <p className="text-muted text-sm">불러오는 중...</p>
        </div>
      </>
    );
  }

  if (loadError || !weddingData) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-ivory pt-20 flex flex-col items-center justify-center gap-4">
          <p className="text-muted">청첩장이 없습니다</p>
          <Link to="/create" className="px-6 py-3 bg-charcoal text-white rounded-full text-sm">
            청첩장 만들기
          </Link>
        </div>
      </>
    );
  }

  const { wedding, code, groomName, brideName, weddingDate, venueName } = weddingData;
  const inviteUrl = `${window.location.origin}/show/${code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(inviteUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const handleHideGuestbook = async (gbId: string) => {
    try {
      await api.hideGuestbook(gbId);
      setGuestbooks((prev) => prev.filter((g) => g.id !== gbId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-ivory pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-5">

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted text-xs mb-0.5">청첩장 관리</p>
              <h1 className="font-serif text-2xl text-charcoal">
                {groomName} ♥ {brideName}
              </h1>
              <p className="text-muted text-sm mt-0.5">{weddingDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/create?weddingId=${wedding.id}`)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-divider text-charcoal rounded-full text-xs hover:bg-surface transition-colors"
              >
                <Pencil size={13} />
                수정하기
              </button>
              <Link
                to={`/show/${code}`}
                target="_blank"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-charcoal text-white rounded-full text-xs hover:bg-charcoal-dark transition-colors"
              >
                <ExternalLink size={13} />
                청첩장 보기
              </Link>
            </div>
          </div>

          <div className="flex gap-0 bg-white rounded-2xl p-1 mb-6 shadow-sm border border-surface overflow-x-auto">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  tab === i ? "bg-charcoal text-white shadow-sm" : "text-secondary hover:text-charcoal"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* 탭 0: 대시보드 */}
              {tab === 0 && (
                <div className="flex flex-col gap-5">
                  <div className="bg-white rounded-2xl p-4 border border-surface shadow-sm">
                    <MessageSquare size={18} style={{ color: "#b89a6a" }} className="mb-2" />
                    <p className="text-xl font-bold text-charcoal">{guestbooks.length}</p>
                    <p className="text-xs text-muted mt-0.5">방명록</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-surface shadow-sm">
                    <p className="text-xs text-muted mb-2">입장 코드</p>
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-xl font-bold text-charcoal tracking-widest flex-1">{code}</p>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ivory border border-divider text-xs text-secondary hover:bg-surface transition-colors"
                      >
                        {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                        {copied ? "복사됨" : "복사"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 탭 1: 방명록 관리 */}
              {tab === 1 && (
                <div className="flex flex-col gap-3">
                  {guestbooks.map((gb) => (
                    <div key={gb.id} className="bg-white rounded-2xl p-4 border border-surface shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-charcoal text-sm">
                              {gb.user?.display_name}
                            </span>
                            <span className="text-xs text-muted">
                              {new Date(gb.created_at).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                          <p className="text-sm text-secondary leading-relaxed">{gb.message}</p>
                        </div>
                        <button
                          onClick={() => handleHideGuestbook(gb.id)}
                          className="p-2 text-rose hover:text-rose-light transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {guestbooks.length === 0 && (
                    <div className="text-center py-16 text-muted text-sm">아직 방명록이 없습니다</div>
                  )}
                </div>
              )}

              {/* 탭 2: 공유하기 */}
              {tab === 2 && (
                <div className="flex flex-col gap-5">
                  <div className="bg-white rounded-2xl p-6 border border-surface shadow-sm flex flex-col items-center gap-4">
                    <p className="text-sm font-medium text-charcoal">QR 코드</p>
                    <div className="p-4 bg-white rounded-xl border border-surface">
                      <QRCodeLib value={inviteUrl} size={160} fgColor="#3a3535" />
                    </div>
                    <p className="text-xs text-muted text-center">QR코드를 스캔하면 청첩장이 열립니다</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-surface shadow-sm">
                    <p className="text-xs text-muted mb-2">청첩장 링크</p>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 text-xs text-charcoal bg-ivory rounded-xl px-3 py-2 truncate font-mono">
                        {inviteUrl}
                      </p>
                      <button
                        onClick={handleCopyUrl}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-charcoal text-white text-xs whitespace-nowrap hover:bg-charcoal-dark transition-colors"
                      >
                        {urlCopied ? <Check size={12} /> : <Copy size={12} />}
                        {urlCopied ? "복사됨" : "복사"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-charcoal rounded-2xl p-5 text-white flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm mb-0.5">라이브 슬라이드쇼</p>
                      <p className="text-white/60 text-xs">사진을 자동 슬라이드쇼로 상영</p>
                    </div>
                    <Link
                      to={`/admin/live?weddingId=${wedding.id}`}
                      className="px-4 py-2 bg-gold rounded-xl text-xs hover:bg-gold-light transition-colors whitespace-nowrap"
                    >
                      열기
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
