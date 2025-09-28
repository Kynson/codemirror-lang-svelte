import { LRLanguage, foldNodeProp } from '@codemirror/language';
import { parser as svelteParser } from './syntax.grammar';
import { configureNesting } from './content';
import { cssLanguage } from '@codemirror/lang-css';
import {
  javascriptLanguage,
  typescriptLanguage,
} from '@codemirror/lang-javascript';
import { completionForMarkup } from '../autocomplete/svelte-autocomplete';
import { indentationProp } from './indentation-prop';

import type { NestedLanguageConfig } from './content';

const defaultNesting: NestedLanguageConfig[] = [
  {
    tag: 'script',
    attributeMatcher: (attrs) =>
      attrs.type === 'text/typescript' || attrs.lang === 'ts',
    parser: typescriptLanguage.parser,
  },
  {
    tag: 'script',
    attributeMatcher(attrs) {
      return (
        !attrs.type ||
        /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(
          attrs.type
        )
      );
    },
    parser: javascriptLanguage.parser,
  },
  {
    tag: 'style',
    attributeMatcher(attrs) {
      return (
        (!attrs.lang || attrs.lang === 'css' || attrs.lang === 'scss') &&
        (!attrs.type ||
          /^(text\/)?(x-)?(stylesheet|css|scss)$/i.test(attrs.type))
      );
    },
    parser: cssLanguage.parser,
  },
];

export const svelteLanguage = LRLanguage.define({
  parser: svelteParser.configure({
    wrap: configureNesting(defaultNesting),

    props: [
      indentationProp,
      foldNodeProp.add({
        Block: (node) => {
          const open = `${node.name}Open`;
          const close = `${node.name}Close`;
          const first = node.firstChild;
          const last = node.lastChild;
          if (!first || first.name !== open) {
            return null;
          }
          return {
            from: first.to,
            to: last?.name === close ? last.from : node.to,
          };
        },
        Element: (node) => {
          const first = node.firstChild;
          const last = node.lastChild;
          if (!first || !last || first.name !== 'OpenTag') {
            return null;
          }
          return {
            from: first.to,
            to: last.name === 'CloseTag' ? last.from : node.to,
          };
        },
      }),
    ],
  }),

  languageData: {
    commentTokens: { block: { open: '<!--', close: '-->' } },
    indentOnInput:
      /^\s*((<\/\w+\W)|(\/?>)|(\{:(else|then|catch))|(\{\/(if|each|await|key|snippet)))$/,
    wordChars: '-._',
    autocomplete: completionForMarkup,
  },
});
