// Parses a JSON object body; malformed or non-object bodies become {} so routes answer 400, not 500.
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  return body && typeof body === "object" && !Array.isArray(body) ? body : {};
}

// Trimmed string field, or "" when missing or not a string.
export const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
