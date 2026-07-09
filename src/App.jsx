import { useMemo, useState } from 'react';
import CapsuleReveal from './components/CapsuleReveal.jsx';
import CollectionGrid from './components/CollectionGrid.jsx';
import GachaponMachine from './components/GachaponMachine.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import TruthOrDareMode from './components/TruthOrDareMode.jsx';
import { items } from './data/items.js';
import { machines } from './data/machines.js';
import { useCollection } from './hooks/useCollection.js';
import { drawWeightedItem } from './lib/drawItem.js';
import { summarizeRarityOdds } from './lib/rarity.js';

const activeMachine = machines[0];
const machineItems = items.filter((item) => activeMachine.itemIds.includes(item.id));
const DRAW_ANIMATION_MS = 4700;

export default function App() {
  const [activeMode, setActiveMode] = useState('gachapon');
  const [isDrawing, setIsDrawing] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [dropColor, setDropColor] = useState(null);
  const { collection, stats, collectionSummary, addItem, resetCollection } =
    useCollection(machineItems);
  const odds = useMemo(() => summarizeRarityOdds(machineItems), []);

  function drawCapsule() {
    if (isDrawing) {
      return;
    }

    const item = drawWeightedItem(machineItems);
    setLatestResult(null);
    setDropColor(item.color);
    setIsDrawing(true);

    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 100
      : DRAW_ANIMATION_MS;
    window.setTimeout(() => {
      const duplicate = addItem(item);
      setLatestResult({
        item,
        duplicate,
      });
      setIsDrawing(false);
      setDropColor(null);
    }, delay);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Retro capsule arcade</p>
          <h1>Gachapon Simulator</h1>
        </div>

        <nav className="mode-switch" aria-label="Simulator mode">
          <button
            type="button"
            className={activeMode === 'gachapon' ? 'is-active' : ''}
            onClick={() => setActiveMode('gachapon')}
          >
            Gashapon
          </button>
          <button
            type="button"
            className={activeMode === 'truth-or-dare' ? 'is-active' : ''}
            onClick={() => setActiveMode('truth-or-dare')}
          >
            Truth or Dare
          </button>
        </nav>
      </header>

      {activeMode === 'gachapon' ? (
        <main className="gachapon-layout">
          <div className="main-column">
            <GachaponMachine
              machine={activeMachine}
              items={machineItems}
              isDrawing={isDrawing}
              onDraw={drawCapsule}
              odds={odds}
              dropColor={dropColor}
            />
            <CapsuleReveal result={latestResult} />
          </div>

          <aside className="side-column">
            <StatsPanel
              stats={stats}
              summary={collectionSummary}
              onReset={resetCollection}
            />
          </aside>

          <CollectionGrid items={machineItems} collection={collection} />
        </main>
      ) : (
        <main className="mode-panel">
          <TruthOrDareMode />
        </main>
      )}
    </div>
  );
}
