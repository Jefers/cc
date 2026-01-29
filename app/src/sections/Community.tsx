import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const communityImages = [
  { src: '/community-1.jpg', rotation: -8, x: -30, y: 20 },
  { src: '/transformation-1.jpg', rotation: 5, x: 20, y: -10 },
  { src: '/coach-christian.jpg', rotation: -3, x: -10, y: 30 },
  { src: '/testimonial-hayley.jpg', rotation: 10, x: 40, y: 10 },
];

const Community = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;

    if (!section || !heading || !cards) return;

    const cardElements = cards.querySelectorAll('.community-card');

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

    // Cards unstack animation
    cardElements.forEach((card, index) => {
      const data = communityImages[index];
      gsap.fromTo(
        card,
        {
          opacity: 0,
          scale: 0.8,
          rotation: 0,
          x: 0,
          y: 0,
        },
        {
          opacity: 1,
          scale: 1,
          rotation: data.rotation,
          x: `${data.x}%`,
          y: `${data.y}%`,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cards,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 0.5,
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section || st.vars.trigger === cards) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 section-padding overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Content */}
          <div ref={headingRef} className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-yellow" />
                <span className="text-yellow font-oswald text-lg tracking-widest">
                  THE SQUAD
                </span>
              </div>
              <h2 className="heading-lg font-oswald font-bold text-white mb-4">
                A COMMUNITY THAT{' '}
                <span className="text-yellow">LIFTS YOU UP</span>
              </h2>
              <p className="body-text max-w-lg">
                When you join Christian Coaching, you join a brotherhood of men who support
                each other, celebrate wins together, and push each other to be better.
                Through group workouts, challenges, and team events, you'll build
                confidence and connections that last a lifetime.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: '200+', label: 'Active Members' },
                { value: '50+', label: 'Weekly Workouts' },
                { value: '12', label: 'Monthly Events' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl sm:text-3xl font-oswald font-bold text-yellow">
                    {stat.value}
                  </p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="#footer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary inline-flex items-center gap-2 group"
            >
              <span>Join The Community</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Right - Stacked Photos */}
          <div
            ref={cardsRef}
            className="relative h-[500px] hidden lg:block"
          >
            {communityImages.map((img, index) => (
              <div
                key={index}
                className="community-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10"
                style={{
                  zIndex: communityImages.length - index,
                }}
              >
                <img
                  src={img.src}
                  alt={`Community ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Polaroid-style bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-white/10 backdrop-blur-sm" />
              </div>
            ))}

            {/* Decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
