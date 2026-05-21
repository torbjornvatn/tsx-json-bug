import statuses from "statuses";

/**
 * Look up an HTTP status message by code.
 * This forces tsx to resolve statuses, which in turn loads statuses/codes.json.
 */
export function getStatusMessage(code: number): string {
  return statuses(code);
}
