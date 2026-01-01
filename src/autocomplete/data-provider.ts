import { CompletionContext } from '@codemirror/autocomplete';
import type { SyntaxNode } from '@lezer/common';

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
  | 'variable';

export interface Info {
  name: string;
  description?: string;
  values?: Info[];
  valueType?: CompletionType;
  boost?: number;
  deprecated?: boolean;
}

/**
 * this file is based on [dataProvider.ts from sveltejs/language-tools](https://github.com/sveltejs/language-tools/blob/master/packages/language-server/src/plugins/html/dataProvider.ts)
 */

export const globalEvents: Info[] = [
  { name: 'onabort' },
  { name: 'onanimationcancel' },
  { name: 'onanimationend' },
  { name: 'onanimationiteration' },
  { name: 'onanimationstart' },
  { name: 'onauxclick' },
  { name: 'onbeforeinput' },
  { name: 'onblur' },
  { name: 'oncancel' },
  { name: 'oncanplay' },
  { name: 'oncanplaythrough' },
  { name: 'onchange' },
  { name: 'onclick' },
  { name: 'onclose' },
  { name: 'oncontextmenu' },
  { name: 'oncopy' },
  { name: 'oncuechange' },
  { name: 'oncut' },
  { name: 'ondblclick' },
  { name: 'ondrag' },
  { name: 'ondragend' },
  { name: 'ondragenter' },
  { name: 'ondragleave' },
  { name: 'ondragover' },
  { name: 'ondragstart' },
  { name: 'ondrop' },
  { name: 'ondurationchange' },
  { name: 'onemptied' },
  { name: 'onended' },
  { name: 'onerror' },
  { name: 'onfocus' },
  { name: 'onformdata' },
  { name: 'ongotpointercapture' },
  { name: 'oninput' },
  { name: 'oninvalid' },
  { name: 'onkeydown' },
  { name: 'onkeypress' },
  { name: 'onkeyup' },
  { name: 'onload' },
  { name: 'onloadeddata' },
  { name: 'onloadedmetadata' },
  { name: 'onloadstart' },
  { name: 'onlostpointercapture' },
  { name: 'onmousedown' },
  { name: 'onmouseenter' },
  { name: 'onmouseleave' },
  { name: 'onmousemove' },
  { name: 'onmouseout' },
  { name: 'onmouseover' },
  { name: 'onmouseup' },
  { name: 'onpaste' },
  { name: 'onpause' },
  { name: 'onplay' },
  { name: 'onplaying' },
  { name: 'onpointercancel' },
  { name: 'onpointerdown' },
  { name: 'onpointerenter' },
  { name: 'onpointerleave' },
  { name: 'onpointermove' },
  { name: 'onpointerout' },
  { name: 'onpointerover' },
  { name: 'onpointerup' },
  { name: 'onprogress' },
  { name: 'onratechange' },
  { name: 'onreset' },
  { name: 'onresize' },
  { name: 'onscroll' },
  { name: 'onsecuritypolicyviolation' },
  { name: 'onseeked' },
  { name: 'onseeking' },
  { name: 'onselect' },
  { name: 'onselectionchange' },
  { name: 'onselectstart' },
  { name: 'onslotchange' },
  { name: 'onstalled' },
  { name: 'onsubmit' },
  { name: 'onsuspend' },
  { name: 'ontimeupdate' },
  { name: 'ontoggle' },
  { name: 'ontouchcancel' },
  { name: 'ontouchend' },
  { name: 'ontouchmove' },
  { name: 'ontouchstart' },
  { name: 'ontransitioncancel' },
  { name: 'ontransitionend' },
  { name: 'ontransitionrun' },
  { name: 'ontransitionstart' },
  { name: 'onvolumechange' },
  { name: 'onwaiting' },
  { name: 'onwebkitanimationend' },
  { name: 'onwebkitanimationiteration' },
  { name: 'onwebkitanimationstart' },
  { name: 'onwebkittransitionend' },
  { name: 'onwheel' },
];

export const svelteEvents = [
  {
    name: 'onintrostart',
    description: 'Available when element has transition',
  },
  {
    name: 'onintroend',
    description: 'Available when element has transition',
  },
  {
    name: 'onoutrostart',
    description: 'Available when element has transition',
  },
  {
    name: 'onoutroend',
    description: 'Available when element has transition',
  },
];

