import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, MessageSquare } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Marcus',
    title: 'Confidence Rebuilt, Life Transformed',
    quote: 'Christian helped me go from self-conscious and stuck to confident, empowered, and thriving in my body, my mindset, and my career.',
    rating: 5,
  },
  {
    name: 'David',
    title: 'The Coach Who Brings Out Your Best',
    quote: 'I joined feeling stuck and unsure. Christian encouraged me through every challenge, built my confidence, and created a community where we all felt amazing.',
    rating: 5,
  },
  {
    name: 'Jennifer',
    title: 'From Struggling to Consistent',
    quote: 'I used to battle with motivation, but Christian made everything feel achievable. His guidance helped me grow in confidence and build a routine that fits my life.',
    rating: 5,
  },
  {
    name: 'Alex',
    title: 'Coaching That Builds Real Independence',
    quote: 'Christian helped me go from unsure and inexperienced to confident training on my own. He taught me proper technique and helped me build a routine I\'ve stuck to.',
    rating: 5,
  },
  {
    name: 'Ryan',
    title: 'From Nervous Beginner to Confident Lifter',
    quote: 'I started with zero confidence and no idea where to begin, but Christian made everything feel comfortable and achievable. I\'ve built a solid routine and real confidence.',
    rating: 5,
  },
  {
    name: 'Chris',
    title: 'Support That Feels Personal',
    quote: 'Christian makes the gym feel comfortable, supportive, and motivating. He pushes you to do your best and genuinely celebrates your progress.',
    rating: 5,
  },
  {
    name: 'Jordan',
    title: 'Results That Finally Stick',
    quote: 'I trained for two years with minimal progress, but Christian helped me achieve more in one year than I ever had before. I reached my goals and became mentally stronger.',
    rating: 5,
  },
  {
    name: 'Tyler',
    title: 'The Start of a Stronger Life',
    quote: 'I had never been to the gym before, but Christian taught me everything about training and nutrition while helping me transform my lifestyle completely.',
    rating: 5,
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
            CLIENT <span className="text-yellow">PRAISE</span>
          </h2>
          <p className="body-text max-w-2xl mx-auto">
            I'm proud of our work — here's what my clients have to say about training with me.
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
                  'TRANSFORM YOUR LIFE',
                  'BUILD REAL STRENGTH',
                  'JOIN THE COMMUNITY',
                  'UNLOCK YOUR POTENTIAL',
                  'BECOME UNSTOPPABLE',
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
