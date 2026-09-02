import { LogOut, ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { setCurrentUser } from '../../../services/authApi';
import { navItems } from '../dashboardData';
import { logoutUser } from '../../../store/authSlice';
import { useDispatch } from 'react-redux';

export const SidebarContent = ({ activeView, compact = false, onClose, onOpen, onViewChange }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await dispatch(logoutUser());
    
      setCurrentUser(null);
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state and redirect
      setCurrentUser(null);
      navigate('/signin');
    } finally {
      setIsLoggingOut(false);
    }
  };


  return (
    <div className="flex h-full flex-col">
      <div className={`flex items-center ${compact ? 'justify-center' : 'justify-between gap-3'}`}>
        <button
          type="button"
          onClick={compact ? onOpen : () => navigate('/')}
          className={`flex min-w-0 items-center gap-3 ${compact ? 'justify-center' : 'cursor-pointer'}`}
          aria-label={compact ? 'Open sidebar' : 'Melodic Vault'}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-[3px] border-black bg-[#FFD600] font-black italic text-black shadow-[4px_4px_0_#0F172A] cursor-pointer active:shadow-[1px_2px_0_#0F172A] active:scale-95">
            M
          </span>
          {!compact && (
            <span className="min-w-0 text-black line-clamp-1">
              <span className="block truncate text-lg font-black uppercase italic leading-none">Melodic</span>
              <span className="mt-1 block truncate text-lg font-black uppercase italic leading-none">Vault</span>
            </span>
          )}
        </button>
        {!compact && (
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border-[3px] border-black bg-white text-black shadow-[3px_3px_0_#0F172A] cursor-pointer active:shadow-[1px_2px_0_#0F172A] active:scale-95"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} strokeWidth={3} />
          </button>
        )}
      </div>

      <nav className="mt-10 grid gap-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onViewChange(id)}
            className={`flex h-12 items-center rounded-2xl border-[3px] text-nowrap line-clamp-1 border-black font-black cursor-pointer ${
              compact ? 'justify-center px-0' : 'gap-3 px-3'
            } ${
              activeView === id
                ? 'bg-[#1E6BFF] text-white shadow-[4px_4px_0_#0F172A]'
                : 'bg-[#FDFBF7] text-black hover:bg-[#FFD600]'
            }`}
            title={label}
          >
            <Icon size={19} strokeWidth={3} />
            {!compact && <span className="text-sm">{label}</span>}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-5">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex h-12 w-full items-center rounded-2xl border-[3px] border-black font-black ${
            compact ? 'justify-center px-0' : 'gap-3 px-3'
          } bg-red-500 text-white shadow-[4px_4px_0_#0F172A] hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 line-clamp-1`}
          title="Logout"

        >
          <LogOut size={19} strokeWidth={3} />
          {!compact && <span className="text-sm">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
        </button>

        <div className={`rounded-2xl border-[3px] border-black bg-[#FDFBF7] p-4 text-black ${compact ? 'hidden' : 'block'}`}>
          <div className="flex items-center gap-2 text-sm font-black text-nowrap line-clamp-1">
            <ShieldCheck size={18} className="text-[#1E6BFF]" />
            Metadata only
          </div>
          <p className="mt-2 text-sm leading-6 text-black/60 line-clamp-3 ">
            Auth runs through the API; vault secrets and files stay client-side.
          </p>
        </div>
      </div>
    </div>
  );
};

export const MobileNav = ({ activeView, onViewChange }) => (
  <nav className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-4 gap-1 rounded-2xl border-[3px] border-black bg-white p-1.5 shadow-[5px_5px_0_#0F172A] sm:grid-cols-7 lg:hidden">
    {navItems.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        type="button"
        onClick={() => onViewChange(id)}
        className={`grid min-w-0 place-items-center gap-1 rounded-xl border-2 border-black px-1 py-2 ${
          activeView === id
            ? 'bg-[#00E676] text-black shadow-[2px_2px_0_#0F172A]'
            : 'bg-[#EAF1FF] text-slate-950 hover:bg-[#FFD600] hover:text-black'
        }`}
        aria-label={label}
        title={label}
      >
        <Icon size={18} strokeWidth={3} />
        <span className="max-w-full truncate text-[10px] font-black leading-none">{label.replace(' Pages', '')}</span>
      </button>
    ))}
  </nav>
);
