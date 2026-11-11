export default function StarMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      {[0, 45, 90, 135].map((d) => (
        <ellipse key={d} cx="20" cy="20" rx="5" ry="17" transform={`rotate(${d} 20 20)`} fill="currentColor" />
      ))}
      <circle cx="20" cy="20" r="4.5" fill="#9a432a" />
    </svg>
  );
}
