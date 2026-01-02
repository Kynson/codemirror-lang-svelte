# CodeMirror Svelte Mode

This is a CodeMirror 6 extension that adds support for Svelte.

> [!NOTE] This is a fork of the MIT licensed [@replit/codemirror-lang-svelte](https://github.com/replit/codemirror-lang-svelte/tree/main).

## Major Difference
- Support for new Svelte 5 template syntax (Attachement, Snippet, Render, in template await)
- Autocomplte for runes

_As some parts are partially rewritten, the behaviour is slightly different from `@replit/codemirror-lang-svelte`. This version tends to be stricter towards grammar than the original one._

### API Reference

```typescript
svelte(config: Config): LanguageSupport
```
**Config:**
- [`jsParser: LRParser`](https://lezer.codemirror.net/docs/ref/#lr.LRParser) \
  Javascript parser used to parse nodes inside `<script>` tags and template javascript expressions. \
  Default: `javascriptLanguage.parser` from [`@codemirror/lang-javascript`](https://github.com/codemirror/lang-javascript/tree/main) \
  Useful for providing a parser with custom configs (e.g. overriding syntax highlighting)

- [`tsParser: LRParser`](https://lezer.codemirror.net/docs/ref/#lr.LRParser) \
  Typescript parser used to parse nodes inside `<script lang="ts">` tags. \
  Default: `typescriptLanguage.parser` from [`@codemirror/lang-javascript`](https://github.com/codemirror/lang-javascript/tree/main) \
  Useful for providing a parser with custom configs (e.g. overriding syntax highlighting)

- [`cssParser: LRParser`](https://lezer.codemirror.net/docs/ref/#lr.LRParser) \
  CSS parser used to parse nodes inside `<style>` tags. \
  Default: `cssLanguage.parser` from [`@codemirror/lang-css`](https://github.com/codemirror/lang-css/tree/main) \
  Useful for providing a parser with custom configs (e.g. overriding syntax highlighting)

### Usage

```typescript
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { svelte } from 'codemirror-lang-svelte';
import { basicSetup } from 'codemirror';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { styleTags, tags } from '@lezer/highlight';

new EditorView({
  state: EditorState.create({
    doc: `<script>let a = "hello world";</script> <div>{a}</div>`,
    extensions: [
      basicSetup,
      svelte({
        jsParser: javascriptLanguage.parser.configure({
          props: [
            styleTags({
              'CallExpression/MemberExpression/PropertyName': tags.function(
                tags.variableName
              ),
            }),
          ],
        }),
      })
    ],
  }),
  parent: document.querySelector('#editor'),
});
```