<<<<<<< Updated upstream
import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
=======
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CreatePage from "./pages/CreatePage";
import ManagePage from "./pages/ManagePage";
import TemplatesPage from "./pages/TemplatesPage";
import InvitePage from "./pages/InvitePage";
import RsvpPage from "./pages/RsvpPage";
import AdminLivePage from "./pages/AdminLivePage";
import LoginCallbackPage from "./pages/LoginCallbackPage";

>>>>>>> Stashed changes
import QR from "./pages/QR";
import ShowQR from "./pages/showQR";
import { Routes, Route } from 'react-router-dom';
import QRview from './pages/QRview';
import GalleryPage from "./pages/GalleryPage";
import GuestGalleryPage from "./pages/guest/GalleryPage";
import GuestPage from "./pages/guest/MobileHomePage";

function App() {
  return (
<<<<<<< Updated upstream
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/qr/:code" element={<QR />} />
      <Route path="/show/:code" element={<ShowQR />} />
      <Route path="/qrview/:code" element={<QRview />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/guest" element={<GuestPage />} />
      <Route path="/guestgallery" element={<GuestGalleryPage />} />
    </Routes>
=======
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/invite/:code" element={<InvitePage />} />
        <Route path="/rsvp/:code" element={<RsvpPage />} />
        <Route path="/event/:code" element={<Navigate to="/" replace />} />
        <Route path="/admin/live" element={<AdminLivePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login/callback" element={<LoginCallbackPage />} />

        <Route path="/qr/:code" element={<QR />} />
        <Route path="/show/:code" element={<ShowQR />} />
        <Route path="/qrview/:code" element={<QRview />}  />
      
      </Routes>
    </BrowserRouter>
>>>>>>> Stashed changes
  );
}

export default App;
