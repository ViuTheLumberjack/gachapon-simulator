import { parsePromptCsv } from '../lib/drawPrompt.js';

async function readPromptFile(file) {
  if (!file) {
    return null;
  }

  const text = await file.text();
  return {
    fileName: file.name,
    ...parsePromptCsv(text),
  };
}

export default function PromptDeckUploader({ deck, onDeckChange, onError }) {
  async function handleFileChange(event) {
    try {
      const file = event.target.files?.[0];
      const result = await readPromptFile(file);

      if (result) {
        onDeckChange(result);
      }
    } catch (error) {
      onError(error.message || 'The prompt CSV could not be read.');
      event.target.value = '';
    }
  }

  return (
    <section className="uploader-panel" aria-labelledby="prompt-upload-title">
      <div className="section-heading">
        <p className="eyebrow">Prompt deck</p>
        <h2 id="prompt-upload-title">Upload your deck</h2>
      </div>

      <p className="uploader-panel__instructions">
        Use one CSV with the columns <code>Truth/dare</code>,{' '}
        <code>topic</code>, <code>description</code>,{' '}
        <code>image_name_1</code>, and <code>image_name_2</code>. Image names are loaded from{' '}
        <code>public/images</code>.
      </p>

      <div className="upload-grid upload-grid--single">
        <label className="file-drop">
          <span>Truth or Dare deck</span>
          <strong>{deck.fileName || 'Choose .csv'}</strong>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </section>
  );
}
