export default function PromptReveal({ result }) {
  if (!result) {
    return (
      <section className="prompt-reveal prompt-reveal--empty" aria-label="Truth or Dare result">
        <p className="eyebrow">Capsule prompt</p>
        <h2>No prompt in tray</h2>
        <p>The prompt tray is empty.</p>
      </section>
    );
  }

  return (
    <section className="prompt-reveal" aria-live="polite" aria-label="Truth or Dare result">
      <p className="eyebrow">{result.type}</p>
      <h2>{result.prompt.text}</h2>
    </section>
  );
}
