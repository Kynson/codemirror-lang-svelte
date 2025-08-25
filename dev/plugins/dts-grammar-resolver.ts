import { relative } from 'node:path';
import { GRAMMAR_FILE_PATTERN } from './consts';

import type { PluginOptions } from 'unplugin-dts';

type Resolver = NonNullable<PluginOptions['resolvers']>[number];

const grammarResolver: Resolver = {
  name: 'grammar-resolver',
  supports: (id) => {
    return GRAMMAR_FILE_PATTERN.test(id);
  },
  transform({ id, root }) {
    return [
      {
        path: relative(root, `${id}.d.ts`),
        content: `import { LRParser } from '@lezer/lr';
export declare const parser: LRParser;`,
      },
    ];
  },
};

export default grammarResolver;
