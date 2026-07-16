const REQUIRED_PROMPT_COLUMNS = [
  'truth/dare',
  'topic',
  'description',
  'image_name_1',
  'image_name_2',
];

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let isQuoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (isQuoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        isQuoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      if (field.trim()) {
        throw new Error('The CSV contains a quote in an invalid position.');
      }
      field = '';
      isQuoted = true;
    } else if (character === ',') {
      row.push(field.trim());
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') {
        index += 1;
      }
      row.push(field.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (isQuoted) {
    throw new Error('The CSV contains an unclosed quoted field.');
  }

  row.push(field.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(value) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function parsePromptCsv(text) {
  const rows = parseCsvRows(String(text ?? '').replace(/^\uFEFF/, ''));

  if (rows.length === 0) {
    throw new Error('The CSV is empty.');
  }

  const headers = rows[0].map(normalizeHeader);
  const columnIndexes = Object.fromEntries(
    REQUIRED_PROMPT_COLUMNS.map((column) => [column, headers.indexOf(column)]),
  );
  const missingColumns = REQUIRED_PROMPT_COLUMNS.filter(
    (column) => columnIndexes[column] === -1,
  );

  if (missingColumns.length > 0) {
    throw new Error(`Missing CSV columns: ${missingColumns.join(', ')}.`);
  }

  const deck = { truths: [], dares: [] };

  rows.slice(1).forEach((values, index) => {
    const rowNumber = index + 2;
    const type = values[columnIndexes['truth/dare']]?.trim().toLowerCase();
    const topic = values[columnIndexes.topic]?.trim();
    const description = values[columnIndexes.description]?.trim();
    const imageName1 = values[columnIndexes.image_name_1]?.trim();
    const imageName2 = values[columnIndexes.image_name_2]?.trim();

    if (type !== 'truth' && type !== 'dare') {
      throw new Error(`Row ${rowNumber}: Truth/dare must be "truth" or "dare".`);
    }

    if (!topic || !description || !imageName1 || !imageName2) {
      throw new Error(
        `Row ${rowNumber}: topic, description, image_name_1, and image_name_2 are required.`,
      );
    }

    const prompt = {
      id: `csv-row-${rowNumber}`,
      type,
      topic,
      text: description,
      imageName1,
      imageName2,
      shadeIndex: deck[`${type}s`].length,
    };

    deck[`${type}s`].push(prompt);
  });

  if (deck.truths.length === 0 && deck.dares.length === 0) {
    throw new Error('The CSV does not contain any prompt rows.');
  }

  return deck;
}

export function getPromptImageUrl(imageName, baseUrl = '/') {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const relativeName = String(imageName ?? '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^images\//i, '');
  const safePath = relativeName
    .split('/')
    .filter((segment) => segment && segment !== '.' && segment !== '..')
    .map(encodeURIComponent)
    .join('/');

  return `${normalizedBase}images/${safePath}`;
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

export function consumeDrawnPrompt(deck, drawResult) {
  const category = `${drawResult.type}s`;

  return {
    ...deck,
    [category]: (deck[category] ?? []).filter(
      (prompt) => prompt.id !== drawResult.prompt.id,
    ),
  };
}

export function getPromptCapsuleColor(type, shadeIndex = 0) {
  const colorIndex = Math.max(0, Number(shadeIndex) || 0);
  const hueOffset = ((colorIndex * 0.61803398875) % 1) * 30;
  const saturation = 68 + ((colorIndex * 7) % 18);
  const lightness = 42 + ((colorIndex * 11) % 24);
  const baseHue = type === 'dare' ? 345 : 200;

  return `hsl(${(baseHue + hueOffset).toFixed(1)} ${saturation}% ${lightness}%)`;
}
