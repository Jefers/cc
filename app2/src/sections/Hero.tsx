import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const subheading = subheadingRef.current;
    const heading = headingRef.current;
    const cta = ctaRef.current;
    const contentWrapper = contentWrapperRef.current;

    if (!section || !subheading || !heading || !cta || !contentWrapper) return;

    const letters = heading.querySelectorAll('.letter');

    // Kill any existing ScrollTriggers for this section
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.trigger === section) st.kill();
    });

    // Initial entrance animation - runs on page load
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(
      subheading,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
    .fromTo(
      letters,
      {
        opacity: 0,
        y: 80,
        rotateX: -60,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: 'back.out(1.4)',
      },
      '-=0.2'
    )
    .fromTo(
      cta,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    );

    // Scroll-triggered animation - letters fade out as you scroll, but CTA stays longer
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=80%',
        pin: true,
        scrub: 0.8,
        onLeaveBack: () => {
          // Reset all elements when scrolling back to top
          gsap.set([subheading, ...letters, cta], { opacity: 1, y: 0, x: 0 });
        }
      },
    });

    // Subheading fades out first
    scrollTl.to(subheading, {
      opacity: 0,
      y: -30,
      ease: 'power2.in',
    }, 0);

    // Letters fade out one by one with stagger
    scrollTl.to(letters, {
      opacity: 0,
      y: -60,
      stagger: 0.03,
      ease: 'power2.in',
    }, 0.1);

    // CTA buttons stay visible longer and fade out near the end
    scrollTl.to(cta, {
      opacity: 0,
      y: -40,
      ease: 'power2.in',
    }, 0.5);

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
      className="relative min-h-screen flex flex-col items-center justify-center section-padding overflow-hidden"
    >
      {/* Main Content */}
      <div ref={contentWrapperRef} className="relative z-10 text-center">
        {/* Subheading - NOW FIRST */}
        <p
          ref={subheadingRef}
          className="text-xl sm:text-2xl md:text-3xl font-oswald tracking-[0.4em] text-yellow mb-6"
        >
          COACH
        </p>

        {/* Main Heading */}
        <h1
          ref={headingRef}
          className="heading-xl font-oswald font-bold text-white mb-10"
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

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-white/70 mb-10 font-light tracking-wide">
          Built for More. Training for Life.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#packages"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
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
