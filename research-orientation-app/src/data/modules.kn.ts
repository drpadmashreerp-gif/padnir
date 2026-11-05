// ಕನ್ನಡ ಆವೃತ್ತಿ — Kannada edition of the book content.
// Mirrors src/data/modules.ts item for item (same order and counts; checked by a test).
// Technical terms are kept in English in brackets where teachers commonly use them.
// To be reviewed by a DSERT language editor before wide release.

export interface KnQuiz { q: string; options: string[]; why: string }
export interface KnModule {
  objectives: string[];
  lessons: { title: string; body: string[] }[];
  karnataka: { title: string; text: string[] }[];
  activity: { title: string; prompt: string };
  quiz: KnQuiz[];
}

import * as BOOK from '@book';

export const KN: Record<string, KnModule> = { ...BOOK.KN_CORE, ...BOOK.ADVANCED_KN };
export const PRE_KN: KnQuiz[] = [...BOOK.PRE_KN_DATA];
