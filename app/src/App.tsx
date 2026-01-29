import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

// Sections
import Hero from './sections/Hero';
import Manifesto from './sections/Manifesto';
import MeetCoach from './sections/MeetCoach';
import Method from './sections/Method';
import Testimonial from './sections/Testimonial';
import Community from './sections/Community';
import Transformations from './sections/Transformations';
import ClientPraise from './sections/ClientPraise';
import Footer from './sections/Footer';
import Navigation from './sections/Navigation';
import ParticleBackground from './sections/ParticleBackground';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll progress indicator
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      });
    }

    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="relative min-h-screen bg-dark overflow-x-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100]">
        <div 
          ref={progressRef}
          className="h-full bg-yellow shadow-glow"
          style={{ width: '0%' }}
        />
      </div>
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <Manifesto />
        <MeetCoach />
        <Method />
        <Testimonial />
        <Community />
        <Transformations />
        <ClientPraise />
        <Footer />
      </main>
    </div>
  );
}

export default App;
