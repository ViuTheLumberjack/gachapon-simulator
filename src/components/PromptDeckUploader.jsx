import { parsePromptText } from '../lib/drawPrompt.js';

async function readPromptFile(file, type) {
  if (!file) {
    return { fileName: '', prompts: [] };
  }

  const text = await file.text();
  return {
    fileName: file.name,
    prompts: parsePromptText(text, type),
  };
}

export default function PromptDeckUploader({ deck, onDeckChange, onError }) {
  async function handleFileChange(event, type) {
    try {
      const file = event.target.files?.[0];
      const result = await readPromptFile(file, type);

      onDeckChange({
        ...deck,
        [`${type}sFileName`]: result.fileName,
        [`${type}s`]: result.prompts,
      });
    } catch {
      onError('The prompt file could not be read. Try a plain .txt file.');
    }
  }

  return (
    <section className="uploader-panel" aria-labelledby="prompt-upload-title">
      <div className="section-heading">
        <p className="eyebrow">Prompt deck</p>
        <h2 id="prompt-upload-title">Upload lists</h2>
      </div>

      <div className="upload-grid">
        <label className="file-drop">
          <span>Truths file</span>
          <strong>{deck.truthsFileName || 'Choose .txt'}</strong>
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={(event) => handleFileChange(event, 'truth')}
          />
        </label>

        <label className="file-drop">
          <span>Dares file</span>
          <strong>{deck.daresFileName || 'Choose .txt'}</strong>
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={(event) => handleFileChange(event, 'dare')}
          />
        </label>
      </div>
    </section>
  );
}
