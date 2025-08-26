import { ExternalTokenizer, ContextTracker } from '@lezer/lr';
import {
  StartTag,
  StartCloseTag,
  MismatchedStartCloseTag,
  missingCloseTag,
  StartSelfClosingTag,
  IncompleteCloseTag,
  Element,
  OpenTag,
  StartScriptTag,
  scriptText,
  StartCloseScriptTag,
  StartStyleTag,
  styleText,
  StartCloseStyleTag,
  StartTextareaTag,
  textareaText,
  StartCloseTextareaTag,
} from './syntax.grammar?terms';

import type { InputStream } from '@lezer/lr';

// const selfClosers: Record<string, boolean> = {
//   area: true,
//   base: true,
//   br: true,
//   col: true,
//   command: true,
//   embed: true,
//   frame: true,
//   hr: true,
//   img: true,
//   input: true,
//   keygen: true,
//   link: true,
//   meta: true,
//   param: true,
//   source: true,
//   track: true,
//   wbr: true,
//   menuitem: true,
// };
const selfClosers = new Set([
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'frame',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
  'menuitem',
  // SVG self-closing tags
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'stop',
  'use',
]);

// const implicitlyClosed: Record<string, boolean> = {
//   dd: true,
//   li: true,
//   optgroup: true,
//   option: true,
//   p: true,
//   rp: true,
//   rt: true,
//   tbody: true,
//   td: true,
//   tfoot: true,
//   th: true,
//   tr: true,
// };
const implicitlyClosed = new Set([
  'dd',
  'li',
  'optgroup',
  'option',
  'p',
  'rp',
  'rt',
  'tbody',
  'td',
  'tfoot',
  'th',
  'tr',
]);

// const closeOnOpen: Record<string, boolean | Record<string, boolean>> = {
//   dd: { dd: true, dt: true },
//   dt: { dd: true, dt: true },
//   li: { li: true },
//   option: { option: true, optgroup: true },
//   optgroup: { optgroup: true },
//   p: {
//     address: true,
//     article: true,
//     aside: true,
//     blockquote: true,
//     dir: true,
//     div: true,
//     dl: true,
//     fieldset: true,
//     footer: true,
//     form: true,
//     h1: true,
//     h2: true,
//     h3: true,
//     h4: true,
//     h5: true,
//     h6: true,
//     header: true,
//     hgroup: true,
//     hr: true,
//     menu: true,
//     nav: true,
//     ol: true,
//     p: true,
//     pre: true,
//     section: true,
//     table: true,
//     ul: true,
//   },
//   rp: { rp: true, rt: true },
//   rt: { rp: true, rt: true },
//   tbody: { tbody: true, tfoot: true },
//   td: { td: true, th: true },
//   tfoot: { tbody: true },
//   th: { td: true, th: true },
//   thead: { tbody: true, tfoot: true },
//   tr: { tr: true },
// };
const closeOnOpen = new Map([
  ['dd', new Set(['dd', 'dt'])],
  ['dt', new Set(['dd', 'dt'])],
  ['li', new Set(['li'])],
  ['option', new Set(['option', 'optgroup'])],
  ['optgroup', new Set(['optgroup'])],
  [
    'p',
    new Set([
      'address',
      'article',
      'aside',
      'blockquote',
      'dir',
      'div',
      'dl',
      'fieldset',
      'footer',
      'form',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'header',
      'hgroup',
      'hr',
      'menu',
      'nav',
      'ol',
      'p',
      'pre',
      'section',
      'table',
      'ul',
    ]),
  ],
  ['rp', new Set(['rp', 'rt'])],
  ['rt', new Set(['rp', 'rt'])],
  ['tbody', new Set(['tbody', 'tfoot'])],
  ['td', new Set(['td', 'th'])],
  ['tfoot', new Set(['tbody'])],
  ['th', new Set(['td', 'th'])],
  ['thead', new Set(['tbody', 'tfoot'])],
  ['tr', new Set(['tr'])],
]);

function nameChar(ch: number) {
  return (
    ch == 45 ||
    ch == 46 ||
    ch == 58 ||
    (ch >= 65 && ch <= 90) ||
    ch == 95 ||
    (ch >= 97 && ch <= 122) ||
    ch >= 161
  );
}

function isSpace(ch: number) {
  return ch == 9 || ch == 10 || ch == 13 || ch == 32;
}

let cachedName: string | null | undefined = null;
let cachedInput: InputStream | null = null;
let cachedPosition = 0;
function tagNameAfter(input: InputStream, offset: number) {
  const position = input.pos + offset;
  if (cachedPosition === position && cachedInput === input) {
    return cachedName;
  }
  let next = input.peek(offset);
  while (isSpace(next)) next = input.peek(++offset);
  let name = '';
  for (;;) {
    if (!nameChar(next)) break;
    name += String.fromCharCode(next);
    next = input.peek(++offset);
  }
  // Undefined to signal there's a <? or <!, null for just missing
  cachedInput = input;
  cachedPosition = position;
  cachedName = name;

  // return name
  //   ? name.toLowerCase()
  //   : next === questionMark || next === bang
  //   ? undefined
  //   : null;
  if (name) {
    // Preserve case for Svelte components
    return /^[A-Z]/.test(name) ? name : name.toLowerCase();
  }

  return next === questionMark || next === bang ? undefined : null;
}

