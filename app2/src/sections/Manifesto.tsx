import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Clock, Brain, Target } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Target,
    title: 'Train With Purpose',
    description: 'Every rep counts. Build mental toughness and physical dominance with structured, goal-driven training.',
  },
  {
    icon: Shield,
    title: 'Own The Gym Floor',
    description: 'Walk in with confidence. Master the equipment, know your program, and command respect.',
  },
  {
    icon: Brain,
    title: 'Develop Unbreakable Discipline',
    description: 'The mind gives up before the body. Learn to push past limitations and build mental fortitude.',
  },
  {
    icon: Clock,
    title: 'Maximize Every Session',
    description: 'No wasted time. Efficient, high-impact workouts designed for men who value results.',
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

    // Kill existing triggers
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.trigger === section || st.vars.trigger === featuresEl) st.kill();
    });

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
        if (st.vars.trigger === section || st.vars.trigger === featuresEl) st.kill();
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
            <p className="text-yellow font-oswald text-lg tracking-widest">THE STANDARD</p>
            <h2 className="heading-lg font-oswald font-bold text-white">
              BUILT FOR
              <br />
              <span className="text-yellow">MORE</span>
            </h2>
            <p className="body-text max-w-md">
              You were not designed for mediocrity. Every man has untapped potential waiting 
              to be unleashed. This is your invitation to become stronger, faster, and more 
              resilient than you ever thought possible.
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
              <p className="text-white/60 text-sm tracking-widest mb-4">FREE ASSESSMENT</p>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-oswald font-bold text-yellow mb-6">
                FIND YOUR
                <br />
                EDGE
              </h3>
              <p className="text-white/80 mb-8">
                Book a free consultation. We'll assess your current fitness level, discuss your 
                goals, and map out a strategy to get you there — whether that's Hyrox competition, 
                strength gains, or complete body transformation.
              </p>
              <a 
                href="#footer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-primary w-full sm:w-auto inline-block text-center"
              >
                Book Your Assessment
              </a>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-yellow/40" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-yellow/40" />
          </div>
        </div>

        {/* Features Grid */}
        <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
