import { useCallback, useEffect, useRef, useState } from 'react';
import { getRarityMeta } from '../lib/rarity.js';

const OPENING_ANIMATION_MS = 5000;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getPromptLabel(type) {
  return type === 'dare' ? 'Dare' : 'Truth';
}

export default function PostDrawRevealOverlay({ reveal, onDismiss }) {
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef(null);
  const overlayRef = useRef(null);

  const completeReveal = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsComplete(true);
  }, []);

  const handleInput = useCallback(() => {
    if (!isComplete) {
      completeReveal();
      return;
    }

    onDismiss();
  }, [completeReveal, isComplete, onDismiss]);

  useEffect(() => {
    setIsComplete(false);
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

      event.preventDefault();
      handleInput();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  const isItemReveal = reveal.kind === 'item';
  const capsuleColor = isItemReveal ? reveal.item.color : reveal.color;
  const overlayClassName = [
    'post-draw-reveal',
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

        <button
          className="post-draw-reveal__action"
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={handleInput}
        >
          {isComplete ? 'Continue' : 'Skip'}
        </button>
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
      <p className="eyebrow">{getPromptLabel(reveal.type)}</p>
      <h2>{reveal.prompt.text}</h2>
    </div>
  );
}
