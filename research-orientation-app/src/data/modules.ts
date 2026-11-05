// Course content for the 60-hour Research Methodology Orientation for DIET faculty.
// Every worked example is set in Karnataka's School Education and Literacy Department (DSEL).
// Numbers inside examples are ILLUSTRATIVE teaching data unless a source is named.


export type ToolId =
  | 'rq' | 'ethics' | 'sample' | 'stats' | 'survey' | 'coding' | 'mixed'
  | 'journal' | 'observation' | 'stakeholder' | 'proposal' | 'literature' | 'quality'
  | 'align' | 'aiprompt' | 'screen' | 'chooser' | 'efa' | 'cfa' | 'fit' | 'mediation';

export interface Quiz { q: string; options: string[]; answer: number; why: string }
export interface Code { label: string; lang: 'R' | 'Python' | 'SPSS' | 'AMOS'; src: string }
export interface Lesson { title: string; body: string[]; code?: Code[] }
export interface Example { title: string; text: string[] }
export interface Module {
  id: string; no: number; title: string; titleKn: string; hours: number; part?: 1 | 2;
  objectives: string[]; lessons: Lesson[]; karnataka: Example[];
  activity: { title: string; prompt: string; tool?: ToolId };
  tools: ToolId[]; quiz: Quiz[];
}

import * as BOOK from '@book';

/** All chapters. Filled at start-up from the bundled content, or after sign-in in the private online build. */
export const MODULES: Module[] = [...BOOK.CORE, ...BOOK.ADVANCED];
export const PRE_ASSESSMENT: Quiz[] = [...BOOK.PRE];
export const contentBundled = BOOK.CORE.length > 0;

export const partOf = (m: Module) => m.part ?? 1;
export const PART_MODULES = (part: 1 | 2) => MODULES.filter((m) => partOf(m) === part);
export const PART_HOURS = (part: 1 | 2) => PART_MODULES(part).reduce((s, m) => s + m.hours, 0);
export const totalHours = () => MODULES.reduce((s, m) => s + m.hours, 0);
export const PARTS = {
  1: { en: 'Part I · Research Methodology Orientation', kn: 'ಭಾಗ ೧ · ಸಂಶೋಧನಾ ವಿಧಾನ ದೃಷ್ಟಿಕೋನ' },
  2: { en: 'Part II · Advanced Research Methods: Analytics, Innovation and AI', kn: 'ಭಾಗ ೨ · ಮುಂದುವರಿದ ಸಂಶೋಧನಾ ವಿಧಾನಗಳು: ವಿಶ್ಲೇಷಣೆ, ನಾವೀನ್ಯತೆ ಮತ್ತು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ' },
} as const;
