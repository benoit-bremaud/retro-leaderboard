import { describe, expect, it } from 'vitest';
import { worker } from '../src/worker';

describe('placeholder worker', () => {
  it('answers 501 until the first brick lands', async () => {
    const response = worker.fetch();
    expect(response.status).toBe(501);
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(await response.text()).toBe('Not implemented');
  });
});
