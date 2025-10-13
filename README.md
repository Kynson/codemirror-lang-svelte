# CodeMirror Svelte Mode

This is a CodeMirror 6 extension that adds support for Svelte.

> [!NOTE] This is a fork of the MIT licensed [@replit/codemirror-lang-svelte](https://github.com/replit/codemirror-lang-svelte/tree/main).

## Major Difference
- Support for new Svelte 5 template syntax (Attachement, Snippet, Render, in template await)
- Autocomplte for runes

_As some parts are partially rewritten, the behaviour is slightly different from `@replit/codemirror-lang-svelte`. This version tends to be stricter towards grammar than the original one._

### Usage

```typescript
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { svelte } from "@replit/codemirror-lang-svelte";
import { basicSetup } from 'codemirror';

new EditorView({
  state: EditorState.create({
    doc: `<script>let a = "hello world";</script> <div>{a}</div>`,
    extensions: [basicSetup, svelte()],
  }),
  parent: document.querySelector('#editor'),
});
```