export const svelteAttributes = [
  {
    name: 'bind:innerHTML',
    description: 'Available when contenteditable=true',
  },
  {
    name: 'bind:textContent',
    description: 'Available when contenteditable=true',
  },
  {
    name: 'bind:innerText',
    description: 'Available when contenteditable=true',
  },
  {
    name: 'bind:clientWidth',
    description: 'Available on all visible elements. (read-only)',
  },
  {
    name: 'bind:clientHeight',
    description: 'Available on all visible elements. (read-only)',
  },
  {
    name: 'bind:offsetWidth',
    description: 'Available on all visible elements. (read-only)',
  },
  {
    name: 'bind:offsetHeight',
    description: 'Available on all visible elements. (read-only)',
  },
  {
    name: 'bind:this',
    description:
      'To get a reference to a DOM node, use bind:this. If used on a component, gets a reference to that component instance.',
  },
];

export const sveltekitAttributes: Info[] = [
  {
    name: 'data-sveltekit-keepfocus',
    description:
      'SvelteKit-specific attribute. Currently focused element will retain focus after navigation. Otherwise, focus will be reset to the body.',
    valueType: 'constant',
    values: [{ name: 'off' }],
  },
  {
    name: 'data-sveltekit-noscroll',
    description:
      'SvelteKit-specific attribute. Will prevent scrolling after the link is clicked.',
    valueType: 'constant',
    values: [{ name: 'off' }],
  },
  {
    name: 'data-sveltekit-preload-code',
    description:
      "SvelteKit-specific attribute. Will cause SvelteKit to run the page's load function as soon as the user hovers over the link (on a desktop) or touches it (on mobile), rather than waiting for the click event to trigger navigation.",
    valueType: 'constant',
    values: [
      { name: 'eager' },
      { name: 'viewport' },
      { name: 'hover' },
      { name: 'tap' },
      { name: 'off' },
    ],
  },
  {
    name: 'data-sveltekit-preload-data',
    description:
      "SvelteKit-specific attribute. Will cause SvelteKit to run the page's load function as soon as the user hovers over the link (on a desktop) or touches it (on mobile), rather than waiting for the click event to trigger navigation.",
    valueType: 'constant',
    values: [{ name: 'hover' }, { name: 'tap' }, { name: 'off' }],
  },
  {
    name: 'data-sveltekit-reload',
    description:
      'SvelteKit-specific attribute. Will cause SvelteKit to do a normal browser navigation which results in a full page reload.',
    valueType: 'constant',
    values: [{ name: 'off' }],
  },
  {
    name: 'data-sveltekit-replacestate',
    description:
      'SvelteKit-specific attribute. Will replace the current `history` entry rather than creating a new one with `pushState` when the link is clicked.',
    valueType: 'constant',
    values: [{ name: 'off' }],
  },
];

