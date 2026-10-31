import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

function ScrollToTopFAB() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full text-white shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 animate-fade-in flex items-center justify-center border border-white/20 backdrop-blur-md"
      style={{
        background: 'var(--gradient-primary)',
        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
      }}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

export default ScrollToTopFAB;
