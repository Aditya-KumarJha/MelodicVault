const defaultDots = ['bg-[#FF5F56]', 'bg-[#FFBD2E]', 'bg-[#27C93F]'];

const WindowDots = ({ className = '', dotClassName = '', colors = defaultDots }) => (
  <div className={`flex gap-1.5 ${className}`}>
    {colors.map((color, index) => (
      <span
        key={`${color}-${index}`}
        className={`h-1.5 w-1.5 rounded-full border-black md:h-2 md:w-2 ${color} ${dotClassName}`}
        style={{ animationDelay: `${index * 0.2}s` }}
      />
    ))}
  </div>
);

export default WindowDots;
