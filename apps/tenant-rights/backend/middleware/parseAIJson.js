function parseAIJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(stripped);
  } catch (_) {}
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) {}
  }
  return null;
}

module.exports = parseAIJson;