const lessThan = 60,
  greaterThan = 62,
  slash = 47,
  questionMark = 63,
  bang = 33,
  dash = 45;

class ElementContext {
  public name: string;
  public parent: ElementContext | null;
  public hash: number;

  constructor(name: string, parent: ElementContext | null) {
    this.name = name;
    this.parent = parent;
    this.hash = parent ? parent.hash : 0;
  }
}

const startTagTerms = new Set([
  StartTag,
  StartSelfClosingTag,
  StartScriptTag,
  StartStyleTag,
  StartTextareaTag,
]);

export const elementContext = new ContextTracker<ElementContext>({
  start: new ElementContext('', null),
  shift(context, term, _stack, input) {
    return startTagTerms.has(term)
      ? new ElementContext(tagNameAfter(input, 1) || '', context)
      : context;
  },
  reduce(context, term) {
    return term === Element && context
      ? context.parent ?? new ElementContext('', null)
      : context;
  },
  reuse(context, node, _stack, input) {
    let type = node.type.id;
    return type === StartTag || type === OpenTag
      ? new ElementContext(tagNameAfter(input, 1) || '', context)
      : context;
  },
  hash(context) {
    return context ? context.hash : 0;
  },
  strict: false,
});

export const tagStart = new ExternalTokenizer(
  (input, stack) => {
    const next: number = input.next;
    if (next !== lessThan) {
      // End of file, close any open tags
      if (next < 0 && stack.context) {
        input.acceptToken(missingCloseTag);
      }

      return;
    }

    input.advance();

    const advancedPosition = input.next;
    const isClosed = advancedPosition === slash;

    if (isClosed) {
      input.advance();
    }

    const name = tagNameAfter(input, 0);

    if (name === undefined) {
      return;
    }
    if (!name) {
      return input.acceptToken(isClosed ? IncompleteCloseTag : StartTag);
    }

    let parent: string = stack.context ? stack.context.name : null;
    if (isClosed) {
      if (name === parent) {
        return input.acceptToken(StartCloseTag);
      }
      if (parent && implicitlyClosed.has(parent)) {
        return input.acceptToken(missingCloseTag, -2);
      }
      // if (stack.dialectEnabled(Dialect_noMatch)) return input.acceptToken(NoMatchStartCloseTag)
      for (let context = stack.context; context; context = context.parent) {
        if (context.name === name) {
          return;
        }
      }
      input.acceptToken(MismatchedStartCloseTag);
    } else {
      if (name === 'script') {
        return input.acceptToken(StartScriptTag);
      }
      if (name === 'style') {
        return input.acceptToken(StartStyleTag);
      }
      if (name === 'textarea') {
        return input.acceptToken(StartTextareaTag);
      }
      if (selfClosers.has(name)) {
        return input.acceptToken(StartSelfClosingTag);
      }
      if (parent && closeOnOpen.get(parent)?.has(name)) {
        input.acceptToken(missingCloseTag, -1);
      } else {
        input.acceptToken(StartTag);
      }
    }
  },
  { contextual: true }
);

function contentTokenizer(tag: string, textToken: number, endToken: number) {
  let lastState = 2 + tag.length;
  return new ExternalTokenizer((input) => {
    // state means:
    // - 0 nothing matched
    // - 1 '<' matched
    // - 2 '</' + possibly whitespace matched
    // - 3-(1+tag.length) part of the tag matched
    // - lastState whole tag + possibly whitespace matched
    for (let state = 0, matchedLen = 0, i = 0; ; i++) {
      if (input.next < 0) {
        if (i) input.acceptToken(textToken);
        break;
      }
      if (
        (state === 0 && input.next === lessThan) ||
        (state === 1 && input.next === slash) ||
        (state >= 2 &&
          state < lastState &&
          input.next === tag.charCodeAt(state - 2))
      ) {
        state++;
        matchedLen++;
      } else if ((state === 2 || state === lastState) && isSpace(input.next)) {
        matchedLen++;
      } else if (state === lastState && input.next === greaterThan) {
        if (i > matchedLen) {
          input.acceptToken(textToken, -matchedLen);
        } else {
          input.acceptToken(endToken, -(matchedLen - 2));
        }
        break;
      } else if (
        (input.next == 10 /* '\n' */ || input.next == 13) /* '\r' */ &&
        i
      ) {
        input.acceptToken(textToken, 1);
        break;
      } else {
        state = matchedLen = 0;
      }
      input.advance();
    }
  });
}

export const scriptTokens = contentTokenizer(
  'script',
  scriptText,
  StartCloseScriptTag
);

export const styleTokens = contentTokenizer(
  'style',
  styleText,
  StartCloseStyleTag
);

export const textareaTokens = contentTokenizer(
  'textarea',
  textareaText,
  StartCloseTextareaTag
);
