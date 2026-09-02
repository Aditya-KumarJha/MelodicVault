import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
const AuthLayout = ({ children, eyebrow, title, subtitle }) => {
  
  
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1E6BFF] px-3 py-4 font-mono text-black sm:px-5 sm:py-6 lg:px-8">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)',
          backgroundSize: '34px 34px',
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3rem] border-black opacity-[0.08]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col">
        <header className="flex items-center justify-between gap-3 border-[3px] border-black bg-white px-3 py-2 shadow-[5px_5px_0_#000] sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Melodic Vault home">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border-[3px] border-black bg-[#FFD600] font-black italic shadow-[3px_3px_0_#000]">
              <span className="absolute inset-x-0 top-0 h-2 border-b-[3px] border-black bg-[#00E676]" />
              M
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-black uppercase italic leading-none">Melodic Vault</span>
              <span className="mt-1 hidden truncate text-[9px] font-black uppercase tracking-[0.18em] text-black/55 sm:block">
                Melody encryption
              </span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-[3px] border-black bg-[#FDFBF7] px-3 text-xs font-black uppercase italic shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5 sm:px-4"
          >
            <ArrowLeft size={16} strokeWidth={3} />
            <span className="hidden min-[420px]:inline">Home</span>
          </Link>
        </header>

        <section className="grid min-w-0 flex-1 items-center py-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,480px)] lg:gap-8 lg:py-8">
          <div className="hidden min-w-0 gap-4 lg:order-1 lg:grid">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex border-[3px] border-black bg-[#FFD600] px-3 py-1 text-[10px] font-black uppercase italic tracking-[0.18em] shadow-[4px_4px_0_#000]">
                {eyebrow}
              </p>
              <h1
                className="max-w-[11ch] text-[clamp(3rem,7vw,7.4rem)] font-black uppercase italic leading-[0.82] text-[#FFD600]  drop-shadow-[4px_4px_0_black]"
                style={{ WebkitTextStroke: '2px black' }}
              >
                {title}
              </h1>
              <p className="mt-4 max-w-xl border-l-[6px] border-black bg-white/90 p-4 text-sm font-black uppercase italic leading-6 shadow-[5px_5px_0_#000] sm:text-base">
                {subtitle}
              </p>
            </div>

          </div>

          <div className="min-w-0 lg:order-2">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default AuthLayout;
