const OtpField = ({ autoComplete, icon: Icon, label, name, placeholder, type = 'text' }) => {
    
  return (
    <label className="grid gap-2 text-sm font-black uppercase italic">
      <span>{label}</span>
      <span className="grid grid-cols-[2.75rem_minmax(0,1fr)] overflow-hidden rounded-md border-[3px] border-black bg-white shadow-[2px_2px_0_#000]">
        <span className="grid place-items-center border-r-[3px] border-black bg-[#FFD600]">
          <Icon size={18} strokeWidth={3} />
        </span>
        <input
          autoComplete={autoComplete}
          id="otp-input"
         
          className="min-h-11 min-w-0 bg-white px-3 text-sm font-bold normal-case outline-none placeholder:font-black placeholder:uppercase placeholder:italic placeholder:text-black/35 focus:bg-[#FDFBF7]"
          name={name}
          placeholder={placeholder}
          type={type}
        />
      </span>
    </label>
  );
};

export default OtpField;
