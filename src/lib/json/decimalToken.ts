export type NormalizedDecimal = {
  sign: 1 | -1;
  digits: string;
  exponent: bigint;
};

/**
 * Normalize a JSON numeric token for exact decimal comparison.
 * Equivalent forms such as 1, 1.0, and 1e0 compare equal.
 * Large integers are compared as digit strings, never as JS numbers.
 * Exponents use exact arbitrary-precision integer arithmetic to avoid precision loss.
 */
export function normalizeDecimalToken(token: string): NormalizedDecimal | null {
  const text = token.trim();
  if (text.length === 0) {
    return null;
  }

  let index = 0;
  let sign: 1 | -1 = 1;
  if (text[index] === '-') {
    sign = -1;
    index += 1;
  }

  let intPart = '';
  while (index < text.length && isDigit(text[index]!)) {
    intPart += text[index];
    index += 1;
  }

  let fracPart = '';
  if (text[index] === '.') {
    index += 1;
    while (index < text.length && isDigit(text[index]!)) {
      fracPart += text[index];
      index += 1;
    }
  }

  if (intPart.length === 0 && fracPart.length === 0) {
    return null;
  }
  if (intPart.length === 0) {
    intPart = '0';
  }

  let exponent = 0n;
  if (text[index] === 'e' || text[index] === 'E') {
    index += 1;
    let expNegative = false;
    if (text[index] === '+') {
      index += 1;
    } else if (text[index] === '-') {
      expNegative = true;
      index += 1;
    }
    let expDigits = '';
    while (index < text.length && isDigit(text[index]!)) {
      expDigits += text[index];
      index += 1;
    }
    if (expDigits.length === 0) {
      return null;
    }
    try {
      const parsed = BigInt(expDigits);
      exponent = expNegative ? -parsed : parsed;
    } catch {
      return null;
    }
  }

  if (index !== text.length) {
    return null;
  }

  let digits = intPart + fracPart;
  exponent -= BigInt(fracPart.length);
  digits = digits.replace(/^0+/, '');

  if (digits.length === 0) {
    return { sign: 1, digits: '0', exponent: 0n };
  }

  while (digits.endsWith('0')) {
    digits = digits.slice(0, -1);
    exponent += 1n;
  }

  return { sign, digits, exponent };
}

export function numericTokensEqual(left: string, right: string): boolean {
  const a = normalizeDecimalToken(left);
  const b = normalizeDecimalToken(right);
  if (!a || !b) {
    return left === right;
  }
  return a.sign === b.sign && a.digits === b.digits && a.exponent === b.exponent;
}

function isDigit(character: string): boolean {
  return character >= '0' && character <= '9';
}
