import { buildParserFile } from '@lezer/generator';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, basename, join, dirname } from 'node:path';

import {
  TERMS_FILE_PATTERN,
  GRAMMAR_FILE_PATTERN,
  GRAMMAR_FILE_GLOB,
} from './consts';

import type { Plugin } from 'vite';

async function injectTermsTypes(id: string, terms: string) {
  const fileName = basename(id.replace('?terms', ''));

  const targetDirectory = dirname(id);
  const termsTypePath = resolve(
    join(targetDirectory, `${fileName}.terms.d.ts`)
  );

  const termsTypesContent = `declare module '*${fileName}?terms' {
${terms.trim().replaceAll(/^/gm, '  ')}
}
  `;

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(termsTypePath, termsTypesContent, 'utf-8');
}

export default function lezerGrammarPlugin(): Plugin {
  return {
    name: 'lezer-grammar-plugin',
    async load(id) {
      if (TERMS_FILE_PATTERN.test(id)) {
        return await readFile(id.replace('?terms', ''), 'utf-8');
      }

      return null;
    },
    async transform(code, id) {
      const isGrammarFile = GRAMMAR_FILE_PATTERN.test(id);
      const isTermsFile = TERMS_FILE_PATTERN.test(id);

      if (!isGrammarFile && !isTermsFile) {
        return null;
      }

      const { parser, terms } = buildParserFile(code);

      await injectTermsTypes(id, terms);

      if (isGrammarFile) {
        return parser;
      }

      return terms;
    },
    configureServer(server) {
      server.watcher.add(GRAMMAR_FILE_GLOB);

      const onFileChange = async () => {
        server.hot.send({ type: 'full-reload' });
      };

      server.watcher.on('add', onFileChange);
      server.watcher.on('unlink', onFileChange);
      server.watcher.on('change', onFileChange);
    },
  };
}
