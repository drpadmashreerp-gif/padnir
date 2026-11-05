// Fills the chapter arrays at run time (private online build), keeping every existing reference valid.
import { MODULES, PRE_ASSESSMENT, type Module, type Quiz } from './modules';
import { KN, PRE_KN, type KnModule, type KnQuiz } from './modules.kn';

export interface BookContent {
  version: number;
  CORE: Module[]; PRE: Quiz[]; ADVANCED: Module[];
  KN_CORE: Record<string, KnModule>; PRE_KN_DATA: KnQuiz[]; ADVANCED_KN: Record<string, KnModule>;
}

export function loadBookContent(c: BookContent) {
  if (!c || !Array.isArray(c.CORE) || !c.CORE.length) throw new Error('The book content in the database is empty.');
  MODULES.splice(0, MODULES.length, ...c.CORE, ...c.ADVANCED);
  PRE_ASSESSMENT.splice(0, PRE_ASSESSMENT.length, ...c.PRE);
  Object.keys(KN).forEach((k) => Reflect.deleteProperty(KN, k));
  Object.assign(KN, c.KN_CORE, c.ADVANCED_KN);
  PRE_KN.splice(0, PRE_KN.length, ...c.PRE_KN_DATA);
}
