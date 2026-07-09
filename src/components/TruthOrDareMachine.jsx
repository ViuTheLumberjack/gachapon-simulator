import CapsuleGlobe from './CapsuleGlobe.jsx';

const PROMPT_CAPSULE_COUNT = 6;
const PROMPT_CAPSULE_COLORS = {
  truth: 'var(--blue)',
  dare: 'var(--coral)',
};

function buildPromptCapsules(hasTruths, hasDares) {
  if (!hasTruths && !hasDares) {
    return [];
  }

  return Array.from({ length: PROMPT_CAPSULE_COUNT }, (_, index) => {
    let type = hasTruths ? 'truth' : 'dare';

    if (hasTruths && hasDares) {
      type = index % 2 === 0 ? 'truth' : 'dare';
    }

    return {
      id: `prompt-${type}-${index}`,
      type,
      color: PROMPT_CAPSULE_COLORS[type],
    };
  });
}

function getLoadedMessage(hasTruths, hasDares) {
  if (hasTruths && hasDares) {
    return 'Truth and dare capsules are loaded.';
  }

  return hasTruths ? 'Truth capsules are loaded.' : 'Dare capsules are loaded.';
}

export default function TruthOrDareMachine({
  hasTruths,
  hasDares,
  isDrawing,
  dropColor,
}) {
  const capsules = buildPromptCapsules(hasTruths, hasDares);

  if (capsules.length === 0) {
    return null;
  }

  return (
    <section
      className="truth-dare-machine machine-shell"
      aria-labelledby="truth-dare-machine-title"
    >
      <div className="machine-marquee">
        <p className="eyebrow">Prompt machine</p>
        <h2 id="truth-dare-machine-title">Gashapon Draw</h2>
        <p>{getLoadedMessage(hasTruths, hasDares)}</p>
      </div>

      <CapsuleGlobe
        capsules={capsules}
        isDrawing={isDrawing}
        className="truth-dare-globe"
        dropColor={dropColor}
      />

      <div className="machine-tray">
        <span className="tray-slot" aria-hidden="true" />
        <p aria-live="polite">
          {isDrawing
            ? 'Prompt capsules spin, then one drops into the tray.'
            : 'Ready for a prompt draw.'}
        </p>
      </div>

      <div className="prompt-capsule-legend" aria-label="Prompt capsule colors">
        {hasTruths ? (
          <span>
            <span className="legend-swatch legend-swatch--truth" aria-hidden="true" />
            Truth
          </span>
        ) : null}
        {hasDares ? (
          <span>
            <span className="legend-swatch legend-swatch--dare" aria-hidden="true" />
            Dare
          </span>
        ) : null}
      </div>
    </section>
  );
}
