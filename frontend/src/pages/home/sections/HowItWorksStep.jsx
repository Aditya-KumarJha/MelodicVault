import React from 'react';
import { Activity, BellRing, Globe2, Wrench } from 'lucide-react';

const icons = {
  connect: Globe2,
  probe: Activity,
  alert: BellRing,
  resolve: Wrench,
};

const HowItWorksStep = React.memo(React.forwardRef(({ step, className = '', style }, ref) => {
  const Icon = icons[step.id] || Activity;

  return (
    <article
      ref={ref}
      className={`bg-white border-[3px] md:border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 md:p-5 min-h-[165px] sm:min-h-[210px] flex flex-col justify-between ${className}`}
      style={style}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <span className="font-black italic text-4xl sm:text-5xl md:text-6xl leading-none text-[#1E6BFF]">
          {step.label}
        </span>
        <div className="h-10 w-10 sm:h-12 sm:w-12 border-[3px] border-black bg-[#FFD600] flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-black" strokeWidth={3.5} />
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <div className="inline-flex bg-black text-white px-2 py-1 font-black text-[8px] sm:text-[9px] uppercase tracking-[0.12em]">
          {step.metric}
        </div>
        <h3 className="mt-2 sm:mt-3 font-[1000] italic uppercase text-lg sm:text-2xl md:text-3xl leading-[0.95] sm:leading-[0.92] text-black">
          {step.title}
        </h3>
        <p className="mt-2 sm:mt-3 font-bold uppercase text-[10px] sm:text-xs leading-snug text-black/75">
          {step.copy}
        </p>
      </div>
    </article>
  );
}));

HowItWorksStep.displayName = 'HowItWorksStep';

export default HowItWorksStep;
