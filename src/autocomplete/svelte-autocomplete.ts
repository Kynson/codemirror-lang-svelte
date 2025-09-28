import { syntaxTree } from '@codemirror/language';
import { snippetCompletion } from '@codemirror/autocomplete';

import {
  elementSpecificAttributes,
  svelteAttributes,
  svelteTags,
  sveltekitAttributes,
  svelteEvents,
  runes,
  logicBlocks,
  specialTags,
  attributeLikeSpecialTags,
} from './data-provider';

import type {
  CompletionContext,
  Completion,
  CompletionResult,
} from '@codemirror/autocomplete';
import type { SyntaxNode } from '@lezer/common';
import type { Info } from './data-provider';

const logicBlockSnippets = logicBlocks.map(({ snippet, label }) => {
  return snippetCompletion(snippet, { label, type: 'keyword' });
});

const specialTagSnippets = specialTags.map(({ snippet, label }) => {
  return snippetCompletion(snippet, { label, type: 'keyword' });
});

const attributeLikeSpecialTagSnippets = attributeLikeSpecialTags.map(
  ({ snippet, label }) => {
    return snippetCompletion(snippet, { label, type: 'keyword' });
  }
);

const sveltePrefiexedTags = svelteTags.filter((tags) =>
  tags.name.startsWith('svelte:')
);

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
      return { from, to, options: logicBlockSnippets, validFor: /^#(\w)*$/ };
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

const optionsForSvelteEvents = [
  ...svelteEvents.map((e) => ({
    ...e,
    boost: 1,
    name: e.name.replace(':', ''),
  })),
  ...svelteEvents,
].map((event) =>
  snippetCompletion(event.name + '={${}}', {
    label: event.name,
    info: event.description,
    type: 'keyword',
    boost: (event as Info & { boost: number }).boost || 0,
  })
);

const optionsForSveltekitAttributes = sveltekitAttributes.map((attr) => ({
  label: attr.name,
  info: attr.description,
  type: 'keyword',
}));

const optionsForSveltekitAttrValues = sveltekitAttributes.reduce((map, cur) => {
  map.set(
    cur.name,
    cur.values.map((value) => ({
      label: value.name,
      type: 'keyword',
    }))
  );

  return map;
}, new Map<string, Completion[]>());

function snippetForAttribute(attributes: Info[]) {
  return attributes.map((attr) =>
    snippetCompletion(attr.name + '={${}}', {
      label: attr.name,
      info: attr.description,
      type: 'keyword',
    })
  );
}

const optionsForSvelteAttributes = snippetForAttribute(svelteAttributes);

const optionsForSvelteTags = svelteTags.reduce<Record<string, Completion[]>>(
  (tags, tag) => {
    tags[tag.name] = snippetForAttribute(tag.attributes);
    return tags;
  },
  {}
);

function completionForAttributes(context: CompletionContext, node: SyntaxNode) {
  const completion = (options: Completion[]) => {
    return { from: node.from, to: context.pos, options, validFor: /^\w*$/ };
  };

  const globalOptions = [
    ...optionsForSvelteEvents,
    ...optionsForSvelteAttributes,
    ...optionsForSveltekitAttributes,
  ];

  const targetNode = node.parent?.parent?.firstChild?.nextSibling;
  const tagName = context.state.doc.sliceString(
    targetNode?.from ?? 0,
    targetNode?.to ?? 0
  );

  if (targetNode?.name === 'SvelteElementName') {
    return completion([...globalOptions, ...optionsForSvelteTags[tagName]]);
  }

  const elementSpecificAttribute = elementSpecificAttributes.get(tagName);

  if (targetNode?.name === 'TagName' && elementSpecificAttribute) {
    const completionsAttributes = snippetForAttribute(elementSpecificAttribute);

    return completion([...globalOptions, ...completionsAttributes]);
  }

  return completion(globalOptions);
}

function completionForSveltekitAttrValues(
  context: CompletionContext,
  node: SyntaxNode,
  attr: string
) {
  const options = optionsForSveltekitAttrValues.get(attr);
  if (options) {
    return {
      from: node.name === 'AttributeValueContent' ? node.from : node.from + 1,
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
    options: sveltePrefiexedTags.map(({ name }) => ({
      label: name,
      type: 'keyword',
    })),
    validFor: isTagName ? /^sve\w*:?$/ : /^svelte:\w*$/,
  };
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

  if (
    (nodeBefore.name === 'DirectiveOn' ||
      nodeBefore.name === 'DirectiveBind' ||
      nodeBefore.name === 'DirectiveTarget') &&
    nodeBefore.parent
  ) {
    return completionForAttributes(context, nodeBefore.parent);
  }

  if (
    nodeBefore.parent?.name === 'AttributeValue' &&
    nodeBefore.parent.parent?.firstChild
  ) {
    const attrNameNode = nodeBefore.parent.parent.firstChild;
    const attrName = context.state.doc.sliceString(
      attrNameNode.from,
      attrNameNode.to
    );

    if (attrName.startsWith('data-sveltekit-')) {
      return completionForSveltekitAttrValues(context, nodeBefore, attrName);
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
      'svelte/animate',
      'svelte/easing',
      'svelte/legacy',
      'svelte/motion',
      'svelte/reactivity',
      'svelte/reactivity/window',
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
