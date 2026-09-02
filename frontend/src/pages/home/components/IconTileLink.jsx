const IconTileLink = ({ href = '#', label, className = '', children }) => (
  <a
    className={`grid h-10 w-10 place-items-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 md:h-11 md:w-11 md:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] ${className}`}
    href={href}
    aria-label={label}
  >
    {children}
  </a>
);

export default IconTileLink;
