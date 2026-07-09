export default function DrawControls({ isDrawing, onDraw }) {
  return (
    <div className="draw-controls">
      <button className="crank-button" type="button" onClick={onDraw} disabled={isDrawing}>
        <span className="crank-button__knob" aria-hidden="true" />
        <span>{isDrawing ? 'Capsule spinning' : 'Turn crank'}</span>
      </button>
      <button className="primary-button" type="button" onClick={onDraw} disabled={isDrawing}>
        {isDrawing ? 'Drawing...' : 'Draw capsule'}
      </button>
    </div>
  );
}
