import { parser as svelteParser } from './language/syntax.grammar';
import { LanguageSupport } from '@codemirror/language';
import { css } from '@codemirror/lang-css';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { autoCloseTags } from './language/html-auto-tag';
import { svelteLanguage } from './language/svelte-language';
import { htmlCompletionSource } from '@codemirror/lang-html';
import { completionForJavascript } from './autocomplete/svelte-autocomplete';

export { svelteParser };

export function svelte() {
  return new LanguageSupport(svelteLanguage, [
    javascript().support,
    javascriptLanguage.data.of({ autocomplete: completionForJavascript }),
    css().support,
    autoCloseTags,
    svelteLanguage.data.of({ autocomplete: htmlCompletionSource }),
  ]);
}
