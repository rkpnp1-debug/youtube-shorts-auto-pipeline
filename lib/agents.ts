import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

export interface AgentOutput {
  title: string;
  description: string;
  hashtags: string[];
  hook: string;
}

export async function runReachAgents(input: {
  workingTitle?: string;
  notes?: string;
  filename: string;
}): Promise<AgentOutput> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for AI agents');
  }

  const system = `You are an elite YouTube Shorts growth agent.
Your job is to maximize reach, retention and algorithm performance for short-form vertical videos.

Rules:
- Titles: 40-70 characters, curiosity + emotion + keyword, no misleading clickbait
- Description: 2-3 short paragraphs + strong CTA + relevant keywords
- Hashtags: 8-12 mix of high-volume + niche. Always include #Shorts
- Hook: the first 3-second spoken or on-screen text that stops the scroll

Return ONLY valid JSON with keys: title, description, hashtags (array of strings), hook.`;

  const user = `Create optimized metadata for this Shorts video.

Working title: ${input.workingTitle || 'none'}
Notes from creator: ${input.notes || 'none'}
Filename: ${input.filename}

Generate the best possible title, description, hashtags and hook.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  return {
    title: (parsed.title || input.workingTitle || 'Untitled Short').slice(0, 100),
    description: parsed.description || '',
    hashtags: Array.isArray(parsed.hashtags)
      ? parsed.hashtags.map(String)
      : ['#Shorts'],
    hook: parsed.hook || '',
  };
}
