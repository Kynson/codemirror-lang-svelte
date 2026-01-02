import { CompletionContext } from '@codemirror/autocomplete';
import type { SyntaxNode } from '@lezer/common';
import type { Completion } from '@codemirror/autocomplete';

type Test = (node: SyntaxNode, context: CompletionContext) => boolean;
type CompletionType =
  | 'class'
  | 'constant'
  | 'enum'
  | 'function'
  | 'interface'
  | 'keyword'
  | 'method'
  | 'namespace'
  | 'property'
  | 'text'
  | 'type'
  | 'variable'
  | 'snippet';

// export interface Info {
//   name: string;
//   description?: string;
//   values?: Info[];
//   valueType?: CompletionType;
//   boost?: number;
//   deprecated?: boolean;
// }

export type AttributeInfo = Completion & {
  values?: AttributeInfo[];
  valueType?: CompletionType;
  deprecated?: boolean;
};

export type TagSpec = Completion & {
  deprecated?: boolean;
  attributes?: AttributeInfo[];
};

/**
 * this file is based on [dataProvider.ts from sveltejs/language-tools](https://github.com/sveltejs/language-tools/blob/master/packages/language-server/src/plugins/html/dataProvider.ts)
 */

export const globalEvents: AttributeInfo[] = [
  { label: 'onabort' },
  { label: 'onanimationcancel' },
  { label: 'onanimationend' },
  { label: 'onanimationiteration' },
  { label: 'onanimationstart' },
  { label: 'onauxclick' },
  { label: 'onbeforeinput' },
  { label: 'onblur' },
  { label: 'oncancel' },
  { label: 'oncanplay' },
  { label: 'oncanplaythrough' },
  { label: 'onchange' },
  { label: 'onclick' },
  { label: 'onclose' },
  { label: 'oncontextmenu' },
  { label: 'oncopy' },
  { label: 'oncuechange' },
  { label: 'oncut' },
  { label: 'ondblclick' },
  { label: 'ondrag' },
  { label: 'ondragend' },
  { label: 'ondragenter' },
  { label: 'ondragleave' },
  { label: 'ondragover' },
  { label: 'ondragstart' },
  { label: 'ondrop' },
  { label: 'ondurationchange' },
  { label: 'onemptied' },
  { label: 'onended' },
  { label: 'onerror' },
  { label: 'onfocus' },
  { label: 'onformdata' },
  { label: 'ongotpointercapture' },
  { label: 'oninput' },
  { label: 'oninvalid' },
  { label: 'onkeydown' },
  { label: 'onkeypress' },
  { label: 'onkeyup' },
  { label: 'onload' },
  { label: 'onloadeddata' },
  { label: 'onloadedmetadata' },
  { label: 'onloadstart' },
  { label: 'onlostpointercapture' },
  { label: 'onmousedown' },
  { label: 'onmouseenter' },
  { label: 'onmouseleave' },
  { label: 'onmousemove' },
  { label: 'onmouseout' },
  { label: 'onmouseover' },
  { label: 'onmouseup' },
  { label: 'onpaste' },
  { label: 'onpause' },
  { label: 'onplay' },
  { label: 'onplaying' },
  { label: 'onpointercancel' },
  { label: 'onpointerdown' },
  { label: 'onpointerenter' },
  { label: 'onpointerleave' },
  { label: 'onpointermove' },
  { label: 'onpointerout' },
  { label: 'onpointerover' },
  { label: 'onpointerup' },
  { label: 'onprogress' },
  { label: 'onratechange' },
  { label: 'onreset' },
  { label: 'onresize' },
  { label: 'onscroll' },
  { label: 'onsecuritypolicyviolation' },
  { label: 'onseeked' },
  { label: 'onseeking' },
  { label: 'onselect' },
  { label: 'onselectionchange' },
  { label: 'onselectstart' },
  { label: 'onslotchange' },
  { label: 'onstalled' },
  { label: 'onsubmit' },
  { label: 'onsuspend' },
  { label: 'ontimeupdate' },
  { label: 'ontoggle' },
  { label: 'ontouchcancel' },
  { label: 'ontouchend' },
  { label: 'ontouchmove' },
  { label: 'ontouchstart' },
  { label: 'ontransitioncancel' },
  { label: 'ontransitionend' },
  { label: 'ontransitionrun' },
  { label: 'ontransitionstart' },
  { label: 'onvolumechange' },
  { label: 'onwaiting' },
  { label: 'onwebkitanimationend' },
  { label: 'onwebkitanimationiteration' },
  { label: 'onwebkitanimationstart' },
  { label: 'onwebkittransitionend' },
  { label: 'onwheel' },
];

