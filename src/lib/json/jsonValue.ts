import type { Node as JsoncNode } from 'jsonc-parser';
import type { JsonValue } from './jsonTypes';

export function jsoncNodeToValue(source: string, node: JsoncNode): JsonValue {
  switch (node.type) {
    case 'object': {
      const entries = [];
      for (const child of node.children ?? []) {
        if (child.type !== 'property' || !child.children || child.children.length < 2) {
          throw new Error('Invalid object property in syntax tree.');
        }
        const keyNode = child.children[0];
        const valueNode = child.children[1];
        if (!keyNode || !valueNode) {
          throw new Error('Invalid object property in syntax tree.');
        }
        const key = typeof keyNode.value === 'string' ? keyNode.value : '';
        entries.push({ key, value: jsoncNodeToValue(source, valueNode) });
      }
      return { type: 'object', entries };
    }
    case 'array':
      return {
        type: 'array',
        items: (node.children ?? []).map((child) => jsoncNodeToValue(source, child)),
      };
    case 'string':
      return {
        type: 'string',
        value: typeof node.value === 'string' ? node.value : '',
        token: sliceToken(source, node),
      };
    case 'number':
      return {
        type: 'number',
        token: sliceToken(source, node),
      };
    case 'boolean':
      return {
        type: 'boolean',
        value: node.value === true,
        token: sliceToken(source, node),
      };
    case 'null':
      return {
        type: 'null',
        token: sliceToken(source, node),
      };
    default:
      throw new Error(`Unsupported JSON syntax node: ${node.type}`);
  }
}

export function jsonValueToText(value: JsonValue): string {
  switch (value.type) {
    case 'number':
    case 'boolean':
    case 'null':
      return value.token;
    case 'string':
      return value.token;
    case 'array':
      return `[${value.items.map(jsonValueToText).join(',')}]`;
    case 'object':
      return `{${value.entries
        .map((entry) => `${JSON.stringify(entry.key)}:${jsonValueToText(entry.value)}`)
        .join(',')}}`;
  }
}

export function jsonTypeName(value: JsonValue): string {
  return value.type;
}

function sliceToken(source: string, node: JsoncNode): string {
  return source.slice(node.offset, node.offset + node.length);
}
