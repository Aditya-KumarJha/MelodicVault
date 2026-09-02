import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { WindowDots } from '../components';

gsap.registerPlugin(Draggable);
let highZIndex = 100;

const MonitorCard = ({ feature }) => {
  const cardRef = useRef(null);
  const cardStyle = {
    '--monitor-w': feature.size?.w || 'min(280px, 85vw)',
    '--monitor-h': feature.size?.h || 'min(200px, 40vh)',
    '--monitor-x': feature.x,
    '--monitor-y': feature.y,
    '--monitor-mobile-w': feature.mobile?.w || '44vw',
    '--monitor-mobile-h': feature.mobile?.h || '140px',
    '--monitor-mobile-x': feature.mobile?.x || feature.x,
    '--monitor-mobile-y': feature.mobile?.y || feature.y,
    zIndex: 20,
  };

  useLayoutEffect(() => {
    if (window.matchMedia('(max-width: 639px)').matches) return undefined;

    const ctx = gsap.context(() => {
      Draggable.create(cardRef.current, {
        bounds: "#playground",
        onPress: function() {
          highZIndex++;
          gsap.set(this.target, { zIndex: highZIndex });
        },
        onDragStart: function() { 
          gsap.to(this.target, { scale: 1.02, opacity: 0.9, cursor: 'grabbing' }); 
        },
        onDragEnd: function() { 
          gsap.to(this.target, { scale: 1, opacity: 1, cursor: 'grab' });
        }
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`monitor-card-item relative flex h-[132px] min-w-0 touch-auto flex-col border-[2px] border-black p-0.5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:absolute sm:left-[var(--monitor-x)] sm:top-[var(--monitor-y)] sm:h-[var(--monitor-h)] sm:w-[var(--monitor-w)] sm:max-w-[92vw] sm:max-h-[40vh] sm:touch-none md:border-[3px] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${feature.color}`}
      style={cardStyle}
    >
      {/* WINDOW HEADER */}
      <div className="bg-white border-b-[2px] md:border-b-[3px] border-black p-1 md:p-1.5 flex gap-1.5 cursor-grab active:cursor-grabbing shrink-0">
        <WindowDots colors={['bg-black', 'bg-black', 'bg-black']} dotClassName="animate-dot border-0" />
      </div>
      
      {/* CONTENT */}
      <div className="flex-grow p-2 md:p-3 flex flex-col justify-between overflow-hidden relative min-h-0">
        <h3 className="text-[clamp(0.75rem,2.4vw,1.4rem)] sm:text-[clamp(0.85rem,3vw,1.4rem)] font-[1000] uppercase italic tracking-normal leading-[0.9] text-black break-words">
          {feature.title}
        </h3>
        
        <div className="mt-auto flex flex-col gap-1 sm:gap-1.5 md:gap-2 min-h-0">
          <div className="border-t-[1px] md:border-t-2 border-black/10 pt-1 md:pt-1.5">
             <p className="text-[clamp(7px,1.8vw,10px)] sm:text-[clamp(8px,1.5vw,10px)] font-bold uppercase leading-tight text-black opacity-90">
               {feature.detail}
             </p>
          </div>
          
          <div className="flex flex-col gap-1">
            <p className="text-[6px] sm:text-[7px] md:text-[8px] font-black uppercase tracking-normal sm:tracking-widest bg-black text-white inline-block px-1 self-start shrink-0 max-w-full break-words">
              {feature.text}
            </p>

            {/* STATUS FILLING BAR */}
            <div className="w-full h-[6px] md:h-[8px] bg-gray-300 border-[1.5px] md:border-2 border-black relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 h-full bg-[#FF4D4D] w-[65%] border-r-[1.5px] md:border-r-2 border-black"></div>
              <div className="animate-scan-line"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorCard;
