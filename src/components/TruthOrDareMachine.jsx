import CapsuleGlobe from './CapsuleGlobe.jsx';
import { getPromptCapsuleColor } from '../lib/drawPrompt.js';

function buildPromptCapsules(truths, dares) {
  const capsules = [];
  const largestCategory = Math.max(truths.length, dares.length);

  for (let index = 0; index < largestCategory; index += 1) {
    [
      ['truth', truths[index]],
      ['dare', dares[index]],
    ].forEach(([type, prompt]) => {
      if (prompt) {
        capsules.push({
          id: prompt.id,
          type,
          color: getPromptCapsuleColor(type, prompt.shadeIndex),
        });
      }
    });
  }

  return capsules;
}

function getLoadedMessage(truthCount, dareCount) {
  const total = truthCount + dareCount;

  if (total === 0) {
    return 'No prompt capsules remain. Reload or upload a deck to play again.';
  }

  if (truthCount > 0 && dareCount > 0) {
    return `${total} capsules remain: ${truthCount} truths and ${dareCount} dares.`;
  }

  return truthCount > 0
    ? `${truthCount} truth capsules remain.`
    : `${dareCount} dare capsules remain.`;
}

export default function TruthOrDareMachine({
  truths,
  dares,
  isDrawing,
  dropColor,
}) {
  const capsules = buildPromptCapsules(truths, dares);
  const hasTruths = truths.length > 0;
  const hasDares = dares.length > 0;

  return (
    <section
      className="truth-dare-machine machine-shell"
      aria-labelledby="truth-dare-machine-title"
    >
      <div className="machine-marquee">
        <p className="eyebrow">Prompt machine</p>
        <h2 id="truth-dare-machine-title">Gashapon Draw</h2>
        <p>{getLoadedMessage(truths.length, dares.length)}</p>
      </div>

      <CapsuleGlobe
        capsules={capsules}
        isDrawing={isDrawing}
        className="truth-dare-globe"
        dropColor={dropColor}
        showAll
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
            Truth · {truths.length}
          </span>
        ) : null}
        {hasDares ? (
          <span>
            <span className="legend-swatch legend-swatch--dare" aria-hidden="true" />
            Dare · {dares.length}
          </span>
        ) : null}
      </div>
    </section>
  );
}
