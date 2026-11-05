import { readFileSync } from 'node:fs';
import { contentSql } from './contentSql';
import * as BOOK from './content/index';

test('supabase/content.sql is up to date with the chapters (run npm run export:content after editing)', () => {
  const committed = readFileSync(new URL('../../supabase/content.sql', import.meta.url), 'utf8');
  expect(committed).toBe(contentSql());
});

test('the SQL payload round-trips to the same book', () => {
  const sql = contentSql();
  const json = sql.slice(sql.indexOf('$book$') + 6, sql.lastIndexOf('$book$'));
  const back = JSON.parse(json);
  expect(back.CORE).toHaveLength(12);
  expect(back.ADVANCED).toHaveLength(5);
  expect(Object.keys(back.KN_CORE)).toHaveLength(12);
  expect(Object.keys(back.ADVANCED_KN)).toHaveLength(5);
  expect(back.CORE[0].title).toBe(BOOK.CORE[0].title);
});
