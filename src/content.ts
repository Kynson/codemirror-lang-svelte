import {
  ShortExpression,
  LongExpression,
  ScriptText,
  StyleText,
  TextareaText,
} from './syntax.grammar?terms';
import { parseMixed } from '@lezer/common';
import { parser as javascriptParser } from '@lezer/javascript';

import type { Input, Parser, SyntaxNode, SyntaxNodeRef } from '@lezer/common';

export type NestedLanguageConfig = {
  tag: 'script' | 'style' | 'textarea';
  attributeMatcher?: (attrs: { [attr: string]: string }) => boolean;
  parser: Parser;
};

function getAttributes(elementNode: SyntaxNode, input: Input) {
  const extractedAttributes = Object.create(null);
  const attributesNodes =
    // The firstChild is the open tag node
    elementNode.firstChild?.getChildren('Attributes') ?? [];

  for (const attribute of attributesNodes) {
    const name = attribute.getChild('AttributeName');
    const value =
      attribute.getChild('AttributeValue') ||
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
  const parent = nodeReference.node.parent;

  if (!parent) {
    return null;
  }

  const attributes = getAttributes(parent, input);

  for (const tag of tags) {
    if (!tag.attributeMatcher || tag.attributeMatcher(attributes)) {
      return { parser: tag.parser };
    }
  }

  return null;
}

const expressionParser = javascriptParser.configure({
  top: 'SingleExpression',
});

export function configureNesting(tags: NestedLanguageConfig[]) {
  const script: NestedLanguageConfig[] = [];
  const style: NestedLanguageConfig[] = [];
  const textarea: NestedLanguageConfig[] = [];

  for (let tag of tags) {
    const { tag: tagName } = tag;

    const array =
      tagName == 'script'
        ? script
        : tagName == 'style'
        ? style
        : tagName == 'textarea'
        ? textarea
        : null;

    if (!array) {
      throw new RangeError(
        'Only script, style, and textarea tags can host nested parsers'
      );
    }

    array.push(tag);
  }

  return parseMixed((nodeReference, input) => {
    const id = nodeReference.type.id;

    if (id === LongExpression || id === ShortExpression) {
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
