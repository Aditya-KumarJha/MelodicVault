import MonitorCard from './MonitorCard';
import TechnicalBackground from './TechnicalBackground';
import { monitorItems } from '../content';

const MonitorGrid = () => {
  return (
    <section id="features" className="relative min-h-[780px] w-full overflow-hidden bg-[#1E6BFF] font-mono bg-grain sm:h-screen sm:h-[100svh] sm:min-h-0">
      <TechnicalBackground />

      {/* 1. SCALED WATERMARK - Responsive scale */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.14] z-0">
        <h2 className="text-[clamp(7rem,32vw,28rem)] font-black italic text-black leading-none tracking-normal sm:tracking-tighter uppercase">
          CORE
        </h2>
      </div>

      {/* 2. SEARCH BAR - Typing Animation */}
      <div className="absolute top-[6%] sm:top-[8%] left-[50%] -translate-x-1/2 z-[200] w-max max-w-[92vw]">
        <div className="bg-white border-[3px] md:border-[4px] border-black px-4 sm:px-6 md:px-10 py-1.5 sm:py-2 md:py-2.5 rounded-full flex items-center gap-3 sm:gap-4 md:gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <div className="animate-typing">
            <span className="font-black uppercase italic tracking-[0.08em] sm:tracking-[0.1em] text-black text-base sm:text-lg md:text-xl">
              FEATURES
            </span>
          </div>
        </div>
      </div>

      {/* 3. POOP ICON - Scaled for mobile */}
      <div className="absolute top-[20%] left-[10%] md:left-[16%] z-10 opacity-90 scale-75 md:scale-100 hidden sm:block">
        <div className="w-12 h-10 bg-black rounded-t-full relative">
           <div className="absolute top-3 left-2 w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
           <div className="absolute top-3 right-2 w-2.5 h-2.5 bg-white rounded-full animate-pulse delay-75"></div>
        </div>
        <div className="w-16 h-3 bg-black rounded-b-lg -mt-1"></div>
      </div>

      {/* 4. ASYMMETRIC FOLDER - Pinned to right gutter */}
      <div className="absolute top-[35%] md:top-[40%] right-[3%] md:right-[5%] z-10 w-20 h-14 md:w-24 md:h-16 pointer-events-none hidden sm:block">
        <div className="absolute -top-3 left-0 w-8 h-3 md:w-10 md:h-4 bg-black border-[2px] border-black rounded-t-sm"></div>
        <div className="absolute inset-0 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
           <span className="font-black italic text-[7px] md:text-[8px] uppercase tracking-tighter opacity-40">DATA_FS</span>
        </div>
      </div>

      {/* 5. CLUSTERED DOTS - Distributed across screen gutters */}
      {[
        { top: '42%', left: '44%' }, { bottom: '35%', right: '28%' },
        { top: '12%', left: '12%' }, { bottom: '15%', left: '45%' },
        { top: '65%', right: '10%' }, { bottom: '10%', left: '10%' }
      ].map((style, i) => (
        <div key={i} className="absolute w-3 h-3 md:w-3.5 md:h-3.5 bg-black rounded-full z-10" style={style} />
      ))}

      {/* 6. CREDIT CARD - Left side anchor */}
      <div className="absolute bottom-[18%] left-[5%] md:left-[10%] z-10 w-16 h-10 md:w-20 md:h-12 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-2 hidden sm:block">
        <div className="w-8 md:w-10 h-1.5 md:h-2 bg-black mb-2"></div>
        <div className="w-4 md:w-6 h-1 bg-black opacity-20"></div>
      </div>

      {/* 7. CURSOR ICON - Anchored bottom right */}
      <div className="absolute bottom-[5%] sm:bottom-[8%] right-[4%] md:right-[8%] z-50 rotate-[-15deg] scale-75 md:scale-100">
        <svg className="h-10 w-10 sm:h-[45px] sm:w-[45px]" viewBox="0 0 24 24" fill="black">
          <path d="M7 2l12 10.5-5.5.5 3.5 6-3 1.5-3.5-6L7 18z" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      <div id="playground" className="relative z-20 grid w-full grid-cols-2 content-start gap-3 overflow-visible pl-4 pr-6 pb-4 pt-32 sm:block sm:h-full sm:p-0">
        {monitorItems.map((feature) => <MonitorCard key={feature.id} feature={feature} />)}
      </div>
    </section>
  );
};

export default MonitorGrid;
