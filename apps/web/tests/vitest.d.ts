/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

import type { Assertion, AsymmetricMatchersContaining } from 'vitest'

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R
  toHaveTextContent(text: string | RegExp): R
  toHaveProperty(property: string, value?: unknown): R
  toContain(value: unknown): R
  toMatch(value: string | RegExp): R
  toHaveLength(length: number): R
  toBeGreaterThan(value: number): R
  toBeCloseTo(value: number, precision?: number): R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}