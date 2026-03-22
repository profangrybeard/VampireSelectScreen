/**
 * Navigation indicator dots — top of screen.
 * Active dot is wider (pill shape). Grey tones only.
 */
export default function IndicatorDots({ count, active }) {
  return (
    <div className="indicator-dots">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`indicator-dot${i === active ? ' indicator-dot--active' : ''}`}
        />
      ))}
    </div>
  );
}
