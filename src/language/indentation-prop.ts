import { indentNodeProp } from '@codemirror/language';

import type { TreeIndentContext } from '@codemirror/language';

function indentIfNotEndTag(context: TreeIndentContext) {
  const endTagMatches = /^\s*<\//.test(context.textAfter);

  return (
    context.lineIndent(context.node.from) + (endTagMatches ? 0 : context.unit)
  );
}

export const indentationProp = indentNodeProp.add({
  Element: indentIfNotEndTag,
  Block: (context) => {
    const node = context.node;
    const text = context.textAfter.trim();
    const name = node.name;

    const isBlockClose =
      (name === 'IfBlock' && text.startsWith('{/if')) ||
      (name === 'EachBlock' && text.startsWith('{/each')) ||
      (name === 'AwaitBlock' && text.startsWith('{/await')) ||
      (name === 'KeyBlock' && text.startsWith('{/key')) ||
      (name === 'SnippetBlock' && text.startsWith('{/snippet'));

    if (text.startsWith('{/') && isBlockClose) {
      return context.lineIndent(context.node.from);
    }

    if (text.startsWith('{/') && !isBlockClose) {
      return null;
    }

    if (
      ((name === 'IfBlock' || name === 'EachBlock') &&
        text.startsWith('{:else')) ||
      (name === 'AwaitBlock' && text.startsWith('{:then')) ||
      (name === 'AwaitBlock' && text.startsWith('{:catch'))
    ) {
      return context.lineIndent(context.node.from);
    }

    return indentIfNotEndTag(context);
  },
  'BlockOpen BlockClose BlockInline OpenTag CloseTag SelfClosingTag': (
    context
  ) => {
    const closeMatches = /^\s*\/?>/.test(context.textAfter);
    return (
      context.column(context.node.from) + (closeMatches ? 0 : context.unit)
    );
  },
  'Interpolation DirectlyInterpolatedAttribute': (
    context: TreeIndentContext
  ) => {
    const closeBraceMatches = /^\s*}/.test(context.textAfter);
    // Not need to indent if followed by a closing brace
    return (
      context.lineIndent(context.node.from) +
      (closeBraceMatches ? 0 : context.unit)
    );
  },
});
