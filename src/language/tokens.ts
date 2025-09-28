import { ExternalTokenizer, InputStream } from "@lezer/lr"
import {
  LongExpression as longExprToken,
  AsTerminatedLongExpression as asTerminatedLongExprToken,
  ShortExpression as shortExprToken,
  commentContent as cmtToken,
} from './syntax.grammar?terms';

const SPACE_CHARS = [
  9, 10, 11, 12, 13, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197,
  8198, 8199, 8200, 8201, 8202, 8232, 8233, 8239, 8287, 12288,
];

const PAREN_OPEN_CHAR = 40;
const PAREN_CLOSE_CHAR = 41;
const SQUARE_OPEN_CHAR = 91;
const SQUARE_CLOSE_CHAR = 93;
const CURLY_OPEN_CHAR = 123;
const CURLY_CLOSE_CHAR = 125;
const COMMA_CHAR = 44;
const COLON_CHAR = 58;
const HASH_CHAR = 35;
const AT_CHAR = 64;
const SLASH_CHAR = 47;
const GREATER_THAN_CHAR = 62;
const DASH_CHAR = 45;
const QUOTE_DOUBLE_CHAR = 34;
const QUOTE_SINGLE_CHAR = 39;
const BACKSLASH_CHAR = 92;
const NEWLINE_CHAR = 10;
const ASTERISK_CHAR = 42;
const TICK_CHAR = 96;

const prefixes = [COLON_CHAR, HASH_CHAR, AT_CHAR, SLASH_CHAR];

export const commentContent = new ExternalTokenizer((input) => {
  for (let dashes = 0, i = 0; ; i++) {
    if (input.next < 0) {
      if (i) input.acceptToken(cmtToken);
      break;
    }
    if (input.next === DASH_CHAR) {
      dashes++;
    } else if (input.next === GREATER_THAN_CHAR && dashes >= 2) {
      if (i > 3) input.acceptToken(cmtToken, -2);
      break;
    } else {
      dashes = 0;
    }
    input.advance();
  }
});

// TODO: string handler does not handle interpolation

function createStringHandler(input: InputStream) {
  let inString = false;
  let inStringType: 'double' | 'single' | 'template' | null = null;
  let inStringIgnoreNext = false;

  return () => {
    if (inString) {
      if (inStringIgnoreNext) {
        inStringIgnoreNext = false;
        return true;
      }

      if (input.next === BACKSLASH_CHAR) {
        inStringIgnoreNext = true;
        return true;
      }

      if (inStringType === 'double' && input.next === QUOTE_DOUBLE_CHAR) {
        inString = false;
        inStringType = null;
        return true;
      }

      if (inStringType === 'single' && input.next === QUOTE_SINGLE_CHAR) {
        inString = false;
        inStringType = null;
        return true;
      }

      if (inStringType === 'template' && input.next === TICK_CHAR) {
        inString = false;
        inStringType = null;
        return true;
      }

      return true;
    }

    if (input.next === QUOTE_DOUBLE_CHAR) {
      inString = true;
      inStringType = 'double';
      return true;
    }

    if (input.next === QUOTE_SINGLE_CHAR) {
      inString = true;
      inStringType = 'single';
      return true;
    }

    if (input.next === TICK_CHAR) {
      inString = true;
      inStringType = 'template';
      return true;
    }

    return false;
  };
}

function createCommentHandler(input: InputStream) {
  let inLineComment = false;
  let inBlockComment = false;

  return () => {
    if (inLineComment) {
      if (input.next === NEWLINE_CHAR) {
        inLineComment = false;
        return true;
      }

      return true;
    }

    if (inBlockComment) {
      if (input.next === ASTERISK_CHAR && input.peek(1) === SLASH_CHAR) {
        inBlockComment = false;
        return true;
      }

      return true;
    }

    if (input.next === SLASH_CHAR && input.peek(1) === SLASH_CHAR) {
      inLineComment = true;
      return true;
    }

    if (input.next === SLASH_CHAR && input.peek(1) === ASTERISK_CHAR) {
      inBlockComment = true;
      return true;
    }

    return false;
  };
}

