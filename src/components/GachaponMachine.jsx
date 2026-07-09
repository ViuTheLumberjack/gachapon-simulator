import CapsuleGlobe from './CapsuleGlobe.jsx';
import DrawControls from './DrawControls.jsx';

export default function GachaponMachine({
  machine,
  items,
  isDrawing,
  onDraw,
  odds,
  dropColor,
}) {
  const displayCapsules = items.slice(0, 6).map((item) => ({
    id: item.id,
    color: item.color,
  }));

  return (
    <section className="machine-stage" aria-labelledby="machine-title">
      <div className="machine-shell">
        <div className="machine-marquee">
          <p className="eyebrow">Now playing</p>
          <h2 id="machine-title">{machine.name}</h2>
          <p>{machine.tagline}</p>
        </div>

        <CapsuleGlobe
          capsules={displayCapsules}
          isDrawing={isDrawing}
          dropColor={dropColor}
        />

        <div className="machine-tray">
          <span className="tray-slot" aria-hidden="true" />
          <p aria-live="polite">
            {isDrawing
              ? 'Capsules are spinning, then one drops into the tray.'
              : 'Ready for the next pull.'}
          </p>
        </div>

        <DrawControls isDrawing={isDrawing} onDraw={onDraw} />
      </div>

      <aside className="odds-panel" aria-label="Rarity odds">
        <h3>Prize odds</h3>
        <div className="odds-list">
          {odds.map((entry) => (
            <div className="odds-row" key={entry.rarity}>
              <span>{entry.label}</span>
              <strong>{entry.percent.toFixed(1)}%</strong>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
