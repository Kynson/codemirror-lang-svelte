import {
  ShortExpression,
  LongExpression,
  AsTerminatedLongExpression,
  ScriptText,
  StyleText,
  TextareaText,
} from './syntax.grammar?terms';
import { parseMixed } from '@lezer/common';
import { javascriptLanguage } from '@codemirror/lang-javascript';

import type { Input, Parser, SyntaxNode, SyntaxNodeRef } from '@lezer/common';

export interface NestedLanguageConfig {
  tag: 'script' | 'style' | 'textarea';
  attributeMatcher?: (attrs: Record<string, string>) => boolean;
  parser: Parser;
}

function getAttributes(elementNode: SyntaxNode, input: Input) {
  const extractedAttributes = Object.create(null) as Record<string, string>;
  const attributesNodes =
    // The firstChild is the open tag node
    elementNode.firstChild?.getChildren('Attribute') ?? [];

  for (const attribute of attributesNodes) {
    const name = attribute.getChild('AttributeName');
    const value =
      attribute.getChild('AttributeValue') ??
      attribute.getChild('UnquotedAttributeValue');

    if (!name) {
      continue;
    }

    // Skip the dobule quotes for AttributeValue
    extractedAttributes[input.read(name.from, name.to)] = !value
      ? ''
      : value.name == 'AttributeValue'
      ? input.read(value.from + 1, value.to - 1)
      : input.read(value.from, value.to);
  }

  return extractedAttributes;
}

function maybeNest(
  nodeReference: SyntaxNodeRef,
  input: Input,
  tags: NestedLanguageConfig[]
) {
  const { node } = nodeReference;
  const { from, to } = node;

  const parent = node.parent;

  if (!parent) {
    return null;
  }

  const attributes = getAttributes(parent, input);

  for (const tag of tags) {
    if (!tag.attributeMatcher || tag.attributeMatcher(attributes)) {
      return {
        parser: tag.parser,
        overlay: [{ from, to }],
      };
    }
  }

  return null;
}

function getJavascriptExpressionParser(
  scriptNestedConfigs: NestedLanguageConfig[]
) {
  for (const { attributeMatcher, parser } of scriptNestedConfigs) {
    if (!attributeMatcher || attributeMatcher({ type: 'text/javascript' })) {
      return parser;
    }
  }

  return javascriptLanguage.parser;
}

export function configureNesting(tags: NestedLanguageConfig[]) {
  const script: NestedLanguageConfig[] = [];
  const style: NestedLanguageConfig[] = [];
  const textarea: NestedLanguageConfig[] = [];

  for (const tag of tags) {
    const { tag: tagName } = tag;

    // Validation is enforced by the type system
    const array =
      tagName === 'script' ? script : tagName === 'style' ? style : textarea;

    array.push(tag);
  }

  return parseMixed((nodeReference, input) => {
    const id = nodeReference.type.id;

    if (
      id === LongExpression ||
      id === AsTerminatedLongExpression ||
      id === ShortExpression
    ) {
      const expressionParser = getJavascriptExpressionParser(script);

      return { parser: expressionParser };
    }
    if (id === ScriptText) {
      return maybeNest(nodeReference, input, script);
    }
    if (id === StyleText) {
      return maybeNest(nodeReference, input, style);
    }
    if (id === TextareaText) {
      return maybeNest(nodeReference, input, textarea);
    }

    return null;
  });
}
