import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
import QR from "./pages/QR";
import ShowQR from "./pages/showQR";
import { Routes, Route } from 'react-router-dom';
import QRview from './pages/QRview';
import GalleryPage from "./pages/GalleryPage";
import GuestGalleryPage from "./pages/guest/GalleryPage";
import GuestPage from "./pages/guest/MobileHomePage";

function App() {
  return (
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
  );
}

export default App;
