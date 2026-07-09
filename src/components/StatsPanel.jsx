import { RARITY_ORDER, getRarityMeta } from '../lib/rarity.js';

export default function StatsPanel({ stats, summary, onReset }) {
  return (
    <section className="stats-panel" aria-labelledby="stats-title">
      <div>
        <p className="eyebrow">Progress</p>
        <h2 id="stats-title">{summary.completionPercent}% complete</h2>
      </div>

      <div className="stat-grid">
        <div>
          <span>Total pulls</span>
          <strong>{stats.totalDraws ?? 0}</strong>
        </div>
        <div>
          <span>Found</span>
          <strong>
            {summary.uniqueCollected}/{summary.totalItems}
          </strong>
        </div>
        <div>
          <span>Copies</span>
          <strong>{summary.totalCopies}</strong>
        </div>
      </div>

      <div className="rarity-counts">
        {RARITY_ORDER.map((rarity) => (
          <div className="odds-row" key={rarity}>
            <span>{getRarityMeta(rarity).label}</span>
            <strong>{stats.rarityCounts?.[rarity] ?? 0}</strong>
          </div>
        ))}
      </div>

      <button className="secondary-button" type="button" onClick={onReset}>
        Reset collection
      </button>
    </section>
  );
}
