import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const MeetCoach = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const content = contentRef.current;

    if (!section || !image || !content) return;

    // Parallax effect on image
    gsap.to(image.querySelector('img'), {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
    });

    // Content reveal
    const contentElements = content.querySelectorAll('.reveal-item');
    gsap.fromTo(
      contentElements,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          end: 'top 20%',
          scrub: 0.5,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section
      id="meet-coach"
      ref={sectionRef}
      className="relative min-h-screen py-24 overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div ref={imageRef} className="absolute inset-0">
        <img
          src="/coach-christian.jpg"
          alt="Christian - Your Coach"
          className="w-full h-full object-cover scale-110"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center section-padding">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Empty for image visibility */}
            <div className="hidden lg:block" />

            {/* Right - Content */}
            <div ref={contentRef} className="space-y-8">
              <div className="reveal-item">
                <p className="text-yellow font-oswald text-lg tracking-widest mb-2">
                  MEET YOUR COACH
                </p>
                <h2 className="heading-lg font-oswald font-bold text-white">
                  MEET
                  <br />
                  <span className="text-yellow">CHRISTIAN</span>
                </h2>
              </div>

              <div className="reveal-item glass rounded-2xl p-6 sm:p-8 space-y-4">
                <p className="text-xl font-oswald text-white">
                  Your Coach, Your Blueprint, Your Edge
                </p>
                <p className="body-text">
                  Hi, I'm Christian, and I wasn't always the athlete you see today. I started exactly where you might be now: uncertain, lacking confidence, and searching for direction.
                </p>
                <p className="body-text">
                  Showing up changed everything. Not overnight, but through relentless consistency, self-discipline, and choosing to level up every single day. Now I help men build that same unstoppable mindset with proven strategies, unwavering support, and a community that pushes you to be your best.
                </p>
              </div>

              <div className="reveal-item flex flex-col sm:flex-row gap-4">
                <a
                  href="#method"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('method')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-glass flex items-center justify-center gap-2 group"
                >
                  <span>Read My Story</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="#footer"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book a Call</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 section-padding py-12">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '10+', label: 'Years Experience' },
                { value: '500+', label: 'Clients Transformed' },
                { value: '50K+', label: 'Pounds Lifted' },
                { value: '98%', label: 'Success Rate' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl sm:text-4xl font-oswald font-bold text-yellow mb-1">
                    {stat.value}
                  </p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetCoach;
