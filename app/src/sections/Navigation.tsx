import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Home', id: 'hero' },
    { label: 'About', id: 'meet-coach' },
    { label: 'Method', id: 'method' },
    { label: 'Results', id: 'transformations' },
    { label: 'Contact', id: 'footer' },
  ];

  return (
    <>
      {/* Floating Navigation Pill */}
      <nav 
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="glass rounded-full px-2 py-2 flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-yellow transition-colors rounded-full hover:bg-white/5"
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`fixed top-6 right-6 z-50 p-3 glass rounded-full transition-all duration-300 ${
          isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-yellow" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-dark/95 backdrop-blur-xl transition-all duration-500 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-3xl font-oswald font-bold text-white hover:text-yellow transition-colors"
              style={{
                transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
                opacity: isMobileMenuOpen ? 1 : 0,
                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero CTA Button - Only visible on hero */}
      <div 
        className={`fixed top-6 right-6 z-50 transition-all duration-500 ${
          !isScrolled 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <a
          href="#footer"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('footer');
          }}
          className="btn-glass text-sm flex items-center gap-2"
        >
          <span>Enquire Here</span>
        </a>
      </div>
    </>
  );
};

export default Navigation;
