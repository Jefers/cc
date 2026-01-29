import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const subheading = subheadingRef.current;
    const cta = ctaRef.current;

    if (!section || !heading || !subheading || !cta) return;

    const letters = heading.querySelectorAll('.letter');

    // Initial entrance animation
    const tl = gsap.timeline({ delay: 0.5 });

    tl.fromTo(
      letters,
      {
        opacity: 0,
        y: 100,
        rotateX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'back.out(1.7)',
      }
    )
      .fromTo(
        subheading,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.3'
      )
      .fromTo(
        cta,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
        '-=0.2'
      );

    // Scroll-triggered exit animation
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: 0.5,
      },
    });

    scrollTl
      .to(letters, {
        opacity: 0,
        y: -100,
        stagger: 0.02,
        ease: 'power2.in',
      })
      .to(
        subheading,
        {
          opacity: 0,
          y: -50,
          ease: 'power2.in',
        },
        '<'
      )
      .to(
        cta,
        {
          opacity: 0,
          scale: 0.5,
          ease: 'power2.in',
        },
        '<'
      );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, []);

  const name = 'CHRISTIAN';

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center section-padding"
    >
      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Main Heading */}
        <h1
          ref={headingRef}
          className="heading-xl font-oswald font-bold text-white mb-4"
          style={{ perspective: '1000px' }}
        >
          {name.split('').map((letter, index) => (
            <span
              key={index}
              className="letter inline-block"
              style={{
                transformStyle: 'preserve-3d',
                textShadow: '0 0 40px rgba(241, 255, 0, 0.3)',
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Subheading */}
        <p
          ref={subheadingRef}
          className="text-xl sm:text-2xl md:text-3xl font-oswald tracking-[0.3em] text-yellow mb-12"
        >
          COACHING
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#manifesto"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('manifesto')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary text-lg flex items-center gap-2 group"
          >
            <span>Start Your Journey</span>
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#meet-coach"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('meet-coach')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-glass text-lg"
          >
            Meet Your Coach
          </a>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-xs text-white/50 tracking-widest">SCROLL</span>
        <div className="w-px h-12 bg-gradient-to-b from-yellow to-transparent" />
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 border-l-2 border-t-2 border-yellow/20" />
      <div className="absolute bottom-20 right-10 w-20 h-20 border-r-2 border-b-2 border-yellow/20" />
    </section>
  );
};

export default Hero;
