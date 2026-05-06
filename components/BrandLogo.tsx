export default function BrandLogo({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Memory Assistant compass mark"
    >
      <defs>
        <style>{`.dot{fill:#A44A3F}.needle{stroke:#A44A3F}`}</style>
      </defs>

      {/* Compass dot motif */}
      <circle cx="32" cy="32" r="22" fill="#FFFDF9" stroke="#D9D6D0" strokeWidth="2" />
      <circle cx="32" cy="32" r="3.2" className="dot" />

      {/* 8 dots around the center */}
      <circle cx="32" cy="10.5" r="2.2" className="dot" />
      <circle cx="44.6" cy="14.6" r="2.2" className="dot" />
      <circle cx="53.5" cy="23.5" r="2.2" className="dot" />
      <circle cx="49.5" cy="36" r="2.2" className="dot" />
      <circle cx="32" cy="53.5" r="2.2" className="dot" />
      <circle cx="19.4" cy="49.4" r="2.2" className="dot" />
      <circle cx="10.5" cy="40.5" r="2.2" className="dot" />
      <circle cx="14.5" cy="28" r="2.2" className="dot" />

      {/* Simple MA wordmark in the center */}
      <text
        x="32"
        y="37"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, Segoe UI, Arial"
        fontSize="18"
        fontWeight="800"
        fill="#A44A3F"
      >
        MA
      </text>
    </svg>
  );
}

