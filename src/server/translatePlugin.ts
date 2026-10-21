import type { Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI();
  }
  return aiInstance;
}

// Clean and decode HTML entities from fallback APIs
function cleanTranslationText(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/^["'`]|["'`]$/g, '')
    .trim();
}

const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash'];

const STATIC_DICT: Record<string, string> = {
  'Επιλογή 1': 'Option 1',
  'Επιλογή 2': 'Option 2',
  'Επιλογή 3': 'Option 3',
  'Επιλογή 4': 'Option 4',
  'Επιλογή Α': 'Option A',
  'Επιλογή Β': 'Option B',
  'Επιλογή Γ': 'Option C',
  'Επιλογή Δ': 'Option D',
  'Σωστό': 'True',
  'Λάθος': 'False',
  'Ναι': 'Yes',
  'Όχι': 'No',
  'Γύπας': 'Vulture',
  'Όρνεο': 'Griffon Vulture',
  'Γύπας Πυρόχρους (Όρνεο)': 'Griffon Vulture (Gyps fulvus)',
  'Γύπας Πυρόχρους': 'Griffon Vulture',
  'Μαυρόγυπας': 'Cinereous Vulture',
  'Ασπροπάρης': 'Egyptian Vulture',
  'Γυπαετός': 'Bearded Vulture',
  'Είδος γύπα': 'Vulture species',
  'Ονομασία': 'Species name',
  'Μέγεθος': 'Size',
  'Πληθυσμός': 'Vulture population',
  'Άνοιγμα φτερούγων': 'Wingspan',
  'Διάρκεια ζωής': 'Lifespan',
  'Αριθμός αυγών': 'Number of eggs laid',
  'Απειλές': 'Threats',
  'Πομποί GPS': 'GPS transmitters',
  'Χρήση πομπών GPS': 'Use of GPS transmitters',
  'Δακτυλίωση': 'Bird ringing / banding',
  'Εισαγωγή γυπών από την Ισπανία': 'Importing vultures from Spain',
  'Ταΐστρες': 'Feeding stations',
  'Ειδικά εκπαιδευμένοι σκύλοι': 'Specially trained dogs'
};

export async function translateSingleText(text: string): Promise<string> {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();

  if (STATIC_DICT[trimmed]) {
    return STATIC_DICT[trimmed];
  }

  const ai = getAI();
  for (const modelName of GEMINI_MODELS) {
    try {
      const resp = await ai.models.generateContent({
        model: modelName,
        config: {
          systemInstruction:
            'You are a direct Greek-to-English educational quiz translator. Translate Greek educational text accurately and naturally into English. Output ONLY the raw translated English text, with absolutely no commentary, no preamble, no markdown formatting, no bullet points, and no conversational filler.'
        },
        contents: trimmed
      });
      const result = resp.text?.trim();
      if (result) {
        let cleaned = cleanTranslationText(result);
        cleaned = cleaned.replace(/^(?:Here is the translation:?|Here's the translation:?|The translation is:?|Translation:?|The translation of [^:]+ is:?)\s*/i, '');
        cleaned = cleaned.replace(/^["'«“‘]|["'»”’]$/g, '');
        cleaned = cleaned.replace(/^\*\*(.*?)\*\*$/, '$1');
        cleaned = cleaned.replace(/\*\*/g, '').trim();
        if (cleaned && !cleaned.toLowerCase().startsWith('the translation of') && !cleaned.startsWith('{')) {
          return cleaned;
        }
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} failed in translateSingleText:`, err?.message || err);
    }
  }

  return trimmed;
}

export async function translateStructuredQuestion(question: any): Promise<{
  title_en: string;
  description_en: string;
  explanation_en?: string;
  payload_en?: any;
}> {
  if (!question) {
    throw new Error('Question object required');
  }

  const [title_en, description_en, explanation_en] = await Promise.all([
    question.title ? translateSingleText(question.title) : Promise.resolve(''),
    question.description ? translateSingleText(question.description) : Promise.resolve(''),
    question.explanation ? translateSingleText(question.explanation) : Promise.resolve(undefined)
  ]);

  let payload_en: any = undefined;
  const p = question.payload || {};

  if (question.type === 'multiple_choice' && Array.isArray(p.options)) {
    const options_en = await Promise.all(p.options.map((o: string) => translateSingleText(o)));
    payload_en = {
      ...p,
      options: options_en,
      correctOptionIndices: p.correctOptionIndices,
      correctOptionIndex: p.correctOptionIndex
    };
  } else if (question.type === 'true_false') {
    payload_en = { ...p };
  } else if (question.type === 'text_match' && Array.isArray(p.pairs)) {
    const pairs_en = await Promise.all(
      p.pairs.map(async (pair: any) => ({
        ...pair,
        left: await translateSingleText(pair.left),
        right: await translateSingleText(pair.right)
      }))
    );
    payload_en = { ...p, pairs: pairs_en };
  } else if (question.type === 'image_match' && Array.isArray(p.pairs)) {
    const pairs_en = await Promise.all(
      p.pairs.map(async (pair: any) => ({
        ...pair,
        text: await translateSingleText(pair.text)
      }))
    );
    payload_en = { ...p, pairs: pairs_en };
  } else if (question.type === 'qr_scan') {
    payload_en = {
      ...p,
      locationHint: p.locationHint ? await translateSingleText(p.locationHint) : undefined,
      unlockedMedia: p.unlockedMedia
        ? {
            ...p.unlockedMedia,
            title: p.unlockedMedia.title ? await translateSingleText(p.unlockedMedia.title) : undefined,
            caption: p.unlockedMedia.caption ? await translateSingleText(p.unlockedMedia.caption) : undefined
          }
        : undefined
    };
  } else if (question.type === 'photo_upload') {
    payload_en = {
      ...p,
      instructions: p.instructions ? await translateSingleText(p.instructions) : undefined
    };
  } else if (question.type === 'puzzle') {
    payload_en = { ...p };
  } else if (question.type === 'task') {
    const checklist_en = Array.isArray(p.checklist)
      ? await Promise.all(p.checklist.map((item: string) => translateSingleText(item)))
      : undefined;
    payload_en = {
      ...p,
      instructions: p.instructions ? await translateSingleText(p.instructions) : undefined,
      checklist: checklist_en,
      completionPrompt: p.completionPrompt ? await translateSingleText(p.completionPrompt) : undefined
    };
  } else if (question.type === 'research') {
    const questions_en = Array.isArray(p.guidingQuestions)
      ? await Promise.all(p.guidingQuestions.map((item: string) => translateSingleText(item)))
      : undefined;
    payload_en = {
      ...p,
      researchTopic: p.researchTopic ? await translateSingleText(p.researchTopic) : undefined,
      instructions: p.instructions ? await translateSingleText(p.instructions) : undefined,
      guidingQuestions: questions_en
    };
  }

  return {
    title_en: title_en || question.title,
    description_en: description_en || title_en || question.title,
    explanation_en,
    payload_en
  };
}

export function viteTranslatePlugin(): Plugin {
  return {
    name: 'vite-translate-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/translate')) {
          return next();
        }

        if (req.method !== 'POST') {
          return next();
        }

        // Read request body
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            const body = rawBody ? JSON.parse(rawBody) : {};

            if (req.url === '/api/translate') {
              const { text, texts } = body;
              if (typeof text === 'string') {
                const translated = await translateSingleText(text);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ translated }));
                return;
              }
              if (Array.isArray(texts)) {
                const translated = await Promise.all(texts.map((t: string) => translateSingleText(t)));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ translated }));
                return;
              }
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'text or texts required' }));
              return;
            }

            if (req.url === '/api/translate-options') {
              const { options } = body;
              if (!Array.isArray(options)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'options array required' }));
                return;
              }
              const options_en = await Promise.all(options.map((opt: string) => translateSingleText(opt)));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ options_en }));
              return;
            }

            if (req.url === '/api/translate-question') {
              const { question } = body;
              if (!question) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'question required' }));
                return;
              }
              const result = await translateStructuredQuestion(question);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
              return;
            }

            if (req.url === '/api/translate-all-questions') {
              const { questions } = body;
              if (!Array.isArray(questions)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'questions array required' }));
                return;
              }

              const translatedQuestions = await Promise.all(
                questions.map(async (q: any) => {
                  try {
                    const trans = await translateStructuredQuestion(q);
                    return {
                      ...q,
                      title_en: trans.title_en,
                      description_en: trans.description_en,
                      explanation_en: trans.explanation_en,
                      payload_en: trans.payload_en || q.payload_en
                    };
                  } catch (e) {
                    console.error('Failed to translate question in bulk:', e);
                    return q;
                  }
                })
              );

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ questions: translatedQuestions }));
              return;
            }

            next();
          } catch (err: any) {
            console.error('Error in translate API plugin:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Internal translation error' }));
          }
        });
      });
    }
  };
}
