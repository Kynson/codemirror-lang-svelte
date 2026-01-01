import { syntaxTree } from '@codemirror/language';
import { snippetCompletion } from '@codemirror/autocomplete';
import { htmlCompletionSource } from '@codemirror/lang-html';

import {
  elementSpecificAttributes,
  svelteAttributes,
  svelteTags,
  sveltekitAttributes,
  svelteEvents,
  runes,
  blocks,
  specialTags,
  attributeLikeSpecialTags,
  globalEvents,
} from './data-provider';

import type {
  CompletionContext,
  Completion,
  CompletionResult,
} from '@codemirror/autocomplete';
import type { SyntaxNode } from '@lezer/common';
import type { Info } from './data-provider';

const blockSnippets = blocks.map(({ snippet, label }) => {
  return snippetCompletion(snippet, { label, type: 'snippet' });
});

const specialTagSnippets = specialTags.map(({ snippet, label }) => {
  return snippetCompletion(snippet, { label, type: 'snippet' });
});

const attributeLikeSpecialTagSnippets = attributeLikeSpecialTags.map(
  ({ snippet, label }) => {
    return snippetCompletion(snippet, { label, type: 'snippet' });
  }
);

function getNodeContent(content: CompletionContext, node: SyntaxNode): string;
function getNodeContent(
  content: CompletionContext,
  node: null | undefined
): null;
function getNodeContent(
  content: CompletionContext,
  node: SyntaxNode | null | undefined
): string | null;
function getNodeContent(context: CompletionContext, node?: SyntaxNode | null) {
  if (!node) {
    return null;
  }

  return context.state.doc.sliceString(node.from, node.to);
}

