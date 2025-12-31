import { EditorView } from '@codemirror/view';

export const theme = EditorView.theme({
  '.cm-completionIcon-snippet': {
    '&:after': { content: "'Σ'" },
  },
});
