import { getRarityMeta } from '../lib/rarity.js';

export default function ItemCard({ item, entry }) {
  const discovered = Boolean(entry);
  const rarityMeta = getRarityMeta(item.rarity);

  return (
    <article className={`item-card ${discovered ? 'is-discovered' : 'is-hidden'}`}>
      <div className="item-card__image" style={{ '--item-color': item.color }}>
        {discovered ? (
          <img src={item.image} alt={`${item.name} artwork`} />
        ) : (
          <span aria-hidden="true">?</span>
        )}
      </div>
      <div className="item-card__content">
        <p className="item-card__name">{discovered ? item.name : 'Undiscovered'}</p>
        <span className={`rarity-pill ${rarityMeta.className}`}>{rarityMeta.label}</span>
        <p className="item-card__count">
          {discovered ? `Owned: ${entry.count}` : 'Keep drawing'}
        </p>
      </div>
    </article>
  );
}
