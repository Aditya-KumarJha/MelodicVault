import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const diagnosticPanels = [
  'col-start-2 row-start-2 h-14 w-14 sm:h-24 sm:w-24',
  'col-start-5 row-start-3 h-16 w-16 sm:h-32 sm:w-32',
  'col-start-1 row-start-5 h-12 w-12 sm:h-20 sm:w-20',
  'col-start-4 row-start-5 h-12 w-24 sm:h-16 sm:w-36',
];

const marginGlyphs = [
  { x: '8%', y: '14%', rotate: -12, scale: 1.05 },
  { x: '82%', y: '10%', rotate: 9, scale: 0.9 },
  { x: '91%', y: '28%', rotate: -7, scale: 1.18 },
  { x: '6%', y: '37%', rotate: 14, scale: 0.82 },
  { x: '88%', y: '55%', rotate: 12, scale: 1 },
  { x: '13%', y: '73%', rotate: -9, scale: 1.12 },
  { x: '72%', y: '86%', rotate: 7, scale: 0.86 },
  { x: '28%', y: '91%', rotate: -15, scale: 0.95 },
  { x: '4%', y: '88%', rotate: 8, scale: 0.78 },
  { x: '95%', y: '80%', rotate: -12, scale: 0.78 },
];

const incidentPhases = [
  {
    id: 'error',
    glyph: '!',
    eyebrow: 'Pattern captured',
    title: 'Melody Input',
    backgroundClass: 'bg-[#1E6BFF]',
    panelClass: 'border-white bg-black/18 text-white',
    accentClass: 'border-[#FFD600] text-[#FFD600]',
    backgroundLabelClass: 'border-white/35 bg-white/[0.06] text-white/45 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.35)]',
    backgroundLabelOpacity: 'opacity-[0.12] md:opacity-[0.16]',
    gridLine: 'rgba(255, 255, 255, 0.07)',
    statusClass: 'bg-[#FF4D4D] text-white',
    meterClass: 'bg-[#FF4D4D] w-[72%]',
    summary: 'The browser captures note order and timing intervals for the selected file.',
    lines: [
      ['Input', 'Virtual piano'],
      ['Notes', 'C-E-G-C2'],
      ['Timing', 'Relative rhythm'],
      ['State', 'Ready'],
    ],
  },
  {
    id: 'analyzing',
    glyph: '?',
    eyebrow: 'Key derivation',
    title: 'Canonical Seed',
    backgroundClass: 'bg-[#00E676]',
    panelClass: 'border-[#0A0C10] bg-white/18 text-[#0A0C10]',
    accentClass: 'border-[#0A0C10] text-[#0A0C10]',
    backgroundLabelClass: 'border-black/35 bg-black/[0.06] text-black/55 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.18)]',
    backgroundLabelOpacity: 'opacity-[0.32] md:opacity-[0.4]',
    gridLine: 'rgba(10, 12, 16, 0.07)',
    statusClass: 'bg-[#FFD600] text-black',
    meterClass: 'bg-[#FFD600] w-[86%]',
    summary: 'Notes and timings are normalized into deterministic key derivation input.',
    lines: [
      ['Step 01', 'Serialize notes'],
      ['Step 02', 'Normalize timing'],
      ['Step 03', 'Apply KDF'],
      ['Step 04', 'Create AES key'],
    ],
  },
  {
    id: 'identified',
    glyph: '+',
    eyebrow: 'Vault exported',
    title: 'File Locked',
    backgroundClass: 'bg-[#1E6BFF]',
    panelClass: 'border-white bg-black/18 text-white',
    accentClass: 'border-[#FFD600] text-[#FFD600]',
    backgroundLabelClass: 'border-white/35 bg-white/[0.06] text-white/45 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.35)]',
    backgroundLabelOpacity: 'opacity-[0.12] md:opacity-[0.16]',
    gridLine: 'rgba(255, 255, 255, 0.07)',
    statusClass: 'bg-[#00E676] text-black',
    meterClass: 'bg-[#00E676] w-[100%]',
    summary: 'The file is encrypted locally and exported as a portable .vault artifact.',
    groups: [
      {
        label: 'Stored safely',
        items: ['Ciphertext artifact', 'Non-secret metadata'],
      },
      {
        label: 'Never stored',
        items: ['Plaintext file', 'Raw melody key'],
      },
    ],
  },
];

const circleReveal = {
  hidden: 'circle(0% at 50% 50%)',
  visible: 'circle(200% at 50% 50%)',
};

const TimelineRail = ({ activeId }) => (
  <div className="mb-2 grid grid-cols-3 border-b-[3px] border-current sm:mb-0 sm:border-b-[4px]">
    {incidentPhases.map((phase, index) => (
      <div
        key={phase.id}
        className={`flex min-h-8 items-center gap-1 border-r-2 border-current px-1.5 py-1 last:border-r-0 sm:min-h-12 sm:gap-2 sm:border-r-[3px] sm:px-4 sm:py-2 ${
          phase.id === activeId ? 'bg-[#FFD600] text-black' : 'bg-black/10'
        }`}
      >
        <span className="grid h-5 w-5 shrink-0 place-items-center border-2 border-current bg-white font-black text-[9px] text-black sm:h-6 sm:w-6 sm:text-[10px]">
          0{index + 1}
        </span>
        <span className="min-w-0 truncate font-black uppercase tracking-[0.04em] text-[7px] min-[380px]:text-[8px] sm:tracking-[0.12em] sm:text-[10px] md:text-xs">
          {phase.eyebrow}
        </span>
      </div>
    ))}
  </div>
);