function isAs(input: InputStream) {
  let token = '';

  for (let i = 0; i < 3; i++) {
    token += String.fromCharCode(input.peek(i));
  }

  return token === ' as';
}

function createLongExpressionHandler(terminateOnAs = false) {
  return (input: InputStream) => {
    if (prefixes.includes(input.next)) {
      return;
    }

    const commentHandler = createCommentHandler(input);
    const stringHandler = createStringHandler(input);

    const stack: ('(' | '{' | '[')[] = [];

    const popIfMatch = (match: '(' | '{' | '[') => {
      const idx = stack.lastIndexOf(match);
      if (idx !== -1) {
        while (stack.length > idx) {
          stack.pop();
        }
      }
    };

    for (let pos = 0; ; pos++) {
      // end of input
      if (input.next < 0) {
        if (pos > 0) {
          input.acceptToken(
            terminateOnAs ? asTerminatedLongExprToken : longExprToken
          );
        }

        break;
      }

      if (commentHandler() || stringHandler()) {
        input.advance();
        continue;
      }

      if (
        stack.length === 0 &&
        (input.next === CURLY_CLOSE_CHAR ||
          input.next === PAREN_CLOSE_CHAR ||
          input.next === SQUARE_CLOSE_CHAR ||
          (terminateOnAs && isAs(input)))
      ) {
        input.acceptToken(
          terminateOnAs ? asTerminatedLongExprToken : longExprToken
        );
        break;
      }

      switch (input.next) {
        case PAREN_OPEN_CHAR:
          stack.push('(');
          break;
        case PAREN_CLOSE_CHAR:
          popIfMatch('(');
          break;
        case SQUARE_OPEN_CHAR:
          stack.push('[');
          break;
        case SQUARE_CLOSE_CHAR:
          popIfMatch('[');
          break;
        case CURLY_OPEN_CHAR:
          stack.push('{');
          break;
        case CURLY_CLOSE_CHAR:
          popIfMatch('{');
          break;
      }

      input.advance();
    }
  };
}

// Terminate on a delimiter that probably isn't in the expression
export const longExpression = new ExternalTokenizer(
  createLongExpressionHandler()
);
// Terminate on " as" that is reasonably not inside of the expression
export const asTerminatedLongExpression = new ExternalTokenizer(
  createLongExpressionHandler(true)
);

// Same as long expression but will terminate on either a space or comma
// that is reasonably not inside of the expression
export const shortExpression = new ExternalTokenizer((input) => {
  if (prefixes.includes(input.peek(0))) {
    return;
  }

  const commentHandler = createCommentHandler(input);
  const stringHandler = createStringHandler(input);

  const stack: ('(' | '{' | '[')[] = [];

  const popIfMatch = (match: '(' | '{' | '[') => {
    const idx = stack.lastIndexOf(match);
    if (idx !== -1) {
      while (stack.length > idx) {
        stack.pop();
      }
    }
  };

  for (let pos = 0; ; pos++) {
    // end of input
    if (input.next < 0) {
      if (pos > 0) {
        input.acceptToken(shortExprToken);
      }

      break;
    }

    if (commentHandler() || stringHandler()) {
      input.advance();
      continue;
    }

    if (
      stack.length === 0 &&
      (input.next === CURLY_CLOSE_CHAR ||
        input.next === PAREN_CLOSE_CHAR ||
        input.next === SQUARE_CLOSE_CHAR ||
        input.next === COMMA_CHAR)
    ) {
      input.acceptToken(shortExprToken);
      break;
    }

    switch (input.next) {
      case PAREN_OPEN_CHAR:
        stack.push('(');
        break;
      case PAREN_CLOSE_CHAR:
        popIfMatch('(');
        break;
      case SQUARE_OPEN_CHAR:
        stack.push('[');
        break;
      case SQUARE_CLOSE_CHAR:
        popIfMatch('[');
        break;
      case CURLY_OPEN_CHAR:
        stack.push('{');
        break;
      case CURLY_CLOSE_CHAR:
        popIfMatch('{');
        break;
    }

    if (pos !== 0 && stack.length === 0 && SPACE_CHARS.includes(input.next)) {
      input.acceptToken(shortExprToken);
      break;
    }

    input.advance();
  }
});
