/**
 * Placeholder Worker entry point: it answers every request with `501 Not Implemented` until the
 * first implementation brick lands (epic benoit-bremaud/retro-shmup#166). It exists so that the
 * local CI tiers have a module to type-check, test and analyse; the conception lives under
 * docs/architecture/ and docs/decisions/.
 */
export const worker = {
  /** Answers every request with 501 and no body content beyond a short reason. */
  fetch(): Response {
    return new Response('Not implemented', {
      status: 501,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  },
};
