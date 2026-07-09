import { useEffect, useRef, useState } from 'react';
import { drawTruthOrDare } from '../lib/drawPrompt.js';
import PromptDeckUploader from './PromptDeckUploader.jsx';
import PromptReveal from './PromptReveal.jsx';
import TruthOrDareMachine from './TruthOrDareMachine.jsx';

const emptyDeck = {
  truthsFileName: '',
  daresFileName: '',
  truths: [],
  dares: [],
};
const DRAW_ANIMATION_MS = 4700;
const PROMPT_DROP_COLORS = {
  truth: 'var(--blue)',
  dare: 'var(--coral)',
};

function PromptReadySummary({ truthCount, dareCount, onEdit }) {
  return (
    <section
      className="prompt-ready-summary"
      aria-labelledby="prompt-ready-title"
    >
      <div className="section-heading">
        <p className="eyebrow">Prompt deck</p>
        <h2 id="prompt-ready-title">Lists ready</h2>
      </div>

      <div className="prompt-stats" aria-label="Ready prompt counts">
        <div>
          <span>Truths</span>
          <strong>{truthCount}</strong>
        </div>
        <div>
          <span>Dares</span>
          <strong>{dareCount}</strong>
        </div>
      </div>

      <button className="secondary-button" type="button" onClick={onEdit}>
        Edit Lists
      </button>
    </section>
  );
}

export default function TruthOrDareMode() {
  const [deck, setDeck] = useState(emptyDeck);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [dropColor, setDropColor] = useState(null);
  const drawTimeoutRef = useRef(null);

  const hasTruths = deck.truths.length > 0;
  const hasDares = deck.dares.length > 0;
  const hasAnyPrompt = hasTruths || hasDares;

  useEffect(() => {
    return () => {
      if (drawTimeoutRef.current) {
        window.clearTimeout(drawTimeoutRef.current);
      }
    };
  }, []);

  function clearPendingDraw() {
    if (drawTimeoutRef.current) {
      window.clearTimeout(drawTimeoutRef.current);
      drawTimeoutRef.current = null;
    }

    setIsDrawing(false);
    setDropColor(null);
  }

  function updateDeck(nextDeck) {
    clearPendingDraw();
    setDeck(nextDeck);
    setResult(null);
    setError('');
    setIsReady(false);
  }

  function readyToPlay() {
    if (!hasAnyPrompt) {
      setError('Upload at least one truth or dare list before playing.');
      return;
    }

    clearPendingDraw();
    setResult(null);
    setError('');
    setIsReady(true);
  }

  function editLists() {
    clearPendingDraw();
    setResult(null);
    setError('');
    setIsReady(false);
  }

  function draw(choice) {
    if (isDrawing || !isReady) {
      return;
    }

    try {
      const nextResult = drawTruthOrDare(deck, choice);
      clearPendingDraw();
      setError('');
      setResult(null);
      setDropColor(PROMPT_DROP_COLORS[nextResult.type]);
      setIsDrawing(true);

      const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 80
        : DRAW_ANIMATION_MS;
      drawTimeoutRef.current = window.setTimeout(() => {
        setResult(nextResult);
        setIsDrawing(false);
        setDropColor(null);
        drawTimeoutRef.current = null;
      }, delay);
    } catch (drawError) {
      setError(drawError.message);
    }
  }

  return (
    <div className="truth-dare-layout">
      <div className="truth-dare-main">
        {isReady ? (
          <TruthOrDareMachine
            hasTruths={hasTruths}
            hasDares={hasDares}
            isDrawing={isDrawing}
            dropColor={dropColor}
          />
        ) : (
          <PromptDeckUploader
            deck={deck}
            onDeckChange={updateDeck}
            onError={setError}
          />
        )}
      </div>

      <div className="truth-dare-play-column">
        <section
          className={`truth-dare-controls ${
            isReady ? 'truth-dare-controls--play' : ''
          }`}
          aria-labelledby="truth-dare-title"
        >
          <div className="section-heading">
            <p className="eyebrow">Party mode</p>
            <h2 id="truth-dare-title">Truth or Dare</h2>
          </div>

          {isReady ? (
            <>
              <div className="draw-controls draw-controls--stacked">
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => draw('surprise')}
                  disabled={!hasAnyPrompt || isDrawing}
                >
                  Surprise Me
                </button>
              </div>

              {isDrawing ? (
                <p className="muted" aria-live="polite">
                  Prompt capsules spinning...
                </p>
              ) : null}
            </>
          ) : (
            <>
              <div className="prompt-stats" aria-label="Uploaded prompt counts">
                <div>
                  <span>Truths</span>
                  <strong>{deck.truths.length}</strong>
                </div>
                <div>
                  <span>Dares</span>
                  <strong>{deck.dares.length}</strong>
                </div>
              </div>

              <div className="truth-dare-setup-actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={readyToPlay}
                  disabled={!hasAnyPrompt}
                >
                  Ready to Play
                </button>
              </div>
            </>
          )}
          {error ? <p className="error-text" role="alert">{error}</p> : null}
        </section>

        {isReady ? (
          <PromptReadySummary
            truthCount={deck.truths.length}
            dareCount={deck.dares.length}
            onEdit={editLists}
          />
        ) : null}
      </div>

      {isReady ? <PromptReveal result={result} /> : null}
    </div>
  );
}
