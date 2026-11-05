// Writes supabase/content.sql: the whole book as one protected database row.
// Run after editing any chapter:  npm run export:content
import { writeFileSync } from 'node:fs';
import { contentSql } from '../src/data/contentSql';

writeFileSync(new URL('../supabase/content.sql', import.meta.url), contentSql());
console.log('wrote supabase/content.sql');
