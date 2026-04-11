import Groq from 'groq-sdk';
import { AIParseResponse, ParsedJobData, ResumeSuggestion } from '../types';

const groq = new Groq({ apiKey: process.env.GEMINI_API_KEY });

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export async function parseJobDescription(jobDescription: string): Promise<AIParseResponse> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('API key not configured');
  }

  const parseResponse = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a job description parser. Return ONLY valid JSON, no markdown, no explanation. JSON format: {"company":"","role":"","requiredSkills":[],"niceToHaveSkills":[],"seniority":"","location":""}'
      },
      { role: 'user', content: `Parse this job description:\n${jobDescription}` }
    ],
    temperature: 0.1,
    max_tokens: 800,
  });

  const parseText = parseResponse.choices[0]?.message?.content?.replace(/```json|```/g, '').trim() || '';
  
  let parsed: ParsedJobData;
  try { parsed = JSON.parse(parseText) as ParsedJobData; }
  catch (_e) { throw new Error('AI returned invalid JSON'); }

  if (!parsed.role) throw new Error('Could not extract role');

  const suggestResponse = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a resume writer. Return ONLY valid JSON: {"suggestions":["bullet1","bullet2","bullet3","bullet4","bullet5"]}'
      },
      { role: 'user', content: `Generate 5 resume bullets for: Role: ${parsed.role}, Skills: ${parsed.requiredSkills.join(', ')}, JD: ${jobDescription.substring(0, 1000)}` }
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  const suggestText = suggestResponse.choices[0]?.message?.content?.replace(/```json|```/g, '').trim() || '';
  
  let suggestData: { suggestions: string[] };
  try { suggestData = JSON.parse(suggestText) as { suggestions: string[] }; }
  catch (_e) { throw new Error('AI returned invalid JSON for suggestions'); }

  const suggestions: ResumeSuggestion[] = (suggestData.suggestions || []).map((text) => ({
    id: generateId(), text,
  }));

  return { parsed, suggestions };
}
