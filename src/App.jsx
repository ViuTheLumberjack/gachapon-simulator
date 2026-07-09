import { useEffect, useMemo, useRef, useState } from 'react';
import CapsuleReveal from './components/CapsuleReveal.jsx';
import CollectionGrid from './components/CollectionGrid.jsx';
import GachaponMachine from './components/GachaponMachine.jsx';
import PostDrawRevealOverlay from './components/PostDrawRevealOverlay.jsx';
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
  const [postDrawReveal, setPostDrawReveal] = useState(null);
  const drawTimeoutRef = useRef(null);
  const { collection, stats, collectionSummary, addItem, resetCollection } =
    useCollection(machineItems);
  const odds = useMemo(() => summarizeRarityOdds(machineItems), []);

  useEffect(() => {
    return () => {
      if (drawTimeoutRef.current) {
        window.clearTimeout(drawTimeoutRef.current);
      }
    };
  }, []);

  function drawCapsule() {
    if (isDrawing || postDrawReveal) {
      return;
    }

    const item = drawWeightedItem(machineItems);
    setLatestResult(null);
    setDropColor(item.color);
    setIsDrawing(true);

    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 100
      : DRAW_ANIMATION_MS;
    drawTimeoutRef.current = window.setTimeout(() => {
      const duplicate = addItem(item);
      setPostDrawReveal({
        kind: 'item',
        item,
        duplicate,
      });
      setIsDrawing(false);
      setDropColor(null);
      drawTimeoutRef.current = null;
    }, delay);
  }

  function dismissPostDrawReveal() {
    if (!postDrawReveal) {
      return;
    }

    if (postDrawReveal.kind === 'item') {
      setLatestResult({
        item: postDrawReveal.item,
        duplicate: postDrawReveal.duplicate,
      });
    }

    setPostDrawReveal(null);
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
              isDrawDisabled={isDrawing || Boolean(postDrawReveal)}
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
      {postDrawReveal ? (
        <PostDrawRevealOverlay
          reveal={postDrawReveal}
          onDismiss={dismissPostDrawReveal}
        />
      ) : null}
    </div>
  );
}
