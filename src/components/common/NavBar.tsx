import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl text-charcoal tracking-widest">
            MomentIn
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-secondary hover:text-charcoal transition-colors px-4 py-2"
            >
              로그인
            </Link>
            <Link
              to="/create"
              className="text-sm bg-charcoal text-white px-5 py-2 rounded-full hover:bg-charcoal-dark transition-colors"
            >
              제작하기
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-charcoal"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white shadow-lg border-t border-surface md:hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="py-3 px-4 text-sm text-secondary text-center">
                로그인
              </Link>
              <Link
                to="/create"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 text-sm bg-charcoal text-white rounded-xl text-center"
              >
                제작하기
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
