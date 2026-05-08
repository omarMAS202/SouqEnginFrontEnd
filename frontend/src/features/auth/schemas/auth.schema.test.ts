import { describe, expect, it } from 'vitest'

import { loginSchema, registerSchema } from './auth.schema'

describe('auth schemas', () => {
  it('accepts a valid login payload', () => {
    expect(
      loginSchema.safeParse({
        email: 'owner@souqengine.com',
        password: 'Owner123',
      }).success,
    ).toBe(true)
  })

  it('rejects mismatched register passwords', () => {
    expect(
      registerSchema.safeParse({
        username: 'ahmedhassan',
        email: 'owner@souqengine.com',
        password: '12345678',
        confirmPassword: 'Mismatch123',
        agreeToTerms: true,
      }).success,
    ).toBe(false)
  })
})