export const svelteTags: (Info & { attributes: Info[] })[] = [
  {
    name: 'svelte:self',
    description:
      'Allows a component to include itself, recursively.\n\nIt cannot appear at the top level of your markup; it must be inside an if or each block to prevent an infinite loop.',
    deprecated: true,
    boost: -1,
    attributes: [],
  },
  {
    name: 'svelte:component',
    description:
      'Renders a component dynamically, using the component constructor specified as the this property. When the property changes, the component is destroyed and recreated.\n\nIf this is falsy, no component is rendered.',
    deprecated: true,
    boost: -1,
    attributes: [
      {
        name: 'this',
        description:
          'Component to render.\n\nWhen this property changes, the component is destroyed and recreated.\nIf this is falsy, no component is rendered.',
      },
    ],
  },
  {
    name: 'svelte:element',
    description:
      'Renders a DOM element dynamically, using the string as the this property. When the property changes, the element is destroyed and recreated.\n\nIf this is falsy, no element is rendered.',
    attributes: [
      {
        name: 'this',
        description:
          'DOM element to render.\n\nWhen this property changes, the element is destroyed and recreated.\nIf this is falsy, no element is rendered.',
      },
    ],
  },
  {
    name: 'svelte:window',
    description:
      'Allows you to add event listeners to the window object without worrying about removing them when the component is destroyed, or checking for the existence of window when server-side rendering.',
    attributes: [
      {
        name: 'bind:innerWidth',
        description: 'Bind to the inner width of the window. (read-only)',
      },
      {
        name: 'bind:innerHeight',
        description: 'Bind to the inner height of the window. (read-only)',
      },
      {
        name: 'bind:outerWidth',
        description: 'Bind to the outer width of the window. (read-only)',
      },
      {
        name: 'bind:outerHeight',
        description: 'Bind to the outer height of the window. (read-only)',
      },
      {
        name: 'bind:scrollX',
        description: 'Bind to the scroll x position of the window.',
      },
      {
        name: 'bind:scrollY',
        description: 'Bind to the scroll y position of the window.',
      },
      {
        name: 'bind:online',
        description: 'An alias for window.navigator.onLine',
      },
      // window events
      { name: 'onafterprint' },
      { name: 'onbeforeprint' },
      { name: 'onbeforeunload' },
      { name: 'ongamepadconnected' },
      { name: 'ongamepaddisconnected' },
      { name: 'onhashchange' },
      { name: 'onlanguagechange' },
      { name: 'onmessage' },
      { name: 'onmessageerror' },
      { name: 'onoffline' },
      { name: 'ononline' },
      { name: 'onpagehide' },
      { name: 'onpageshow' },
      { name: 'onpopstate' },
      { name: 'onrejectionhandled' },
      { name: 'onstorage' },
      { name: 'onunhandledrejection' },
      { name: 'onunload' },
    ],
  },
  {
    name: 'svelte:document',
    description:
      "As with <svelte:window>, this element allows you to add listeners to events on document, such as visibilitychange, which don't fire on window.",
    attributes: [
      // document events
      { name: 'onfullscreenchange' },
      { name: 'onfullscreenerror' },
      { name: 'onpointerlockchange' },
      { name: 'onpointerlockerror' },
      { name: 'onreadystatechange' },
      { name: 'onvisibilitychange' },
    ],
  },
  {
    name: 'svelte:body',
    description:
      "As with <svelte:window>, this element allows you to add listeners to events on document.body, such as mouseenter and mouseleave which don't fire on window.",
    attributes: [],
  },
  {
    name: 'svelte:boundary',
    description: "Boundaries allow you to 'wall off' parts of your app",
    attributes: [
      {
        name: 'onerror',
        description:
          'An error handler, will be called with the same arguments as the `failed` snippet. This is useful for tracking the error with an error reporting service.',
      },
      {
        name: 'failed',
        description:
          'A fail snippet, it will be rendered when an error is thrown inside the boundary, with the error and a reset function that recreates the contents.',
      },
      {
        name: 'pending',
        description:
          'A pending snippet. It will be will be shown when the boundary is first created, and will remain visible until all the await expressions inside the boundary have resolved.',
      },
    ],
  },
  {
    name: 'svelte:head',
    description:
      'This element makes it possible to insert elements into document.head. During server-side rendering, head content exposed separately to the main html content.',
    attributes: [],
  },
  {
    name: 'svelte:options',
    description: 'Provides a place to specify per-component compiler options',
    attributes: [
      {
        name: 'runes',
        description: 'If true, forces a component into runes mode.',
      },
      {
        name: 'namespace',
        description: 'The namespace where this component will be used.',
        valueType: 'constant',
        values: [
          { name: 'html', description: 'The default.' },
          { name: 'svg' },
          { name: 'mathml' },
        ],
      },
      {
        name: 'customElement',
        description:
          'The options to use when compiling this component as a custom element. If a string is passed, it is used as the tag option',
      },
      {
        name: 'css',
        valueType: 'constant',
        values: [
          {
            name: 'injected',
            description:
              "The component will inject its styles inline: During server-side rendering, it's injected as a <style> tag in the head, during client side rendering, it's loaded via JavaScript",
          },
        ],
      },
      {
        name: 'immutable',
        description:
          'If true, tells the compiler that you promise not to mutate any objects. This allows it to be less conservative about checking whether values have changed.',
        deprecated: true,
        boost: -1,
        values: [
          {
            name: 'true',
            description:
              'You never use mutable data, so the compiler can do simple referential equality checks to determine if values have changed',
          },
          {
            name: 'false',
            description:
              'The default. Svelte will be more conservative about whether or not mutable objects have changed',
          },
        ],
      },
      {
        name: 'accessors',
        deprecated: true,
        boost: -1,
        description:
          "If true, getters and setters will be created for the component's props. If false, they will only be created for readonly exported values (i.e. those declared with const, class and function). If compiling with customElement: true this option defaults to true.",
      },
      {
        name: 'tag',
        description:
          'The name to use when compiling this component as a custom element',
      },
    ],
  },
  {
    name: 'svelte:fragment',
    description:
      'This element is useful if you want to assign a component to a named slot without creating a wrapper DOM element.',
    deprecated: true,
    boost: -1,
    attributes: [
      {
        name: 'slot',
        description: 'The name of the named slot that should be targeted.',
      },
    ],
  },
  // This never worked for the autocomplete as the HTML automcomplete already provided one, (and was filtered)
  // Will remove after <slot> support is completely dropped, keeped for reference
  // {
  //   name: 'slot',
  //   description:
  //     'Components can have child content, in the same way that elements can.\n\nThe content is exposed in the child component using the <slot> element, which can contain fallback content that is rendered if no children are provided.',
  //   attributes: [
  //     {
  //       name: 'name',
  //       description:
  //         'Named slots allow consumers to target specific areas. They can also have fallback content.',
  //     },
  //   ],
  // },
];

