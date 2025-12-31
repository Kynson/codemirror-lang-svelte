// unfortunately the HTML language explicitly checks for the language type,
// so we have to duplicate the entire autoCloseTags extension

import { syntaxTree } from '@codemirror/language';
import { EditorSelection } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

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
    const currentNode = syntaxTree(view.state).resolveInner(from, -1);
    const potentialElementNode =
      currentNode.name === 'SvelteElementType'
        ? // SvelteElementType -> SvelteElementName -> OpenTag -> Element
          currentNode.parent?.parent?.parent
        : // TagName (if correct position) -> OpenTag -> Element
          currentNode.parent?.parent;

    if (
      view.composing ||
      view.state.readOnly ||
      from !== to ||
      (text !== '>' && text !== '/') ||
      potentialElementNode?.name !== 'Element'
    ) {
      return false;
    }

    const { state } = view;
    const changes = state.changeByRange((range) => {
      const { head } = range;
      let around = syntaxTree(state).resolveInner(head, -1);
      let name: string;

      // The below node must have a parent node as they are inside a Document/ OpenTag
      if (
        around.name === 'TagName' ||
        around.name === 'ComponentName' ||
        around.name === 'StartTag'
      ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        around = around.parent!;
      }

      if (around.name === 'SvelteElementType') {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        around = around.parent!.parent!;
      }

      name = getElementName(state.doc, around.parent, head);
      const nextChar = state.doc.sliceString(head, head + 1);

      console.log('Element name:', name);

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
