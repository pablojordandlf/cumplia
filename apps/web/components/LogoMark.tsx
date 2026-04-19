export default function LogoMark() {
  return (
    <div
      style={{
        width: 32, height: 32,
        background: 'var(--y)',
        borderRadius: 8,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z"
          stroke="#0A0A0A"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 6.5L11.5 8V11L9 12.5L6.5 11V8L9 6.5Z" fill="#0A0A0A" />
      </svg>
    </div>
  );
}
