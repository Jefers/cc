import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const transformations = [
  {
    name: 'Marcus',
    duration: '6 Months',
    result: 'Lost 45 lbs • Gained Muscle',
    image: '/transformation-1.jpg',
  },
  {
    name: 'David',
    duration: '12 Months',
    result: 'Complete Body Recomposition',
    image: '/coach-christian.jpg',
  },
  {
    name: 'Jennifer',
    duration: '8 Months',
    result: 'From Beginner to Competitor',
    image: '/testimonial-hayley.jpg',
  },
  {
    name: 'Team Alpha',
    duration: 'Ongoing',
    result: '50+ Members Transformed',
    image: '/community-1.jpg',
  },
];

const Transformations = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const grid = gridRef.current;

    if (!section || !heading || !grid) return;

    const cards = grid.querySelectorAll('.transformation-card');

    // Heading animation
    gsap.fromTo(
      heading.children,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'top 30%',
          scrub: 0.5,
        },
      }
    );

    // Cards reveal with scale
    gsap.fromTo(
      cards,
      { opacity: 0, scale: 0.5, y: 100 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.15,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 0.5,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section || st.vars.trigger === grid) st.kill();
      });
    };
  }, []);

  return (
    <section
      id="transformations"
      ref={sectionRef}
      className="relative py-24 section-padding"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-yellow" />
            <span className="text-yellow font-oswald text-lg tracking-widest">
              REAL RESULTS
            </span>
          </div>
          <h2 className="heading-lg font-oswald font-bold text-white mb-4">
            <span className="text-yellow">TRANSFORMATIONS</span>
          </h2>
          <p className="body-text max-w-2xl mx-auto">
            These photos show what's possible when you're supported, guided, and believed in.
            Real progress, real confidence, and real results built through consistency and care.
          </p>
        </div>

        {/* Transformations Grid */}
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {transformations.map((item, index) => (
            <div
              key={index}
              className="transformation-card group relative"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                {/* Image */}
                <img
                  src={item.image}
                  alt={`${item.name}'s Transformation`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-yellow font-oswald text-sm tracking-widest mb-1">
                      {item.duration}
                    </p>
                    <h3 className="text-xl font-oswald font-bold text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-white/60 text-sm">{item.result}</p>
                  </div>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow/50 transition-colors duration-300" />

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/60 mb-6 text-lg">
            Start Your Own Transformation Today!
          </p>
          <a
            href="#footer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary inline-flex items-center gap-2 group"
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Transformations;
