import { expect, it } from 'vitest';
import clues from './clues';

it('clues', () => {
    const result = JSON.stringify(clues);
    expect(result).toMatchSnapshot();
});