function completionForBlock(context: CompletionContext, node: SyntaxNode) {
  const prefix = context.state.doc.sliceString(node.from, node.from + 1);

  const parent = node.parent;
  const block = node.parent?.parent;

  const from = node.from;
  const to = context.pos;

  const type = 'keyword';

  const completionBase = {
    from,
    to,
  };

  switch (prefix) {
    case '/': {
      const completion = (label: string) => ({
        ...completionBase,
        options: [{ label, type }],
        validFor: /^\/\w*$/,
      });

      if (parent?.name === 'EachBlockClose' || block?.name === 'EachBlock') {
        return completion('/each');
      }

      if (parent?.name === 'IfBlockClose' || block?.name === 'IfBlock') {
        return completion('/if');
      }
      if (parent?.name === 'AwaitBlockClose' || block?.name === 'AwaitBlock') {
        return completion('/await');
      }

      if (parent?.name === 'KeyBlockClose' || block?.name === 'KeyBlock') {
        return completion('/key');
      }

      break;
    }
    case ':': {
      const completion = (options: Completion[]) => ({
        ...completionBase,
        options,
        validFor: /^:\w*$/,
      });

      if (parent?.name === 'ElseBlock' || block?.name === 'IfBlock') {
        return completion([
          { label: ':else', type },
          { label: ':else if ', type },
        ]);
      }

      if (parent?.name === 'ThenBlock' || block?.name === 'AwaitBlock') {
        return completion([
          { label: ':then', type },
          { label: ':catch', type },
        ]);
      }

      break;
    }
    case '#': {
      return { from, to, options: blockSnippets, validFor: /^#(\w)*$/ };
    }
    case '@': {
      const grandParentName = node.parent?.parent?.name;
      const isInsideTag =
        grandParentName === 'SelfClosingTag' || grandParentName === 'OpenTag';

      return {
        ...completionBase,
        options: isInsideTag
          ? attributeLikeSpecialTagSnippets
          : specialTagSnippets,
        validFor: /^@(\w)*$/,
      };
    }
  }

  return null;
}

function snippetForAttribute(attributes: Info[]) {
  return attributes.reduce<Completion[]>(
    (array, { name, valueType, description, deprecated, boost }) => {
      const placeholder = valueType === 'constant' ? '"${}"' : '{${}}';
      const baseOptions = {
        info: description,
        boost,
        detail: deprecated ? 'deprecated' : undefined,
        type: 'snippet',
      };

      array.push(
        snippetCompletion(`${name}=${placeholder}`, {
          ...baseOptions,
          label: name,
        })
      );

      if (!name.startsWith('on')) {
        return array;
      }

      const eventAttributeWithDirective = name.replace(/^on/, 'on:');

      array.push(
        snippetCompletion(`${eventAttributeWithDirective}=${placeholder}`, {
          ...baseOptions,
          label: eventAttributeWithDirective,
          detail: 'deprecated',
          // The on: directive is deprecated, so we lower its priority
          boost: -1,
        })
      );

      return array;
    },
    []
  );
}

const optionsForGlobalEvents = snippetForAttribute(globalEvents);

const optionsForSvelteEvents = snippetForAttribute(svelteEvents);

const optionsForSveltekitAttributes = snippetForAttribute(sveltekitAttributes);

const optionsForSvelteAttributes = snippetForAttribute(svelteAttributes);
const optionsForSveltekitAttributeValues = sveltekitAttributes.reduce(
  (map, current) => {
    if (!current.values) {
      return map;
    }

    map.set(
      current.name,
      current.values.map(({ name, description, boost }) => ({
        label: name,
        info: description,
        boost,
        type: 'constant',
      }))
    );

    return map;
  },
  new Map<string, Completion[]>()
);

const optionsForSvelteTagAttributes = svelteTags.reduce((map, current) => {
  map.set(current.name, snippetForAttribute(current.attributes));
  return map;
}, new Map<string, Completion[]>());

const optionsForSvelteTagAttributeValues = svelteTags.reduce(
  (map, { attributes, name }) => {
    if (attributes.length === 0) {
      return map;
    }

    for (const attribute of attributes) {
      if (!attribute.values) {
        continue;
      }

      map.set(
        `${name}/${attribute.name}`,
        attribute.values.map(({ name, description, boost }) => ({
          label: name,
          info: description,
          boost,
          type: 'constant',
        }))
      );
    }

    return map;
  },
  new Map<string, Completion[]>()
);

const optionsForSvelteTags = svelteTags.map(
  ({ name, deprecated, description, boost }) => ({
    label: name,
    info: description,
    detail: deprecated ? 'deprecated' : undefined,
    boost,
    type: 'type',
  })
);

function completionForAttributes(
  context: CompletionContext,
  node?: SyntaxNode | null
) {
  if (!node) {
    return null;
  }

  const completion = (options: Completion[]) => {
    // The colon is for directive attributes like on:, bind:, etc.
    return { from: node.from, to: context.pos, options, validFor: /^\w*:?$/ };
  };

  const globalOptions = [
    ...optionsForGlobalEvents,
    ...optionsForSvelteEvents,
    ...optionsForSvelteAttributes,
    ...optionsForSveltekitAttributes,
  ];

  const elementNode = node.parent?.parent?.firstChild?.nextSibling;
  const elementName = getNodeContent(context, elementNode);

  if (
    elementNode?.name === 'SvelteElementName' &&
    // This check is technically not needed if the parser is correct, but just in case
    elementName &&
    /^svelte:(options|boundary)/.test(elementName)
  ) {
    return completion(optionsForSvelteTagAttributes.get(elementName) ?? []);
  }

  if (
    elementNode?.name === 'SvelteElementName' &&
    // This check is technically not needed if the parser is correct, but just in case
    elementName
  ) {
    return completion([
      ...(optionsForSvelteTagAttributes.get(elementName) ?? []),
      ...globalOptions,
    ]);
  }

  const elementSpecificAttribute = elementSpecificAttributes.get(
    elementName ?? ''
  );

  if (elementNode?.name === 'TagName' && elementSpecificAttribute) {
    const completionsAttributes = snippetForAttribute(elementSpecificAttribute);

    return completion([...globalOptions, ...completionsAttributes]);
  }

  return completion(globalOptions);
}

function completionForAttributeValues(
  context: CompletionContext,
  node: SyntaxNode,
  attributeValuesMap: Map<string, Completion[]>,
  attribute: string
) {
  const options = attributeValuesMap.get(attribute);

  if (options) {
    const from =
      node.name === 'AttributeValueContent'
        ? node.from
        : node.prevSibling
        ? // End quote, should not match anything (no completion will be shown)
          node.from - 1
        : // Skip the quote
          node.from + 1;

    return {
      from,
      to: context.pos,
      options,
      validFor: /^\w*$/,
    };
  }

  return null;
}

function completionForSvelteTags(node: SyntaxNode) {
  const isTagName = node.name === 'TagName';

  return {
    from: isTagName ? node.from : node.from - 'svelte:'.length,
    options: optionsForSvelteTags,
    validFor: isTagName ? /^sve\w*:?$/ : /^svelte:\w*$/,
  };
}

function tryCompleteSvelteKitAttributeValues(
  context: CompletionContext,
  node: SyntaxNode
) {
  const attributeNameNode = node.parent?.parent?.firstChild;

  if (!attributeNameNode) {
    return null;
  }

  const attributeName = getNodeContent(context, attributeNameNode);

  if (!attributeName.startsWith('data-sveltekit-')) {
    return null;
  }

  return completionForAttributeValues(
    context,
    node,
    optionsForSveltekitAttributeValues,
    attributeName
  );
}

function tryCompleteSvelteTagAttributeValues(
  context: CompletionContext,
  node: SyntaxNode
) {
  const svelteElementTypeNode =
    node.parent?.parent?.parent?.getChild('SvelteElementName');

  if (!svelteElementTypeNode) {
    return null;
  }

  const svelteElementName = getNodeContent(context, svelteElementTypeNode);

  const attributeNameNode = node.parent?.parent?.firstChild;
  if (!attributeNameNode) {
    return null;
  }
  const attributeName = getNodeContent(context, attributeNameNode);

  return completionForAttributeValues(
    context,
    node,
    optionsForSvelteTagAttributeValues,
    `${svelteElementName}/${attributeName}`
  );
}

export function completionForMarkup(
  context: CompletionContext
): CompletionResult | null {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

  if (nodeBefore.name === 'BlockPrefix') {
    return completionForBlock(context, nodeBefore);
  }

  if (nodeBefore.prevSibling?.name === 'BlockPrefix') {
    return completionForBlock(context, nodeBefore.prevSibling);
  }

  if (nodeBefore.name === 'AttributeName') {
    return completionForAttributes(context, nodeBefore);
  }

  // Continue completing after directive prefix (e.g. on:, bind:)
  if (nodeBefore.name === 'DirectiveTarget') {
    return completionForAttributes(context, nodeBefore.parent);
  }

  // In order to prevent putting too much logic here, use a simple heuristic here
  // and try completing the attribute value
  if (nodeBefore.parent?.name === 'AttributeValue') {
    const svelteKitAttributeCompletionResult =
      tryCompleteSvelteKitAttributeValues(context, nodeBefore);

    if (svelteKitAttributeCompletionResult) {
      return svelteKitAttributeCompletionResult;
    }

    const svelteTagAttributeCompletionResult =
      tryCompleteSvelteTagAttributeValues(context, nodeBefore);

    if (svelteTagAttributeCompletionResult) {
      return svelteTagAttributeCompletionResult;
    }
  }

  if (
    (nodeBefore.name === 'TagName' &&
      context.state
        .sliceDoc(nodeBefore.from, nodeBefore.to)
        .startsWith('sve')) ||
    nodeBefore.name === 'SvelteElementType'
  ) {
    return completionForSvelteTags(nodeBefore);
  }

  return null;
}

const options = runes.map(({ snippet, test }, i) => ({
  option: snippetCompletion(snippet, {
    type: 'keyword',
    boost: runes.length - i,
    label: snippet.includes('(')
      ? snippet.slice(0, snippet.indexOf('('))
      : snippet,
  }),
  test,
}));

export function completionForJavascript(
  context: CompletionContext
): CompletionResult | null | false {
  const node = syntaxTree(context.state).resolveInner(context.pos, -1);

  if (node.name === 'String' && node.parent?.name === 'ImportDeclaration') {
    const modules = [
      'svelte',
      'svelte/action',
      'svelte/animate',
      'svelte/attachments',
      'svelte/compiler',
      'svelte/easing',
      'svelte/events',
      'svelte/legacy',
      'svelte/motion',
      'svelte/reactivity',
      'svelte/reactivity/window',
      'svelte/server',
      'svelte/store',
      'svelte/transition',
    ];

    return {
      from: node.from + 1,
      options: modules.map((label) => ({
        label,
        type: 'string',
      })),
    };
  }

  if (
    node.name === 'VariableName' ||
    node.name === 'PropertyName' ||
    node.name === '.'
  ) {
    // special case — `$inspect(...).with(...)` is the only rune that 'returns'
    // an 'object' with a 'method'
    if (node.name === 'PropertyName' || node.name === '.') {
      if (
        node.parent?.name === 'MemberExpression' &&
        node.parent.firstChild?.name === 'CallExpression' &&
        node.parent.firstChild.firstChild?.name === 'VariableName' &&
        context.state.sliceDoc(
          node.parent.firstChild.firstChild.from,
          node.parent.firstChild.firstChild.to
        ) === '$inspect'
      ) {
        const open = context.matchBefore(/\.\w*/);
        if (!open) return null;

        return {
          from: open.from,
          options: [
            snippetCompletion('.with(${})', {
              type: 'keyword',
              label: '.with',
            }),
          ],
        };
      }
    }

    const open = context.matchBefore(/\$[\w.]*/);
    if (!open) {
      return null;
    }

    return {
      from: open.from,
      options: options
        .filter((option) => (option.test ? option.test(node, context) : true))
        .map((option) => option.option),
    };
  }

  return null;
}

export function svelteHtmlCompletionSource(context: CompletionContext) {
  let node: SyntaxNode | null = syntaxTree(context.state).resolveInner(
    context.pos,
    -1
  );

  while (node && node.name !== 'OpenTag' && node.name !== 'SelfClosingTag') {
    node = node.parent;
  }

  const elementNode = node?.getChild('SvelteElementName');
  const elementName = getNodeContent(context, elementNode);

  if (elementName && /^svelte:(options|boundary)/.test(elementName)) {
    return null;
  }

  return htmlCompletionSource(context);
}