const PhaseContent = ({ phase }) => (
  <div className="relative z-50 flex w-full max-w-[calc(100vw-1rem)] items-center justify-center sm:max-w-[94vw] md:max-w-[980px]">
    <div
      className={`relative z-10 w-full overflow-visible border-[3px] shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] backdrop-blur-[2px] sm:border-[4px] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] ${phase.panelClass}`}
      style={{
        backgroundImage:
          `linear-gradient(${phase.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${phase.gridLine} 1px, transparent 1px)`,
        backgroundSize: 'clamp(2rem, 5vw, 3.5rem) clamp(2rem, 5vw, 3.5rem)',
        backgroundPosition: '-1px -1px',
      }}
    >
      <div className="grid grid-cols-[1fr_auto] items-center border-b-[3px] border-current bg-white text-black sm:border-b-[4px]">
        <div className="flex min-w-0 items-center gap-2 px-3 py-2 sm:px-4 sm:py-3">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-2 w-2 shrink-0 rounded-full bg-black sm:h-2.5 sm:w-2.5" />
          ))}
          <span className="ml-1 truncate font-black uppercase italic tracking-[0.16em] text-[10px] sm:text-xs">
            vault console
          </span>
        </div>
        <span className={`m-1.5 border-2 border-black px-2 py-1 font-black uppercase tracking-[0.14em] text-[9px] sm:m-2 sm:text-[10px] ${phase.statusClass}`}>
          live
        </span>
      </div>

      <TimelineRail activeId={phase.id} />

      <div className="relative grid lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="relative overflow-hidden border-b-[3px] border-current/70 p-2 text-left min-[380px]:p-3 sm:p-6 lg:border-b-0 lg:border-r-[4px] lg:p-8">
          <div className="float-right ml-2 mb-1 grid h-9 w-9 rotate-6 place-items-center border-[3px] border-current bg-[#FFD600] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:ml-3 sm:mb-2 sm:h-16 sm:w-16 sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black text-2xl leading-none sm:text-4xl">{phase.glyph}</span>
          </div>
          <p className={`inline-flex max-w-[calc(100%-2.75rem)] border-2 px-1.5 py-0.5 font-black uppercase italic tracking-[0.08em] text-[8px] min-[380px]:text-[9px] sm:max-w-none sm:px-2 sm:py-1 sm:tracking-[0.16em] sm:text-xs ${phase.accentClass}`}>
            {phase.eyebrow}
          </p>
          <h2 className="mt-2 max-w-[14ch] font-black italic uppercase leading-[0.88] tracking-normal text-[clamp(1.65rem,9vw,2.45rem)] sm:mt-4 sm:leading-[0.88] sm:text-[clamp(1.85rem,10.5vw,5.9rem)]">
            {phase.title}
          </h2>
          <p className="mt-2 max-w-[34rem] border-t-2 border-current/55 pt-2 font-black uppercase leading-tight text-[10px] min-[380px]:text-[11px] sm:mt-4 sm:pt-3 sm:leading-snug sm:text-sm md:text-base">
            {phase.summary}
          </p>
          <div className="mt-3 border-[3px] border-current bg-black/10 p-1 sm:mt-5">
            <div className="h-2 border-2 border-current bg-white/25 sm:h-3">
              <div className={`h-full border-r-2 border-current ${phase.meterClass}`} />
            </div>
          </div>
        </div>

        <div className="grid bg-black/10 text-left sm:grid-cols-2 lg:grid-cols-1">
          {phase.lines?.map((line) => (
            <div key={line.join('-')} className="grid min-h-10 content-center border-b border-current/45 px-3 py-2 last:border-b-0 sm:min-h-16 sm:px-5 sm:py-3 sm:[&:nth-child(odd)]:border-r lg:[&:nth-child(odd)]:border-r-0">
              <span className={`font-black uppercase tracking-[0.14em] text-[8px] sm:tracking-[0.18em] sm:text-xs ${phase.accentClass}`}>{line[0]}</span>
              <span className="mt-0.5 break-words font-black uppercase text-xs sm:mt-1 sm:text-base">{line[1]}</span>
            </div>
          ))}

          {phase.groups?.map((group) => (
            <div key={group.label} className="border-b border-current/45 px-3 py-3 last:border-b-0 sm:px-5 sm:py-4 sm:[&:nth-child(odd)]:border-r lg:[&:nth-child(odd)]:border-r-0">
              <h3 className={`font-black uppercase tracking-[0.14em] text-[8px] sm:tracking-[0.18em] sm:text-xs ${phase.accentClass}`}>{group.label}</h3>
              <ul className="mt-2 grid gap-1.5 font-bold uppercase leading-tight text-[10px] sm:mt-3 sm:gap-2 sm:leading-snug sm:text-sm">
                {group.items.map((item) => (
                  <li key={item} className="border-l-[3px] border-current/70 pl-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const IncidentResolutionSection = ({ className = '' }) => {
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const phaseRefs = useRef([]);
  const glyphTiles = useMemo(
    () =>
      marginGlyphs.map((tile, index) => ({
        ...tile,
        label: ['AES', 'KDF', 'IV', 'GCM', 'KEY', 'LOCK', 'VAULT', 'NOTE', 'META', 'TTL'][index],
      })),
    []
  );

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const phaseLayers = phaseRefs.current;

      gsap.set(phaseLayers.filter(Boolean), {
        autoAlpha: 1,
        clipPath: circleReveal.hidden,
        transformOrigin: '50% 50%',
      });
      gsap.set(phaseLayers[0], { clipPath: circleReveal.visible });

      const colorTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: () => `+=${(incidentPhases.length - 1) * 100}%`,
          pin: panelRef.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          scrub: 1,
        },
      });

      colorTimeline
        .fromTo(phaseLayers[1], { clipPath: circleReveal.hidden }, { clipPath: circleReveal.visible, duration: 0.42, ease: 'none' }, 0)
        .set(panelRef.current, { backgroundColor: '#00E676' })
        .to('.incident-ink', { color: '#0A0C10', borderColor: '#0A0C10', duration: 0.18, ease: 'none' }, 0.2)
        .to('.incident-ink-fill', { backgroundColor: '#0A0C10', duration: 0.18, ease: 'none' }, 0.2)
        .to('.incident-accent', { color: '#FFD600', borderColor: '#0A0C10', duration: 0.18, ease: 'none' }, 0.2)
        .to({}, { duration: 0.18 })
        .fromTo(phaseLayers[2], { clipPath: circleReveal.hidden }, { clipPath: circleReveal.visible, duration: 0.42, ease: 'none' })
        .set(panelRef.current, { backgroundColor: '#1E6BFF' })
        .to('.incident-ink', { color: '#FFFFFF', borderColor: '#FFFFFF', duration: 0.18, ease: 'none' }, 0.78)
        .to('.incident-ink-fill', { backgroundColor: '#FFFFFF', duration: 0.18, ease: 'none' }, 0.78)
        .to('.incident-accent', { color: '#FFD600', borderColor: '#FFD600', duration: 0.18, ease: 'none' }, 0.78);

      gsap.from('.incident-grid-item', {
        autoAlpha: 0,
        y: 22,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          end: 'top 20%',
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={`relative min-h-screen min-h-[100svh] w-screen max-w-full bg-[#1E6BFF] font-mono text-white ${className}`}>
      {/* 
          UI REMOVAL: The top decorative h-20 bar is removed.
          This allows the previous section's slant and caution strips 
          to stack directly on top of the blue field.
      */}
      <div ref={panelRef} className="h-screen h-[100svh] w-full overflow-hidden bg-[#1E6BFF]">
        <div className="pointer-events-none absolute inset-0 z-[1] opacity-10 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-grain opacity-80" />
        
        {/* Only bottom bar remains */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-14 border-t-[3px] border-black/35 bg-black/10" />

        {incidentPhases.map((phase, index) => (
          <div
            key={phase.id}
            ref={(el) => (phaseRefs.current[index] = el)}
            className={`absolute inset-0 flex items-center justify-center overflow-hidden px-2 pb-4 pt-10 text-center will-change-[clip-path] sm:px-4 sm:pb-10 sm:pt-24 md:pb-12 md:pt-28 ${phase.backgroundClass}`}
            style={{
              clipPath: index === 0 ? circleReveal.visible : circleReveal.hidden,
              zIndex: 24 + index,
            }}
          >
            <div className={`pointer-events-none absolute inset-0 z-0 ${phase.backgroundLabelOpacity}`} aria-hidden="true">
              {glyphTiles.map((tile) => (
                <span
                  key={`${phase.id}-${tile.label}`}
                  className={`absolute border-[3px] px-2 py-1 font-black uppercase italic leading-none text-[clamp(0.75rem,1.8vw,1.4rem)] ${phase.backgroundLabelClass}`}
                  style={{ left: tile.x, top: tile.y, transform: `rotate(${tile.rotate}deg) scale(${tile.scale})` }}
                >
                  {tile.label}
                </span>
              ))}
            </div>
            <PhaseContent phase={phase} />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 z-10 hidden grid-cols-6 grid-rows-6 p-4 opacity-[0.45] min-[420px]:grid sm:p-10">
          {diagnosticPanels.map((position, index) => (
            <div key={position} className={`incident-grid-item incident-ink relative border border-white/20 bg-white/[0.02] ${position}`}>
              <div className="incident-ink-fill absolute -left-1 -top-1 h-2 w-2 bg-white" />
              <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-[#FFD600]" />
              {index === 1 && <div className="incident-accent absolute inset-3 border border-[#FFD600]/80" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IncidentResolutionSection;
