/** Placeholder tiles shaped like real ones, shown while the first feed loads. */
export function SkeletonGrid({ count }: { count: number }) {
  return (
    <ul className="grid skeleton-grid" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="tile skeleton" style={{ animationDelay: `${(i % 4) * 80}ms` }}>
          <div className="thumb sk" />
          <div className="sk sk-line wide" />
          <div className="sk sk-line" />
          <div className="sk sk-line short" />
        </li>
      ))}
    </ul>
  );
}
