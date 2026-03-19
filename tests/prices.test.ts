import { describe, expect, test } from 'bun:test'
import { formatPrice, jpyToUsd } from '~/services/prices.ts'

describe('Price utilities', () => {
  test('formatPrice formats JPY correctly', () => {
    expect(formatPrice(15000, 'JPY')).toBe('¥15,000')
    expect(formatPrice(0, 'JPY')).toBe('¥0')
    expect(formatPrice(100, 'JPY')).toBe('¥100')
  })

  test('formatPrice formats USD correctly', () => {
    expect(formatPrice(1999, 'USD')).toBe('$19.99')
    expect(formatPrice(100, 'USD')).toBe('$1.00')
    expect(formatPrice(50, 'USD')).toBe('$0.50')
  })

  test('jpyToUsd converts at expected rate', () => {
    const result = jpyToUsd(15000)
    expect(result).toBe(100)
  })

  test('jpyToUsd handles zero', () => {
    expect(jpyToUsd(0)).toBe(0)
  })

  test('jpyToUsd rounds to 2 decimal places', () => {
    const result = jpyToUsd(1)
    // 1 / 150 = 0.006666... → rounds to 0.01
    expect(result).toBe(0.01)
  })
})
