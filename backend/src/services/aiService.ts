import OpenAI from 'openai';
import { v4 as uuidv4 } from 'crypto';
import { AIParseResponse, ParsedJobData, ResumeSuggestion } from '../types';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

const PARSE_SYSTEM_PROMPT = `You are an expert job description parser. Extract structured information from job descriptions and return ONLY valid JSON with no markdown, no code blocks, no explanation.

Return exactly this JSON structure:
{
  "company": "company name or empty string if not found",
  "role": "job title/role",
  "requiredSkills": ["skill1", "skill2"],
  "niceToHaveSkills": ["skill1", "skill2"],
  "seniority": "Junior|Mid|Senior|Lead|Principal|Staff|Director or empty string",
  "location": "city, state/country or Remote or empty string"
}`;

const SUGGESTIONS_SYSTEM_PROMPT = `You are a professional resume writer specializing in tech roles. Generate specific, impactful resume bullet points tailored to the job description. Return ONLY valid JSON with no markdown, no code blocks.

Return exactly this JSON structure:
{
  "suggestions": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3",
    "bullet point 4",
    "bullet point 5"
  ]
}

Each bullet point must:
- Start with a strong action verb
- Include specific metrics or outcomes where possible
- Be tailored to the specific role and skills mentioned
- Be 1-2 sentences max
- Sound human and specific, not generic`;

export async function parseJobDescription(jobDescription: string): Promise<AIParseResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const parseResponse = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: PARSE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Parse this job description:\n\n${jobDescription}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 800,
  });

  const parseContent = parseResponse.choices[0]?.message?.content;
  if (!parseContent) {
    throw new Error('No response from AI parser');
  }

  let parsed: ParsedJobData;
  try {
    parsed = JSON.parse(parseContent) as ParsedJobData;
  } catch {
    throw new Error('AI returned invalid JSON for job parsing');
  }

  if (!parsed.role) {
    throw new Error('AI could not extract job role from description');
  }

  const suggestResponse = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SUGGESTIONS_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate 5 resume bullet points for this job:\n\nRole: ${parsed.role}\nCompany: ${parsed.company}\nRequired Skills: ${parsed.requiredSkills.join(', ')}\nSeniority: ${parsed.seniority}\n\nOriginal JD:\n${jobDescription.substring(0, 2000)}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 800,
  });

  const suggestContent = suggestResponse.choices[0]?.message?.content;
  if (!suggestContent) {
    throw new Error('No response from AI suggestion generator');
  }

  let suggestData: { suggestions: string[] };
  try {
    suggestData = JSON.parse(suggestContent) as { suggestions: string[] };
  } catch {
    throw new Error('AI returned invalid JSON for suggestions');
  }

  const suggestions: ResumeSuggestion[] = (suggestData.suggestions || []).map((text) => ({
    id: generateId(),
    text,
  }));

  return { parsed, suggestions };
}
