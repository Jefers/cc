import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Dumbbell, Apple, Brain, Repeat, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    icon: Target,
    title: 'Train With Intention',
    description: 'No more guessing. Every session has purpose, structure, and clarity so you always know exactly what you\'re doing and why.',
    color: 'from-yellow/20 to-yellow/5',
  },
  {
    icon: Dumbbell,
    title: 'Build Strength You\'re Proud Of',
    description: 'Progressive, empowering training that helps you feel stronger week by week — physically and mentally.',
    color: 'from-yellow/20 to-yellow/5',
  },
  {
    icon: Apple,
    title: 'Fuel Your Body With Freedom',
    description: 'Learn how to nourish yourself without restriction, guilt, or confusion so you can feel energized and confident.',
    color: 'from-yellow/20 to-yellow/5',
  },
  {
    icon: Brain,
    title: 'Strengthen Your Mindset',
    description: 'Shift from self-doubt to self-belief with simple mindset tools that help you stay grounded and consistent.',
    color: 'from-yellow/20 to-yellow/5',
  },
  {
    icon: Repeat,
    title: 'Create Habits That Last',
    description: 'Build routines that fit your real life — sustainable, flexible, and designed to help you grow long-term.',
    color: 'from-yellow/20 to-yellow/5',
  },
  {
    icon: Users,
    title: 'Feel Supported Every Step',
    description: 'You\'re never doing this alone. Coaching gives you accountability, encouragement, and a community that gets it.',
    color: 'from-yellow/20 to-yellow/5',
  },
];

const Method = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const grid = gridRef.current;

    if (!section || !heading || !grid) return;

    const cards = grid.querySelectorAll('.pillar-card');

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

    // Cards animation
    gsap.fromTo(
      cards,
      { opacity: 0, y: 80, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.1,
        ease: 'power2.out',
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
      id="method"
      ref={sectionRef}
      className="relative py-24 section-padding"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16">
          <p className="text-yellow font-oswald text-lg tracking-widest mb-4">
            WHAT COACHING HELPS YOU ACHIEVE
          </p>
          <h2 className="heading-lg font-oswald font-bold text-white max-w-4xl mx-auto">
            BECOME THE <span className="text-yellow">STRONGEST</span>, MOST{' '}
            <span className="text-yellow">CONFIDENT</span> VERSION OF YOU
          </h2>
        </div>

        {/* Pillars Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="pillar-card group relative"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div
                className={`relative h-full glass rounded-2xl p-6 sm:p-8 overflow-hidden transition-all duration-500 ${
                  activeIndex === index ? 'border-yellow/50 scale-[1.02]' : ''
                }`}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-yellow/10 flex items-center justify-center mb-6 group-hover:bg-yellow/20 group-hover:scale-110 transition-all duration-300">
                    <pillar.icon className="w-7 h-7 text-yellow" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-oswald font-bold text-white mb-3 group-hover:text-yellow transition-colors">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                    {pillar.description}
                  </p>
                </div>

                {/* Number Badge */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="text-xs font-oswald text-white/40">
                    0{index + 1}
                  </span>
                </div>

                {/* Hover Glow */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/60 mb-6">
            Ready to start your transformation?
          </p>
          <a
            href="#footer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary inline-flex items-center gap-2 group"
          >
            <span>Let's Talk About Your Goals</span>
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Method;