export const svelteEvents: AttributeInfo[] = [
  {
    label: 'onintrostart',
    info: 'Available when element has transition',
  },
  {
    label: 'onintroend',
    info: 'Available when element has transition',
  },
  {
    label: 'onoutrostart',
    info: 'Available when element has transition',
  },
  {
    label: 'onoutroend',
    info: 'Available when element has transition',
  },
];

export const svelteAttributes: AttributeInfo[] = [
  {
    label: 'bind:innerHTML',
    info: 'Available when contenteditable=true',
  },
  {
    label: 'bind:textContent',
    info: 'Available when contenteditable=true',
  },
  {
    label: 'bind:innerText',
    info: 'Available when contenteditable=true',
  },
  {
    label: 'bind:clientWidth',
    info: 'Available on all visible elements. (read-only)',
  },
  {
    label: 'bind:clientHeight',
    info: 'Available on all visible elements. (read-only)',
  },
  {
    label: 'bind:offsetWidth',
    info: 'Available on all visible elements. (read-only)',
  },
  {
    label: 'bind:offsetHeight',
    info: 'Available on all visible elements. (read-only)',
  },
  {
    label: 'bind:this',
    info: 'To get a reference to a DOM node, use bind:this. If used on a component, gets a reference to that component instance.',
  },
];

export const sveltekitAttributes: AttributeInfo[] = [
  {
    label: 'data-sveltekit-keepfocus',
    info: 'SvelteKit-specific attribute. Currently focused element will retain focus after navigation. Otherwise, focus will be reset to the body.',
    valueType: 'constant',
    values: [{ label: 'off' }],
  },
  {
    label: 'data-sveltekit-noscroll',
    info: 'SvelteKit-specific attribute. Will prevent scrolling after the link is clicked.',
    valueType: 'constant',
    values: [{ label: 'off' }],
  },
  {
    label: 'data-sveltekit-preload-code',
    info: "SvelteKit-specific attribute. Will cause SvelteKit to run the page's load function as soon as the user hovers over the link (on a desktop) or touches it (on mobile), rather than waiting for the click event to trigger navigation.",
    valueType: 'constant',
    values: [
      { label: 'eager' },
      { label: 'viewport' },
      { label: 'hover' },
      { label: 'tap' },
      { label: 'off' },
    ],
  },
  {
    label: 'data-sveltekit-preload-data',
    info: "SvelteKit-specific attribute. Will cause SvelteKit to run the page's load function as soon as the user hovers over the link (on a desktop) or touches it (on mobile), rather than waiting for the click event to trigger navigation.",
    valueType: 'constant',
    values: [{ label: 'hover' }, { label: 'tap' }, { label: 'off' }],
  },
  {
    label: 'data-sveltekit-reload',
    info: 'SvelteKit-specific attribute. Will cause SvelteKit to do a normal browser navigation which results in a full page reload.',
    valueType: 'constant',
    values: [{ label: 'off' }],
  },
  {
    label: 'data-sveltekit-replacestate',
    info: 'SvelteKit-specific attribute. Will replace the current `history` entry rather than creating a new one with `pushState` when the link is clicked.',
    valueType: 'constant',
    values: [{ label: 'off' }],
  },
];

