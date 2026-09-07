const { openRouterFetch } = require('../../../../packages/ai-client/index.cjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

async function callOpenRouter(systemPrompt, userPrompt) {
  try {
    const response = await openRouterFetch({
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'AI Estate Planning'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'OpenRouter API error');
    }

    return {
      content: data.choices?.[0]?.message?.content || 'No response generated',
      model: data.model || OPENROUTER_MODEL,
      usage: data.usage || {},
      id: data.id || ''
    };
  } catch (error) {
    console.error('OpenRouter error:', error.message);
    throw error;
  }
}

// AI Feature: Will Drafting
async function generateWillDraft(details) {
  const systemPrompt = `You are an expert estate planning attorney AI assistant. Help draft will documents with proper legal language. Always include disclaimers that this is AI-generated and should be reviewed by a licensed attorney. Format your response with clear sections using markdown.`;
  const userPrompt = `Draft a will document with the following details:
- Testator: ${details.testator_name}
- Executor: ${details.executor_name || 'Not specified'}
- Title: ${details.title}
- Special Instructions: ${details.content || 'Standard provisions'}
Please create a comprehensive, professionally formatted will draft with standard clauses.`;
  return callOpenRouter(systemPrompt, userPrompt);
}

// AI Feature: Estate Planning Advice
async function getEstateAdvice(question) {
  const systemPrompt = `You are a knowledgeable estate planning advisor AI. Provide helpful, accurate information about estate planning, wills, trusts, and legacy planning. Always recommend consulting with a licensed attorney for specific legal advice. Format responses with clear headers and bullet points using markdown.`;
  return callOpenRouter(systemPrompt, question);
}

// AI Feature: Power of Attorney Drafting
async function generatePOA(details) {
  const systemPrompt = `You are an expert legal document AI assistant specializing in Power of Attorney documents. Create professional POA drafts with proper legal language. Include disclaimers about attorney review. Format with clear sections using markdown.`;
  const userPrompt = `Draft a ${details.poa_type} Power of Attorney with:
- Principal: ${details.principal_name}
- Agent: ${details.agent_name}
- Powers: ${details.powers_granted}
- Effective Date: ${details.effective_date || 'Upon signing'}
Create a comprehensive POA document.`;
  return callOpenRouter(systemPrompt, userPrompt);
}

// AI Feature: Trust Planning
async function generateTrustPlan(details) {
  const systemPrompt = `You are an expert trust planning AI assistant. Help create trust documents and provide recommendations for trust structures. Always recommend professional legal review. Use clear markdown formatting.`;
  const userPrompt = `Create a trust plan for:
- Trust Type: ${details.trust_type}
- Trust Name: ${details.trust_name}
- Grantor: ${details.grantor_name}
- Trustee: ${details.trustee_name}
- Beneficiaries: ${details.beneficiary_names}
- Assets: ${details.assets_description}
Provide a detailed trust document outline with recommendations.`;
  return callOpenRouter(systemPrompt, userPrompt);
}

// AI Feature: Healthcare Directive
async function generateHealthcareDirective(details) {
  const systemPrompt = `You are a healthcare directive AI assistant. Help create advance healthcare directives with clear, compassionate language. Include all standard provisions and remind users to discuss with their healthcare providers. Use markdown formatting.`;
  const userPrompt = `Create a healthcare directive for:
- Type: ${details.directive_type}
- Principal: ${details.principal_name}
- Healthcare Agent: ${details.healthcare_agent}
- Wishes: ${details.wishes}
- Conditions: ${details.conditions}
Draft a comprehensive healthcare directive.`;
  return callOpenRouter(systemPrompt, userPrompt);
}

// AI Feature: Legacy Message Enhancement
async function enhanceLegacyMessage(details) {
  const systemPrompt = `You are a compassionate AI writing assistant specializing in legacy messages - heartfelt letters people leave for their loved ones. Help enhance and beautify these messages while preserving the original sentiment and voice. Make the language more eloquent and touching. Use markdown formatting.`;
  const userPrompt = `Enhance this legacy message:
- To: ${details.recipient_name}
- Original message: ${details.message_content}
- Occasion/Trigger: ${details.delivery_trigger}
Please enhance this message to be more eloquent and heartfelt while preserving the original intent.`;
  return callOpenRouter(systemPrompt, userPrompt);
}

// AI Feature: Digital Asset Analysis
async function analyzeDigitalAssets(assets) {
  const systemPrompt = `You are a digital asset management AI advisor. Analyze digital asset portfolios and provide recommendations for estate planning, security, and succession. Use clear markdown formatting with tables and bullet points.`;
  const userPrompt = `Analyze this digital asset portfolio and provide estate planning recommendations:\n${JSON.stringify(assets, null, 2)}\n\nProvide: 1) Portfolio summary 2) Risk assessment 3) Succession recommendations 4) Security recommendations`;
  return callOpenRouter(systemPrompt, userPrompt);
}

// AI Feature: Estate Summary
async function generateEstateSummary(data) {
  const systemPrompt = `You are an estate planning AI assistant. Generate comprehensive estate plan summaries with clear organization and actionable insights. Use professional markdown formatting.`;
  const userPrompt = `Generate a comprehensive estate plan summary based on:\n${JSON.stringify(data, null, 2)}\n\nInclude: 1) Executive summary 2) Asset overview 3) Beneficiary distribution 4) Document status 5) Recommendations for improvement`;
  return callOpenRouter(systemPrompt, userPrompt);
}

module.exports = {
  callOpenRouter,
  generateWillDraft,
  getEstateAdvice,
  generatePOA,
  generateTrustPlan,
  generateHealthcareDirective,
  enhanceLegacyMessage,
  analyzeDigitalAssets,
  generateEstateSummary
};
