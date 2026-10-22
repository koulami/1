import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { generateVultureQuestsPdf } from './server/pdfService.ts';
import { generatePrintableQuestsHtml } from './server/printHtmlService.ts';
import { INITIAL_GAME_STATE } from './src/data/defaultGame.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Must listen on port 3000 as per AI Studio environment constraints
  // Note: NGINX listens on 8080 and reverse-proxies to 3000, so PORT=8080 env must not be used.
  let port = 3000;
  const portArgIdx = process.argv.indexOf('--port');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    const parsedPort = parseInt(process.argv[portArgIdx + 1], 10);
    if (!isNaN(parsedPort)) port = parsedPort;
  }

  app.use(express.json({ limit: '10mb' }));

  const ai = new GoogleGenAI();

  // Multi-model fallback list for maximum availability and reliability
  const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash'];

  // Clean raw translation output: removes introductory conversational chatter, quotes, asterisks, etc.
  function cleanTranslationOutput(raw: string): string {
    if (!raw) return '';
    let clean = raw.trim();
    // Remove typical AI preambles
    clean = clean.replace(/^(?:Here is the translation:?|Here's the translation:?|The translation is:?|Translation:?|The translation of [^:]+ is:?)\s*/i, '');
    // Remove surrounding quotes and brackets
    clean = clean.replace(/^["'«“‘]|["'»”’]$/g, '');
    // Remove markdown bold
    clean = clean.replace(/^\*\*(.*?)\*\*$/, '$1');
    clean = clean.replace(/\*\*/g, '');
    return clean.trim();
  }

  // Pre-cached common Greek translations for zero-latency fallbacks
  const STATIC_DICTIONARY: Record<string, string> = {
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

  // Helper to translate single text using Gemini fallback chain
  async function translateTextWithGemini(text: string): Promise<string> {
    if (!text || !text.trim()) return '';
    const trimmed = text.trim();

    if (STATIC_DICTIONARY[trimmed]) {
      return STATIC_DICTIONARY[trimmed];
    }

    // Try Gemini model fallback chain
    for (const modelName of GEMINI_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          config: {
            systemInstruction:
              'You are a direct Greek-to-English educational quiz translator. Translate Greek educational text accurately and naturally into English. Output ONLY the raw translated English text, with absolutely no commentary, no preamble, no markdown formatting, no bullet points, and no conversational filler.'
          },
          contents: trimmed
        });
        const translated = response.text?.trim();
        if (translated) {
          const cleaned = cleanTranslationOutput(translated);
          if (cleaned && !cleaned.toLowerCase().startsWith('the translation of') && !cleaned.startsWith('{')) {
            return cleaned;
          }
        }
      } catch (err: any) {
        console.warn(`Gemini model ${modelName} failed during translation:`, err?.message || err);
      }
    }

    // Fallback: check dictionary substring match or return trimmed text
    return trimmed;
  }

  // Single or batch text translation endpoint
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, texts } = req.body;
      if (typeof text === 'string') {
        const translated = await translateTextWithGemini(text);
        return res.json({ translated });
      }
      if (Array.isArray(texts)) {
        const translated = await Promise.all(texts.map((t: string) => translateTextWithGemini(t)));
        return res.json({ translated });
      }
      return res.status(400).json({ error: 'text or texts required' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Translation failed' });
    }
  });

  // Dedicated endpoint for multiple choice options translation
  app.post('/api/translate-options', async (req, res) => {
    try {
      const { options } = req.body;
      if (!Array.isArray(options)) {
        return res.status(400).json({ error: 'options array required' });
      }
      const options_en = await Promise.all(options.map((opt: string) => translateTextWithGemini(opt)));
      return res.json({ options_en });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Options translation failed' });
    }
  });

  // Full question translation endpoint: translates Greek question fields into exact matching English fields
  app.post('/api/translate-question', async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) return res.status(400).json({ error: 'Question required' });

      // Translate all core text fields
      const [title_en, description_en, explanation_en] = await Promise.all([
        question.title ? translateTextWithGemini(question.title) : Promise.resolve(''),
        question.description ? translateTextWithGemini(question.description) : Promise.resolve(''),
        question.explanation ? translateTextWithGemini(question.explanation) : Promise.resolve(undefined)
      ]);

      let payload_en: any = undefined;
      const p = question.payload || {};

      if (question.type === 'multiple_choice' && Array.isArray(p.options)) {
        const options_en = await Promise.all(p.options.map((o: string) => translateTextWithGemini(o)));
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
            left: await translateTextWithGemini(pair.left),
            right: await translateTextWithGemini(pair.right)
          }))
        );
        payload_en = { ...p, pairs: pairs_en };
      } else if (question.type === 'image_match' && Array.isArray(p.pairs)) {
        const pairs_en = await Promise.all(
          p.pairs.map(async (pair: any) => ({
            ...pair,
            text: await translateTextWithGemini(pair.text)
          }))
        );
        payload_en = { ...p, pairs: pairs_en };
      } else if (question.type === 'qr_scan') {
        payload_en = {
          ...p,
          locationHint: p.locationHint ? await translateTextWithGemini(p.locationHint) : undefined,
          unlockedMedia: p.unlockedMedia
            ? {
                ...p.unlockedMedia,
                title: p.unlockedMedia.title ? await translateTextWithGemini(p.unlockedMedia.title) : undefined,
                caption: p.unlockedMedia.caption ? await translateTextWithGemini(p.unlockedMedia.caption) : undefined
              }
            : undefined
        };
      } else if (question.type === 'photo_upload') {
        payload_en = {
          ...p,
          instructions: p.instructions ? await translateTextWithGemini(p.instructions) : undefined
        };
      } else if (question.type === 'puzzle') {
        payload_en = { ...p };
      } else if (question.type === 'task') {
        const checklist_en = Array.isArray(p.checklist)
          ? await Promise.all(p.checklist.map((c: string) => translateTextWithGemini(c)))
          : undefined;
        payload_en = {
          ...p,
          instructions: p.instructions ? await translateTextWithGemini(p.instructions) : undefined,
          checklist: checklist_en,
          completionPrompt: p.completionPrompt ? await translateTextWithGemini(p.completionPrompt) : undefined
        };
      } else if (question.type === 'research') {
        const questions_en = Array.isArray(p.guidingQuestions)
          ? await Promise.all(p.guidingQuestions.map((c: string) => translateTextWithGemini(c)))
          : undefined;
        payload_en = {
          ...p,
          researchTopic: p.researchTopic ? await translateTextWithGemini(p.researchTopic) : undefined,
          instructions: p.instructions ? await translateTextWithGemini(p.instructions) : undefined,
          guidingQuestions: questions_en
        };
      }

      return res.json({
        title_en: title_en || question.title,
        description_en: description_en || title_en || question.title,
        explanation_en,
        payload_en
      });
    } catch (err: any) {
      console.error('Error in /api/translate-question:', err);
      return res.status(500).json({ error: err.message || 'Translation failed' });
    }
  });

  // Bulk questions translation endpoint
  app.post('/api/translate-all-questions', async (req, res) => {
    try {
      const { questions } = req.body;
      if (!Array.isArray(questions)) return res.status(400).json({ error: 'questions array required' });

      const translatedQuestions = await Promise.all(
        questions.map(async (q: any) => {
          try {
            const title_en = q.title ? await translateTextWithGemini(q.title) : q.title_en;
            const description_en = q.description ? await translateTextWithGemini(q.description) : q.description_en;
            const explanation_en = q.explanation ? await translateTextWithGemini(q.explanation) : q.explanation_en;

            let payload_en = q.payload_en;
            if (q.type === 'multiple_choice' && Array.isArray(q.payload?.options)) {
              const options_en = await Promise.all(q.payload.options.map((o: string) => translateTextWithGemini(o)));
              payload_en = { ...q.payload, options: options_en };
            } else if (q.type === 'text_match' && Array.isArray(q.payload?.pairs)) {
              const pairs_en = await Promise.all(q.payload.pairs.map(async (p: any) => ({
                ...p,
                left: await translateTextWithGemini(p.left),
                right: await translateTextWithGemini(p.right)
              })));
              payload_en = { ...q.payload, pairs: pairs_en };
            } else if (q.type === 'image_match' && Array.isArray(q.payload?.pairs)) {
              const pairs_en = await Promise.all(q.payload.pairs.map(async (p: any) => ({
                ...p,
                text: await translateTextWithGemini(p.text)
              })));
              payload_en = { ...q.payload, pairs: pairs_en };
            } else if (q.type === 'task') {
              const checklist_en = Array.isArray(q.payload?.checklist)
                ? await Promise.all(q.payload.checklist.map((c: string) => translateTextWithGemini(c)))
                : undefined;
              payload_en = {
                ...q.payload,
                instructions: q.payload?.instructions ? await translateTextWithGemini(q.payload.instructions) : undefined,
                checklist: checklist_en,
                completionPrompt: q.payload?.completionPrompt ? await translateTextWithGemini(q.payload.completionPrompt) : undefined
              };
            } else if (q.type === 'research') {
              const questions_en = Array.isArray(q.payload?.guidingQuestions)
                ? await Promise.all(q.payload.guidingQuestions.map((c: string) => translateTextWithGemini(c)))
                : undefined;
              payload_en = {
                ...q.payload,
                researchTopic: q.payload?.researchTopic ? await translateTextWithGemini(q.payload.researchTopic) : undefined,
                instructions: q.payload?.instructions ? await translateTextWithGemini(q.payload.instructions) : undefined,
                guidingQuestions: questions_en
              };
            }

            return {
              ...q,
              title_en,
              description_en,
              explanation_en,
              payload_en
            };
          } catch (e) {
            console.error('Failed translating single question in bulk:', e);
            return q;
          }
        })
      );

      return res.json({ questions: translatedQuestions });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Check GitHub repository visibility and basic info
  app.get('/api/github/check-repo', async (req, res) => {
    try {
      const repoParam = (req.query.repo as string) || 'koulami/Koulami-vultures';
      const cleanRepo = repoParam.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').trim();
      const token = (req.query.token as string) || '';

      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BoundPad-Vultures-App'
      };
      if (token.trim()) {
        headers['Authorization'] = `token ${token.trim()}`;
      }

      const ghRes = await fetch(`https://api.github.com/repos/${cleanRepo}`, { headers });
      if (ghRes.status === 404) {
        return res.json({
          accessible: false,
          status: 404,
          isPrivate: true,
          repo: cleanRepo,
          message: `Το repository "${cleanRepo}" είναι ιδιωτικό (Private) ή δεν βρέθηκε.`
        });
      }
      if (ghRes.status === 401 || ghRes.status === 403) {
        return res.json({
          accessible: false,
          status: ghRes.status,
          repo: cleanRepo,
          message: `Απαιτείται έγκυρο Personal Access Token για πρόσβαση στο "${cleanRepo}".`
        });
      }
      if (!ghRes.ok) {
        return res.json({
          accessible: false,
          status: ghRes.status,
          repo: cleanRepo,
          message: `Σφάλμα GitHub: ${ghRes.statusText}`
        });
      }

      const data = await ghRes.json();
      return res.json({
        accessible: true,
        status: 200,
        repo: cleanRepo,
        isPrivate: data.private,
        defaultBranch: data.default_branch,
        updatedAt: data.updated_at,
        pushedAt: data.pushed_at
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Connect to GitHub repo and restore quests/files
  app.post('/api/github/connect-and-restore', async (req, res) => {
    try {
      const { repo = 'koulami/Koulami-vultures', token = '', branch } = req.body;
      const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').trim();

      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BoundPad-Vultures-Integration'
      };
      if (token && token.trim()) {
        headers['Authorization'] = `token ${token.trim()}`;
      }

      // 1. Verify access
      const repoRes = await fetch(`https://api.github.com/repos/${cleanRepo}`, { headers });
      if (repoRes.status === 404) {
        return res.status(404).json({
          success: false,
          status: 404,
          isPrivate: true,
          repo: cleanRepo,
          error: `Το αποθετήριο "${cleanRepo}" είναι ιδιωτικό (Private) στο GitHub ή δεν βρέθηκε. Για να συνδεθείτε, εισαγάγετε ένα GitHub Personal Access Token (PAT) ή κάντε το αποθετήριο Public στο GitHub.`
        });
      }

      if (repoRes.status === 401 || repoRes.status === 403) {
        return res.status(repoRes.status).json({
          success: false,
          status: repoRes.status,
          repo: cleanRepo,
          error: `Απόρριψη εξουσιοδότησης από το GitHub (Status ${repoRes.status}). Ελέγξτε ότι το Personal Access Token έχει δικαιώματα "repo".`
        });
      }

      if (!repoRes.ok) {
        return res.status(repoRes.status).json({
          success: false,
          status: repoRes.status,
          error: `Σφάλμα επικοινωνίας με το GitHub: ${repoRes.statusText}`
        });
      }

      const repoData = await repoRes.json();
      const targetBranch = branch || repoData.default_branch || 'main';

      // 2. Fetch tree
      const treeRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/trees/${targetBranch}?recursive=1`, { headers });
      let files: any[] = [];
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        files = treeData.tree || [];
      }

      // Prioritize target files:
      // 1) src/data/defaultGame.ts
      // 2) defaultGame.ts
      // 3) vultures.json / quests.json / backup.json
      let matchedFile = files.find((f: any) => f.path === 'src/data/defaultGame.ts')
        || files.find((f: any) => f.path.endsWith('defaultGame.ts'))
        || files.find((f: any) => /vulture.*\.json$/i.test(f.path))
        || files.find((f: any) => /quest.*\.json$/i.test(f.path))
        || files.find((f: any) => /game.*\.json$/i.test(f.path))
        || files.find((f: any) => /\.json$/i.test(f.path) && f.size > 800);

      if (!matchedFile) {
        return res.json({
          success: false,
          repo: cleanRepo,
          branch: targetBranch,
          filesFound: files.map((f: any) => f.path).slice(0, 40),
          error: `Το αποθετήριο "${cleanRepo}" συνδέθηκε, αλλά δεν βρέθηκε αρχείο defaultGame.ts ή αρχείο αποστολών JSON στον κλάδο "${targetBranch}".`
        });
      }

      // 3. Fetch file content
      const fileRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${matchedFile.path}?ref=${targetBranch}`, { headers });
      if (!fileRes.ok) {
        return res.status(fileRes.status).json({
          success: false,
          error: `Αποτυχία λήψης αρχείου ${matchedFile.path} από το GitHub.`
        });
      }

      const fileData = await fileRes.json();
      const rawContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

      // If it's a TypeScript file (e.g. defaultGame.ts)
      if (matchedFile.path.endsWith('.ts')) {
        const localDest = path.join(__dirname, 'src/data/defaultGame.ts');
        const currentLocal = fs.existsSync(localDest) ? fs.readFileSync(localDest, 'utf-8') : '';
        const remoteHasVultures = /γυπ|vulture/i.test(rawContent);
        const remoteQuestionCount = (rawContent.match(/id:\s*['"]quest-/g) || []).length;
        const localQuestionCount = (currentLocal.match(/id:\s*['"]quest-/g) || []).length;

        // If local has all 31 full Vulture missions and remote only has older generic template (14 questions)
        if (localQuestionCount >= 30 && (!remoteHasVultures || remoteQuestionCount < 20)) {
          return res.json({
            success: true,
            repo: cleanRepo,
            branch: targetBranch,
            filePath: matchedFile.path,
            has31VulturesLocally: true,
            remoteQuestionCount,
            localQuestionCount,
            message: `Συνδεθήκατε επιτυχώς με το αποθετήριο ${cleanRepo}! Το αποθετήριο στο GitHub περιέχει προς το παρόν το αρχικό πρότυπο (${remoteQuestionCount} ερωτήσεις). Στην εφαρμογή σας υπάρχουν ήδη και οι ${localQuestionCount} πλήρεις Αποστολές των Γυπών, οι οποίες προστατεύτηκαν και παραμένουν 100% ενεργές!`
          });
        }

        fs.writeFileSync(localDest, rawContent, 'utf-8');
      }

      let parsedQuestions: any[] = [];
      let parsedGameState: any = null;

      try {
        if (matchedFile.path.endsWith('.json')) {
          const json = JSON.parse(rawContent);
          if (Array.isArray(json)) {
            parsedQuestions = json;
          } else if (json.questions && Array.isArray(json.questions)) {
            parsedQuestions = json.questions;
            parsedGameState = json;
          }
        }
      } catch (err) {
        console.warn('Could not parse JSON directly:', err);
      }

      return res.json({
        success: true,
        repo: cleanRepo,
        branch: targetBranch,
        filePath: matchedFile.path,
        fileContent: rawContent,
        parsedQuestions,
        parsedGameState,
        message: `Επιτυχής σύνδεση με το αποθετήριο ${cleanRepo}! Το αρχείο ${matchedFile.path} ανακτήθηκε και εφαρμόστηκε.`
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'GitHub sync failed' });
    }
  });

  // Download defaultGame.ts file directly (for committing to GitHub)
  app.get('/api/export-defaultgame-ts', (_req, res) => {
    try {
      const filePath = path.join(__dirname, 'src/data/defaultGame.ts');
      const content = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'text/typescript; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="defaultGame.ts"');
      return res.send(content);
    } catch (err: any) {
      return res.status(500).send('Failed to export defaultGame.ts');
    }
  });

  // Download clean JSON containing all 32 vulture quests and 4 teams
  app.get('/api/export-vultures-ts', (_req, res) => {
    try {
      const filePath = path.join(__dirname, 'src/data/vulturesData.ts');
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="vulturesData.ts"');
        return res.sendFile(filePath);
      }
      return res.status(404).send('Not found');
    } catch (err: any) {
      return res.status(500).send('Failed to export vultures TypeScript');
    }
  });

  app.get('/api/export-vultures-json', (_req, res) => {
    try {
      const filePath = path.join(__dirname, 'vultures_clean_portable.json');
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="vultures-quests-and-teams.json"');
        return res.sendFile(filePath);
      }
      return res.status(404).send('Not found');
    } catch (err: any) {
      return res.status(500).send('Failed to export vultures JSON');
    }
  });

  // Direct restore endpoint (allows writing to src/data/defaultGame.ts)
  app.post('/api/github/direct-restore', async (req, res) => {
    try {
      const { content, filename = 'defaultGame.ts' } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'content string required' });
      }

      if (filename.endsWith('.ts')) {
        const dest = path.join(__dirname, 'src/data/defaultGame.ts');
        fs.writeFileSync(dest, content, 'utf-8');
      }

      return res.json({ success: true, message: 'Το αρχείο defaultGame.ts αποθηκεύτηκε επιτυχώς!' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Dedicated Pixel-Perfect HTML Print & PDF Export endpoint (renders exact preview layout for all 61 quests)
  app.get('/api/print-view', async (req, res) => {
    try {
      const includeAnswers = req.query.answers !== 'false';
      const printLang = (req.query.lang as 'el' | 'en' | 'both') || 'el';
      const teamFilter = (req.query.team as string) || 'all';
      const autoprint = req.query.autoprint === '1';

      const html = await generatePrintableQuestsHtml(INITIAL_GAME_STATE.questions, {
        title: INITIAL_GAME_STATE.title,
        title_en: INITIAL_GAME_STATE.title_en,
        description: INITIAL_GAME_STATE.description,
        description_en: INITIAL_GAME_STATE.description_en,
        includeAnswers,
        printLang,
        includeExplanations: true,
        teamFilter,
        teams: INITIAL_GAME_STATE.teams,
        autoprint
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } catch (err: any) {
      console.error('Error in /api/print-view GET:', err);
      return res.status(500).send('Failed to generate print view');
    }
  });

  app.post('/api/print-view', async (req, res) => {
    try {
      const {
        questions = INITIAL_GAME_STATE.questions,
        title = INITIAL_GAME_STATE.title,
        title_en = INITIAL_GAME_STATE.title_en,
        description = INITIAL_GAME_STATE.description,
        description_en = INITIAL_GAME_STATE.description_en,
        includeAnswers = true,
        printLang = 'el',
        includeExplanations = true,
        teamFilter = 'all',
        teams = INITIAL_GAME_STATE.teams,
        autoprint = false
      } = req.body || {};

      const html = await generatePrintableQuestsHtml(questions, {
        title,
        title_en,
        description,
        description_en,
        includeAnswers,
        printLang,
        includeExplanations,
        teamFilter,
        teams,
        autoprint
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } catch (err: any) {
      console.error('Error in /api/print-view POST:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Direct PDF generation endpoint (POST: customizable options & custom questions; GET: quick download)
  app.post('/api/generate-pdf', (req, res) => {
    try {
      const {
        questions = INITIAL_GAME_STATE.questions,
        title = INITIAL_GAME_STATE.title,
        title_en = INITIAL_GAME_STATE.title_en,
        includeAnswers = true,
        printLang = 'el',
        includeExplanations = true,
        teamFilter = 'all',
        teams = INITIAL_GAME_STATE.teams
      } = req.body || {};

      const pdfBuffer = generateVultureQuestsPdf(questions, {
        title,
        title_en,
        includeAnswers,
        printLang,
        includeExplanations,
        teamFilter,
        teams
      });

      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = includeAnswers
        ? `BoundPad-Vulture-Arena-61-Apostoles-Lyseis-${dateStr}.pdf`
        : `BoundPad-Vulture-Arena-61-Apostoles-Fyllo-Mathiti-${dateStr}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    } catch (err: any) {
      console.error('PDF generation endpoint error:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate PDF' });
    }
  });

  app.get('/api/generate-pdf', (req, res) => {
    try {
      const includeAnswers = req.query.answers !== 'false';
      const printLang = (req.query.lang as 'el' | 'en' | 'both') || 'el';
      const teamFilter = (req.query.team as string) || 'all';

      const pdfBuffer = generateVultureQuestsPdf(INITIAL_GAME_STATE.questions, {
        title: INITIAL_GAME_STATE.title,
        title_en: INITIAL_GAME_STATE.title_en,
        includeAnswers,
        printLang,
        includeExplanations: true,
        teamFilter,
        teams: INITIAL_GAME_STATE.teams
      });

      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = includeAnswers
        ? `BoundPad-Vulture-Arena-61-Apostoles-Lyseis-${dateStr}.pdf`
        : `BoundPad-Vulture-Arena-61-Apostoles-Fyllo-Mathiti-${dateStr}.pdf`;

      const isInline = req.query.view === '1' || req.query.inline === '1';
      const disposition = isInline ? 'inline' : 'attachment';

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    } catch (err: any) {
      console.error('PDF GET endpoint error:', err);
      return res.status(500).send('Failed to generate PDF');
    }
  });

  // Mount Vite middlewares in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
