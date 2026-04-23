interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 44, className }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 58 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Pin shape */}
      <path
        d="M29 6 C18 6 11 14 11 23 C11 35 29 52 29 52 C29 52 47 35 47 23 C47 14 40 6 29 6Z"
        fill="rgba(196,132,74,0.12)"
        stroke="#c4844a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Circle inside pin */}
      <circle
        cx="29"
        cy="23"
        r="9"
        fill="rgba(196,132,74,0.08)"
        stroke="#c4844a"
        strokeWidth="1.5"
      />
      {/* Fork */}
      <line x1="26" y1="17" x2="26" y2="23" stroke="#1a1a18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="17" x2="24" y2="20.5" stroke="#1a1a18" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="17" x2="28" y2="20.5" stroke="#1a1a18" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M24 20.5 Q24 23 26 23 Q28 23 28 20.5"
        stroke="#1a1a18"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="26" y1="23" x2="26" y2="29" stroke="#1a1a18" strokeWidth="1.5" strokeLinecap="round" />
      {/* Knife */}
      <path
        d="M32 17 L32 23 Q32 26 30 26 L30 29"
        stroke="#c4844a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M32 17 Q34.5 19 34.5 22 Q34.5 25 32 26"
        stroke="#c4844a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
