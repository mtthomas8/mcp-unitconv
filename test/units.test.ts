import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert, dimensionOf, supportedUnits, supportedUnitsByDimension } from '../src/units.ts';

function closeTo(actual: number, expected: number, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) < epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );
}

test('length conversions', () => {
  assert.equal(convert(1, 'km', 'm').value, 1000);
  closeTo(convert(1, 'mi', 'ft').value, 5280);
  closeTo(convert(1, 'in', 'cm').value, 2.54);
  closeTo(convert(1000, 'm', 'km').value, 1);
});

test('mass conversions', () => {
  assert.equal(convert(1, 'kg', 'g').value, 1000);
  closeTo(convert(1, 'lb', 'oz').value, 16);
});

test('time conversions', () => {
  assert.equal(convert(1, 'h', 'min').value, 60);
  assert.equal(convert(1, 'd', 'h').value, 24);
  assert.equal(convert(1000, 'ms', 's').value, 1);
});

test('volume conversions', () => {
  assert.equal(convert(1, 'm3', 'l').value, 1000);
  closeTo(convert(1, 'gal', 'qt').value, 4);
  closeTo(convert(1000, 'ml', 'l').value, 1);
});

test('area conversions', () => {
  assert.equal(convert(1, 'km2', 'm2').value, 1000000);
  assert.equal(convert(1, 'ha', 'm2').value, 10000);
  closeTo(convert(1, 'acre', 'ft2').value, 43560, 1e-6);
});

test('temperature conversions', () => {
  closeTo(convert(100, 'C', 'F').value, 212);
  closeTo(convert(32, 'F', 'C').value, 0);
  closeTo(convert(0, 'C', 'K').value, 273.15);
  closeTo(convert(273.15, 'K', 'C').value, 0);
  closeTo(convert(212, 'F', 'K').value, 373.15);
});

test('converting a unit to itself is a no-op', () => {
  assert.equal(convert(42, 'm', 'm').value, 42);
  assert.equal(convert(20, 'C', 'C').value, 20);
});

test('result carries the dimension it was resolved through', () => {
  assert.equal(convert(1, 'km', 'm').dimension, 'length');
  assert.equal(convert(1, 'kg', 'g').dimension, 'mass');
  assert.equal(convert(1, 'h', 's').dimension, 'time');
  assert.equal(convert(0, 'C', 'F').dimension, 'temperature');
});

test('dimension mismatch is rejected', () => {
  assert.throws(() => convert(1, 'km', 'kg'), /dimension mismatch/);
  assert.throws(() => convert(1, 's', 'm'), /dimension mismatch/);
});

test('unknown units are rejected', () => {
  assert.throws(() => convert(1, 'parsec', 'm'), /unknown unit: parsec/);
  assert.throws(() => convert(1, 'm', 'parsec'), /unknown unit: parsec/);
});

test('a temperature unit cannot mix with a non-temperature unit', () => {
  assert.throws(() => convert(1, 'C', 'm'));
});

test('non-finite values are rejected', () => {
  assert.throws(() => convert(NaN, 'm', 'km'), /finite number/);
  assert.throws(() => convert(Infinity, 'm', 'km'), /finite number/);
});

test('dimensionOf resolves known units and rejects unknown ones', () => {
  assert.equal(dimensionOf('km'), 'length');
  assert.equal(dimensionOf('g'), 'mass');
  assert.equal(dimensionOf('h'), 'time');
  assert.equal(dimensionOf('C'), null);
  assert.equal(dimensionOf('parsec'), null);
});

test('supportedUnits lists every convertible unit exactly once', () => {
  const units = supportedUnits();
  assert.equal(new Set(units).size, units.length);
  for (const u of ['m', 'km', 'g', 'kg', 's', 'h', 'C', 'F', 'K']) {
    assert.ok(units.includes(u), `missing ${u}`);
  }
});

test('supportedUnitsByDimension groups units under their dimension', () => {
  const grouped = supportedUnitsByDimension();
  assert.deepEqual(Object.keys(grouped).sort(), [
    'area',
    'length',
    'mass',
    'temperature',
    'time',
    'volume',
  ]);
  assert.ok(grouped.length.includes('km'));
  assert.ok(grouped.mass.includes('kg'));
  assert.deepEqual(grouped.temperature, ['C', 'F', 'K']);
  for (const unit of grouped.length) assert.equal(dimensionOf(unit), 'length');
});

test('supportedUnitsByDimension and supportedUnits agree on the full set', () => {
  const flatFromGroups = Object.values(supportedUnitsByDimension()).flat();
  assert.deepEqual([...flatFromGroups].sort(), [...supportedUnits()].sort());
});