export const svelteTags: TagSpec[] = [
  {
    label: 'svelte:self',
    info: 'Allows a component to include itself, recursively.\n\nIt cannot appear at the top level of your markup; it must be inside an if or each block to prevent an infinite loop.',
    deprecated: true,
    boost: -1,
  },
  {
    label: 'svelte:component',
    info: 'Renders a component dynamically, using the component constructor specified as the this property. When the property changes, the component is destroyed and recreated.\n\nIf this is falsy, no component is rendered.',
    deprecated: true,
    boost: -1,
    attributes: [
      {
        label: 'this',
        info: 'Component to render.\n\nWhen this property changes, the component is destroyed and recreated.\nIf this is falsy, no component is rendered.',
      },
    ],
  },
  {
    label: 'svelte:element',
    info: 'Renders a DOM element dynamically, using the string as the this property. When the property changes, the element is destroyed and recreated.\n\nIf this is falsy, no element is rendered.',
    attributes: [
      {
        label: 'this',
        info: 'DOM element to render.\n\nWhen this property changes, the element is destroyed and recreated.\nIf this is falsy, no element is rendered.',
      },
    ],
  },
  {
    label: 'svelte:window',
    info: 'Allows you to add event listeners to the window object without worrying about removing them when the component is destroyed, or checking for the existence of window when server-side rendering.',
    attributes: [
      {
        label: 'bind:innerWidth',
        info: 'Bind to the inner width of the window. (read-only)',
      },
      {
        label: 'bind:innerHeight',
        info: 'Bind to the inner height of the window. (read-only)',
      },
      {
        label: 'bind:outerWidth',
        info: 'Bind to the outer width of the window. (read-only)',
      },
      {
        label: 'bind:outerHeight',
        info: 'Bind to the outer height of the window. (read-only)',
      },
      {
        label: 'bind:scrollX',
        info: 'Bind to the scroll x position of the window.',
      },
      {
        label: 'bind:scrollY',
        info: 'Bind to the scroll y position of the window.',
      },
      {
        label: 'bind:online',
        info: 'An alias for window.navigator.onLine',
      },
      // window events
      { label: 'onafterprint' },
      { label: 'onbeforeprint' },
      { label: 'onbeforeunload' },
      { label: 'ongamepadconnected' },
      { label: 'ongamepaddisconnected' },
      { label: 'onhashchange' },
      { label: 'onlanguagechange' },
      { label: 'onmessage' },
      { label: 'onmessageerror' },
      { label: 'onoffline' },
      { label: 'ononline' },
      { label: 'onpagehide' },
      { label: 'onpageshow' },
      { label: 'onpopstate' },
      { label: 'onrejectionhandled' },
      { label: 'onstorage' },
      { label: 'onunhandledrejection' },
      { label: 'onunload' },
    ],
  },
  {
    label: 'svelte:document',
    info: "As with <svelte:window>, this element allows you to add listeners to events on document, such as visibilitychange, which don't fire on window.",
    attributes: [
      // document events
      { label: 'onfullscreenchange' },
      { label: 'onfullscreenerror' },
      { label: 'onpointerlockchange' },
      { label: 'onpointerlockerror' },
      { label: 'onreadystatechange' },
      { label: 'onvisibilitychange' },
    ],
  },
  {
    label: 'svelte:body',
    info: "As with <svelte:window>, this element allows you to add listeners to events on document.body, such as mouseenter and mouseleave which don't fire on window.",
  },
  {
    label: 'svelte:boundary',
    info: "Boundaries allow you to 'wall off' parts of your app",
    attributes: [
      {
        label: 'onerror',
        info: 'An error handler, will be called with the same arguments as the `failed` snippet. This is useful for tracking the error with an error reporting service.',
      },
      {
        label: 'failed',
        info: 'A fail snippet, it will be rendered when an error is thrown inside the boundary, with the error and a reset function that recreates the contents.',
      },
      {
        label: 'pending',
        info: 'A pending snippet. It will be will be shown when the boundary is first created, and will remain visible until all the await expressions inside the boundary have resolved.',
      },
    ],
  },
  {
    label: 'svelte:head',
    info: 'This element makes it possible to insert elements into document.head. During server-side rendering, head content exposed separately to the main html content.',
  },
  {
    label: 'svelte:options',
    info: 'Provides a place to specify per-component compiler options',
    attributes: [
      {
        label: 'runes',
        info: 'If true, forces a component into runes mode.',
      },
      {
        label: 'namespace',
        info: 'The namespace where this component will be used.',
        valueType: 'constant',
        values: [
          { label: 'html', info: 'The default.' },
          { label: 'svg' },
          { label: 'mathml' },
        ],
      },
      {
        label: 'customElement',
        info: 'The options to use when compiling this component as a custom element. If a string is passed, it is used as the tag option',
      },
      {
        label: 'css',
        valueType: 'constant',
        values: [
          {
            label: 'injected',
            info: "The component will inject its styles inline: During server-side rendering, it's injected as a <style> tag in the head, during client side rendering, it's loaded via JavaScript",
          },
        ],
      },
      {
        label: 'immutable',
        info: 'If true, tells the compiler that you promise not to mutate any objects. This allows it to be less conservative about checking whether values have changed.',
        deprecated: true,
        boost: -1,
        values: [
          {
            label: 'true',
            info: 'You never use mutable data, so the compiler can do simple referential equality checks to determine if values have changed',
          },
          {
            label: 'false',
            info: 'The default. Svelte will be more conservative about whether or not mutable objects have changed',
          },
        ],
      },
      {
        label: 'accessors',
        deprecated: true,
        boost: -1,
        info: "If true, getters and setters will be created for the component's props. If false, they will only be created for readonly exported values (i.e. those declared with const, class and function). If compiling with customElement: true this option defaults to true.",
      },
      {
        label: 'tag',
        info: 'The name to use when compiling this component as a custom element',
      },
    ],
  },
  {
    label: 'svelte:fragment',
    info: 'This element is useful if you want to assign a component to a named slot without creating a wrapper DOM element.',
    deprecated: true,
    boost: -1,
    attributes: [
      {
        label: 'slot',
        info: 'The name of the named slot that should be targeted.',
      },
    ],
  },
  // This never worked for the autocomplete as the HTML automcomplete already provided one, (and was filtered)
  // Will remove after <slot> support is completely dropped, keeped for reference
  // {
  //   label: 'slot',
  //   info:
  //     'Components can have child content, in the same way that elements can.\n\nThe content is exposed in the child component using the <slot> element, which can contain fallback content that is rendered if no children are provided.',
  //   attributes: [
  //     {
  //       label: 'name',
  //       info:
  //         'Named slots allow consumers to target specific areas. They can also have fallback content.',
  //     },
  //   ],
  // },
];

