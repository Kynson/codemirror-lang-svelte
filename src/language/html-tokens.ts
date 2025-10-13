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

  if (name) {
    // Preserve case for Svelte components
    return /^[A-Z]/.test(name) ? name : name.toLowerCase();
  }

  return next === QUESTION_MARK_CHAR || next === BANK_CHAR ? undefined : null;
}

const LESS_THAN_CHAR = 60;
const GREATER_THAN_CHAR = 62;
const SLASH_CHAR = 47;
const QUESTION_MARK_CHAR = 63;
const BANK_CHAR = 33;

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

export const elementContext = new ContextTracker<ElementContext | null>({
  start: null,
  shift(context, term, _stack, input) {
    return startTagTerms.has(term)
      ? new ElementContext(tagNameAfter(input, 1) ?? '', context)
      : context;
  },
  reduce(context, term) {
    return term === Element && context
      ? context.parent ?? new ElementContext('', null)
      : context;
  },
  reuse(context, node, _stack, input) {
    const type = node.type.id;
    return type === StartTag || type === OpenTag
      ? new ElementContext(tagNameAfter(input, 1) ?? '', context)
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
    if (next !== LESS_THAN_CHAR) {
      // End of file, close any open tags
      if (next < 0 && stack.context) {
        input.acceptToken(missingCloseTag);
      }

      return;
    }

    input.advance();

    const advancedPosition = input.next;
    const isClosed = advancedPosition === SLASH_CHAR;

    if (isClosed) {
      input.advance();
    }

    const name = tagNameAfter(input, 0);

    if (name === undefined) {
      return;
    }
    if (!name) {
      input.acceptToken(isClosed ? IncompleteCloseTag : StartTag);

      return;
    }

    const parent = stack.context
      ? (stack.context as ElementContext).name
      : null;

    if (isClosed) {
      if (name === parent) {
        input.acceptToken(StartCloseTag);

        return;
      }
      if (parent && implicitlyClosed.has(parent)) {
        input.acceptToken(missingCloseTag, -2);

        return;
      }

      for (
        let context = stack.context as ElementContext | null;
        context;
        context = context.parent
      ) {
        if (context.name === name) {
          return;
        }
      }

      input.acceptToken(MismatchedStartCloseTag);

      return;
    }

    if (name === 'script') {
      input.acceptToken(StartScriptTag);

      return;
    }
    if (name === 'style') {
      input.acceptToken(StartStyleTag);

      return;
    }
    if (name === 'textarea') {
      input.acceptToken(StartTextareaTag);

      return;
    }
    if (selfClosers.has(name)) {
      input.acceptToken(StartSelfClosingTag);

      return;
    }
    if (parent && closeOnOpen.get(parent)?.has(name)) {
      input.acceptToken(missingCloseTag, -1);
    } else {
      input.acceptToken(StartTag);
    }
  },
  { contextual: true }
);

function contentTokenizer(tag: string, textToken: number, endToken: number) {
  const lastState = 2 + tag.length;
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
        (state === 0 && input.next === LESS_THAN_CHAR) ||
        (state === 1 && input.next === SLASH_CHAR) ||
        (state >= 2 &&
          state < lastState &&
          input.next === tag.charCodeAt(state - 2))
      ) {
        state++;
        matchedLen++;
      } else if ((state === 2 || state === lastState) && isSpace(input.next)) {
        matchedLen++;
      } else if (state === lastState && input.next === GREATER_THAN_CHAR) {
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
