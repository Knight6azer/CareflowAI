import test from 'node:test';
import assert from 'node:assert';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../src/i18n/languages.js';
import { TRANSLATIONS } from '../src/i18n/translations.js';

test('i18n languages configuration', () => {
  assert.strictEqual(DEFAULT_LANGUAGE, 'en');
  assert.strictEqual(LANGUAGES.length, 6);
  const codes = LANGUAGES.map(l => l.code);
  assert.deepStrictEqual(codes, ['en', 'hi', 'es', 'fr', 'de', 'bn']);
});

test('translations parity across all 6 languages', () => {
  function getFlattenedKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
      const full = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(getFlattenedKeys(obj[key], full));
      } else {
        keys.push(full);
      }
    }
    return keys;
  }

  const enKeys = new Set(getFlattenedKeys(TRANSLATIONS.en));
  assert.strictEqual(enKeys.size, 179, 'English should have exactly 179 translation keys');

  for (const lang of ['hi', 'es', 'fr', 'de', 'bn']) {
    const langKeys = new Set(getFlattenedKeys(TRANSLATIONS[lang]));
    const missing = [...enKeys].filter(k => !langKeys.has(k));
    assert.strictEqual(
      missing.length,
      0,
      `Language '${lang}' is missing keys: ${missing.join(', ')}`
    );
  }
});

test('no empty translations in any language', () => {
  function checkNoEmptyStrings(obj, path = '') {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        checkNoEmptyStrings(obj[key], currentPath);
      } else {
        assert.ok(
          typeof obj[key] === 'string' && obj[key].trim().length > 0,
          `Empty translation found at key: ${currentPath}`
        );
      }
    }
  }

  for (const lang of ['en', 'hi', 'es', 'fr', 'de', 'bn']) {
    checkNoEmptyStrings(TRANSLATIONS[lang], lang);
  }
});
