import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
import QR from "./pages/QR";
import ShowQR from "./pages/showQR";
import QRview from './pages/QRview';
import LoginPage from "./pages/LoginPage";
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/qr/:code" element={<QR />} />
      <Route path="/show/:code" element={<ShowQR />} />
      <Route path="/qrview/:code" element={<QRview />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
