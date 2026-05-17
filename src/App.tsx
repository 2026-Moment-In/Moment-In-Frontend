import LandingPage from "./pages/LandingPage";
import EditorPage from "./pages/EditorPage";
<<<<<<< HEAD
import QR from "./pages/QR";
import ShowQR from "./pages/showQR";
import { Routes, Route } from 'react-router-dom';
import QRview from './pages/QRview';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/qr/:code" element={<QR />} />
      <Route path="/show/:code" element={<ShowQR />} />
      <Route path="/qrview/:code" element={<QRview />} />
    </Routes>
  );
=======

function App() {
  return <EditorPage />;
>>>>>>> origin/main
}

export default App;
