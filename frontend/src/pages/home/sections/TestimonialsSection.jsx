import { useLayoutEffect, useRef } from 'react';
import { FileArchive, KeyRound, Music2, Quote, ShieldCheck, Timer } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: 'Melodic Vault made the encryption demo feel memorable, secure, and easy to explain.',
    name: 'Aarav Mehta',
    role: 'Student Builder',
    company: 'Crypto Lab',
    metric: '0 keys stored',
    icon: ShieldCheck,
  },
  {
    quote: 'The melody plus rhythm idea turned a normal file lock into a strong project story.',
    name: 'Nisha Rao',
    role: 'Research Mentor',
    company: 'Security Studio',
    metric: 'AES-GCM',
    icon: Music2,
  },
  {
    quote: 'The metadata-only backend keeps the security model simple and defensible.',
    name: 'Kabir Sethi',
    role: 'Backend Engineer',
    company: 'Vault Works',
    metric: 'local crypto',
    icon: FileArchive,
  },
  {
    quote: 'Wrong-pattern rejection is the part everyone understands immediately.',
    name: 'Mira Shah',
    role: 'Evaluator',
    company: 'Project Jury',
    metric: 'deny by auth tag',
    icon: KeyRound,
  },
  {
    quote: 'Timing makes the secret feel personal without storing biometric raw data.',
    name: 'Dev Arora',
    role: 'Frontend Engineer',
    company: 'MVP Forge',
    metric: 'rhythm profile',
    icon: Timer,
  },
];

const TestimonialsSection = ({ className = '' }) => {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    const cards = cardRefs.current.filter(Boolean);

    const ctx = gsap.context(() => {
      gsap.set(cards, {
        autoAlpha: 0,
        x: 80,
        rotation: (index) => [-2, 1.5, -1, 1, -1.4][index] || 0,
      });

      const getTravel = () => {
        const viewport = viewportRef.current;
        const lastCard = cards.at(-1);
        return lastCard && viewport ? Math.max(0, lastCard.offsetLeft + lastCard.offsetWidth - viewport.clientWidth) : 0;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${getTravel()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(cards, { autoAlpha: 1, x: 0, stagger: 0.08, duration: 0.25, ease: 'none' }, 0)
        .to(trackRef.current, { x: () => -getTravel(), duration: 1, ease: 'none' }, 0.08);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative z-[60] h-screen h-[100svh] w-screen max-w-full overflow-hidden border-b-[6px] border-black bg-[#1E6BFF] font-mono text-white ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-10 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-grain opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-14 border-t-[3px] border-black/35 bg-black/10" />

      <div ref={viewportRef} className="relative z-10 h-full overflow-hidden">
        <div ref={trackRef} className="flex h-full w-max items-center gap-4 px-8 py-7 sm:gap-6 sm:px-12 lg:px-20">
          <div className="flex h-[min(520px,78svh)] w-[88vw] max-w-[920px] shrink-0 flex-col justify-center text-white lg:w-[820px]">
            <div>
              <div className="inline-flex border-[3px] border-white bg-black px-3 py-1.5 font-black uppercase italic tracking-[0.18em] text-[#BFE8FF] text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:text-xs">
                vault signal log
              </div>
              <h2
                className="mt-4 max-w-[12ch] text-wrap font-black uppercase italic leading-[0.88] text-[clamp(2.35rem,8vw,5.9rem)] sm:mt-5 sm:text-[clamp(3rem,7.5vw,6.7rem)]"
                style={{
                  WebkitTextStroke: 'clamp(1px, 0.16vw, 1.5px) white',
                  textShadow: 'clamp(5px, 0.8vw, 9px) clamp(5px, 0.8vw, 9px) 0 #061B66, clamp(9px, 1.2vw, 14px) clamp(9px, 1.2vw, 14px) 0 rgba(0,0,0,0.5)',
                }}
              >
                Melody-first file security.
              </h2>
            </div>
            <div className="mt-5 grid w-full max-w-lg grid-cols-3 gap-2 sm:mt-7 sm:gap-3">
              {['KEYS', 'FILES', 'MELODY'].map((label, index) => (
                <div key={label} className="border-[3px] border-white bg-[#BFE8FF] px-2 py-3 text-center text-[#061B66] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:px-3 sm:py-4">
                  <span className="block font-black uppercase tracking-[0.12em] text-[9px] sm:text-[10px]">{label}</span>
                  <span className="mt-1 block font-black text-xl leading-none sm:text-3xl">{['0', 'local', 'secret'][index]}</span>
                </div>
              ))}
            </div>
          </div>

            {testimonials.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.name}
                  ref={(el) => (cardRefs.current[index] = el)}
                  className="relative flex h-[min(390px,76svh)] w-[88vw] max-w-[540px] shrink-0 flex-col justify-between border-[4px] border-white bg-[#061B66] p-4 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:w-[500px] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Quote className="h-9 w-9 text-[#BFE8FF]" strokeWidth={3.4} />
                    <div className="grid h-14 w-14 shrink-0 place-items-center border-[3px] border-white bg-[#BFE8FF]">
                      <Icon className="h-7 w-7 text-[#061B66]" strokeWidth={3.2} />
                    </div>
                  </div>
                  <p className="mt-4 font-black uppercase italic leading-[1.02] text-[clamp(1.05rem,3.6vw,1.78rem)] sm:mt-5 sm:leading-[0.98]">
                    {item.quote}
                  </p>
                  <div className="mt-4 border-t-[3px] border-white pt-3 sm:mt-5 sm:pt-4">
                    <span className="inline-flex border-[3px] border-white bg-[#1E6BFF] px-2 py-1 font-black uppercase tracking-[0.13em] text-white text-[10px]">
                      {item.metric}
                    </span>
                    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
                      <div className="min-w-0 pr-1">
                        <h3 className="break-words font-black uppercase text-lg leading-[0.95] sm:text-xl">{item.name}</h3>
                        <p className="mt-1 break-words font-bold uppercase tracking-[0.08em] text-white/70 text-[10px] sm:text-xs">
                          {item.role} / {item.company}
                        </p>
                      </div>
                      <span className="shrink-0 border-2 border-white px-2 py-1 font-black text-xs">0{index + 1}</span>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
