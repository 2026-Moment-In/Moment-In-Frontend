import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';
import QR from './pages/QR';
import ShowQR from './pages/showQR';
import QRview from './pages/QRview';
import GalleryPage from './pages/GalleryPage';
import GuestGalleryPage from './pages/guest/GalleryPage';
import GuestPage from './pages/guest/MobileHomePage';
import DashboardPage from './pages/DashboardPage';
import WeddingPage from './pages/WeddingPage';
import LiveScreenPage from './pages/LiveScreenPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LandingPage />} />
      <Route path="/enter" element={<GuestPage />} />
      <Route path="/admin" element={<DashboardPage />} />
      <Route path="/admin/create" element={<EditorPage />} />
      <Route path="/admin/dashboard/:id" element={<DashboardPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/qr/:code" element={<QR />} />
      <Route path="/show/:code" element={<ShowQR />} />
      <Route path="/qrview/:code" element={<QRview />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/gallery/:code" element={<GalleryPage />} />
      <Route path="/guest" element={<GuestPage />} />
      <Route path="/guestgallery" element={<GuestGalleryPage />} />
      <Route path="/guestgallery/:code" element={<GuestGalleryPage />} />
      <Route path="/wedding/:code/*" element={<WeddingPage />} />
      <Route path="/live/:code" element={<LiveScreenPage />} />
    </Routes>
  );
}

export default App;
