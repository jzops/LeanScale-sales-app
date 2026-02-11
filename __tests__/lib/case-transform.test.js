const { toSnakeCase, toCamelCase } = require('../../lib/case-transform');

describe('lib/case-transform', () => {
  describe('toSnakeCase', () => {
    test('converts simple camelCase keys', () => {
      expect(toSnakeCase({ firstName: 'John', lastName: 'Doe' }))
        .toEqual({ first_name: 'John', last_name: 'Doe' });
    });

    test('converts nested objects', () => {
      expect(toSnakeCase({ clientInfo: { companyName: 'Acme' } }))
        .toEqual({ client_info: { company_name: 'Acme' } });
    });

    test('converts arrays of objects', () => {
      expect(toSnakeCase([{ firstName: 'A' }, { lastName: 'B' }]))
        .toEqual([{ first_name: 'A' }, { last_name: 'B' }]);
    });

    test('handles nested arrays', () => {
      expect(toSnakeCase({ items: [{ itemName: 'x' }] }))
        .toEqual({ items: [{ item_name: 'x' }] });
    });

    test('returns null as-is', () => {
      expect(toSnakeCase(null)).toBeNull();
    });

    test('returns primitives as-is', () => {
      expect(toSnakeCase('hello')).toBe('hello');
      expect(toSnakeCase(42)).toBe(42);
      expect(toSnakeCase(true)).toBe(true);
    });

    test('returns empty object', () => {
      expect(toSnakeCase({})).toEqual({});
    });

    test('keys already snake_case pass through', () => {
      expect(toSnakeCase({ already_snake: 'yes' }))
        .toEqual({ already_snake: 'yes' });
    });

    test('handles Date objects without recursing', () => {
      const d = new Date('2025-01-01');
      expect(toSnakeCase(d)).toBe(d);
    });
  });

  describe('toCamelCase', () => {
    test('converts simple snake_case keys', () => {
      expect(toCamelCase({ first_name: 'John', last_name: 'Doe' }))
        .toEqual({ firstName: 'John', lastName: 'Doe' });
    });

    test('converts nested objects', () => {
      expect(toCamelCase({ client_info: { company_name: 'Acme' } }))
        .toEqual({ clientInfo: { companyName: 'Acme' } });
    });

    test('converts arrays of objects', () => {
      expect(toCamelCase([{ first_name: 'A' }]))
        .toEqual([{ firstName: 'A' }]);
    });

    test('returns null as-is', () => {
      expect(toCamelCase(null)).toBeNull();
    });

    test('returns primitives as-is', () => {
      expect(toCamelCase(42)).toBe(42);
    });

    test('handles empty object', () => {
      expect(toCamelCase({})).toEqual({});
    });

    test('already camelCase keys pass through', () => {
      expect(toCamelCase({ alreadyCamel: 'yes' }))
        .toEqual({ alreadyCamel: 'yes' });
    });
  });
});
