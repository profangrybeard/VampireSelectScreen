/**
 * Clan title + archetype label.
 * Permanent, designed into composition. Not a tooltip.
 * Tap to toggle stats panel.
 * Includes a small accent-colored signifier prompting the user to tap.
 */
export default function ClanTitle({ name, archetype, accent, statsOpen, onClick }) {
  return (
    <div className="clan-title" onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      <span className="clan-title__archetype">{archetype}</span>
      <h1 className="clan-title__name">{name}</h1>
      <div
        className={`clan-title__tap-hint ${statsOpen ? 'clan-title__tap-hint--hidden' : ''}`}
        style={{ '--accent': accent || '#888' }}
      >
        <span className="clan-title__tap-dot" />
        <span>Details</span>
      </div>
    </div>
  );
}