const mediaAttributes = [
  {
    name: 'bind:duration',
    description: 'The total duration of the video, in seconds. (readonly)',
  },
  {
    name: 'bind:buffered',
    description: 'An array of {start, end} objects. (readonly)',
  },
  {
    name: 'bind:seekable',
    description: 'An array of {start, end} objects. (readonly)',
  },
  {
    name: 'bind:played',
    description: 'An array of {start, end} objects. (readonly)',
  },
  {
    name: 'bind:seeking',
    description: 'boolean. (readonly)',
  },
  {
    name: 'bind:ended',
    description: 'boolean. (readonly)',
  },
  {
    name: 'bind:currentTime',
    description: 'The current point in the video, in seconds.',
  },
  {
    name: 'bind:playbackRate',
    description: "how fast or slow to play the video, where 1 is 'normal'",
  },
  {
    name: 'bind:paused',
  },
  {
    name: 'bind:volume',
    description: 'A value between 0 and 1',
  },
  {
    name: 'bind:muted',
  },
  {
    name: 'bind:readyState',
  },
];

const videoAttributes = [
  {
    name: 'bind:videoWidth',
    description: 'readonly',
  },
  {
    name: 'bind:videoHeight',
    description: 'readonly',
  },
];

const indeterminateAttribute = {
  name: 'indeterminate',
  description: 'Available for type="checkbox"',
};

export const elementSpecificAttributes = new Map<string, Info[]>([
  ['select', [{ name: 'bind:value' }]],
  [
    'input',
    [
      { name: 'bind:value' },
      {
        name: 'bind:group',
        description: 'Available for type="radio" and type="checkbox"',
      },
      { name: 'bind:checked', description: 'Available for type="checkbox"' },
      {
        name: 'bind:files',
        description: 'Available for type="file" (readonly)',
      },
      indeterminateAttribute,
      { ...indeterminateAttribute, name: 'bind:indeterminate' },
    ],
  ],
  ['img', [{ name: 'bind:naturalWidth' }, { name: 'bind:naturalHeight' }]],
  ['textarea', [{ name: 'bind:value' }]],
  ['video', [...mediaAttributes, ...videoAttributes]],
  ['audio', [...mediaAttributes]],
  ['details', [{ name: 'bind:open' }]],
]);

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
  { snippet: '#if ${}}\n\n{/if', label: '#if' },
  { snippet: '#each ${} as }\n\n{/each', label: '#each' },
  { snippet: '#await ${} then }\n\n{/await', label: '#await then' },
  { snippet: '#await ${}}\n\n{:then }\n\n{/await', label: '#await :then' },
  { snippet: '#key ${}}\n\n{/key', label: '#key' },
  { snippet: '#snippet ${}()}\n\n{/snippet', label: '#snippet' },
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