import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar, Trophy, Flame, Dumbbell } from 'lucide-react';

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

    // Kill existing triggers
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars.trigger === section) st.kill();
    });

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
                  YOUR COACH
                </p>
                <h2 className="heading-lg font-oswald font-bold text-white">
                  MEET
                  <br />
                  <span className="text-yellow">CHRISTIAN</span>
                </h2>
              </div>

              <div className="reveal-item glass rounded-2xl p-6 sm:p-8 space-y-4">
                <p className="text-xl font-oswald text-white">
                  Hyrox Competitor • Strength Coach • Nutrition Specialist
                </p>
                <p className="body-text">
                  I don't believe in excuses. I believe in results. As a certified Hyrox competitor 
                  and strength coach, I've helped hundreds of men transform not just their bodies, 
                  but their entire approach to life.
                </p>
                <p className="body-text">
                  My philosophy is simple: <span className="text-yellow font-semibold">Built for More</span>. 
                  Every man has the capacity for greatness. Whether you're training for your first Hyrox, 
                  looking to pack on serious muscle, or need to overhaul your nutrition — I'll give you 
                  the blueprint, the accountability, and the push you need.
                </p>
                <p className="body-text">
                  No shortcuts. No fluff. Just proven methods, hard work, and a community of men 
                  who refuse to settle for average.
                </p>
              </div>

              {/* Specializations */}
              <div className="reveal-item grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4 text-center">
                  <Trophy className="w-6 h-6 text-yellow mx-auto mb-2" />
                  <p className="text-white text-sm font-oswald">HYROX</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <Dumbbell className="w-6 h-6 text-yellow mx-auto mb-2" />
                  <p className="text-white text-sm font-oswald">STRENGTH</p>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <Flame className="w-6 h-6 text-yellow mx-auto mb-2" />
                  <p className="text-white text-sm font-oswald">NUTRITION</p>
                </div>
              </div>

              <div className="reveal-item flex flex-col sm:flex-row gap-4">
                <a
                  href="#packages"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-glass flex items-center justify-center gap-2 group"
                >
                  <span>View Training Packages</span>
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
                { value: '500+', label: 'Men Transformed' },
                { value: '50+', label: 'Hyrox Athletes' },
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
