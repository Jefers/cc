import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram, Youtube, Mail, MapPin, Phone, ArrowRight, Check, Trophy } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    const elements = content.querySelectorAll('.footer-reveal');

    // Kill existing triggers
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.trigger === section) st.kill();
    });

    gsap.fromTo(
      elements,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 40%',
          scrub: 0.5,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="footer"
      ref={sectionRef}
      className="relative py-24 section-padding"
    >
      {/* CTA Section */}
      <div ref={contentRef} className="max-w-7xl mx-auto">
        <div className="footer-reveal glass-yellow rounded-3xl p-8 sm:p-12 lg:p-16 mb-16 text-center relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow/20 rounded-full blur-[100px]" />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow" />
              <span className="text-yellow font-oswald text-lg tracking-widest">
                YOUR JOURNEY STARTS NOW
              </span>
            </div>
            <h2 className="heading-md font-oswald font-bold text-white mb-4">
              ARE YOU <span className="text-yellow">BUILT FOR MORE</span>?
            </h2>
            <p className="body-text max-w-xl mx-auto mb-8">
              Stop making excuses. Start making progress. Book your free consultation 
              and let's build the strongest version of you — whether that's Hyrox competition, 
              serious strength gains, or complete body transformation.
            </p>
            <a
              href="mailto:christian@builtformore.com"
              className="btn-primary inline-flex items-center gap-2 text-lg group"
            >
              <span>Book Your Free Call</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="footer-reveal lg:col-span-2">
            <h3 className="text-3xl font-oswald font-bold text-white mb-4">
              COACH <span className="text-yellow">CHRISTIAN</span>
            </h3>
            <p className="text-white/60 mb-4 max-w-md">
              Hyrox Competitor • Strength Coach • Nutrition Specialist
            </p>
            <p className="text-white/60 mb-6 max-w-md">
              Helping men become unstoppable through proven training methods, 
              science-backed nutrition, and the Built for More mindset.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/40 focus:outline-none focus:border-yellow/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  isSubmitted
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow text-black hover:shadow-glow'
                }`}
              >
                {isSubmitted ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="footer-reveal">
            <h4 className="text-lg font-oswald font-bold text-white mb-4">QUICK LINKS</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', id: 'hero' },
                { label: 'About', id: 'meet-coach' },
                { label: 'Packages', id: 'packages' },
                { label: 'Method', id: 'method' },
                { label: 'Results', id: 'transformations' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-white/60 hover:text-yellow transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-reveal">
            <h4 className="text-lg font-oswald font-bold text-white mb-4">CONTACT</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/60">
                <Mail className="w-4 h-4 text-yellow" />
                <span>christian@builtformore.com</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Phone className="w-4 h-4 text-yellow" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <MapPin className="w-4 h-4 text-yellow mt-1" />
                <span>Tokyo, JP<br/>Lisburn, UK</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow/20 transition-colors"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow/20 transition-colors"
              >
                <Youtube className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-reveal pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2026 Coach Christian. Built for More.
          </p>
          <div className="flex gap-6">
            <button className="text-white/40 hover:text-white text-sm transition-colors">
              Privacy Policy
            </button>
            <button className="text-white/40 hover:text-white text-sm transition-colors">
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Large Background Text */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
        <p className="text-[15vw] font-oswald font-bold text-white/[0.02] whitespace-nowrap leading-none">
          BUILT FOR MORE
        </p>
      </div>
    </footer>
  );
};

export default Footer;
