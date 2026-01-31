import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, MessageSquare, Trophy, Dumbbell, Flame } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Marcus',
    title: 'Hyrox Changed Everything',
    quote: 'I never thought I could compete in something like Hyrox. Christian showed me what I was capable of. Finished my first race and already signed up for the next one.',
    rating: 5,
    badge: 'Hyrox Finisher',
    icon: Trophy,
  },
  {
    name: 'David',
    title: 'Finally Seeing Real Gains',
    quote: 'After years of spinning my wheels in the gym, Christian\'s programming finally got me results. Up 12kg of muscle and my deadlift hit 200kg.',
    rating: 5,
    badge: 'Strength Beast',
    icon: Dumbbell,
  },
  {
    name: 'Ryan',
    title: 'Nutrition Was The Game Changer',
    quote: 'I thought I was eating right until Christian broke down my nutrition. The meal plan he gave me was sustainable and the fat melted off. Down 18% body fat.',
    rating: 5,
    badge: 'Body Recomp',
    icon: Flame,
  },
  {
    name: 'Alex',
    title: 'The Brotherhood Keeps Me Accountable',
    quote: 'Training alone was hit or miss. The group sessions and the community push me to show up even when I don\'t feel like it. That\'s made all the difference.',
    rating: 5,
    badge: 'Group Training',
    icon: MessageSquare,
  },
  {
    name: 'Jordan',
    title: 'From Couch to Competition',
    quote: 'I was 40kg overweight and miserable. Christian didn\'t judge me — he gave me a plan. 18 months later I\'m competing in my first Hyrox. Built for More is real.',
    rating: 5,
    badge: 'Transformation King',
    icon: Trophy,
  },
  {
    name: 'Chris',
    title: 'Online Coaching That Actually Works',
    quote: 'I was skeptical about online training but Christian\'s app and video feedback is better than most in-person trainers I\'ve had. Worth every penny.',
    rating: 5,
    badge: 'Online Client',
    icon: Dumbbell,
  },
  {
    name: 'Tyler',
    title: 'Mindset Shift Was Everything',
    quote: 'Christian taught me that the weights are just the tool — the real change happens in your head. That discipline has spilled into every area of my life.',
    rating: 5,
    badge: 'Mental Game Strong',
    icon: Flame,
  },
  {
    name: 'Sam',
    title: 'Nutrition Without The BS',
    quote: 'No fad diets, no magic pills. Just solid nutrition advice that I can actually stick to long-term. The results speak for themselves.',
    rating: 5,
    badge: 'Nutrition Focused',
    icon: Star,
  },
];

const ClientPraise = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const grid = gridRef.current;
    const marquee = marqueeRef.current;

    if (!section || !heading || !grid || !marquee) return;

    const cards = grid.querySelectorAll('.testimonial-card');

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

    // Cards animation
    gsap.fromTo(
      cards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 0.5,
        },
      }
    );

    // Marquee animation
    const marqueeContent = marquee.querySelector('.marquee-content');
    if (marqueeContent) {
      gsap.to(marqueeContent, {
        xPercent: -50,
        ease: 'none',
        duration: 30,
        repeat: -1,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section || st.vars.trigger === grid) st.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 section-padding overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-yellow" />
            <span className="text-yellow font-oswald text-lg tracking-widest">
              TESTIMONIALS
            </span>
          </div>
          <h2 className="heading-lg font-oswald font-bold text-white mb-4">
            WHAT THE <span className="text-yellow">BROTHERHOOD</span> SAYS
          </h2>
          <p className="body-text max-w-2xl mx-auto">
            Real men. Real results. No filters, no excuses — just honest feedback 
            from guys who've put in the work and seen the transformation.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card group"
            >
              <div className="h-full glass rounded-2xl p-6 hover:border-yellow/30 transition-all duration-300">
                {/* Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="glass-yellow rounded-full p-1.5">
                    <testimonial.icon className="w-3 h-3 text-yellow" />
                  </div>
                  <span className="text-yellow text-xs font-oswald">{testimonial.badge}</span>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow text-yellow" />
                  ))}
                </div>

                {/* Title */}
                <h4 className="text-lg font-oswald font-bold text-white mb-3 group-hover:text-yellow transition-colors">
                  {testimonial.title}
                </h4>

                {/* Quote */}
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  "{testimonial.quote}"
                </p>

                {/* Name */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-yellow/20 flex items-center justify-center">
                    <span className="text-yellow font-oswald font-bold">
                      {testimonial.name[0]}
                    </span>
                  </div>
                  <span className="text-white font-medium">{testimonial.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Infinite Marquee */}
        <div ref={marqueeRef} className="mt-16 overflow-hidden">
          <div className="marquee-content flex gap-8 whitespace-nowrap">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-8">
                {[
                  'BUILT FOR MORE',
                  'HYROX READY',
                  'STRENGTH UNLEASHED',
                  'NO EXCUSES',
                  'JOIN THE BROTHERHOOD',
                  'TRAIN WITH PURPOSE',
                ].map((text, index) => (
                  <span
                    key={index}
                    className="text-4xl sm:text-5xl font-oswald font-bold text-white/10"
                  >
                    {text} •
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientPraise;
