import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HowItWorksStep from './HowItWorksStep';
import { howItWorksContent } from '../content';

gsap.registerPlugin(ScrollTrigger);

const connectorDots = [
  { top: '18%', left: '10%' },
  { top: '38%', right: '9%' },
  { bottom: '20%', left: '18%' },
  { bottom: '12%', right: '22%' },
];

const SECTION_ACTIVE_Z_INDEX = 120;
const SECTION_RESTING_Z_INDEX = 40;
const STEP_SCROLL_LENGTH = 160;
const CARD_SETTLE_HOLD = 0.8;

const HowItWorksSection = ({ className = '' }) => {
  const { eyebrow, title, steps } = howItWorksContent;
  const sectionRef = useRef(null);
  const cardsLayerRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      // 1. Initial State: Cards are positioned below the viewport
      gsap.set(cards, {
        y: () => window.innerHeight, 
        yPercent: -50,
        xPercent: 0,
        rotation: 0,
        autoAlpha: 1,
      });

      // 2. Main Timeline: Handles pinning and stacking
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${steps.length * STEP_SCROLL_LENGTH}%`,
          pin: true,
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => {
            gsap.set(sectionRef.current, { zIndex: SECTION_ACTIVE_Z_INDEX });
            gsap.set(cardsLayerRef.current, { autoAlpha: 1 });
          },
          onEnterBack: () => {
            gsap.set(sectionRef.current, { zIndex: SECTION_ACTIVE_Z_INDEX });
            gsap.set(cardsLayerRef.current, { autoAlpha: 1 });
          },
          onLeave: () => {
            gsap.set(sectionRef.current, { zIndex: SECTION_RESTING_Z_INDEX });
            gsap.set(cardsLayerRef.current, { autoAlpha: 1 });
          },
          onLeaveBack: () => {
            gsap.set(sectionRef.current, { zIndex: SECTION_RESTING_Z_INDEX });
            gsap.set(cardsLayerRef.current, { autoAlpha: 1 });
          },
        },
      });

      cards.forEach((card, i) => {
        // Card slides to center (y: 0) and slightly rotates
        tl.to(card, {
          y: 0,
          rotation: i % 2 === 0 ? -1.5 : 1.5,
          duration: 1,
          ease: 'none',
          // Stacking logic: each new card gets a higher z-index
          onStart: () => gsap.set(card, { zIndex: 100 + i }),
          onReverseComplete: () => gsap.set(card, { zIndex: 100 + i }),
        });

        if (i < cards.length - 1) {
          tl.to({}, { duration: CARD_SETTLE_HOLD });
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [steps]);

  return (
    <section 
      id="how-it-works"
      ref={sectionRef} 
      className={`relative z-100 min-h-screen w-screen max-w-full bg-[#00E676] border-t-[6px] border-black font-mono overflow-hidden ${className}`}
    style={{
      /* This polygon creates the sharp caution-strip angle that sits OVER the next section */
    
    }}
    >
      <div className="sticky top-0 h-screen h-[100svh] overflow-hidden">
        
        {/* BACKGROUND DECOR */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <svg className="h-full w-full" viewBox="0 0 1200 900" preserveAspectRatio="none">
            <g stroke="black" strokeWidth="3" fill="none">
              <path d="M 0 170 H 380 V 370 H 840 V 120 H 1200" />
              <path d="M 110 900 V 620 H 520 V 760 H 1200" />
              <path d="M 260 0 V 250 H 710 V 900" />
            </g>
          </svg>
        </div>

        {connectorDots.map((style, index) => (
          <div key={index} className="absolute h-2.5 w-2.5 rounded-full bg-black sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 z-0" style={style} />
        ))}

        {/* PERSISTENT HEADER UI */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-3 text-center select-none sm:px-4">
          <span className="inline-flex max-w-[92vw] bg-black text-white px-3 py-1.5 font-black uppercase italic text-[10px] tracking-widest sm:text-xs">
            {eyebrow}
          </span>
          <h2
            className="mt-4 max-w-[94vw] font-black italic uppercase text-black text-[clamp(3.15rem,14vw,12rem)] leading-[0.86] opacity-95 sm:mt-5 sm:max-w-[96vw] sm:text-[clamp(4.4rem,15vw,12rem)] sm:leading-[0.78]"
            style={{
              WebkitTextStroke: 'clamp(1px, 0.16vw, 1.5px) black',
              textShadow: 'clamp(4px, 0.7vw, 7px) clamp(4px, 0.7vw, 7px) 0 #FFD600, clamp(7px, 1.15vw, 12px) clamp(7px, 1.15vw, 12px) 0 rgba(0, 0, 0, 0.16)',
            }}
          >
            {title}
          </h2>
          <div className="mt-5 max-w-[92vw] bg-[#FFD600] border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] px-3 py-2 sm:mt-8 sm:border-[4px] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:px-5 sm:py-3">
            <p className="font-black uppercase italic text-[10px] leading-tight sm:text-sm md:text-base text-black">
              select, perform, derive, encrypt
            </p>
          </div>
        </div>

        {/* STACKING CARDS LAYER */}
        <div ref={cardsLayerRef} className="absolute inset-0 z-20 pointer-events-none">
          {steps.map((step, index) => (
            <HowItWorksStep
              key={step.id}
              ref={(el) => (cardRefs.current[index] = el)}
              step={step}
              className="absolute left-0 right-0 top-1/2 mx-auto w-[92%] max-w-130 will-change-transform pointer-events-auto [backface-visibility:hidden] sm:w-[90%]"
              style={{ zIndex: index + 10 }} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
