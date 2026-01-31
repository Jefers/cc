import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, ArrowRight, Trophy, Flame, Dumbbell } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const transformations = [
  {
    name: 'Marcus',
    duration: '8 Months',
    result: 'Hyrox Competitor • -28kg',
    highlight: 'First Race: 1:35:22',
    image: '/transformation-1.jpg',
    icon: Trophy,
  },
  {
    name: 'David',
    duration: '12 Months',
    result: 'Strength Focus • +12kg Muscle',
    highlight: 'Deadlift: 200kg',
    image: '/coach-christian.jpg',
    icon: Dumbbell,
  },
  {
    name: 'Ryan',
    duration: '6 Months',
    result: 'Body Recomp • -18% Body Fat',
    highlight: 'Complete Transformation',
    image: '/testimonial-hayley.jpg',
    icon: Flame,
  },
  {
    name: 'The Brotherhood',
    duration: 'Ongoing',
    result: '500+ Men Transformed',
    highlight: 'Built for More Community',
    image: '/community-1.jpg',
    icon: TrendingUp,
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

    // Kill existing triggers
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.trigger === section || st.vars.trigger === grid) st.kill();
    });

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
              PROVEN RESULTS
            </span>
          </div>
          <h2 className="heading-lg font-oswald font-bold text-white mb-4">
            <span className="text-yellow">TRANSFORMATIONS</span>
          </h2>
          <p className="body-text max-w-2xl mx-auto">
            These men started exactly where you are. Through consistent training, 
            proper nutrition, and unwavering discipline, they've built bodies and 
            mindsets that command respect.
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
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                {/* Achievement Badge */}
                <div className="absolute top-4 right-4">
                  <div className="glass-yellow rounded-full p-2">
                    <item.icon className="w-5 h-5 text-yellow" />
                  </div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-yellow font-oswald text-sm tracking-widest mb-1">
                      {item.duration}
                    </p>
                    <h3 className="text-xl font-oswald font-bold text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-white/60 text-sm mb-2">{item.result}</p>
                    <div className="glass-yellow rounded-lg px-3 py-1 inline-block">
                      <span className="text-yellow text-sm font-oswald font-bold">
                        {item.highlight}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow/50 transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/60 mb-6 text-lg">
            Your transformation starts with a single decision.
          </p>
          <a
            href="#footer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary inline-flex items-center gap-2 group"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Transformations;
