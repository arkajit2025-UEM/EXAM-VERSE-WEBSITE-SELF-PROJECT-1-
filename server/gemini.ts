import { GoogleGenAI, Type } from '@google/genai';
import type { Book, StudyAdvisorPlan } from '../src/types';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface StudyAdvisorInput {
  examTarget: string;
  stream: string;
  timelineMonths: number;
  weakAreas: string;
  books: Book[];
}

export async function generateStudyBookPlan(
  input: StudyAdvisorInput
): Promise<StudyAdvisorPlan> {
  const ai = getGeminiClient();

  const compactCatalog = input.books.map((b) => ({
    id: b.id,
    title: b.title,
    exam_category: b.exam_category,
    subject_stream: b.subject_stream,
    price: b.price,
    highlights: b.highlights,
    topics: b.toc.map((t) => t.title),
  }));

  const prompt = `A student is preparing for: "${input.examTarget}" (Stream/Track: "${input.stream}"), with ${input.timelineMonths} months remaining.
Their self-identified weak areas or focus goals: "${input.weakAreas || 'Balanced full-syllabus mastery and mock practice'}".

Using ONLY books from the EXAM VERSE catalog below, select the 2 to 4 most effective books for this student, assign each a priority role ("Core Foundation", "Practice & PYQ", or "Revision & Interview"), explain specifically why each book fits their exam and weak areas, and create a practical 3-phase study roadmap fitting ${input.timelineMonths} months.

Catalog JSON:
${JSON.stringify(compactCatalog, null, 2)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction:
        'You are the senior academic advisor at EXAM VERSE, helping Indian engineering, GATE, government job (UPSC/SSC/Banking), and software/core interview aspirants pick the exact right textbooks and structure a realistic study schedule. Only reference valid bookId integers present in the provided Catalog JSON. Keep recommendations concise, tactical, and grounded in exam weightage.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategySummary: {
            type: Type.STRING,
            description: '2-3 sentence tailored strategic overview for the student.',
          },
          dailyHoursRecommended: {
            type: Type.INTEGER,
            description: 'Realistic daily study hours recommended (between 2 and 10).',
          },
          recommendedBooks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                bookId: {
                  type: Type.INTEGER,
                  description: 'Exact integer id of the book from the catalog.',
                },
                priority: {
                  type: Type.STRING,
                  description: 'One of: Core Foundation, Practice & PYQ, Revision & Interview',
                },
                reason: {
                  type: Type.STRING,
                  description: 'Concrete 1-2 sentence explanation linking book chapters to student goals.',
                },
              },
              required: ['bookId', 'priority', 'reason'],
            },
          },
          studyRoadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING, description: 'Phase title, e.g. Phase 1: Core Concept Lock' },
                duration: { type: Type.STRING, description: 'Time window, e.g. Weeks 1-6' },
                focus: { type: Type.STRING, description: 'Primary objective of this phase' },
                milestones: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2-3 concrete, measurable study milestones',
                },
              },
              required: ['phase', 'duration', 'focus', 'milestones'],
            },
          },
        },
        required: [
          'strategySummary',
          'dailyHoursRecommended',
          'recommendedBooks',
          'studyRoadmap',
        ],
      },
    },
  });

  const text = (response.text ?? '').trim();
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  const parsed = JSON.parse(text) as StudyAdvisorPlan;
  const bookMap = new Map(input.books.map((b) => [b.id, b]));

  parsed.recommendedBooks = (parsed.recommendedBooks || [])
    .filter((rec) => bookMap.has(rec.bookId))
    .map((rec) => ({
      ...rec,
      book: bookMap.get(rec.bookId),
    }));

  return parsed;
}
