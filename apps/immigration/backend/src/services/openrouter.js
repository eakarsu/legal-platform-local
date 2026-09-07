const { openRouterFetch } = require('../../../../../packages/ai-client/index.cjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const callOpenRouter = async (systemPrompt, userMessage) => {
  const response = await openRouterFetch({
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'OpenRouter API error');
  return data.choices[0].message.content;
};

module.exports = { callOpenRouter };
