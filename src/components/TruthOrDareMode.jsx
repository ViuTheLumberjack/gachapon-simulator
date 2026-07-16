import { useEffect, useRef, useState } from 'react';
import {
  consumeDrawnPrompt,
  drawTruthOrDare,
  getPromptCapsuleColor,
  parsePromptCsv,
} from '../lib/drawPrompt.js';
import PostDrawRevealOverlay from './PostDrawRevealOverlay.jsx';
import PromptDeckUploader from './PromptDeckUploader.jsx';
import TruthOrDareMachine from './TruthOrDareMachine.jsx';

const emptyDeck = {
  fileName: '',
  truths: [],
  dares: [],
};
const DRAW_ANIMATION_MS = 4700;
const DEFAULT_DECK_FILE_NAME = 'truthordare-deck.csv';

function PromptReadySummary({ truthCount, dareCount, onEdit }) {
  return (
    <section
      className="prompt-ready-summary"
      aria-labelledby="prompt-ready-title"
    >
      <div className="section-heading">
        <p className="eyebrow">Prompt deck</p>
        <h2 id="prompt-ready-title">Capsules remaining</h2>
      </div>

      <div className="prompt-stats" aria-label="Ready prompt counts">
        <div>
          <span>Truths left</span>
          <strong>{truthCount}</strong>
        </div>
        <div>
          <span>Dares left</span>
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
  const [error, setError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [dropColor, setDropColor] = useState(null);
  const [postDrawReveal, setPostDrawReveal] = useState(null);
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

  useEffect(() => {
    const controller = new AbortController();

    async function loadDefaultDeck() {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}${DEFAULT_DECK_FILE_NAME}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          return;
        }

        const parsedDeck = parsePromptCsv(await response.text());
        setDeck((currentDeck) => {
          if (currentDeck.fileName) {
            return currentDeck;
          }

          return {
            fileName: DEFAULT_DECK_FILE_NAME,
            ...parsedDeck,
          };
        });
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          // A missing or malformed optional deck simply leaves the uploader ready.
        }
      }
    }

    loadDefaultDeck();
    return () => controller.abort();
  }, []);

  function clearPendingDraw() {
    if (drawTimeoutRef.current) {
      window.clearTimeout(drawTimeoutRef.current);
      drawTimeoutRef.current = null;
    }

    setIsDrawing(false);
    setDropColor(null);
    setPostDrawReveal(null);
  }

  function updateDeck(nextDeck) {
    clearPendingDraw();
    setDeck(nextDeck);
    setError('');
    setIsReady(false);
  }

  function readyToPlay() {
    if (!hasAnyPrompt) {
      setError('Upload at least one truth or dare list before playing.');
      return;
    }

    clearPendingDraw();
    setError('');
    setIsReady(true);
  }

  function editLists() {
    clearPendingDraw();
    setError('');
    setIsReady(false);
  }

  function draw(choice) {
    if (isDrawing || postDrawReveal || !isReady) {
      return;
    }

    try {
      const nextResult = drawTruthOrDare(deck, choice);
      const selectedColor = getPromptCapsuleColor(
        nextResult.type,
        nextResult.prompt.shadeIndex,
      );
      clearPendingDraw();
      setError('');
      setDeck((currentDeck) => consumeDrawnPrompt(currentDeck, nextResult));
      setDropColor(selectedColor);
      setIsDrawing(true);

      const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 80
        : DRAW_ANIMATION_MS;
      drawTimeoutRef.current = window.setTimeout(() => {
        setPostDrawReveal({
          kind: 'prompt',
          type: nextResult.type,
          prompt: nextResult.prompt,
          color: selectedColor,
        });
        setIsDrawing(false);
        setDropColor(null);
        drawTimeoutRef.current = null;
      }, delay);
    } catch (drawError) {
      setError(drawError.message);
    }
  }

  function dismissPostDrawReveal() {
    if (!postDrawReveal) {
      return;
    }

    setPostDrawReveal(null);
  }

  return (
    <div className="truth-dare-layout">
      <div className="truth-dare-main">
        {isReady ? (
          <TruthOrDareMachine
            truths={deck.truths}
            dares={deck.dares}
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
                  disabled={!hasAnyPrompt || isDrawing || Boolean(postDrawReveal)}
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

      {postDrawReveal ? (
        <PostDrawRevealOverlay
          reveal={postDrawReveal}
          onDismiss={dismissPostDrawReveal}
        />
      ) : null}
    </div>
  );
}
