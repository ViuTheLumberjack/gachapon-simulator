import { getRarityMeta } from '../lib/rarity.js';

export default function CapsuleReveal({ result }) {
  if (!result) {
    return (
      <section className="reveal-panel reveal-panel--empty" aria-label="Latest capsule result">
        <p className="eyebrow">Capsule tray</p>
        <h2>Ready for a prize</h2>
        <p>The tray is empty.</p>
      </section>
    );
  }

  const rarityMeta = getRarityMeta(result.item.rarity);

  return (
    <section className="reveal-panel" aria-live="polite" aria-label="Latest capsule result">
      <div className="reveal-art" style={{ '--item-color': result.item.color }}>
        <img src={result.item.image} alt="" />
      </div>
      <div>
        <p className="eyebrow">{result.duplicate ? 'Duplicate prize' : 'New prize'}</p>
        <h2>{result.item.name}</h2>
        <span className={`rarity-pill ${rarityMeta.className}`}>{rarityMeta.label}</span>
        <p>{result.item.description}</p>
        {result.duplicate ? (
          <p className="muted">This copy was added to your collection count.</p>
        ) : (
          <p className="muted">This prize was added to your collection album.</p>
        )}
      </div>
    </section>
  );
}