const mediaAttributes: AttributeInfo[] = [
  {
    label: 'bind:duration',
    info: 'The total duration of the video, in seconds. (readonly)',
  },
  {
    label: 'bind:buffered',
    info: 'An array of {start, end} objects. (readonly)',
  },
  {
    label: 'bind:seekable',
    info: 'An array of {start, end} objects. (readonly)',
  },
  {
    label: 'bind:played',
    info: 'An array of {start, end} objects. (readonly)',
  },
  {
    label: 'bind:seeking',
    info: 'boolean. (readonly)',
  },
  {
    label: 'bind:ended',
    info: 'boolean. (readonly)',
  },
  {
    label: 'bind:currentTime',
    info: 'The current point in the video, in seconds.',
  },
  {
    label: 'bind:playbackRate',
    info: "how fast or slow to play the video, where 1 is 'normal'",
  },
  {
    label: 'bind:paused',
  },
  {
    label: 'bind:volume',
    info: 'A value between 0 and 1',
  },
  {
    label: 'bind:muted',
  },
  {
    label: 'bind:readyState',
  },
];

const videoAttributes: AttributeInfo[] = [
  {
    label: 'bind:videoWidth',
    info: 'readonly',
  },
  {
    label: 'bind:videoHeight',
    info: 'readonly',
  },
];

const indeterminateAttribute: AttributeInfo = {
  label: 'indeterminate',
  info: 'Available for type="checkbox"',
};

export const tagSpecificAttributes: TagSpec[] = [
  {
    label: 'select',
    attributes: [{ label: 'bind:value' }],
  },
  {
    label: 'input',
    attributes: [
      { label: 'bind:value' },
      {
        label: 'bind:group',
        info: 'Available for type="radio" and type="checkbox"',
      },
      { label: 'bind:checked', info: 'Available for type="checkbox"' },
      {
        label: 'bind:files',
        info: 'Available for type="file" (readonly)',
      },
      indeterminateAttribute,
      { ...indeterminateAttribute, label: 'bind:indeterminate' },
    ],
  },
  {
    label: 'img',
    attributes: [
      { label: 'bind:naturalWidth' },
      { label: 'bind:naturalHeight' },
    ],
  },
  {
    label: 'textarea',
    attributes: [{ label: 'bind:value' }],
  },
  {
    label: 'video',
    attributes: [...mediaAttributes, ...videoAttributes],
  },
  {
    label: 'audio',
    attributes: [...mediaAttributes],
  },
  {
    label: 'details',
    attributes: [{ label: 'bind:open' }],
  },
  {
    label: 'script',
    attributes: [
      { label: 'lang', values: [{ label: 'ts' }], valueType: 'text' },
    ],
  },
];

/**
 * Returns `true` is this is a valid place to declare state
 */
const isState: Test = (node) => {
  let parent = node.parent;

  if (node.name === '.' || node.name === 'PropertyName') {
    if (parent?.name !== 'MemberExpression') return false;
    parent = parent.parent;
  }

  if (!parent) return false;

  return (
    parent.name === 'VariableDeclaration' ||
    parent.name === 'PropertyDeclaration'
  );
};

/**
 * Returns `true` if we're already in a valid call expression, e.g.
 * changing an existing `$state()` to `$state.raw()`
 */
