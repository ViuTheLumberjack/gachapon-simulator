export function parsePromptText(text, type) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `${type}-${index + 1}`,
      type,
      text: line,
    }));
}

export function drawUniformPrompt(prompts, random = Math.random) {
  if (!Array.isArray(prompts) || prompts.length === 0) {
    throw new Error('Cannot draw from an empty prompt list.');
  }

  const index = Math.min(Math.floor(random() * prompts.length), prompts.length - 1);
  return prompts[index];
}

export function drawTruthOrDare(deck, choice, random = Math.random) {
  const categories = {
    truth: deck.truths ?? [],
    dare: deck.dares ?? [],
  };

  if (choice === 'truth' || choice === 'dare') {
    return {
      type: choice,
      prompt: drawUniformPrompt(categories[choice], random),
    };
  }

  if (choice !== 'surprise') {
    throw new Error(`Unknown prompt draw choice: ${choice}`);
  }

  const availableTypes = Object.entries(categories)
    .filter(([, prompts]) => prompts.length > 0)
    .map(([type]) => type);

  if (availableTypes.length === 0) {
    throw new Error('Cannot draw without uploaded truth or dare prompts.');
  }

  const typeIndex = Math.min(
    Math.floor(random() * availableTypes.length),
    availableTypes.length - 1,
  );
  const type = availableTypes[typeIndex];

  return {
    type,
    prompt: drawUniformPrompt(categories[type], random),
  };
}
