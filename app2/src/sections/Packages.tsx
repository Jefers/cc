import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Users, Monitor, Check, ArrowRight, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const packages = [
  {
    id: 'one-to-one',
    icon: User,
    name: 'ONE-TO-ONE',
    subtitle: 'In-Person Coaching',
    description: 'The ultimate personalized experience. Train directly with Christian in the gym for maximum results.',
    features: [
      'In-person sessions at premium facilities',
      'Completely customized training program',
      'Real-time form correction & technique',
      'Nutrition planning & meal guidance',
      'Weekly progress assessments',
      'Direct WhatsApp support',
    ],
    highlight: 'Most Personal',
    color: 'yellow',
  },
  {
    id: 'online',
    icon: Monitor,
    name: 'ONLINE',
    subtitle: 'Remote Coaching',
    description: 'Train anywhere in the world with a program built specifically for you and your goals.',
    features: [
      'Custom training program via app',
      'Video form checks & feedback',
      'Nutrition coaching & macros',
      'Weekly check-in calls',
      '24/7 messaging support',
      'Program adjustments as you progress',
    ],
    highlight: 'Most Flexible',
    color: 'white',
  },
  {
    id: 'group',
    icon: Users,
    name: 'GROUP',
    subtitle: 'Team Training',
    description: 'Train alongside like-minded men. Push each other, compete, and grow together.',
    features: [
      'Small group sessions (4-6 people)',
      'Hyrox-specific training available',
      'Team challenges & competitions',
      'Nutrition workshop access',
      'Community events & meetups',
      'Accountability partnerships',
    ],
    highlight: 'Best Value',
    color: 'white',
  },
];

const Packages = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;

    if (!section || !heading || !cards) return;

    const cardElements = cards.querySelectorAll('.package-card');

    // Kill existing triggers
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.trigger === section || st.vars.trigger === cards) st.kill();
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

    // Cards animation
    gsap.fromTo(
      cardElements,
      { opacity: 0, y: 80, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cards,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 0.5,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section || st.vars.trigger === cards) st.kill();
      });
    };
  }, []);

  return (
    <section
      id="packages"
      ref={sectionRef}
      className="relative py-24 section-padding"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow" />
            <span className="text-yellow font-oswald text-lg tracking-widest">
              TRAINING OPTIONS
            </span>
          </div>
          <h2 className="heading-lg font-oswald font-bold text-white mb-4">
            CHOOSE YOUR <span className="text-yellow">PATH</span>
          </h2>
          <p className="body-text max-w-2xl mx-auto">
            Every man is different. That's why I offer multiple ways to train — 
            from one-to-one intensity to the energy of group sessions. 
            All programs include nutrition guidance and the Built for More mindset.
          </p>
        </div>

        {/* Packages Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="package-card relative"
              onMouseEnter={() => setHoveredPackage(pkg.id)}
              onMouseLeave={() => setHoveredPackage(null)}
            >
              <div
                className={`h-full rounded-2xl p-8 transition-all duration-500 ${
                  pkg.id === 'one-to-one'
                    ? 'bg-yellow/10 border-2 border-yellow/50'
                    : 'glass border border-white/10'
                } ${hoveredPackage === pkg.id ? 'scale-[1.02]' : ''}`}
              >
                {/* Highlight Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-xs font-oswald font-bold ${
                    pkg.id === 'one-to-one'
                      ? 'bg-yellow text-black'
                      : 'bg-white/10 text-white'
                  }`}>
                    {pkg.highlight}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                  pkg.id === 'one-to-one' ? 'bg-yellow/20' : 'bg-white/5'
                }`}>
                  <pkg.icon className={`w-8 h-8 ${
                    pkg.id === 'one-to-one' ? 'text-yellow' : 'text-white'
                  }`} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-oswald font-bold text-white mb-1">
                  {pkg.name}
                </h3>
                <p className="text-yellow text-sm font-oswald mb-4">{pkg.subtitle}</p>

                {/* Description */}
                <p className="text-white/60 text-sm mb-6">{pkg.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        pkg.id === 'one-to-one' ? 'text-yellow' : 'text-white/60'
                      }`} />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="#footer"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-all duration-300 group ${
                    pkg.id === 'one-to-one'
                      ? 'bg-yellow text-black hover:shadow-glow'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-white/40 text-sm">
            All packages include nutrition planning, supplement guidance, and access to the Built for More community.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Packages;