const isStateCall: Test = (node) => {
  let parent = node.parent;

  if (node.name === '.' || node.name === 'PropertyName') {
    if (parent?.name !== 'MemberExpression') return false;
    parent = parent.parent;
  }

  if (parent?.name !== 'CallExpression') {
    return false;
  }

  parent = parent.parent;
  if (!parent) {
    return false;
  }

  return (
    parent.name === 'VariableDeclaration' ||
    parent.name === 'PropertyDeclaration'
  );
};

const isStatement: Test = (node) => {
  if (node.name === 'VariableName') {
    return node.parent?.name === 'ExpressionStatement';
  }

  if (node.name === '.' || node.name === 'PropertyName') {
    return node.parent?.parent?.name === 'ExpressionStatement';
  }

  return false;
};

/**
 * Returns `true` if `$props()` is valid
 */
const isProps: Test = (node) => {
  return (
    node.name === 'VariableName' &&
    node.parent?.name === 'VariableDeclaration' &&
    node.parent.parent?.name === 'Script'
  );
};

/**
 * Returns `true` if `$bindable()` is valid
 * */
const isBindable: Test = (node, context) => {
  // disallow outside `let { x = $bindable }`
  if (node.parent?.name !== 'PatternProperty') return false;
  if (node.parent.parent?.name !== 'ObjectPattern') return false;
  if (node.parent.parent.parent?.name !== 'VariableDeclaration') return false;

  let last = node.parent.parent.parent.lastChild;
  if (!last) return true;

  // if the declaration is incomplete, assume the best
  if (
    last.name === 'ObjectPattern' ||
    last.name === 'Equals' ||
    last.name === '⚠'
  ) {
    return true;
  }

  if (last.name === ';') {
    last = last.prevSibling;
    if (!last || last.name === '⚠') return true;
  }

  // if the declaration is complete, only return true if it is a `$props()` declaration
  return (
    last.name === 'CallExpression' &&
    last.firstChild?.name === 'VariableName' &&
    context.state.sliceDoc(last.firstChild.from, last.firstChild.to) ===
      '$props'
  );
};

const isPropsIdCall: Test = (node, context) => {
  return (
    isStateCall(node, context) &&
    node.parent?.parent?.parent?.parent?.name === 'Script'
  );
};

export const runes = [
  { snippet: '$state(${})', test: isState },
  { snippet: '$state', test: isStateCall },
  { snippet: '$props()', test: isProps },
  { snippet: '$props.id', test: isPropsIdCall },
  { snippet: '$props.id()', test: isProps },
  { snippet: '$derived(${});', test: isState },
  { snippet: '$derived', test: isStateCall },
  { snippet: '$derived.by(() => {\n\t${}\n});', test: isState },
  { snippet: '$derived.by', test: isStateCall },
  { snippet: '$effect(() => {\n\t${}\n});', test: isStatement },
  { snippet: '$effect.pre(() => {\n\t${}\n});', test: isStatement },
  { snippet: '$state.raw(${});', test: isState },
  { snippet: '$state.raw', test: isStateCall },
  { snippet: '$bindable()', test: isBindable },
  { snippet: '$effect.root(() => {\n\t${}\n})' },
  { snippet: '$state.snapshot(${})' },
  { snippet: '$effect.tracking()' },
  { snippet: '$inspect(${});', test: isStatement },
  { snippet: '$inspect.trace();', test: isStatement },
  { snippet: '$inspect.trace(${});', test: isStatement },
  { snippet: '$host()' },
];

export const blocks = [
  { snippet: '#if ${}}\n\t${}\n{/if', label: '#if' },
  { snippet: '#each ${} as ${}}\n\t${}\n{/each', label: '#each' },
  { snippet: '#await ${} then ${}}\n\t${}\n{/await', label: '#await then' },
  { snippet: '#await ${} catch ${}}\n\t${}\n{/await', label: '#await catch' },
  {
    snippet: '#await ${}}\n\t${}\n{:then ${}}\n\t${}\n{/await',
    label: '#await :then',
  },
  { snippet: '#key ${}}\n\t${}\n{/key', label: '#key' },
  { snippet: '#snippet ${}()}\n\t${}\n{/snippet', label: '#snippet' },
];

export const specialTags = [
  { snippet: '@html ${}', label: '@html' },
  { snippet: '@debug ${}', label: '@debug' },
  { snippet: '@const ${}', label: '@const' },
  { snippet: '@render ${}', label: '@render' },
];

export const attributeLikeSpecialTags = [
  { snippet: '@attach ${}', label: '@attach' },
];
