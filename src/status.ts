import request from 'superagent';

/**
 * Fetch a URL and return the parsed JSON body.
 *
 * Uses superagent (a CJS package with internal require() calls) so that tsx's
 * node-modules resolver is exercised.  On Node 24+ with unfixed tsx versions,
 * this throws "Cannot find module '…index.jsx'" because tsx wrongly rewrites
 * CJS-internal relative requires inside node_modules.
 */
export async function fetchJson(url: string): Promise<unknown> {
  const res = await request.get(url).set('Accept', 'application/json');
  return res.body;
}
