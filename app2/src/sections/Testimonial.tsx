import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, Trophy } from 'lucide-react';

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

    // Kill existing triggers
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.trigger === section) st.kill();
    });

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
          src="/transformation-1.jpg"
          alt="Client Transformation"
          className="w-full h-full object-cover scale-110"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-dark/80" />
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
            {/* Featured Badge */}
            <div className="quote-text flex items-center gap-2 mb-8">
              <Trophy className="w-5 h-5 text-yellow" />
              <span className="text-yellow font-oswald text-sm tracking-widest">HYROX FINISHER</span>
            </div>

            {/* Quote Icon */}
            <div className="quote-text mb-8">
              <Quote className="w-16 h-16 text-yellow/40" />
            </div>

            {/* Quote Text */}
            <blockquote className="quote-text mb-8">
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-oswald font-bold text-white leading-tight">
                I went from struggling to run 5km to finishing my first{' '}
                <span className="text-yellow">Hyrox race in under 90 minutes.</span>{' '}
                Christian didn't just train my body — he rebuilt my mindset. 
                Now I'm stronger, faster, and more confident than I've ever been.
              </p>
            </blockquote>

            {/* Attribution */}
            <div className="quote-text flex items-center gap-4">
              <div className="w-16 h-px bg-yellow" />
              <div>
                <p className="text-xl font-oswald font-bold text-white">James</p>
                <p className="text-white/60">Hyrox Competitor • Lost 35kg • 6 Months Training</p>
              </div>
            </div>

            {/* Stats */}
            <div className="quote-text mt-8 flex flex-wrap gap-6">
              <div className="glass rounded-lg px-4 py-2">
                <span className="text-yellow font-oswald font-bold">1:28:45</span>
                <span className="text-white/60 text-sm ml-2">Hyrox Time</span>
              </div>
              <div className="glass rounded-lg px-4 py-2">
                <span className="text-yellow font-oswald font-bold">-35kg</span>
                <span className="text-white/60 text-sm ml-2">Body Fat</span>
              </div>
              <div className="glass rounded-lg px-4 py-2">
                <span className="text-yellow font-oswald font-bold">+15kg</span>
                <span className="text-white/60 text-sm ml-2">Muscle Gained</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
