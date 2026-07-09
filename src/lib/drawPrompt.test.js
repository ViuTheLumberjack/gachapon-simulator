import { describe, expect, it } from 'vitest';
import { drawTruthOrDare, drawUniformPrompt, parsePromptText } from './drawPrompt.js';

describe('parsePromptText', () => {
  it('turns non-empty lines into typed prompts', () => {
    expect(parsePromptText('One\n\n  Two  \r\nThree', 'truth')).toEqual([
      { id: 'truth-1', type: 'truth', text: 'One' },
      { id: 'truth-2', type: 'truth', text: 'Two' },
      { id: 'truth-3', type: 'truth', text: 'Three' },
    ]);
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
