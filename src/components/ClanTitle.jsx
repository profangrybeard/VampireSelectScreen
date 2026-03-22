/**
 * Clan title + archetype label.
 * Permanent, designed into composition. Not a tooltip.
 * Tap to toggle stats panel.
 * Pass 1: grey values only.
 */
export default function ClanTitle({ name, archetype, onClick }) {
  return (
    <div className="clan-title" onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      <span className="clan-title__archetype">{archetype}</span>
      <h1 className="clan-title__name">{name}</h1>
    </div>
  );
}
