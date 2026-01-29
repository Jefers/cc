import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Testimonial = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const quote = quoteRef.current;
    const lens = lensRef.current;

    if (!section || !image || !quote || !lens) return;

    // Parallax on image
    gsap.to(image.querySelector('img'), {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
    });

    // Quote reveal with clip-path
    gsap.fromTo(
      lens,
      { clipPath: 'circle(0% at 50% 50%)' },
      {
        clipPath: 'circle(150% at 50% 50%)',
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          end: 'top 20%',
          scrub: 0.5,
        },
      }
    );

    // Quote text animation
    const quoteElements = quote.querySelectorAll('.quote-text');
    gsap.fromTo(
      quoteElements,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 50%',
          end: 'top 20%',
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

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-24 overflow-hidden"
    >
      {/* Background Image */}
      <div ref={imageRef} className="absolute inset-0">
        <img
          src="/testimonial-hayley.jpg"
          alt="Client Transformation"
          className="w-full h-full object-cover scale-110"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-dark/70" />
      </div>

      {/* Lens Reveal Container */}
      <div
        ref={lensRef}
        className="absolute inset-0"
        style={{ clipPath: 'circle(0% at 50% 50%)' }}
      >
        <div className="absolute inset-0 bg-yellow/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center section-padding">
        <div className="max-w-5xl mx-auto w-full">
          <div ref={quoteRef} className="relative">
            {/* Quote Icon */}
            <div className="quote-text mb-8">
              <Quote className="w-16 h-16 text-yellow/40" />
            </div>

            {/* Quote Text */}
            <blockquote className="quote-text mb-8">
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-oswald font-bold text-white leading-tight">
                Christian hasn't just helped me change my body; he has{' '}
                <span className="text-yellow">completely transformed my life.</span> His
                support, encouragement, and belief in me helped me find a genuine love
                for the gym — a passion I've now turned into a career.
              </p>
            </blockquote>

            {/* Attribution */}
            <div className="quote-text flex items-center gap-4">
              <div className="w-16 h-px bg-yellow" />
              <div>
                <p className="text-xl font-oswald font-bold text-white">Hayley</p>
                <p className="text-white/60">Personal Trainer & Online Coach</p>
              </div>
            </div>

            {/* Featured Badge */}
            <div className="quote-text absolute -top-4 right-0 glass-yellow rounded-full px-4 py-2">
              <span className="text-sm font-oswald text-yellow">Featured Story</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-yellow' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Testimonial;
