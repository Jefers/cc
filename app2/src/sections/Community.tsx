import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, ArrowRight, Calendar, MapPin, Trophy } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const upcomingEvents = [
  {
    name: 'Hyrox Simulation Race',
    date: 'Feb 15, 2025',
    location: 'London',
    type: 'Competition',
  },
  {
    name: 'Built for More Challenge',
    date: 'Mar 1, 2025',
    location: 'Online',
    type: '30-Day Challenge',
  },
  {
    name: 'Strength Camp Weekend',
    date: 'Mar 22, 2025',
    location: 'Manchester',
    type: 'Training Camp',
  },
];

const Community = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;
    const events = eventsRef.current;

    if (!section || !heading || !cards || !events) return;

    const cardElements = cards.querySelectorAll('.community-card');
    const eventElements = events.querySelectorAll('.event-item');

    // Kill existing triggers
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.trigger === section || st.vars.trigger === cards || st.vars.trigger === events) st.kill();
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

    // Cards unstack animation
    cardElements.forEach((card, index) => {
      gsap.fromTo(
        card,
        {
          opacity: 0,
          scale: 0.8,
          rotation: 0,
        },
        {
          opacity: 1,
          scale: 1,
          rotation: (index % 2 === 0 ? -5 : 5),
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cards,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 0.5,
          },
        }
      );
    });

    // Events animation
    gsap.fromTo(
      eventElements,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: events,
          start: 'top 80%',
          end: 'top 40%',
          scrub: 0.5,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section || st.vars.trigger === cards || st.vars.trigger === events) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 section-padding overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left - Content */}
          <div ref={headingRef} className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-yellow" />
                <span className="text-yellow font-oswald text-lg tracking-widest">
                  THE BROTHERHOOD
                </span>
              </div>
              <h2 className="heading-lg font-oswald font-bold text-white mb-4">
                BUILT FOR <span className="text-yellow">MORE</span>
              </h2>
              <p className="body-text max-w-lg mb-6">
                This isn't just training — it's a movement. When you join Christian Coaching, 
                you become part of a brotherhood of men who refuse to accept mediocrity. 
                We train together, compete together, and elevate each other.
              </p>
              <p className="body-text max-w-lg">
                From Hyrox race days to strength challenges, nutrition workshops to recovery 
                sessions — every event is designed to push you further and forge unbreakable bonds.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: '200+', label: 'Active Members' },
                { value: '50+', label: 'Weekly Sessions' },
                { value: '12', label: 'Events Per Year' },
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
              <span>Join The Brotherhood</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Right - Events & Photos */}
          <div className="space-y-8">
            {/* Upcoming Events */}
            <div ref={eventsRef}>
              <h3 className="text-xl font-oswald font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow" />
                UPCOMING EVENTS
              </h3>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="event-item glass rounded-xl p-4 hover:border-yellow/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-yellow" />
                          <span className="text-yellow text-xs font-oswald">{event.type}</span>
                        </div>
                        <h4 className="text-white font-oswald font-bold group-hover:text-yellow transition-colors">
                          {event.name}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-white/60 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-yellow transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Stack */}
            <div ref={cardsRef} className="relative h-[300px] hidden lg:block">
              {[
                { src: '/community-1.jpg', rotation: -8 },
                { src: '/transformation-1.jpg', rotation: 5 },
                { src: '/coach-christian.jpg', rotation: -3 },
              ].map((img, index) => (
                <div
                  key={index}
                  className="community-card absolute top-0 left-1/2 -translate-x-1/2 w-56 h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10"
                  style={{
                    zIndex: 3 - index,
                    marginLeft: `${(index - 1) * 30}px`,
                    marginTop: `${index * 20}px`,
                  }}
                >
                  <img
                    src={img.src}
                    alt={`Community ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
