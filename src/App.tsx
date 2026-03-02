import React, { useState, useEffect } from 'react';
import { ArrowRight, Coffee, MapPin, Mail, Clock, Phone, Menu, X, Flame, Heart, Instagram, Twitter, Facebook, Star } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/* ──────────────────────────────────────────────────────────────
   Custom Cursor
   ────────────────────────────────────────────────────────────── */
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return;

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    // We start listening once they move the mouse
    window.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseleave', () => setIsVisible(false));
    document.addEventListener('mouseenter', () => setIsVisible(true));

    return () => {
      window.removeEventListener('mousemove', updatePosition);
    };
  }, [isVisible]);

  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999]"
      animate={{
        x: position.x - 4,
        y: position.y - 4,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.1 }}
    >
      <img src="/cursor.png" alt="" className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] filter brightness-110" />
    </motion.div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Reusable Scroll-Reveal Wrapper
   ────────────────────────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, direction = 'up', className = '' }: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  key?: React.Key;
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const dirMap = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...dirMap[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Wavy Divider
   ────────────────────────────────────────────────────────────── */
const WavyDivider = ({ flip = false }: { flip?: boolean }) => (
  <div className={`w-full overflow-hidden leading-none z-10 relative ${flip ? 'rotate-180' : ''}`}>
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
      <path
        d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z"
        fill="var(--color-bg-secondary)"
      />
    </svg>
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Navigation
   ────────────────────────────────────────────────────────────── */
const Navigation = ({ view, setView }: { view: string, setView: (v: 'home' | 'menu') => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Menu', href: '#menu' },
    { name: 'Our Story', href: '#story' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-40 py-6">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" onClick={() => { setView('home'); window.scrollTo(0, 0); }} className="flex items-center gap-2 text-[var(--color-text-primary)] z-50 hover:opacity-80 transition-opacity">
          <Coffee size={24} className="text-[var(--color-accent)]" />
          <span className="font-display font-bold text-xl tracking-tight">Roastly</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-center gap-8 text-[14px] font-medium text-[var(--color-text-secondary)] absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={view === 'menu' && link.name !== 'Menu' ? '#' : link.href}
              onClick={(e) => {
                if (link.name === 'Menu') {
                  e.preventDefault();
                  setView('menu');
                  window.scrollTo(0, 0);
                } else if (view === 'menu') {
                  setView('home');
                }
              }}
              className="relative hover:text-[var(--color-text-primary)] transition-colors duration-200 py-1 group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block z-50">
          <button onClick={() => { setView('menu'); window.scrollTo(0, 0); }} className="text-[var(--color-text-primary)] text-[14px] font-medium px-5 py-2.5 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] transition-all duration-300 cursor-pointer">
            Order Ahead
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[var(--color-text-primary)] z-50 relative"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div
          className="absolute top-full left-0 right-0 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] p-6 flex flex-col gap-5 md:hidden shadow-lg z-40"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {navLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={view === 'menu' && link.name !== 'Menu' ? '#' : link.href}
              className="text-[var(--color-text-primary)] text-[16px] font-medium"
              onClick={(e) => {
                setIsOpen(false);
                if (link.name === 'Menu') {
                  e.preventDefault();
                  setView('menu');
                  window.scrollTo(0, 0);
                } else if (view === 'menu') {
                  setView('home');
                }
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {link.name}
            </motion.a>
          ))}
          <button className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] text-[15px] font-medium px-4 py-3 rounded-lg mt-2 w-full text-center block" onClick={() => { setIsOpen(false); setView('menu'); window.scrollTo(0, 0); }}>
            Order Ahead
          </button>
        </motion.div>
      )}
    </nav>
  );
};

/* ──────────────────────────────────────────────────────────────
   Hero
   ────────────────────────────────────────────────────────────── */
