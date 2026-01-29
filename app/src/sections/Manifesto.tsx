import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Clock, Brain } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Shield,
    title: 'Feel Safe Walking Into the Gym',
    description: 'Simple mindset shifts and grounding tools to calm nerves and reduce overthinking.',
  },
  {
    icon: Clock,
    title: 'What to Do in Your First 10 Minutes',
    description: 'A step-by-step plan so you know exactly where to start and how long to stay.',
  },
  {
    icon: Brain,
    title: 'How to Handle Gym Anxiety',
    description: 'Quick resets and confidence-building reminders for those challenging moments.',
  },
];

const Manifesto = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const card = cardRef.current;
    const featuresEl = featuresRef.current;

    if (!section || !heading || !card || !featuresEl) return;

    const featureCards = featuresEl.querySelectorAll('.feature-card');

    // Entrance animation
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 20%',
        scrub: 0.5,
      },
    });

    scrollTl
      .fromTo(
        heading.children,
        { opacity: 0, x: -100 },
        { opacity: 1, x: 0, stagger: 0.1, ease: 'power2.out' }
      )
      .fromTo(
        card,
        { opacity: 0, x: 100, rotateY: -30 },
        { opacity: 1, x: 0, rotateY: 0, ease: 'power2.out' },
        '<'
      )
      .fromTo(
        featureCards,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, stagger: 0.1, ease: 'power2.out' },
        '-=0.3'
      );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      className="relative min-h-screen py-24 section-padding flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Left - Heading */}
          <div ref={headingRef} className="space-y-4">
            <p className="text-yellow font-oswald text-lg tracking-widest">WELCOME TO</p>
            <h2 className="heading-lg font-oswald font-bold text-white">
              GET YOUR
              <br />
              <span className="text-yellow">FREE</span>
            </h2>
            <p className="body-text max-w-md">
              A free, beginner-friendly guide to help you feel confident, prepared, and empowered in the gym — even if you're starting from scratch.
            </p>
          </div>

          {/* Right - Glass Card */}
          <div
            ref={cardRef}
            className="glass-yellow rounded-3xl p-8 sm:p-12 relative overflow-hidden group"
            style={{ perspective: '1000px' }}
          >
            {/* Glow Effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow/20 rounded-full blur-3xl group-hover:bg-yellow/30 transition-all duration-500" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow/10 rounded-full blur-3xl group-hover:bg-yellow/20 transition-all duration-500" />

            <div className="relative z-10">
              <p className="text-white/60 text-sm tracking-widest mb-4">ALPHA MALE</p>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-oswald font-bold text-yellow mb-6">
                GUIDE
              </h3>
              <p className="text-white/80 mb-8">
                Master the fundamentals of gym confidence with proven strategies from elite coaching.
              </p>
              <button className="btn-primary w-full sm:w-auto">
                Get Your Guide
              </button>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-yellow/40" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-yellow/40" />
          </div>
        </div>

        {/* Features Grid */}
        <div ref={featuresRef} className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card glass rounded-2xl p-6 hover:border-yellow/30 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow/10 flex items-center justify-center mb-4 group-hover:bg-yellow/20 transition-colors">
                <feature.icon className="w-6 h-6 text-yellow" />
              </div>
              <h4 className="text-lg font-oswald font-semibold text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Manifesto;
