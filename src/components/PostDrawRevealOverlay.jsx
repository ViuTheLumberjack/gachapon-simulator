import { useCallback, useEffect, useRef, useState } from 'react';
import { getPromptImageUrl } from '../lib/drawPrompt.js';
import { getRarityMeta } from '../lib/rarity.js';

const OPENING_ANIMATION_MS = 5000;
const OUTCOME_ANIMATION_MS = 2400;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getPromptLabel(type) {
  return type === 'dare' ? 'Dare' : 'Truth';
}

export default function PostDrawRevealOverlay({ reveal, onDismiss }) {
  const [isComplete, setIsComplete] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [isOutcomeComplete, setIsOutcomeComplete] = useState(false);
  const timerRef = useRef(null);
  const overlayRef = useRef(null);
  const isItemReveal = reveal.kind === 'item';

  const completeReveal = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsComplete(true);
  }, []);

  const handleInput = useCallback(() => {
    if (outcome) {
      if (isOutcomeComplete) {
        onDismiss();
      }
      return;
    }

    if (!isComplete) {
      completeReveal();
      return;
    }

    if (isItemReveal) {
      onDismiss();
    }
  }, [
    completeReveal,
    isComplete,
    isItemReveal,
    isOutcomeComplete,
    onDismiss,
    outcome,
  ]);

  const choosePromptOutcome = useCallback((nextOutcome) => {
    if (!isComplete || isItemReveal || outcome) {
      return;
    }

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setOutcome(nextOutcome);

    if (prefersReducedMotion()) {
      setIsOutcomeComplete(true);
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setIsOutcomeComplete(true);
      timerRef.current = null;
    }, OUTCOME_ANIMATION_MS);
  }, [isComplete, isItemReveal, outcome]);

  useEffect(() => {
    setIsComplete(false);
    setOutcome(null);
    setIsOutcomeComplete(false);
    overlayRef.current?.focus();

    if (prefersReducedMotion()) {
      setIsComplete(true);
      return undefined;
    }

    timerRef.current = window.setTimeout(() => {
      completeReveal();
    }, OPENING_ANIMATION_MS);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [completeReveal, reveal]);

  useEffect(() => {
    if (isItemReveal) {
      return;
    }

    [reveal.prompt.imageName1, reveal.prompt.imageName2].forEach((imageName) => {
      const image = new Image();
      image.src = getPromptImageUrl(imageName, import.meta.env.BASE_URL);
    });
  }, [isItemReveal, reveal]);

  useEffect(() => {
    if (outcome) {
      overlayRef.current?.focus();
    }
  }, [outcome]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.key === 'Tab' ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      if (event.target instanceof HTMLElement && event.target.closest('button')) {
        return;
      }

      if (!isItemReveal && isComplete && !outcome) {
        if (event.key.toLowerCase() === 'c') {
          event.preventDefault();
          choosePromptOutcome('correct');
        } else if (event.key.toLowerCase() === 'i') {
          event.preventDefault();
          choosePromptOutcome('incorrect');
        }
        return;
      }

      event.preventDefault();
      handleInput();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [choosePromptOutcome, handleInput, isComplete, isItemReveal, outcome]);

  const capsuleColor = isItemReveal ? reveal.item.color : reveal.color;

  if (outcome) {
    return (
      <PromptOutcome
        outcome={outcome}
        prompt={reveal.prompt}
        isComplete={isOutcomeComplete}
        onContinue={handleInput}
        overlayRef={overlayRef}
      />
    );
  }

  const overlayClassName = [
    'post-draw-reveal',
    isItemReveal ? 'post-draw-reveal--item' : 'post-draw-reveal--prompt',
    isComplete ? 'is-complete' : 'is-animating',
  ].join(' ');

  return (
    <div
      className={overlayClassName}
      style={{
        '--reveal-color': capsuleColor,
        '--opening-duration': `${OPENING_ANIMATION_MS}ms`,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={
        isItemReveal
          ? `${reveal.item.name} revealed`
          : `${getPromptLabel(reveal.type)} prompt revealed`
      }
      tabIndex={-1}
      ref={overlayRef}
      onPointerDown={handleInput}
    >
      <div className="post-draw-reveal__stage">
        <div className="post-draw-reveal__stars" aria-hidden="true" />

        <div className="post-draw-reveal__result" aria-live="polite">
          {isItemReveal ? <ItemReveal reveal={reveal} /> : <PromptReveal reveal={reveal} />}
        </div>

        <div className="post-draw-reveal__capsule" aria-hidden="true">
          <span className="post-draw-reveal__capsule-half post-draw-reveal__capsule-half--left" />
          <span className="post-draw-reveal__capsule-half post-draw-reveal__capsule-half--right" />
          <span className="post-draw-reveal__capsule-seam" />
        </div>

        {isItemReveal || !isComplete ? (
          <button
            className="post-draw-reveal__action"
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleInput}
          >
            {isComplete ? 'Continue' : 'Skip'}
          </button>
        ) : (
          <div
            className="post-draw-reveal__answer-actions"
            aria-label="Choose whether the answer was correct"
          >
            <button
              className="post-draw-reveal__answer post-draw-reveal__answer--correct"
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => choosePromptOutcome('correct')}
            >
              Correct
            </button>
            <button
              className="post-draw-reveal__answer post-draw-reveal__answer--incorrect"
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => choosePromptOutcome('incorrect')}
            >
              Incorrect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemReveal({ reveal }) {
  const rarityMeta = getRarityMeta(reveal.item.rarity);

  return (
    <div className="post-draw-reveal__content">
      <div className="post-draw-reveal__puppet" style={{ '--item-color': reveal.item.color }}>
        <img src={reveal.item.image} alt={`${reveal.item.name} artwork`} />
      </div>
      <p className="eyebrow">{reveal.duplicate ? 'Duplicate prize' : 'New prize'}</p>
      <h2>{reveal.item.name}</h2>
      <span className={`rarity-pill ${rarityMeta.className}`}>{rarityMeta.label}</span>
      <p>{reveal.item.description}</p>
    </div>
  );
}

function PromptReveal({ reveal }) {
  return (
    <div className="post-draw-reveal__content post-draw-reveal__content--prompt">
      <div className="post-draw-reveal__prompt-meta">
        <p className="eyebrow">{getPromptLabel(reveal.type)}</p>
        <span className="post-draw-reveal__topic">{reveal.prompt.topic}</span>
      </div>
      <h2>{reveal.prompt.text}</h2>
    </div>
  );
}

function PromptOutcome({ outcome, prompt, isComplete, onContinue, overlayRef }) {
  const isCorrect = outcome === 'correct';
  const imageName = isCorrect ? prompt.imageName1 : prompt.imageName2;
  const message = isCorrect
    ? "Un nuovo animaletto si unisce all'avventura"
    : 'La tua ignoranza lo ha ucciso';
  const imageUrl = getPromptImageUrl(imageName, import.meta.env.BASE_URL);
  const className = [
    'prompt-outcome',
    `prompt-outcome--${outcome}`,
    isComplete ? 'is-complete' : 'is-animating',
  ].join(' ');

  return (
    <div
      className={className}
      role="dialog"
      aria-modal="true"
      aria-label={message}
      tabIndex={-1}
      ref={overlayRef}
      onPointerDown={onContinue}
      style={{ '--outcome-duration': `${OUTCOME_ANIMATION_MS}ms` }}
    >
      <div className="prompt-outcome__energy" aria-hidden="true" />
      <div className="prompt-outcome__particles" aria-hidden="true" />

      <figure className="prompt-outcome__figure">
        <OutcomeImage src={imageUrl} alt={message} />
        <figcaption>{message}</figcaption>
      </figure>

      {isComplete ? (
        <button
          className="prompt-outcome__continue"
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onContinue}
        >
          Premi per continuare
        </button>
      ) : null}
    </div>
  );
}

function OutcomeImage({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="prompt-outcome__image-error" role="img" aria-label={alt}>
        <span>Image not found</span>
        <small>Check the filename in public/images.</small>
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setHasError(true)} />;
}
