export default function Logo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="50,10 78,26 78,58 50,74 22,58 22,26"
        fill="var(--accent-dim)"
        stroke="var(--accent)"
        strokeWidth="1.5"
      />
      <path
        d="M38 30 Q68 34 68 46 Q68 55 50 55 Q32 55 32 64 Q32 73 68 76"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="50" cy="45" r="3" fill="var(--accent)" />
    </svg>
  );
}