const Hero = ({ setView }: { setView: (v: 'home' | 'menu') => void }) => {
  return (
    <section className="relative pt-32 pb-0 flex flex-col items-center text-center min-h-screen justify-start overflow-hidden bg-[var(--color-bg-primary)]">

      {/* Decorative Custom Assets */}
      <img
        src="/bean.png"
        alt=""
        className="absolute top-20 left-4 md:left-12 opacity-80 mix-blend-multiply leaf-sway pointer-events-none w-24 md:w-36 h-auto z-[2]"
      />
      <img
        src="/ladybug.png"
        alt=""
        className="absolute top-32 right-4 md:right-16 opacity-80 mix-blend-multiply leaf-sway pointer-events-none w-20 md:w-32 h-auto z-[2] -scale-x-100"
        style={{ animationDelay: '2s' }}
      />

      {/* Decorative coffee beans */}
      <img
        src="/beanfall.png"
        alt=""
        className="absolute top-[20%] left-[8%] opacity-70 mix-blend-multiply pointer-events-none rotate-12 w-16 h-auto z-[2]"
      />
      <img
        src="/beanfall.png"
        alt=""
        className="absolute top-[30%] right-[12%] opacity-60 mix-blend-multiply pointer-events-none -rotate-45 w-20 h-auto z-[2]"
      />

      {/* Table Background */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-[var(--color-bg-secondary)] z-0 border-t border-[var(--color-border)]" />

      {/* ESPRESSO Bands */}
      <motion.div
        className="absolute bottom-[10%] left-0 right-0 z-[5] pointer-events-none h-64 flex flex-col justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 1.2, delay: 1.2 }}
      >
        <div className="absolute top-10 left-[-10%] w-[120%] h-14 bg-[var(--color-accent)] -rotate-3 flex items-center whitespace-nowrap overflow-hidden shadow-sm">
          <div className="animate-[marquee_20s_linear_infinite] flex items-center text-[var(--color-bg-primary)] font-display font-bold text-2xl tracking-widest uppercase">
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <span className="mx-6">ESPRESSO</span>
                <Coffee size={24} className="mx-6" />
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="absolute top-28 left-[-10%] w-[120%] h-14 bg-[var(--color-border)] rotate-2 flex items-center whitespace-nowrap overflow-hidden shadow-sm">
          <div className="animate-[marquee_25s_linear_infinite_reverse] flex items-center text-[var(--color-text-secondary)] font-display font-bold text-2xl tracking-widest uppercase">
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <span className="mx-6">ESPRESSO</span>
                <Coffee size={24} className="mx-6" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto w-full flex flex-col items-center mt-12 md:mt-16 relative z-10 px-6">
        {/* Handwritten tagline */}
        <motion.p
          className="font-handwritten text-[20px] md:text-[24px] text-[var(--color-accent)] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          The perfect excuse for another cup
        </motion.p>

        {/* Title */}
        <div className="relative">
          <motion.h1
            className="text-[18vw] md:text-[14vw] leading-[0.85] font-display font-bold tracking-tight text-[var(--color-text-primary)] relative z-0"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            Roastly
          </motion.h1>
        </div>

        {/* Cup — ENLARGED to overlap the title */}
        <div className="relative w-full flex justify-center items-center -mt-14 md:-mt-36 z-10 mb-0">
          <div className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] md:w-[680px] md:h-[680px] flex justify-center items-center">

            {/* Warm radial glow */}
            <motion.div
              className="absolute inset-[-10%] rounded-full hero-glow z-0"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.6, ease: 'easeOut' }}
            />

            {/* Coffee Cup */}
            <motion.div
              className="w-full h-full z-10 relative flex justify-center items-center"
              initial={{ opacity: 0, y: 120, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="/coffee-cup.png"
                alt="Premium Latte Art"
                className="w-[85%] h-[85%] object-contain drop-shadow-[0_40px_50px_rgba(44,40,37,0.35)] hero-float relative z-10"
              />
            </motion.div>

            {/* Circular CTA */}
            <motion.button
              onClick={() => { setView('menu'); window.scrollTo(0, 0); }}
              className="absolute right-[-2%] md:right-10 top-1/2 -translate-y-1/2 z-20 w-24 h-24 md:w-32 md:h-32 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] rounded-full flex items-center justify-center group border border-[var(--color-border)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] transition-all duration-300 shadow-xl"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform duration-200" />
              <div className="absolute inset-0 animate-[spin_15s_linear_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible opacity-60">
                  <path id="circlePath" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" fill="transparent" />
                  <text className="text-[9.5px] font-sans font-medium uppercase tracking-[0.25em]" fill="currentColor">
                    <textPath href="#circlePath" startOffset="0%">
                      ORDER NOW • ORDER NOW • ORDER NOW •
                    </textPath>
                  </text>
                </svg>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   Stats / Why Us
   ────────────────────────────────────────────────────────────── */
const WhyUs = () => {
  const stats = [
    { value: '100%', label: 'Locally Sourced', icon: <MapPin size={22} /> },
    { value: '24h', label: 'Freshly Roasted', icon: <Flame size={22} /> },
    { value: '5k+', label: 'Happy Locals', icon: <Heart size={22} /> },
  ];

  return (
    <section className="py-20 border-y border-[var(--color-border)] bg-[var(--color-bg-secondary)] relative">
      {/* Decorative beans */}
      <img src="/beanfall.png" alt="" className="absolute top-6 right-[10%] opacity-60 mix-blend-multiply pointer-events-none rotate-45 w-14 h-auto" />
      <img src="/beanfall.png" alt="" className="absolute bottom-6 left-[15%] opacity-50 mix-blend-multiply pointer-events-none -rotate-12 w-12 h-auto" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <div className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)] mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <span className="text-[32px] md:text-[36px] font-display font-bold text-[var(--color-text-primary)] mb-1">{stat.value}</span>
                <span className="text-[12px] font-sans font-medium text-[var(--color-text-secondary)] tracking-[0.15em] uppercase">{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   Our Menu — Using Custom User Images
   ────────────────────────────────────────────────────────────── */
const OurMenu = ({ setView }: { setView: (v: 'home' | 'menu') => void }) => {
  const items = [
    { img: '/clasic expresso.jpg', title: 'Classic Espresso', desc: 'Rich & Bold', price: '$4.50' },
    { img: '/velvetchocolateespresso.webp', title: 'Velvet Cappuccino', desc: 'Smooth & Creamy', price: '$5.50' },
    { img: '/artisan.webp', title: 'Artisan Pastries', desc: 'Baked Fresh Daily', price: '$6.00' },
    { img: '/house blend.png', title: 'House Blend Beans', desc: 'Freshly Roasted', price: '$15.00' },
  ];

  return (
    <section id="menu" className="py-24 bg-[var(--color-bg-primary)] relative">
      {/* Decorative leaf */}
      <img src="/purpleflora.png" alt="" className="absolute top-8 right-8 md:right-20 opacity-70 mix-blend-multiply leaf-sway pointer-events-none w-24 md:w-32 h-auto" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
            <div>
              <p className="font-handwritten text-[22px] md:text-[28px] text-[var(--color-accent)] mb-1">Curated Selections</p>
              <h2 className="text-[32px] md:text-[44px] font-display font-bold text-[var(--color-text-primary)] mb-2">
                <span className="hand-underline">Our Menu</span>
              </h2>
              <p className="text-[15px] font-sans text-[var(--color-text-secondary)] max-w-md">Carefully crafted to elevate your daily routine.</p>
            </div>
            <motion.button
              onClick={() => { setView('menu'); window.scrollTo(0, 0); }}
              className="text-[14px] font-sans font-medium text-[var(--color-bg-primary)] bg-[var(--color-text-primary)] px-6 py-3 rounded-full flex items-center gap-2 group hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              View Full Menu
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div
                className="group flex flex-col bg-[var(--color-bg-secondary)] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm hover:border-[var(--color-accent)] cursor-pointer h-full"
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(44,40,37,0.12)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-[240px] overflow-hidden bg-[var(--color-bg-primary)] flex items-center justify-center">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Price badge */}
                  <div className="absolute top-3 right-3 bg-[var(--color-bg-primary)]/90 backdrop-blur-sm px-3 py-1 rounded-full text-[13px] font-sans font-bold text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)]">
                    {item.price}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
                  <h3 className="text-[18px] font-display font-semibold text-[var(--color-text-primary)] mb-1">{item.title}</h3>
                  <p className="text-[14px] font-sans text-[var(--color-text-secondary)]">{item.desc}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   Banner CTA
   ────────────────────────────────────────────────────────────── */
const Banner = ({ setView }: { setView: (v: 'home' | 'menu') => void }) => {
  return (
    <section id="story" className="py-20 bg-[var(--color-bg-secondary)] relative z-10">

      {/* Decorative center divider above banner */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none z-20">
        <img src="/purpleflora.png" className="h-20 w-auto opacity-60 mix-blend-multiply leaf-sway" alt="divider" />
      </div>

      {/* Decorative leaves */}
      <img src="/ladybug.png" alt="" className="absolute bottom-4 left-4 md:left-12 opacity-80 mix-blend-multiply leaf-sway pointer-events-none w-24 md:w-32 h-auto" style={{ animationDelay: '3s' }} />

      <div className="max-w-5xl mx-auto px-6 mt-6">
        <Reveal>
          <div className="relative bg-gradient-to-br from-[var(--color-text-primary)] to-[#3D3530] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left overflow-hidden shadow-xl">
            {/* Decorative circles */}
            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full bg-[var(--color-accent)]/10 pointer-events-none" />
            <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-[var(--color-accent)]/5 pointer-events-none" />

            {/* Scattered coffee beans */}
            <img src="/beanfall.png" alt="" className="absolute top-8 right-[30%] opacity-40 mix-blend-screen -rotate-12 pointer-events-none w-14 h-auto" />
            <img src="/beanfall.png" alt="" className="absolute bottom-12 right-[20%] opacity-30 mix-blend-screen rotate-45 pointer-events-none w-10 h-auto" />

            <div className="max-w-lg relative z-10">
              <p className="font-handwritten text-[22px] md:text-[28px] text-[var(--color-accent)] mb-1">Handcrafted Daily</p>
              <h2 className="text-[28px] md:text-[36px] font-display font-bold text-[var(--color-bg-primary)] mb-4 leading-tight">
                Morning starts here.
              </h2>
              <p className="text-[15px] font-sans text-[var(--color-bg-primary)]/80 mb-8 leading-relaxed">
                Skip the line and order ahead. Your perfect cup, handcrafted with love, will be waiting for you.
              </p>
              <motion.button
                onClick={() => { setView('menu'); window.scrollTo(0, 0); }}
                className="inline-flex items-center gap-3 bg-[var(--color-accent)] text-[var(--color-text-primary)] px-8 py-4 rounded-full font-sans font-semibold text-[15px] shadow-lg hover:shadow-xl transition-shadow group"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Coffee size={18} />
                Order Your Cup
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>

            {/* Premium to-go cup user image */}
            <div className="w-48 h-48 md:w-64 md:h-auto shrink-0 relative z-10 flex justify-center items-center">
              <img
                src="/togocup.png"
                alt="Premium To-Go Coffee"
                className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] hero-float relative z-10 max-h-[300px]"
              />
              {/* Handwritten label */}
              <div className="absolute -bottom-2 md:-bottom-6 -right-2 md:-right-6 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-handwritten text-[18px] md:text-[22px] px-5 py-2 rounded-full shadow-lg rotate-[-5deg] border border-[var(--color-border)] z-20">
                Fresh daily ☕
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   Reviews
   ────────────────────────────────────────────────────────────── */
const Reviews = () => {
  const reviews = [
    { name: 'Gabrielle W.', text: 'The most consistent and flavorful espresso in the neighborhood. It\'s become my morning ritual.', stars: 5 },
    { name: 'Samantha J.', text: 'Exceeded my expectations. The ambiance is perfect for deep work and creative thinking.', stars: 5 },
    { name: 'Isabella R.', text: 'Their ability to capture the essence of single-origin beans is unparalleled. Truly artisanal.', stars: 5 },
  ];

  return (
    <section id="reviews" className="py-24 bg-[var(--color-bg-primary)] relative z-0">
      {/* Decorative elements */}
      <img src="/ladybug.png" alt="" className="absolute top-12 left-8 md:left-16 opacity-70 mix-blend-multiply leaf-sway pointer-events-none w-20 md:w-28 h-auto" style={{ animationDelay: '4s' }} />
      <img src="/beanfall.png" alt="" className="absolute bottom-8 right-8 md:right-20 opacity-50 mix-blend-multiply pointer-events-none rotate-20 w-16 h-auto" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-handwritten text-[22px] md:text-[28px] text-[var(--color-accent)] mb-1">Testimonials</p>
            <h2 className="text-[32px] md:text-[44px] font-display font-bold text-[var(--color-text-primary)] mb-2">
              <span className="hand-underline">Words of praise</span>
            </h2>
            <p className="text-[15px] font-sans text-[var(--color-text-secondary)]">Loved by the neighborhood.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reviews.map((review, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <motion.div
                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group h-full shadow-sm hover:border-[var(--color-accent)] transition-colors"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                {/* Decorative large quote */}
                <span className="absolute top-3 right-6 text-[80px] font-display font-bold text-[var(--color-accent)]/20 leading-none pointer-events-none select-none font-serif">"</span>

                {/* Stars */}
                <div className="flex gap-1 mb-4 relative z-10">
                  {[...Array(review.stars)].map((_, s) => (
                    <Star key={s} size={15} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                  ))}
                </div>

                <p className="text-[var(--color-text-primary)] text-[16px] leading-[1.7] mb-8 relative z-10 font-display italic">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-full border border-[var(--color-border)] overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=${review.name}`} alt={review.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-[var(--color-text-primary)] text-[15px]">{review.name}</h4>
                    <p className="text-[13px] font-sans text-[var(--color-text-secondary)]">Regular Customer</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   Contact
   ────────────────────────────────────────────────────────────── */
const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000); // Reset success message after 5s
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="py-24 bg-[var(--color-bg-secondary)] relative">
      {/* Decorative leaf */}
      <img src="/bean.png" alt="" className="absolute top-8 right-8 md:right-16 opacity-70 mix-blend-multiply leaf-sway pointer-events-none w-24 md:w-36 h-auto" style={{ animationDelay: '5s' }} />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-handwritten text-[22px] md:text-[28px] text-[var(--color-accent)] mb-1">Say Hello</p>
            <h2 className="text-[32px] md:text-[44px] font-display font-bold text-[var(--color-text-primary)] mb-2">
              <span className="hand-underline">Get In Touch</span>
            </h2>
            <p className="text-[15px] font-sans text-[var(--color-text-secondary)] max-w-lg mx-auto">
              Whether you're looking to host an event, inquire about our wholesale beans, or just want to say hello.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Reveal delay={0.1} direction="left">
            <div className="space-y-8 bg-[var(--color-bg-primary)] p-8 rounded-3xl border border-[var(--color-border)] shadow-sm">
              {[
                { icon: <MapPin size={22} />, title: 'Location', lines: ['123 Brew Street', 'Coffee District, CD 10012'] },
                { icon: <Clock size={22} />, title: 'Hours', lines: ['Mon-Fri: 7am - 7pm', 'Sat-Sun: 8am - 8pm'] },
                { icon: <Mail size={22} />, title: 'Email', lines: ['hello@roastly.com'] },
                { icon: <Phone size={22} />, title: 'Phone', lines: ['(555) 123-4567'] },
              ].map((item, i) => (
                <div key={i} className="flex gap-5 items-start group relative">
                  <div className="w-12 h-12 rounded-full border border-[var(--color-accent)] bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-primary)] shrink-0 group-hover:scale-105 group-hover:bg-[var(--color-text-primary)] group-hover:text-[var(--color-bg-primary)] transition-all duration-300 shadow-sm relative z-10">
                    {item.icon}
                  </div>
                  {i !== 3 && <div className="absolute left-6 top-12 bottom-[-2rem] w-[1px] bg-[var(--color-border)] group-hover:bg-[var(--color-accent)] transition-colors z-0" />}
                  <div className="pt-1">
                    <h4 className="font-display font-semibold text-[var(--color-text-primary)] text-[16px] mb-1">{item.title}</h4>
                    {item.lines.map((line, j) => (
                      <p key={j} className="text-[var(--color-text-secondary)] font-sans text-[14px] leading-[1.6]">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2} direction="right">
            <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] p-8 md:p-10 rounded-3xl shadow-sm">
              <h3 className="text-[22px] font-display font-semibold text-[var(--color-text-primary)] mb-8 flex items-center gap-2">
                <Coffee size={20} className="text-[var(--color-accent)]" /> Send a message
              </h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-sans font-medium text-[var(--color-text-secondary)] mb-2 uppercase tracking-wide">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      disabled={status === 'loading'}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-[15px] font-sans text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/40 focus:outline-none focus:border-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-text-primary)] transition-all disabled:opacity-50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-sans font-medium text-[var(--color-text-secondary)] mb-2 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      disabled={status === 'loading'}
                      className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-[15px] font-sans text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/40 focus:outline-none focus:border-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-text-primary)] transition-all disabled:opacity-50"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-sans font-medium text-[var(--color-text-secondary)] mb-2 uppercase tracking-wide">Message</label>
                  <textarea
                    rows={4}
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl px-4 py-3.5 text-[15px] font-sans text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/40 focus:outline-none focus:border-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-text-primary)] transition-all resize-none disabled:opacity-50"
                    placeholder="How can we help?"
                  ></textarea>
                </div>

                {status === 'success' && (
                  <div className="p-4 bg-green-50/5 text-green-600 border border-green-200/20 rounded-xl text-sm font-medium">
                    Message sent successfully! We'll get back to you soon.
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-4 bg-red-50/5 text-red-500 border border-red-200/20 rounded-xl text-sm font-medium">
                    {errorMessage}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-sans font-semibold text-[15px] px-8 py-4 rounded-full transition-all w-full flex items-center justify-center gap-2 group hover:bg-[var(--color-accent)] hover:text-[var(--color-text-primary)] disabled:opacity-70"
                  whileHover={status !== 'loading' ? { scale: 1.02, boxShadow: '0 8px 24px rgba(44,40,37,0.15)' } : {}}
                  whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                  {status !== 'loading' && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </motion.button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────────────────────────────────────────────
   Footer
   ────────────────────────────────────────────────────────────── */
const Footer = () => {
  return (
    <footer className="bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] pt-16 pb-8 relative overflow-hidden">
      {/* Decorative elements */}
      <img src="/beanfall.png" alt="" className="absolute top-12 right-12 opacity-30 mix-blend-screen pointer-events-none w-20 h-auto" />
      <img src="/beanfall.png" alt="" className="absolute bottom-20 left-8 opacity-20 mix-blend-screen pointer-events-none -rotate-12 w-24 h-auto" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Coffee size={24} className="text-[var(--color-accent)]" />
              <span className="font-display font-bold text-2xl tracking-tight">Roastly</span>
            </div>
            <p className="text-[14px] font-sans text-[var(--color-bg-primary)]/70 leading-relaxed mb-6">
              Handcrafted coffee, roasted with love. Serving the neighborhood since 2019.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Instagram size={18} />, label: 'Instagram' },
                { icon: <Twitter size={18} />, label: 'Twitter' },
                { icon: <Facebook size={18} />, label: 'Facebook' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)] transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-[15px] uppercase tracking-wider mb-5 text-[var(--color-accent)]">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Menu', 'Our Story', 'Reviews', 'Contact'].map((link) => (
                <li key={link}>
                  <a href={`#${link === 'Home' ? '' : link === 'Our Story' ? 'story' : link.toLowerCase()}`} className="text-[14px] font-sans text-[var(--color-bg-primary)]/70 hover:text-[var(--color-accent)] transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display font-semibold text-[15px] uppercase tracking-wider mb-5 text-[var(--color-accent)]">Hours</h4>
            <div className="space-y-4 text-[14px] font-sans text-[var(--color-bg-primary)]/70">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span>Mon - Fri</span>
                <span className="font-medium text-white">7am - 7pm</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span>Sat - Sun</span>
                <span className="font-medium text-white">8am - 8pm</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Holidays</span>
                <span className="font-medium text-white">9am - 5pm</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-semibold text-[15px] uppercase tracking-wider mb-5 text-[var(--color-accent)]">Stay Updated</h4>
            <p className="text-[14px] font-sans text-[var(--color-bg-primary)]/70 mb-5">Get the latest on new blends and seasonal specials.</p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] font-sans placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)] focus:bg-white/10 transition-all"
              />
              <button className="w-full bg-[var(--color-accent)] text-[var(--color-text-primary)] px-4 py-3 rounded-xl text-[14px] font-sans font-bold hover:opacity-90 hover:shadow-lg transition-all flex justify-center items-center gap-2 group">
                Join Newsletter <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] font-sans text-[var(--color-bg-primary)]/40 flex items-center gap-4">
            <span>© {new Date().getFullYear()} Roastly Cafe. All rights reserved.</span>
            <button onClick={() => window.dispatchEvent(new CustomEvent('NAV_OWNER'))} className="hover:text-white transition-colors cursor-pointer border-l border-white/20 pl-4">Staff Portal</button>
          </p>
          <p className="text-[15px] font-handwritten text-[var(--color-bg-primary)]/60 flex items-center gap-1.5">
            Handcrafted with <Coffee size={14} className="text-[var(--color-accent)] mx-0.5" /> &amp; love
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ──────────────────────────────────────────────────────────────
   App Shell
   ────────────────────────────────────────────────────────────── */
import FullMenu from './components/FullMenu';
import OwnerPortal from './components/OwnerPortal';

export default function App() {
  const [view, setView] = useState<'home' | 'menu' | 'owner'>('home');

  useEffect(() => {
    const handleNav = () => {
      setView('owner');
      window.scrollTo(0, 0);
    };
    window.addEventListener('NAV_OWNER', handleNav);
    return () => window.removeEventListener('NAV_OWNER', handleNav);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <CustomCursor />
      {view !== 'owner' && <Navigation view={view} setView={setView} />}
      <main>
        {view === 'home' && (
          <>
            <Hero setView={setView} />
            <WhyUs />
            <WavyDivider />
            <OurMenu setView={setView} />
            {/* Removed branch divider since purpleflora is positioned relatively inside Menu block */}
            <Banner setView={setView} />
            <Reviews />
            <WavyDivider />
            <Contact />
          </>
        )}
        {view === 'menu' && <FullMenu />}
        {view === 'owner' && <OwnerPortal />}
      </main>
      {view !== 'owner' && <Footer />}
      <SpeedInsights />
    </div>
  );
}
