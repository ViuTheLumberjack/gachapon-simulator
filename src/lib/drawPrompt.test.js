import { describe, expect, it } from 'vitest';
import {
  consumeDrawnPrompt,
  drawTruthOrDare,
  drawUniformPrompt,
  getPromptCapsuleColor,
  getPromptImageUrl,
  parsePromptCsv,
} from './drawPrompt.js';

describe('parsePromptCsv', () => {
  it('builds truth and dare decks from one CSV', () => {
    const csv = [
      'Truth/dare,topic,description,image_name_1,image_name_2',
      'truth,Friends,"A question, with a comma",friend cat.png,sad-cat.png',
      'DARE,Performance,"A dare with\na second line",hero.png,ghost.png',
    ].join('\n');

    expect(parsePromptCsv(csv)).toEqual({
      truths: [
        {
          id: 'csv-row-2',
          type: 'truth',
          topic: 'Friends',
          text: 'A question, with a comma',
          imageName1: 'friend cat.png',
          imageName2: 'sad-cat.png',
          shadeIndex: 0,
        },
      ],
      dares: [
        {
          id: 'csv-row-3',
          type: 'dare',
          topic: 'Performance',
          text: 'A dare with\na second line',
          imageName1: 'hero.png',
          imageName2: 'ghost.png',
          shadeIndex: 0,
        },
      ],
    });
  });

  it('accepts a BOM and escaped quotes', () => {
    const csv =
      '\uFEFFTruth/dare,topic,description,image_name_1,image_name_2\r\n' +
      'truth,Conversation,"Say ""hello""",one.png,two.png';

    expect(parsePromptCsv(csv).truths[0].text).toBe('Say "hello"');
  });

  it('reports missing columns and invalid rows', () => {
    expect(() => parsePromptCsv('Truth/dare,description\ntruth,Hello')).toThrow(
      'Missing CSV columns: topic, image_name_1, image_name_2.',
    );
    expect(() =>
      parsePromptCsv(
        'Truth/dare,topic,description,image_name_1,image_name_2\nmaybe,General,Hello,a.png,b.png',
      ),
    ).toThrow('Row 2: Truth/dare must be "truth" or "dare".');
  });
});

describe('getPromptImageUrl', () => {
  it('maps image filenames into the public images folder', () => {
    expect(getPromptImageUrl('friend cat.png', '/gachapon-simulator/')).toBe(
      '/gachapon-simulator/images/friend%20cat.png',
    );
    expect(getPromptImageUrl('images/pets/cat.png', '/')).toBe(
      '/images/pets/cat.png',
    );
  });
});

describe('drawUniformPrompt', () => {
  const prompts = [
    { id: 'a', text: 'A' },
    { id: 'b', text: 'B' },
    { id: 'c', text: 'C' },
  ];

  it('selects prompts uniformly by index', () => {
    expect(drawUniformPrompt(prompts, () => 0).id).toBe('a');
    expect(drawUniformPrompt(prompts, () => 0.34).id).toBe('b');
    expect(drawUniformPrompt(prompts, () => 0.99).id).toBe('c');
  });

  it('throws for an empty prompt list', () => {
    expect(() => drawUniformPrompt([])).toThrow(
      'Cannot draw from an empty prompt list.',
    );
  });
});

describe('drawTruthOrDare', () => {
  const deck = {
    truths: [
      { id: 'truth-1', type: 'truth', text: 'Truth one' },
      { id: 'truth-2', type: 'truth', text: 'Truth two' },
    ],
    dares: [{ id: 'dare-1', type: 'dare', text: 'Dare one' }],
  };

  it('draws from the requested category', () => {
    expect(drawTruthOrDare(deck, 'truth', () => 0.99)).toEqual({
      type: 'truth',
      prompt: deck.truths[1],
    });
    expect(drawTruthOrDare(deck, 'dare', () => 0.1)).toEqual({
      type: 'dare',
      prompt: deck.dares[0],
    });
  });

  it('chooses an available category for surprise draws', () => {
    const result = drawTruthOrDare(deck, 'surprise', () => 0.75);

    expect(result).toEqual({
      type: 'dare',
      prompt: deck.dares[0],
    });
  });

  it('throws when surprise has no available prompts', () => {
    expect(() =>
      drawTruthOrDare({ truths: [], dares: [] }, 'surprise'),
    ).toThrow('Cannot draw without uploaded truth or dare prompts.');
  });
});

describe('consumeDrawnPrompt', () => {
  const deck = {
    fileName: 'deck.csv',
    truths: [
      { id: 'truth-1', type: 'truth' },
      { id: 'truth-2', type: 'truth' },
    ],
    dares: [{ id: 'dare-1', type: 'dare' }],
  };

  it('removes only the selected row from the remaining deck', () => {
    const nextDeck = consumeDrawnPrompt(deck, {
      type: 'truth',
      prompt: deck.truths[0],
    });

    expect(nextDeck).toEqual({
      fileName: 'deck.csv',
      truths: [deck.truths[1]],
      dares: deck.dares,
    });
    expect(deck.truths).toHaveLength(2);
  });
});

describe('getPromptCapsuleColor', () => {
  it('creates stable, distinct blue truth and red dare shades', () => {
    const truthShades = Array.from({ length: 8 }, (_, index) =>
      getPromptCapsuleColor('truth', index),
    );
    const dareShades = Array.from({ length: 8 }, (_, index) =>
      getPromptCapsuleColor('dare', index),
    );

    expect(new Set(truthShades)).toHaveLength(truthShades.length);
    expect(new Set(dareShades)).toHaveLength(dareShades.length);
    expect(truthShades[0]).toBe('hsl(200.0 68% 42%)');
    expect(dareShades[0]).toBe('hsl(345.0 68% 42%)');
  });
});
