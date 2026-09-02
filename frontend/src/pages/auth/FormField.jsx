import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormField = ({ autoComplete, icon: Icon, label, name, placeholder, type = 'text' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputType = type === 'password' && isVisible ? 'text' : type;

  return (
    <label className="grid gap-2 text-sm font-black uppercase italic">
      <span>{label}</span>
      <span className="grid grid-cols-[2.75rem_minmax(0,1fr)] overflow-hidden rounded-md border-[3px] border-black bg-white shadow-[2px_2px_0_#000]">
        <span className="grid place-items-center border-r-[3px] border-black bg-[#FFD600]">
          <Icon size={18} strokeWidth={3} />
        </span>
        <span className="flex min-w-0 items-center bg-white focus-within:bg-[#FDFBF7]">
          <input
            autoComplete={autoComplete}
            className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-bold normal-case outline-none placeholder:font-black placeholder:uppercase placeholder:italic placeholder:text-black/35"
            name={name}
            placeholder={placeholder}
            type={inputType}
            required
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setIsVisible((visible) => !visible)}
              className="grid h-10 w-10 shrink-0 place-items-center text-black/65 hover:text-black"
              aria-label={isVisible ? 'Hide password' : 'Show password'}
            >
              {isVisible ? <EyeOff size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={3} />}
            </button>
          )}
        </span>
      </span>
    </label>
  );
};

export default FormField;
