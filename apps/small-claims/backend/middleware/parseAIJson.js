function parseAIJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {}
  // Strip markdown code fences
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(stripped);
  } catch (_) {}
  // Find first {...} block
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) {}
  }
  return null;
}

module.exports = parseAIJson;
