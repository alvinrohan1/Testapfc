import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { validateQuestion } from './src/utils/scoring.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI client with standard User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

/**
 * Question Schema for Gemini structured JSON output
 */
const questionSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: 'The multiple choice question text based strictly on the provided notes.'
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Exactly four plausible options [Option A, Option B, Option C, Option D].'
    },
    correctAnswer: {
      type: Type.INTEGER,
      description: 'Index of the single correct option (0 for A, 1 for B, 2 for C, or 3 for D).'
    },
    explanation: {
      type: Type.STRING,
      description: 'Concise explanation citing the rule, definition, criteria, threshold, or reason from the notes.'
    },
    topic: {
      type: Type.STRING,
      description: 'Syllabus topic or subtopic (e.g. Labour Laws, Social Security, Accounting, Polity, etc.).'
    },
    reference: {
      type: Type.STRING,
      description: 'Specific passage, section, or page reference in the notes.'
    }
  },
  required: ['question', 'options', 'correctAnswer', 'explanation', 'topic']
};

/**
 * POST /api/generate-set
 * Generates one set of 20 high-quality UPSC APFC multiple-choice questions
 * from the provided notes content.
 */
app.post('/api/generate-set', async (req: Request, res: Response) => {
  const { noteContent, noteTitle, setIndex = 1, totalSets = 5 } = req.body;

  if (!noteContent || typeof noteContent !== 'string') {
    return res.status(400).json({ error: 'Missing or empty notes content.' });
  }

  const words = noteContent.trim().split(/\s+/).filter(Boolean);
  if (words.length < 150) {
    return res.status(400).json({
      error: `Notes content is too short (${words.length} words). For rigorous 100-question generation without hallucination, please provide comprehensive study material (minimum 150 words).`
    });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please attach an API key in the AI Studio Secrets panel.'
    });
  }

  try {
    const prompt = `You are a Senior Question Paper Setter for the UPSC EPFO APFC (Assistant Provident Fund Commissioner) Examination.
Your task is to generate Set ${setIndex} of ${totalSets} (EXACTLY 20 unique, high-quality, four-option multiple-choice questions) based STRICTLY on the supplied study notes.

STUDY NOTES DOCUMENT TITLE: "${noteTitle || 'APFC Study Material'}"

STUDY NOTES CONTENT:
${noteContent.slice(0, 30000)}

REQUIREMENTS FOR SET ${setIndex}:
1. Produce EXACTLY 20 questions. Do not produce fewer than 20 questions.
2. Every question must have EXACTLY four options (options array of length 4).
3. The correctAnswer must be an integer index (0, 1, 2, or 3) pointing to the only correct option.
4. Provide a thorough, concise explanation explaining why the correct answer is right and citing the specific rule, section, exception, or numerical threshold.
5. Provide a topic tag and a reference to the passage or section in the notes.
6. Cover definitions, key terms, statutory criteria, exceptions, mechanisms, appointments, time limits, penalties, and thresholds present in the notes.
7. Avoid duplicate questions across sets. Maintain authentic UPSC APFC standards: mix of factual recall, conceptual understanding, and application.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert exam question author for UPSC EPFO APFC. Output strictly valid JSON conforming to the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: questionSchema
        },
        temperature: 0.3
      }
    });

    const rawJson = response.text ? response.text.trim() : '';
    if (!rawJson) {
      throw new Error('Empty response received from Gemini model.');
    }

    let parsedQuestions: any[] = JSON.parse(rawJson);

    // Validate and clean each question
    const validatedQuestions: any[] = [];
    for (let i = 0; i < parsedQuestions.length; i++) {
      const q = parsedQuestions[i];
      const val = validateQuestion(q);
      if (val.isValid) {
        validatedQuestions.push({
          id: `q-set${setIndex}-${Date.now()}-${i + 1}`,
          question: q.question.trim(),
          options: q.options.map((o: any) => String(o).trim()),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation.trim(),
          topic: q.topic ? String(q.topic).trim() : 'General Studies & Labour Laws',
          reference: q.reference ? String(q.reference).trim() : `Notes: ${noteTitle || 'Study Material'}`
        });
      }
    }

    if (validatedQuestions.length < 20) {
      console.warn(`Set ${setIndex} yielded ${validatedQuestions.length} valid questions, expected 20.`);
    }

    return res.json({
      setIndex,
      totalQuestions: validatedQuestions.length,
      questions: validatedQuestions
    });
  } catch (err: any) {
    console.error(`Gemini generation error for Set ${setIndex}:`, err);
    return res.status(500).json({
      error: `Failed to generate Set ${setIndex}: ${err.message || 'Model API call failed'}`
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[APFC Smart Test Server] Running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
