import { parser as svelteParser } from './language/syntax.grammar';
import { LanguageSupport } from '@codemirror/language';
import { css } from '@codemirror/lang-css';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { autoCloseTags } from './language/html-auto-tag';
import { svelteLanguage } from './language/svelte-language';
import {
  completionForJavascript,
  svelteHtmlCompletionSource,
} from './autocomplete/svelte-autocomplete';
import { theme } from './autocomplete/theme';

import type { Config } from './language/svelte-language';

export { svelteParser };

export function svelte(config: Config = {}) {
  const svelteLanguageInstance = svelteLanguage(config);

  return new LanguageSupport(svelteLanguageInstance, [
    javascript().support,
    javascriptLanguage.data.of({
      autocomplete: completionForJavascript,
    }),
    css().support,
    autoCloseTags,
    svelteLanguageInstance.data.of({
      autocomplete: svelteHtmlCompletionSource,
    }),
    theme,
  ]);
}
