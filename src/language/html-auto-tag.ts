// unfortunately the HTML language explicitly checks for the language type,
// so we have to duplicate the entire autoCloseTags extension

import { syntaxTree } from '@codemirror/language';
import { EditorSelection } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { svelteLanguage } from './svelte-language';

import type { SyntaxNode } from '@lezer/common';
import type { Text } from '@codemirror/state';

function getElementName(
  doc: Text,
  tree: SyntaxNode | null | undefined,
  max = doc.length
) {
  if (!tree) {
    return '';
  }

  const tag = tree.firstChild;
  const nameNode =
    tag &&
    (tag.getChild('TagName') ??
      tag.getChild('ComponentName') ??
      tag.getChild('SvelteElementName'));

  return nameNode
    ? doc.sliceString(nameNode.from, Math.min(nameNode.to, max))
    : '';
}

export const autoCloseTags = EditorView.inputHandler.of(
  (view, from, to, text) => {
    if (
      view.composing ||
      view.state.readOnly ||
      from !== to ||
      (text !== '>' && text !== '/') ||
      // Note that this will disable auto closing using "/" inside script/style tags
      !svelteLanguage.isActiveAt(view.state, from, -1)
    ) {
      return false;
    }

    const { state } = view;
    const changes = state.changeByRange((range) => {
      const { head } = range;
      let around = syntaxTree(state).resolveInner(head, -1);
      let name: string;

      if (
        around.name === 'TagName' ||
        around.name === 'ComponentName' ||
        around.name === 'SvelteElementName' ||
        around.name === 'StartTag'
      ) {
        // The above Token must have a parent node as they are inside a Document/ OpenTag
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        around = around.parent!;
      }

      name = getElementName(state.doc, around.parent, head);
      const nextChar = state.doc.sliceString(head, head + 1);

      if (
        text === '>' &&
        around.name === 'OpenTag' &&
        // Ensure there is no closing tag already
        (around.parent?.lastChild?.name !== 'CloseTag' || nextChar !== '<') &&
        name
      ) {
        const hasRightBracket = nextChar === '>';
        const insert = `${hasRightBracket ? '' : '>'}</${name}>`;
        return {
          range: EditorSelection.cursor(head + 1),
          changes: { from: head + (hasRightBracket ? 1 : 0), insert },
        };
      }

      const empty = around.parent;
      const base = empty?.parent;
      name = getElementName(state.doc, base, head);

      if (
        text === '/' &&
        around.name === 'OpenTag' &&
        empty?.from === head - 1 &&
        base?.lastChild?.name !== 'CloseTag' &&
        name
      ) {
        const hasRightBracket =
          view.state.doc.sliceString(head, head + 1) === '>';
        const insert = `/${name}${hasRightBracket ? '' : '>'}`;
        const pos = head + insert.length + (hasRightBracket ? 1 : 0);

        return {
          range: EditorSelection.cursor(pos),
          changes: { from: head, insert },
        };
      }

      return { range };
    });

    if (changes.changes.empty) {
      return false;
    }

    view.dispatch(changes, { userEvent: 'input.type', scrollIntoView: true });

    return true;
  }
);
