import { ArrowRight, LogIn, RotateCcw, UserPlus } from 'lucide-react';
import TechnicalBackground from './TechnicalBackground';
import { useSelector } from 'react-redux';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Flow', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
];

const HeroSection = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return (
    <section className="bg-grain relative flex min-h-[720px] w-full flex-col items-center overflow-hidden bg-[#1E6BFF] px-3 pb-10 pt-[4.75rem] font-mono sm:min-h-[112svh] sm:px-5 sm:pb-14 sm:pt-[6rem] lg:pt-[6.25rem] max-[380px]:px-2">
      <TechnicalBackground />

      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.11] mix-blend-multiply">
        <div className="absolute left-1/2 top-1/2 h-[74vmin] w-[74vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3.5rem] border-black" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[7%] top-[19%] hidden border-[3px] border-black bg-white px-3 py-2 font-black uppercase italic text-[10px] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:block">
          KDF_01
        </div>
        <div className="absolute right-[8%] top-[27%] hidden border-[3px] border-black bg-[#FFD600] px-3 py-2 font-black uppercase italic text-[10px] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:block">
          AES-256
        </div>
        <div className="absolute bottom-[18%] left-[12%] hidden h-4 w-4 rounded-full bg-black sm:block" />
        <div className="absolute bottom-[12%] right-[18%] h-3 w-3 rounded-full bg-black" />
      </div>

      <header className="absolute left-0 top-0 z-30 w-full px-2.5 py-2.5 sm:px-5 sm:py-3 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-2 rounded-[1.1rem] border-[3px] border-black bg-white/[0.94] px-2.5 py-1.5 text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] backdrop-blur sm:gap-3 sm:rounded-[1.35rem] sm:px-3 sm:py-2 md:grid-cols-[1fr_auto_1fr] md:px-4">
          <a href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Melodic Vault home">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border-[3px] border-black bg-[#FFD600] font-[900] italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:h-11 sm:w-11 sm:rounded-2xl">
              <span className="absolute inset-x-0 top-0 h-2 bg-[#00E676] border-b-[3px] border-black" />
              M
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-lg font-[900] uppercase italic leading-none tracking-normal sm:text-xl">
                Melodic Vault
              </span>
              <span className="mt-1 hidden truncate text-[9px] font-black uppercase tracking-[0.18em] text-black/55 sm:block">
                melody based encryption
              </span>
            </span>
          </a>

          <nav className="hidden items-center rounded-full border-[3px] border-black bg-[#FDFBF7] p-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-xs font-[900] uppercase italic tracking-[0.06em] transition-colors hover:bg-[#FFD600]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <nav className="flex items-center justify-end gap-2 sm:gap-3" aria-label="Account actions">
            {!isAuthenticated ? (<> <a
              href="/signin"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border-[3px] border-black bg-white px-2.5 text-[11px] font-[900] uppercase italic text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 min-[360px]:px-3 sm:gap-2 md:px-4 md:text-sm"
            >
              <LogIn size={16} strokeWidth={3} />
              <span className="hidden min-[380px]:inline">Sign in</span>
            </a>
              <a
                href="/signup"
                className="group inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border-[3px] border-black bg-[#00E676] px-2.5 text-[11px] font-[900] uppercase italic text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 min-[360px]:px-3 sm:gap-2 md:px-4 md:text-sm"
              >
                <UserPlus size={16} strokeWidth={3} className="sm:hidden" />
                <span>Sign up</span>
                <ArrowRight size={16} strokeWidth={3} className="hidden transition-transform group-hover:translate-x-0.5 sm:block" />
              </a></>)
                 : (<a
                href="/dashboard/overview"
                className="group inline-flex h-10 w-fit  items-center justify-center gap-1.5 rounded-xl border-[3px] border-black bg-[#00E676] px-2.5 text-[11px] font-[900] uppercase italic text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 min-[360px]:px-3 sm:gap-2 md:px-4 md:text-sm"
              >
                <UserPlus size={16} strokeWidth={3} className="sm:hidden" />
                <span>Back to Vault</span>
                <ArrowRight size={16} strokeWidth={3} className="hidden transition-transform group-hover:translate-x-0.5 sm:block" />
              </a>)}

          </nav>
        </div>
      </header>

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-5 sm:gap-8">
        <div className="relative flex aspect-[1.2/1] w-[min(88vw,440px,calc(116svh_-_14.5rem))] flex-col rounded-[20px] border-[3px] border-black bg-[#FFC0CB] p-2.5 shadow-[0_7px_0px_0px_rgba(0,0,0,1)] min-[420px]:w-[min(84vw,470px,calc(120svh_-_15rem))] sm:rounded-[28px] sm:border-[4px] sm:p-4 sm:shadow-[0_10px_0px_0px_rgba(0,0,0,1)] lg:w-[min(44vw,500px,calc(122svh_-_14.65rem))] lg:p-5">
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-[15px] border-[3px] border-black bg-white shadow-[inset_0_4px_0_rgba(0,0,0,0.1)] sm:rounded-[20px] sm:border-[4px]">
            <div className="flex h-9 w-full border-b-[3px] border-black sm:h-10 sm:border-b-[4px]">
              <div className="flex min-w-0 flex-[2.5] items-center border-r-[3px] border-black bg-[#1E6BFF] px-3 sm:border-r-[4px] sm:px-5">
                <span className="truncate text-[9px] font-[900] uppercase italic tracking-normal text-black sm:text-xs">Melodic Vault</span>
              </div>
              <div className="flex flex-1 items-center justify-center bg-[#00A86B]">
                <span className="text-[9px] font-[900] uppercase italic text-black sm:text-xs">Local</span>
              </div>
            </div>

            <div className="relative flex flex-1 flex-col items-center justify-center px-3 py-3 text-center sm:px-5">
              <span className="absolute left-3 top-4 text-base text-black sm:left-6 sm:top-6 sm:text-lg">*</span>
              <span className="absolute right-5 top-5 text-sm text-black sm:right-8 sm:top-8 sm:text-base">*</span>

              <h1
                className="max-w-[9.8ch] text-[clamp(1.75rem,7.4vw,3.25rem)] font-[900] uppercase italic leading-[0.84] text-[#FFD600] drop-shadow-[2px_2px_0px_black] sm:drop-shadow-[4px_4px_0px_black]"
                style={{ WebkitTextStroke: '2px black' }}
              >
                Lock
                <br />
                Files
                <br />
                By Melody
              </h1>

              <p className="mt-2 max-w-[28ch] border-y-[3px] border-black bg-white/80 px-2 py-1 text-[8px] font-black uppercase italic leading-tight text-black min-[420px]:text-[9px] sm:mt-3 sm:px-3 sm:text-[11px]">
                melody plus rhythm becomes your encryption secret
              </p>

              <div className="mt-2 grid w-full max-w-[22rem] grid-cols-3 gap-1.5 sm:mt-3 sm:gap-2">
                {[
                  ['AES', 'crypto'],
                  ['0 keys', 'stored'],
                  ['.vault', 'output'],
                ].map(([value, label]) => (
                  <div key={label} className="border-2 border-black bg-[#FDFBF7] px-1.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="truncate text-[10px] font-black uppercase italic leading-none text-black sm:text-xs">{value}</div>
                    <div className="mt-0.5 truncate text-[6px] font-black uppercase tracking-[0.08em] text-black/55 sm:text-[8px]">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="h-10 w-full border-t-[3px] border-black sm:h-[3.25rem] sm:border-t-[4px] lg:h-14"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #00A86B 25%, transparent 25%),
                  linear-gradient(-45deg, #00A86B 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #00A86B 75%),
                  linear-gradient(-45deg, transparent 75%, #00A86B 75%)
                `,
                backgroundColor: '#FDFBF7',
                backgroundSize: '36px 36px',
                backgroundPosition: '0 0, 0 18px, 18px -18px, -18px 0px',
              }}
            />
          </div>

          <div className="absolute bottom-2 left-10 h-2.5 w-2.5 rounded-full border-2 border-black bg-yellow-400 sm:bottom-3 sm:left-12" />
          <div className="absolute bottom-2 right-10 h-2.5 w-2.5 rounded-full border-2 border-black bg-yellow-400 sm:bottom-3 sm:right-12" />

          <div className="absolute bottom-[-10px] right-[-10px] flex h-10 w-10 rotate-[10deg] items-center justify-center rounded-xl border-2 border-black bg-[#999] shadow-lg sm:h-12 sm:w-12">
            <div className="h-4 w-4 border-b-4 border-r-4 border-black sm:h-5 sm:w-5" />
          </div>
        </div>

        <div className="flex w-full max-w-[750px] items-end gap-3 px-1 sm:gap-10 sm:px-4">
          <div className="relative h-16 min-w-0 flex-[3] rounded-xl border-[4px] border-black bg-[#FFC0CB] p-2.5 shadow-[0_8px_0px_0px_rgba(0,0,0,1)] sm:h-24 sm:border-[5px] sm:p-4 sm:shadow-[0_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid h-full w-full grid-cols-12 gap-1 border-2 border-black/5">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="rounded-sm border border-black/5 bg-black/10" />
              ))}
            </div>

            <a
              href="/signup"
              className="absolute -left-1 bottom-[-10px] flex items-center gap-2 border-[3px] border-black bg-white px-3 py-1.5 text-[9px] font-[900] uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:-left-4 sm:px-4 sm:text-[10px]"
            >
              <span>-&gt;</span> Create vault account
            </a>
          </div>

          <div className="relative flex h-24 w-16 flex-none flex-col items-center rounded-full border-[4px] border-black bg-[#FFC0CB] pt-4 shadow-[0_8px_0px_0px_rgba(0,0,0,1)] sm:h-32 sm:w-24 sm:border-[5px] sm:pt-6 sm:shadow-[0_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="absolute top-0 h-8 w-[2px] bg-black sm:h-10" />
            <div className="h-7 w-5 rounded-lg border-[3px] border-black bg-white/20 sm:h-9 sm:w-6" />

            <div className="absolute bottom-[-5px] right-[-5px] flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#999] sm:h-10 sm:w-10">
              <RotateCcw size={16} strokeWidth={3} className="text-black sm:hidden" />
              <RotateCcw size={18} strokeWidth={3} className="hidden text-black sm:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
