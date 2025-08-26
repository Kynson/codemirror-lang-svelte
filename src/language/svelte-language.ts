import { LRLanguage, indentNodeProp, foldNodeProp } from '@codemirror/language';
import { parser as svelteParser } from './syntax.grammar';
import { configureNesting } from './content';
import { cssLanguage } from '@codemirror/lang-css';
import {
  javascriptLanguage,
  typescriptLanguage,
} from '@codemirror/lang-javascript';
import { completionForMarkup } from '../autocomplete/svelte-autocomplete';
import { htmlCompletionSource } from '@codemirror/lang-html';

import type { NestedLanguageConfig } from './content';
import type { SyntaxNode } from '@lezer/common';

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
      indentNodeProp.add({
        Element: (context) => {
          let after = /^(\s*)(<\/)?/.exec(context.textAfter)!;
          if (context.node.to <= context.pos + after[0].length) {
            return context.continue();
          }
          return (
            context.lineIndent(context.node.from) +
            (after[2] ? 0 : context.unit)
          );
        },

        Block: (context) => {
          const node = context.node;
          const text = context.textAfter.trim();

          if (text.startsWith('{/')) {
            const name = node.name;
            if (
              (name === 'IfBlock' && text.startsWith('{/if')) ||
              (name === 'EachBlock' && text.startsWith('{/each')) ||
              (name === 'AwaitBlock' && text.startsWith('{/await')) ||
              (name === 'KeyBlock' && text.startsWith('{/key')) ||
              (name === 'SnippetBlock' && text.startsWith('{/snippet'))
            ) {
              return context.lineIndent(context.node.from);
            }

            return null;
          }

          if (node.name === 'IfBlock' || node.name === 'EachBlock') {
            if (text.startsWith('{:else')) {
              return context.lineIndent(node.from);
            }
          } else if (node.name === 'AwaitBlock') {
            if (text.startsWith('{:then')) {
              return context.lineIndent(node.from);
            }
            if (text.startsWith('{:catch')) {
              return context.lineIndent(node.from);
            }
          }

          // not sure if this needed to be duplicated
          let after = /^(\s*)(<\/)?/.exec(context.textAfter)!;
          if (context.node.to <= context.pos + after[0].length) {
            return context.continue();
          }
          return (
            context.lineIndent(context.node.from) +
            (after[2] ? 0 : context.unit)
          );
        },

        'BlockOpen BlockClose BlockInline': (context) => {
          return context.column(context.node.from) + context.unit;
        },

        'OpenTag CloseTag SelfClosingTag': (context) => {
          return context.column(context.node.from) + context.unit;
        },

        Document: (context) => {
          if (
            context.pos + /\s*/.exec(context.textAfter)![0].length <
            context.node.to
          ) {
            return context.continue();
          }

          let endElt: SyntaxNode | null = null;
          let close: SyntaxNode | null;

          for (let cur = context.node; ; ) {
            let last = cur.lastChild;
            if (!last || last.name !== 'Element' || last.to !== cur.to) {
              break;
            }
            endElt = cur = last;
          }

          if (
            endElt &&
            !(
              (close = endElt.lastChild) &&
              (close.name === 'CloseTag' || close.name === 'SelfClosingTag')
            )
          ) {
            return context.lineIndent(endElt.from) + context.unit;
          }

          return null;
        },
      }),
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
          let first = node.firstChild;
          let last = node.lastChild!;
          if (!first || first.name !== 'OpenTag') {
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
      /^\s*((<\/\w+\W)|(\{:(else|then|catch))|(\{\/(if|each|await|key)))$/,
    wordChars: '-._',
    autocomplete: completionForMarkup,
  },
});
