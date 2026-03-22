/**
 * Clan title + archetype label.
 * Permanent, designed into composition. Not a tooltip.
 * Pass 1: grey values only.
 */
export default function ClanTitle({ name, archetype }) {
  return (
    <div className="clan-title">
      <span className="clan-title__archetype">{archetype}</span>
      <h1 className="clan-title__name">{name}</h1>
    </div>
  );
}
