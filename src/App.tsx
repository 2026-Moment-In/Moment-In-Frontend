import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LoginCallbackPage from "./pages/LoginPageCallback";
import CreatePage from "./pages/CreatePage";
import ManagePage from "./pages/ManagePage";
import TemplatesPage from "./pages/TemplatesPage";
import InvitePage from "./pages/InvitePage";
import AdminLivePage from "./pages/AdminLivePage";
import QR from "./pages/QR";
import ShowQR from "./pages/showQR";
import QRview from "./pages/QRview";
import GalleryPage from "./pages/GalleryPage";
import GuestGalleryPage from "./pages/guest/GalleryPage";
import GuestPage from "./pages/guest/MobileHomePage";
import "./styles.css";

function App() {
  return (
    <Routes>
      {/* 관리자 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<LoginCallbackPage />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/manage" element={<ManagePage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/invite/:code" element={<InvitePage />} />
      <Route path="/admin/live" element={<AdminLivePage />} />
      <Route path="/gallery-admin" element={<GalleryPage />} />

      {/* QR / 코드 */}
      <Route path="/qr/:code" element={<QR />} />
      <Route path="/qrview/:code" element={<QRview />} />

      {/* 하객 */}
      <Route path="/guest" element={<GuestPage />} />
      <Route path="/show/:code" element={<ShowQR />} />
      <Route path="/gallery/:code" element={<GuestGalleryPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
