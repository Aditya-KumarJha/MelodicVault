import { useLayoutEffect, useRef } from 'react';
import { Activity, ArrowRight, Code2, Hash, Mail, Zap } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IconTileLink, WindowDots } from '../components';

gsap.registerPlugin(ScrollTrigger);

const footerGroups = [
  {
    title: 'SYSTEM',
    kicker: 'Product routes',
    links: [
      { label: 'Create Vault', note: 'Encrypt a selected file' },
      { label: 'Unlock Vault', note: 'Replay melody to decrypt' },
      { label: 'Vault History', note: 'Metadata without secrets' },
    ],
  },
  {
    title: 'DEBUG',
    kicker: 'Ops library',
    links: [
      { label: 'Melody Engine', note: 'Notes and timing capture' },
      { label: 'Crypto Engine', note: 'KDF plus AES-GCM' },
      { label: 'Vault Format', note: '.vault container layout' },
    ],
  },
  {
    title: 'CORE',
    kicker: 'Company signal',
    links: [
      { label: 'About', note: 'Why musical auth matters' },
      { label: 'Security', note: 'Privacy-first design rules' },
      { label: 'Roadmap', note: 'ESP32 and MIDI later' },
    ],
  },
];

const FooterCtaSection = ({ className = '' }) => {
  const sectionRef = useRef(null);
  const floorRef = useRef(null);
  const stripTrackRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. FLOOR PERSPECTIVE
      gsap.fromTo(floorRef.current, 
        { rotateX: 90, y: 0 }, 
        { 
          rotateX: 65, 
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "top top",
            scrub: true
          }
        }
      );

      // 2. WINDOWS LANDING
      gsap.from(".drop-window", {
        y: -500,
        rotateZ: -10,
        autoAlpha: 0,
        stagger: 0.15,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        }
      });

      gsap.from(".footer-point", {
        x: -28,
        autoAlpha: 0,
        stagger: 0.055,
        duration: 0.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".footer-nav",
          start: "top 82%",
        }
      });

      gsap.to(stripTrackRef.current, {
        xPercent: -50,
        duration: 18,
        ease: "none",
        repeat: -1,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer 
      ref={sectionRef} 
      className={`relative w-full bg-[#1E6BFF] pt-32 pb-16 md:pb-24 overflow-hidden font-mono ${className}`}
      style={{ perspective: '1500px', perspectiveOrigin: '50% 0%' }}
    >
      {/* BACK WALL GRID */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* 3D CHECKERED FLOOR */}
      <div 
        ref={floorRef}
        className="absolute top-0 left-[-50%] w-[200%] h-screen z-0 pointer-events-none"
        style={{ 
          backgroundImage: `
            linear-gradient(45deg, #fff 25%, transparent 25%), 
            linear-gradient(-45deg, #fff 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #fff 75%), 
            linear-gradient(-45deg, transparent 75%, #fff 75%)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: '0 0, 0 50px, 50px -50px, -50px 0px',
          backgroundColor: '#1E6BFF',
          transformOrigin: 'top center',
          borderTop: '6px solid black'
        }} 
      />

      {/* TICKER STRIP */}
      <div className="absolute inset-x-0 top-0 z-5 overflow-hidden border-y-[6px] border-black bg-[#FFD600] py-2 shadow-[0_8px_0px_0px_rgba(0,0,0,1)]">
        <div ref={stripTrackRef} className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform">
          {[...Array(2)].map((_, repeatIndex) => (
            <div key={repeatIndex} className="flex items-center gap-8">
              {['MELODY LOCKED', 'VAULT ARTIFACT READY', 'CLIENT CRYPTO ONLINE', 'WRONG PATTERN DENIED', 'METADATA ONLY'].map((item) => (
                <span key={`${repeatIndex}-${item}`} className="flex items-center gap-3 font-black uppercase italic tracking-[0.18em] text-black text-[10px] sm:text-xs">
                  <span className="h-2.5 w-2.5 border-2 border-black bg-[#1E6BFF]" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* CTA CONTENT STACK - Height reduced on mobile to prevent overlap */}
        <div className="relative h-100 md:h-125 flex items-center justify-center">
          
          <div className="drop-window relative w-full max-w-[90vw] md:max-w-md bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black border-b-[6px] border-black p-2 md:p-3 flex justify-between items-center text-white">
              <WindowDots dotClassName="h-3 w-3 border-2 md:h-4 md:w-4" colors={['bg-[#FF5F56]', 'bg-[#FFBD2E]']} />
              <span className="text-[9px] md:text-[10px] font-black italic tracking-widest uppercase">Vault_Ready</span>
            </div>
            
            <div className="p-6 md:p-10 text-center">
              <h2 className="font-black text-black leading-[0.85] text-4xl sm:text-5xl md:text-6xl uppercase italic mb-6 md:mb-8">
                PLAY <br/>THE <span className="bg-[#1E6BFF] text-white px-1.5 md:px-2">KEY.</span>
              </h2>
              <button className="group w-full bg-[#FFD600] border-4 border-black p-3 md:p-4 text-black font-black uppercase italic text-base md:text-xl flex items-center justify-between hover:translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
                <span>Open_Vault</span>
                <Zap fill="currentColor" size={20} className="md:w-6 md:h-6" />
              </button>
            </div>
          </div>

          {/* Floating window hidden on very small screens to avoid clutter */}
          <div className="drop-window absolute -right-4 top-16 md:-right-6 md:top-10 bg-[#00E676] border-4 border-black p-3 md:p-5 rotate-[8deg] z-30 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hidden sm:block">
            <Activity className="text-black w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
            <p className="text-[8px] md:text-[10px] font-black mt-2 uppercase tracking-tighter">Rhythm_Pulse</p>
          </div>
        </div>

        {/* BRUTALIST NAV - Responsive Grid Logic */}
        <div className="footer-nav grid gap-12 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.05fr_1fr_1fr_1fr] mt-12 md:mt-24">
          <div className="space-y-6 lg:pr-6">
            <div className="bg-black text-white p-4 inline-block transform -skew-x-12 border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,230,118,1)]">
              <h3 className="text-2xl md:text-3xl font-black italic uppercase leading-none tracking-tighter">MELODIC VAULT</h3>
            </div>
            <p className="max-w-xs text-xs md:text-sm font-black uppercase italic leading-tight text-white">
              Secure file vaults where melody and rhythm become the unlock pattern.
            </p>
            <div className="flex gap-3">
              <IconTileLink className="bg-white text-black" label="Email Melodic Vault">
                <Mail className="h-4.5 w-4.5 md:h-5 md:w-5" strokeWidth={3} />
              </IconTileLink>
              <IconTileLink className="bg-[#FFD600] text-black" label="Developer resources">
                <Code2 className="h-4.5 w-4.5 md:h-5 md:w-5" strokeWidth={3} />
              </IconTileLink>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <div className="mb-5 flex items-end justify-between gap-3 border-b-4 border-black pb-3">
                <div>
                  <h4 className="inline-block border-2 border-black bg-[#FFD600] px-2 font-black uppercase italic tracking-widest text-black text-[9px] md:text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {group.title}
                  </h4>
                  <p className="mt-2 md:mt-3 font-black uppercase tracking-[0.16em] text-black/60 text-[8px] md:text-[9px]">{group.kicker}</p>
                </div>
                <Hash className="h-4 w-4 text-black md:h-4.5 md:w-4.5" strokeWidth={4} />
              </div>

              <ul className="grid gap-3">
                {group.links.map((link, index) => (
                  <li key={link.label} className="footer-point">
                    <a className="group grid grid-cols-[2rem_minmax(0,1fr)_auto] md:grid-cols-[2.35rem_minmax(0,1fr)_auto] items-center gap-2 md:gap-3 border-4 border-black bg-white/95 p-2 md:p-3 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:bg-[#00E676] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]" href="#">
                      <span className="grid h-8 w-8 md:h-9 md:w-9 place-items-center border-2 border-black bg-[#1E6BFF] font-black text-white text-[9px] md:text-[10px]">
                        0{index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-black uppercase italic leading-none text-xs md:text-sm">{link.label}</span>
                        <span className="mt-1 block truncate font-black uppercase tracking-[0.08em] text-black/55 text-[8px] md:text-[9px]">{link.note}</span>
                      </span>
                      <ArrowRight className="h-3.75 w-3.75 transition-transform group-hover:translate-x-1 md:h-4.25 md:w-4.25" strokeWidth={4} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default FooterCtaSection;
