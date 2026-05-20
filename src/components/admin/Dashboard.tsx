import { useState } from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import { Copy, ExternalLink, Check, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  entryCode: string;
}

export default function Dashboard({ entryCode }: DashboardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const eventUrl = `${window.location.origin}/event/${entryCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(entryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-sm border border-[#f0ece6] p-8"
      >
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="p-4 bg-white rounded-2xl border border-[#ede8e2] shadow-sm">
              <QRCode
                value={eventUrl}
                size={160}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                fgColor="#3a3535"
              />
            </div>
            <p className="text-xs text-[#8c8585] text-center">QR 코드로 바로 입장</p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p className="text-xs text-[#8c8585] mb-2 tracking-widest uppercase">입장 코드</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#f7f4ef] border border-[#ede8e2] rounded-xl px-5 py-3.5">
                  <span className="font-serif text-2xl text-[#3a3535] tracking-widest">{entryCode}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-3.5 bg-[#b89a6a] text-white rounded-xl hover:bg-[#a08555] transition-colors flex-shrink-0"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              {copied && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[#8a9e8a] mt-1.5"
                >
                  코드가 복사되었습니다!
                </motion.p>
              )}
            </div>

            <div>
              <p className="text-xs text-[#8c8585] mb-2 tracking-widest uppercase">이벤트 URL</p>
              <div className="flex items-center gap-2 text-xs text-[#8c8585] bg-[#f7f4ef] rounded-xl px-4 py-3 break-all">
                <span className="flex-1">{eventUrl}</span>
                <a
                  href={eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-[#b89a6a] hover:text-[#a08555]"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <button
              onClick={() => navigate("/admin/live")}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#3a3535] text-white rounded-xl text-sm hover:bg-[#b89a6a] transition-colors"
            >
              <Monitor size={16} />
              라이브 스크린 열기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
