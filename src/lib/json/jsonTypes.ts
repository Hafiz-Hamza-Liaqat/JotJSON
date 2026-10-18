import type { Node as JsoncNode } from 'jsonc-parser';

export type JsonIndent = '2' | '4' | 'tab';

export type JsonNumber = {
  type: 'number';
  token: string;
};

export type JsonString = {
  type: 'string';
  value: string;
  token: string;
};

export type JsonBoolean = {
  type: 'boolean';
  value: boolean;
  token: string;
};

export type JsonNull = {
  type: 'null';
  token: string;
};

export type JsonObject = {
  type: 'object';
  entries: JsonObjectEntry[];
};

export type JsonObjectEntry = {
  key: string;
  value: JsonValue;
};

export type JsonArray = {
  type: 'array';
  items: JsonValue[];
};

export type JsonPrimitive = JsonNumber | JsonString | JsonBoolean | JsonNull;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type JsonDiagnostic = {
  message: string;
  offset: number;
  length: number;
  line: number;
  column: number;
};

export type ValidationError =
  | { kind: 'empty'; message: string }
  | { kind: 'too-large'; message: string; byteLength: number }
  | { kind: 'syntax'; message: string; diagnostic: JsonDiagnostic }
  | { kind: 'processing'; message: string };

export type ValidationSuccess = {
  ok: true;
  source: string;
  tree: JsoncNode;
  value: JsonValue;
};

export type ValidationFailure = {
  ok: false;
  error: ValidationError;
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

export type JsonStatistics = {
  byteLength: number;
  lineCount: number;
  objectKeyCount: number;
  maxDepth: number;
};

export type CompareKind = 'added' | 'removed' | 'changed';

export type JsonDiff = {
  kind: CompareKind;
  path: string;
  originalValue?: string;
  modifiedValue?: string;
  originalType?: string;
  modifiedType?: string;
};

export type SearchScope = 'keys' | 'values' | 'both';

export type SearchMatch = {
  path: string;
  kind: 'key' | 'value';
  matchedText: string;
  valueText: string;
};
