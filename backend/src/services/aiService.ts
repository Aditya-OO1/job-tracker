import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIParseResponse, ParsedJobData, ResumeSuggestion } from '../types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export async function parseJobDescription(jobDescription: string): Promise<AIParseResponse> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const parsePrompt = `Extract info from this job description and return ONLY valid JSON, no markdown:
{"company":"","role":"","requiredSkills":[],"niceToHaveSkills":[],"seniority":"","location":""}
JD: ${jobDescription}`;

  const parseResult = await model.generateContent(parsePrompt);
  const parseText = parseResult.response.text().replace(/```json|```/g, '').trim();

  let parsed: ParsedJobData;
  try { parsed = JSON.parse(parseText) as ParsedJobData; }
  catch (_e) { throw new Error('AI returned invalid JSON'); }

  if (!parsed.role) throw new Error('Could not extract role');

  const suggestPrompt = `Generate 5 resume bullet points for this role. Return ONLY valid JSON:
{"suggestions":["bullet1","bullet2","bullet3","bullet4","bullet5"]}
Role: ${parsed.role}, Skills: ${parsed.requiredSkills.join(', ')}
JD: ${jobDescription.substring(0, 1000)}`;

  const suggestResult = await model.generateContent(suggestPrompt);
  const suggestText = suggestResult.response.text().replace(/```json|```/g, '').trim();

  let suggestData: { suggestions: string[] };
  try { suggestData = JSON.parse(suggestText) as { suggestions: string[] }; }
  catch (_e) { throw new Error('AI returned invalid JSON for suggestions'); }

  const suggestions: ResumeSuggestion[] = (suggestData.suggestions || []).map((text) => ({
    id: generateId(), text,
  }));

  return { parsed, suggestions };
}
