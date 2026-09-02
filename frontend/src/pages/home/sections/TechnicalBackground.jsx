// TechnicalBackground.jsx

const TechnicalBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 1500 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* Bundled Pathways */}
        <g stroke="black" strokeWidth="1" fill="none" opacity="0.4">
          <path d="M 0 100 H 1500 M 0 106 H 1500" />
          <path d="M 150 0 V 1000 M 156 0 V 1000" />
        </g>

        {/* Primary Circuit Lines */}
        <g stroke="black" strokeWidth="2" fill="none">
          <path d="M 450 0 V 200 H 100 V 500 H 600 V 1000" />
          <path d="M 0 750 H 350 V 600 H 900 V 850 H 1500" />
          <path d="M 1100 0 V 450 H 1300" />
          <path d="M 600 200 H 1000 V 0" />
        </g>

        {/* Junction Dots (Nodes) */}
        <g fill="black">
          {[
            [150, 100], [450, 200], [100, 500], [600, 500],
            [350, 600], [900, 600], [1100, 450], [900, 850]
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" />
          ))}
          {/* Scatter Components / Small Dots */}
          <circle cx="280" cy="150" r="6" />
          <circle cx="850" cy="800" r="5" />
          <circle cx="50" cy="820" r="6" />
        </g>
      </svg>
    </div>
  );
};

export default TechnicalBackground;
