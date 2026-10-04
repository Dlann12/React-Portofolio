import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { flushSync } from 'react-dom';
import Lenis from 'lenis';

// ==========================================================================
// 1. SMOOTH SCROLLING (Lenis)
// ==========================================================================
const useSmoothScroll = () => {
  useEffect(() => {
    // Disable JS smooth scrolling on mobile for performance and native feel
    if (window.innerWidth <= 768) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
};

// ==========================================================================
// 2. PRELOADER
// ==========================================================================
const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 2;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => onComplete(), 600); // Small pause at 100%
      }
      setProgress(current);
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ y: 0 }}
      exit={{ y: '-100vh', opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
        background: 'var(--bg-main)', color: 'var(--text-main)',
        zIndex: 99999, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end',
        padding: '5%'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 'clamp(5rem, 15vw, 12rem)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 0.9 }}>
          {progress}%
        </div>
        <div style={{ fontFamily: 'var(--font-code)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          System Initialization
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================================================
// 3. MAGNETIC COMPONENT
// ==========================================================================
const Magnetic = ({ children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return React.cloneElement(children, {
    ref,
    onMouseMove: handleMouse,
    onMouseLeave: reset,
    animate: { x: position.x, y: position.y },
    transition: { type: 'spring', stiffness: 150, damping: 15, mass: 0.1 },
  });
};

// ==========================================================================
// 4. TYPOGRAPHY ANIMATIONS
// ==========================================================================
const SplitText = ({ text, className }) => {
  const words = text.split(' ');
  return (
    <div className={className} style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.25em' }}>
      {words.map((word, i) => (
        <span key={i} style={{ overflow: 'hidden', display: 'inline-flex' }}>
          <motion.span
            initial={{ y: '100%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
            viewport={{ once: true, margin: '-50px' }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
};

const TypingEffect = ({ words }) => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if (isDeleting) {
      setText(currentWord.substring(0, text.length - 1));
      timeout = setTimeout(() => {}, 30);
    } else {
      setText(currentWord.substring(0, text.length + 1));
      timeout = setTimeout(() => {}, 80);
    }

    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return <span>{text}</span>;
};

// ==========================================================================
// 5. IMAGE REVEAL COMPONENT
// ==========================================================================
const RevealImage = ({ src, alt, className, onMouseEnter, onMouseLeave }) => {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '0px', amount: 0.1 }}
      style={{ overflow: 'hidden', position: 'relative' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.img
        src={src}
        alt={alt}
        className="project-img"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </motion.div>
  );
};

// ==========================================================================
// 4. CAROUSEL GALLERY COMPONENT
// ==========================================================================
const projectsData = [
  { id: 'proj1', img: 'assets/project-1.webp', title: 'Retinopathy Diabetic Early Detection', tags: ['Machine Learning', 'Healthcare'], desc: 'This study compares VGG16, ResNet50, InceptionV3, and EfficientNet-B3 for detecting DR from retinal fundus images.', link: 'https://github.com/Dlann12/Deteksi-Dini-Retinopati-Diabetik' },
  { id: 'proj2', img: 'assets/project-2.webp', title: 'Sweet Aware', tags: ['Web App', 'Prediction Model'], desc: 'An application aiming to provide a self-prediction tool for early diabetes screening that is accurate, easy to use, and encourages a healthy lifestyle.', link: 'https://github.com/SweetAware/sweetaware-model', live: 'https://sweetawareapp.netlify.app/' },
  { id: 'proj3', img: 'assets/project-3.webp', title: 'SIPARLU', tags: ['Information System', 'Tourism'], desc: 'Sistem Informasi Pariwisata Kota Bengkulu (SIPARLU) is a web-based application providing information about tourist attractions to promote tourism and easy access.', link: 'https://github.com/Dlann12/SIPARLU-SISTEM-INFORMASI-PARIWISATA-KOTA-BENGKULU' }
];

const CarouselGallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    if (currentIndex < projectsData.length - 1) setCurrentIndex(prev => prev + 1);
  };
  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold) {
      prevSlide();
    }
  };

  return (
    <div className="carousel-container" style={{ position: 'relative', width: '100vw', marginLeft: 'calc(-50vw + 50%)', overflow: 'hidden', padding: '20px 0 60px', marginTop: '10px' }}>
      
      {/* 3D Coverflow Track */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        style={{ 
          position: 'relative', 
          height: isMobile ? '35vh' : '50vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          cursor: 'grab'
        }}
        whileTap={{ cursor: 'grabbing' }}
      >
        {projectsData.map((proj, idx) => {
          const offset = idx - currentIndex;
          const absOffset = Math.abs(offset);
          const direction = Math.sign(offset);
          const isActive = offset === 0;

          // 3D Stacking Calculations
          const xOffset = isMobile ? 100 : 75; // % shift relative to own width
          const xPos = direction * absOffset * xOffset;
          const scale = Math.max(1 - absOffset * 0.15, 0.6);
          const zIndex = 10 - absOffset;
          // Hide cards that are too far away
          const opacity = absOffset >= 2 ? 0 : (isActive ? 1 : 0.4);

          return (
            <motion.div
              key={proj.id}
              onClick={() => setCurrentIndex(idx)}
              animate={{ 
                x: `${xPos}%`,
                scale: scale,
                zIndex: zIndex,
                opacity: opacity
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ 
                position: 'absolute',
                width: isMobile ? '70vw' : '45vw', 
                maxWidth: '700px',
                height: '100%', 
                borderRadius: '24px', 
                overflow: 'hidden', 
                border: '1px solid var(--border-color)', 
                background: '#0a0a0a',
                boxShadow: isActive ? '0 30px 60px -15px rgba(0,0,0,0.7)' : '0 10px 30px rgba(0,0,0,0.5)',
                cursor: isActive ? 'grab' : 'pointer'
              }}
            >
              <img src={proj.img} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {/* Dark overlay for inactive slides */}
              <motion.div 
                animate={{ opacity: isActive ? 0 : 0.6 }}
                transition={{ duration: 0.6 }}
                style={{ position: 'absolute', inset: 0, background: '#000' }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Active Project Details (Centered Below) */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ textAlign: 'center', marginTop: '60px', padding: '0 5vw', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
            {projectsData[currentIndex].tags.map(t => <span key={t} className="tag" style={{ border: '1px solid var(--border-color)' }}>{t}</span>)}
          </div>
          
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)', marginBottom: '15px', color: 'var(--text-main)', lineHeight: 1.2 }}>
            {projectsData[currentIndex].title}
          </h3>
          
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', marginBottom: '30px', maxWidth: '750px', fontSize: isMobile ? '0.95rem' : '1.1rem', lineHeight: 1.6 }}>
            {projectsData[currentIndex].desc}
          </p>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <a href={projectsData[currentIndex].link} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>code</span> Code
            </a>
            {projectsData[currentIndex].live && (
              <a href={projectsData[currentIndex].live} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>open_in_new</span> Live
              </a>
            )}
          </div>
          
          {/* Slider Dots Indicator & Navigation Arrows */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', marginTop: '50px' }}>
            <button onClick={prevSlide} disabled={currentIndex === 0} style={{ background: 'none', border: 'none', color: currentIndex === 0 ? 'var(--border-color)' : 'var(--text-main)', cursor: currentIndex === 0 ? 'default' : 'pointer', padding: '5px' }}>
               <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>arrow_back_ios</span>
            </button>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {projectsData.map((_, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    width: idx === currentIndex ? '30px' : '8px', 
                    height: '8px', 
                    borderRadius: '4px', 
                    background: idx === currentIndex ? 'var(--text-main)' : 'var(--border-color)',
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                />
              ))}
            </div>

            <button onClick={nextSlide} disabled={currentIndex === projectsData.length - 1} style={{ background: 'none', border: 'none', color: currentIndex === projectsData.length - 1 ? 'var(--border-color)' : 'var(--text-main)', cursor: currentIndex === projectsData.length - 1 ? 'default' : 'pointer', padding: '5px' }}>
               <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>arrow_forward_ios</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      
    </div>
  );
};

// ==========================================================================
// 6. MAIN APP
// ==========================================================================
function App() {
  useSmoothScroll();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll();
  const yMarquee = useTransform(scrollYProgress, [0, 1], isMobileView ? [0, 0] : [0, -200]);
  const yProfile = useTransform(scrollYProgress, [0, 1], isMobileView ? [0, 0] : [0, 200]);
  const yOversizedText = useTransform(scrollYProgress, [0, 1], isMobileView ? [0, 0] : [0, 400]);

  // Scroll & Active Section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // Active Section Observer
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach((s) => observer.observe(s));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      sections.forEach((s) => observer.unobserve(s));
    };
  }, []);

  // Theme Toggle Effect
  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
  }, [isLightTheme]);

  const handleThemeToggle = (e) => {
    const willBeLight = !isLightTheme;

    if (!document.startViewTransition) {
      setIsLightTheme(willBeLight);
      return;
    }

    // Get the click position
    const x = e.clientX;
    const y = e.clientY;
    
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsLightTheme(willBeLight);
      });
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  const navLinks = ['home', 'about', 'skills', 'experience', 'credentials', 'projects', 'contact'];

  return (
    <>
      {/* 1. Cinematic Film Grain Overlay */}
      <div className="noise-overlay"></div>

      {/* 2. Custom Preloader */}
      <AnimatePresence mode="wait">
        {isLoading && <Preloader key="preloader" onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div className="bg-grid"></div>

      {/* Navigation */}
      <header className={`header ${isScrolled ? 'scrolled' : ''}`} style={{ transition: 'all 0.4s ease' }}>
        <motion.nav 
          initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: isLoading ? 0 : 1.5 }}
          className="nav-container"
          style={{ 
            boxShadow: isScrolled ? '0 10px 30px rgba(0,0,0,0.1)' : 'none',
            backdropFilter: isScrolled ? 'blur(10px)' : 'none',
            borderBottom: isScrolled ? '1px solid var(--border)' : '1px solid transparent'
          }}
        >
          <Magnetic>
            <motion.a href="#home" className="logo">
              <span className="logo-text">FDF</span><span className="logo-dot">.</span>
            </motion.a>
          </Magnetic>

          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link}>
                <Magnetic>
                  <motion.a 
                    href={`#${link}`} 
                    className={`nav-link ${activeSection === link ? 'active' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    {link.charAt(0).toUpperCase() + link.slice(1)}
                    {activeSection === link && (
                      <motion.div 
                        layoutId="nav-indicator"
                        style={{ position: 'absolute', bottom: -5, left: 0, width: '100%', height: '2px', background: 'var(--text-main)' }}
                      />
                    )}
                  </motion.a>
                </Magnetic>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Magnetic>
              <motion.button 
                onClick={handleThemeToggle}
                className="btn btn-outline" 
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <motion.span 
                  className="material-symbols-outlined"
                  initial={false}
                  animate={{ rotate: isLightTheme ? 180 : 0 }}
                >
                  {isLightTheme ? 'dark_mode' : 'light_mode'}
                </motion.span>
              </motion.button>
            </Magnetic>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span className="material-symbols-outlined menu-icon">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mobile-nav-overlay active" 
            style={{ pointerEvents: 'all' }}
          >
            <ul className="mobile-nav-links">
              {navLinks.map((link, i) => (
                <motion.li 
                  key={link}
                  initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                >
                  <a href={`#${link}`} className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                    {link.charAt(0).toUpperCase() + link.slice(1)}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section id="home" className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
          
          {/* Oversized Decorative Typography behind the profile (Running Text) */}
          <motion.div 
            style={{ 
              y: yOversizedText, 
              position: 'absolute', 
              top: '50%', 
              left: '0', 
              width: '100%', 
              overflow: 'hidden', 
              zIndex: 0, 
              pointerEvents: 'none', 
              marginTop: '-10vh'
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: isLoading ? 0 : 1 }}
          >
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 30 }}
              style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}
            >
              <div className="oversized-text" style={{ position: 'relative', transform: 'none', top: 'auto', left: 'auto', paddingRight: '10vw' }}>
                FADLAN DWI FEBRIO — FADLAN DWI FEBRIO —
              </div>
              <div className="oversized-text" style={{ position: 'relative', transform: 'none', top: 'auto', left: 'auto', paddingRight: '10vw' }}>
                FADLAN DWI FEBRIO — FADLAN DWI FEBRIO —
              </div>
            </motion.div>
          </motion.div>

          <div className="hero-container">
            <div className="hero-content">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: isLoading ? 0 : 1.5 }}
                className="status-badge"
              >
                <span className="status-dot"></span>
                <span className="status-text">Available for Opportunities</span>
              </motion.div>

              {!isLoading && <SplitText text="Fadlan Dwi Febrio." className="hero-title" />}

              <motion.h2 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: isLoading ? 0 : 2.5 }}
                className="hero-subtitle"
              >
                <span className="material-symbols-outlined">code</span>
                <TypingEffect words={["Software Engineer", "Machine Learning Eng", "Data Analyst", "Graphic Designer"]} />
                <span className="cursor">|</span>
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isLoading ? 0 : 2.8 }}
                className="hero-description"
              >
                Bachelor Of Informatics | Coding Camp Machine Learning Engineer 2025 | Interest on Software Engineering, Graphic Designer, Full stack, Machine Learning, etc.
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: isLoading ? 0 : 3 }} className="hero-cta">
                <Magnetic>
                  <motion.a href="#projects" className="btn btn-primary">
                    <span>Explore Work</span>
                    <span className="material-symbols-outlined">arrow_outward</span>
                  </motion.a>
                </Magnetic>
                <Magnetic>
                  <motion.a href="#contact" className="btn btn-secondary">
                    <span>Contact Me</span>
                  </motion.a>
                </Magnetic>
              </motion.div>
            </div>

            <div className="hero-visual">
              
              {!isLoading && (
                <motion.div 
                  style={{ y: yProfile }}
                  initial={{ opacity: 0, y: 80, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 1 }}
                  className="image-wrapper"
                >
                  <motion.img 
                    src="assets/profile.webp" 
                    alt="Fadlan Dwi Febrio" 
                    className="profile-img"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </motion.div>
              )}

            </div>
          </div>
        </section>

        {/* Marquee with Parallax */}
        <div className="marquee-section" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div style={{ x: yMarquee }} className="marquee-container">
            <div className="marquee-content" style={{ animationDuration: '30s' }}>
              <span>SOFTWARE ENGINEERING</span><span className="dot">•</span>
              <span>MACHINE LEARNING</span><span className="dot">•</span>
              <span>ARTIFICIAL INTELLIGENCE</span><span className="dot">•</span>
              <span>DATA SCIENCE</span><span className="dot">•</span>
              <span>FULLSTACK DEV</span><span className="dot">•</span>
              <span>GRAPHIC DESIGN</span><span className="dot">•</span>
            </div>
          </motion.div>
        </div>

        {/* About Section */}
        <section id="about" className="about section-padding">
          <div className="section-container">
            <div className="section-header">
              <span className="section-subtitle">Get To Know Me</span>
              <SplitText text="About Me" className="section-title" />
            </div>

            <div className="about-grid">
              <div className="about-visual">
                <div className="about-image-wrapper">
                  <RevealImage 
                    src="assets/about.webp" 
                    alt="About Fadlan" 
                    className="about-img" 
                  />
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }} viewport={{ once: true }}
                    className="experience-badge glass-panel"
                  >
                    <span className="exp-number">1st</span>
                    <span className="exp-text">Place National<br/>Innovation</span>
                  </motion.div>
                </div>
              </div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ visible: { transition: { staggerChildren: 0.1 }}}} className="about-content">
                <motion.h3 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="about-heading">Who Am I?</motion.h3>
                
                <div className="about-text-blocks">
                  <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    As a recent Informatics graduate with a strong interest in Software Engineering, Machine Learning, Artificial Intelligence, Data Science, Graphic Design, as well as Full Stack, Front End, and Back End development, I bring a combination of leadership, creativity, adaptability, and innovation. I am a curious, proactive, and highly motivated individual with a strong desire to continuously learn and develop my skills.
                  </motion.p>
                  <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    I enjoy exploring new ideas, learning technologies such as Machine Learning and Artificial Intelligence, and transforming those ideas into practical and applicable solutions. During high school, I was entrusted with the role of Chairperson of DELTA and contributed to initiating ATHENA as a platform for high-achieving students. 
                  </motion.p>
                  <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    These experiences helped me develop strong skills in leadership, teamwork, communication, creative thinking, problem-solving, and taking initiative. I am comfortable working both independently and collaboratively, and I am always open to challenges and opportunities to learn new things.
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="skills section-padding relative">
          <div className="section-container">
            <div className="section-header">
              <span className="section-subtitle">What I Can Do</span>
              <SplitText text="My Expertise" className="section-title" />
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ visible: { transition: { staggerChildren: 0.1 }}}} className="bento-grid">
              {[
                { icon: 'terminal', title: 'Software Engineering', desc: 'Developing reliable and maintainable software solutions.', tags: ['Python', 'JavaScript', 'PHP', 'SQL', 'Laravel'] },
                { icon: 'psychology', title: 'Artificial Intelligence & ML', desc: 'Exploring and developing AI solutions by applying algorithms and data processing.', tags: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'], large: true },
                { icon: 'layers', title: 'Fullstack Dev', desc: 'Building complete web applications with responsive interfaces.', tags: ['React', 'Node.js', 'Express.js', 'MySQL'] },
                { icon: 'analytics', title: 'Data Analyst', desc: 'Analyzing and transforming raw data into meaningful insights.', tags: ['Python', 'SQL', 'Matplotlib', 'Seaborn'] },
                { icon: 'palette', title: 'Graphic Design', desc: 'Creating visual designs applying composition, typography, and color theory.', tags: ['Photoshop', 'Illustrator', 'Figma', 'Canva'] }
              ].map((skill, idx) => (
                <motion.div 
                  key={idx}
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }} 
                  whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  className={`bento-item glass-panel ${skill.large ? 'bento-large' : ''}`}
                >
                  <div className="bento-icon"><span className="material-symbols-outlined">{skill.icon}</span></div>
                  <h3>{skill.title}</h3>
                  <p>{skill.desc}</p>
                  <div className="tech-stack">
                    {skill.tags.map(tag => <span key={tag} className="tech-pill">{tag}</span>)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="experience section-padding relative">
          <div className="section-container">
            <div className="section-header">
              <span className="section-subtitle">Career Path</span>
              <SplitText text="Work Experience" className="section-title" />
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ visible: { transition: { staggerChildren: 0.15 }}}} className="timeline-container">
              {[
                { date: 'Sep 2026 - Present', role: 'Intern IT Programmer', comp: 'PT SELAMAT JAYA PERSADA', desc: 'Working as an IT Programmer Intern developing and maintaining company systems in Bengkulu.' },
                { date: 'Jul 2026 - Present', role: 'Teacher', comp: 'Timedoor', desc: 'Teaching programming and digital skills.' },
                { date: 'Feb 2024 - Present', role: 'Teaching Assistant', comp: 'Universitas Bengkulu', desc: 'Assisting in teaching activities, mentoring students, and evaluating assignments across multiple semesters.' },
                { date: 'Feb 2024 - Mar 2024', role: 'Event Committee & Moderator', comp: 'HIMATIF UNIB', desc: 'Served as a committee member for CHROME. Contributed as part of the PUBDEKDOK division. Also served as Moderator.' }
              ].map((exp, idx) => (
                <motion.div key={idx} variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content glass-panel">
                    <span className="timeline-date">{exp.date}</span>
                    <h3 className="timeline-title">{exp.role}</h3>
                    <h4 className="timeline-company">{exp.comp}</h4>
                    <p className="timeline-desc">{exp.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Credentials Section */}
        <section id="credentials" className="credentials section-padding relative">
          <div className="section-container">
            <div className="section-header">
              <span className="section-subtitle">Licenses & Certifications</span>
              <SplitText text="Credentials & Achievements" className="section-title" />
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ visible: { transition: { staggerChildren: 0.1 }}}} className="credentials-grid">
              {[
                { icon: 'workspace_premium', title: '1st Winner FIFO', org: 'Future International Food Technopreneur', desc: 'Awarded first place in a prestigious food innovation competition at the national level.' },
                { icon: 'emoji_events', title: 'Honorable Mention', org: 'Poster Competition', desc: 'Recognized for creating an impactful visual design in a national-scale competition.' },
                { icon: 'gavel', title: '3rd Debat Competition', org: 'Debate Tournament', desc: 'Achieved 3rd place in debate competition multiple times, demonstrating strong public speaking.' },
                { icon: 'verified', title: 'AWS & Technical Certifications', org: 'Amazon Web Services & Others', desc: 'AWS Educate ML Foundations, Compute, Databases, Networking, and Financial Literacy 101.' }
              ].map((cred, idx) => (
                <motion.div key={idx} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }} className="credential-card glass-panel">
                  <div className="credential-icon"><span className="material-symbols-outlined">{cred.icon}</span></div>
                  <div className="credential-info">
                    <h3 className="credential-title">{cred.title}</h3>
                    <p className="credential-org">{cred.org}</p>
                    <p className="credential-desc">{cred.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Projects Section - Editorial Carousel */}
        <section id="projects" className="projects section-padding">
          <div className="section-container">
            <div className="section-header">
              <span className="section-subtitle">My Recent Work</span>
              <SplitText text="Selected Projects" className="section-title" />
            </div>

            <CarouselGallery />

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="projects-cta" style={{ marginTop: '60px', textAlign: 'center' }}>
              <Magnetic>
                <motion.a href="https://github.com/Dlann12" target="_blank" rel="noreferrer" className="btn btn-outline">
                  <span>View GitHub Archive</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </motion.a>
              </Magnetic>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact section-padding relative">
          
          <div className="section-container">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }} className="contact-wrapper glass-panel">
              <div className="contact-header">
                <span className="section-subtitle">Initiate Transmission</span>
                <SplitText text="Let's Work Together" className="section-title" />
                <p className="contact-subtitle" style={{ marginTop: '10px' }}>Have a project, collaboration, or opportunity? My inbox is always open.</p>
              </div>

              <div className="contact-grid">
                {[
                  { icon: 'mail', title: 'Email', value: 'fadlandwifebrio51@gmail.com', href: 'mailto:fadlandwifebrio51@gmail.com' },
                  { icon: 'code', title: 'GitHub', value: '@Dlann12', href: 'https://github.com/Dlann12' },
                  { icon: 'work', title: 'LinkedIn', value: 'Fadlan Dwi Febrio', href: 'https://www.linkedin.com/in/fadlan-dwi-febrio' },
                  { icon: 'chat', title: 'WhatsApp', value: 'Direct Message', href: 'https://wa.me//62895609616426' },
                  { icon: 'photo_camera', title: 'Instagram', value: '@dlaa_nnn', href: 'https://www.instagram.com/dlaa_nnn/' },
                  { icon: 'play_circle', title: 'YouTube', value: '@FadlanDFB', href: 'https://www.youtube.com/@FadlanDFB' }
                ].map((item, idx) => (
                  <Magnetic key={idx}>
                    <motion.a href={item.href} target="_blank" rel="noreferrer" className="contact-card">
                      <div className="contact-icon-wrapper"><span className="material-symbols-outlined">{item.icon}</span></div>
                      <div className="contact-info"><h4>{item.title}</h4><p>{item.value}</p></div>
                      <span className="material-symbols-outlined arrow">arrow_outward</span>
                    </motion.a>
                  </Magnetic>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <a href="#home" className="logo">
              <span className="logo-text">FDF</span><span className="logo-dot">.</span>
            </a>
            <p className="footer-desc">Synthesizing ideas into scalable digital realities.</p>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Fadlan Dwi Febrio. All Rights Reserved.</p>
            <div className="system-status">
              <span className="status-dot blink"></span>
              <span className="font-code">SYS::ONLINE</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
