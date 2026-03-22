/**
 * Stats Panel — slides down from beneath the clan title.
 * Shows epithet, disciplines, and humanity.
 * Stays open during carousel rotation (content updates).
 * Only closes when user taps the clan title again.
 * Pass 1: grey values only.
 */
export default function StatsPanel({ clan, isOpen }) {
  // Humanity pips: filled vs empty out of 10
  const humanityPips = Array.from({ length: 10 }, (_, i) => i < clan.humanity);

  return (
    <div className={`stats-panel ${isOpen ? 'stats-panel--open' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="stats-panel__content">
        {/* Epithet / tagline */}
        <p className="stats-panel__epithet">"{clan.epithet}"</p>

        {/* Disciplines */}
        <div className="stats-panel__section">
          <span className="stats-panel__label">Disciplines</span>
          <ul className="stats-panel__disciplines">
            {clan.disciplines.map((d) => (
              <li key={d} className="stats-panel__discipline">{d}</li>
            ))}
          </ul>
        </div>

        {/* Humanity */}
        <div className="stats-panel__section">
          <span className="stats-panel__label">Humanity</span>
          <div className="stats-panel__pips">
            {humanityPips.map((filled, i) => (
              <span
                key={i}
                className={`stats-panel__pip ${filled ? 'stats-panel__pip--filled' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
