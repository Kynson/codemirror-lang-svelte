// unfortunately the HTML language explicitly checks for the language type,
// so we have to duplicate the entire autoCloseTags extension

import { syntaxTree } from '@codemirror/language';
import { EditorSelection } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { svelteLanguage } from './svelte-language';

import type { SyntaxNode } from '@lezer/common';
import type { Text } from '@codemirror/state';

function elementName(
  doc: Text,
  tree: SyntaxNode | null | undefined,
  max = doc.length
) {
  if (!tree) {
    return '';
  }
  let tag = tree.firstChild;
  let name =
    tag &&
    (tag.getChild('TagName') ||
      tag.getChild('ComponentName') ||
      tag.getChild('SvelteElementName'));
  return name ? doc.sliceString(name.from, Math.min(name.to, max)) : '';
}

export const autoCloseTags = EditorView.inputHandler.of(
  (view, from, to, text) => {
    if (
      view.composing ||
      view.state.readOnly ||
      from !== to ||
      (text !== '>' && text !== '/') ||
      !svelteLanguage.isActiveAt(view.state, from, -1)
    ) {
      return false;
    }
    let { state } = view;
    let changes = state.changeByRange((range) => {
      let { head } = range;
      let around = syntaxTree(state).resolveInner(head, -1);
      let name: string;

      if (
        around.name === 'TagName' ||
        around.name === 'ComponentName' ||
        around.name === 'SvelteElementName' ||
        around.name === 'StartTag'
      ) {
        around = around.parent!;
      }

      if (text === '>' && around.name === 'OpenTag') {
        if (
          around.parent?.lastChild?.name !== 'CloseTag' &&
          (name = elementName(state.doc, around.parent, head))
        ) {
          let hasRightBracket =
            view.state.doc.sliceString(head, head + 1) === '>';
          let insert = `${hasRightBracket ? '' : '>'}</${name}>`;
          return {
            range: EditorSelection.cursor(head + 1),
            changes: { from: head + (hasRightBracket ? 1 : 0), insert },
          };
        }
      } else if (text === '/' && around.name === 'OpenTag') {
        let empty = around.parent,
          base = empty?.parent;
        if (
          empty!.from == head - 1 &&
          base!.lastChild?.name != 'CloseTag' &&
          (name = elementName(state.doc, base, head))
        ) {
          let hasRightBracket =
            view.state.doc.sliceString(head, head + 1) === '>';
          let insert = `/${name}${hasRightBracket ? '' : '>'}`;
          let pos = head + insert.length + (hasRightBracket ? 1 : 0);
          return {
            range: EditorSelection.cursor(pos),
            changes: { from: head, insert },
          };
        }
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
