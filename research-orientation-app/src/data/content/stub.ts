// Private online build: no book text in the website code. Content is loaded from the
// protected database after an approved person signs in (see loadBookContent).
import type { Module, Quiz } from '../modules';
import type { KnModule, KnQuiz } from '../modules.kn';
export const CORE: Module[] = [];
export const PRE: Quiz[] = [];
export const ADVANCED: Module[] = [];
export const KN_CORE: Record<string, KnModule> = {};
export const PRE_KN_DATA: KnQuiz[] = [];
export const ADVANCED_KN: Record<string, KnModule> = {};
