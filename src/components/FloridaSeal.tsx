export function FloridaSeal({ size = 46 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border-2 border-gold bg-navy-dark"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" style={{ width: size * 0.58, height: size * 0.58 }}>
        <path
          d="M2.2 6.8 L12.8 6.1 L13.6 4.9 L15.2 5.6 L15.9 7.3 C17.4 9.4 18.9 12.9 19.5 16.3 C19.9 18.8 19.2 20.9 18.1 21.4 C17.1 21.9 16.1 20.9 15.6 19.4 C14.5 15.9 13.1 12.1 11.4 10.4 L9.8 9.4 L3.2 9 L2.2 8 Z"
          fill="#C9A227"
        />
        <circle cx="16.6" cy="22.2" r="0.7" fill="#C9A227" />
        <circle cx="15" cy="22.6" r="0.55" fill="#C9A227" />
      </svg>
    </span>
  );
}
