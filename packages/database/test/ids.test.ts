import { validate, version } from 'uuid';
import { describe, expect, it } from 'vitest';

import { createId } from '../src/ids.js';

describe('createId', () => {
  it('creates a valid RFC 9562 UUIDv7', () => {
    const id = createId();

    expect(validate(id)).toBe(true);
    expect(version(id)).toBe(7);
  });

  it('creates unique IDs', () => {
    const ids = Array.from({ length: 100 }, () => createId());

    expect(new Set(ids)).toHaveLength(ids.length);
  });
});
