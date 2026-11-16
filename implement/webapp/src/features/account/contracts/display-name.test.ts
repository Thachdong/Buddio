import { describe, expect, it } from 'vitest'
import { normalizeDisplayName } from './display-name'

describe('normalizeDisplayName (BR-29, FLOW-01 E2)', () => {
  it('AC-7: thiếu tên / null / chỉ khoảng trắng → phần trước "@" của email', () => {
    expect(normalizeDisplayName(null, 'noname@gmail.com')).toBe('noname')
    expect(normalizeDisplayName(undefined, 'noname@gmail.com')).toBe('noname')
    expect(normalizeDisplayName('   ', 'noname@gmail.com')).toBe('noname')
  })

  it('AC-8: tên 60 ký tự → cắt còn đúng 50 ký tự đầu', () => {
    const long = 'Nguyễn'.repeat(10) // 60 ký tự
    expect(Array.from(long)).toHaveLength(60)
    const r = normalizeDisplayName(long, 'x@gmail.com')
    expect(Array.from(r)).toHaveLength(50)
    expect(long.startsWith(r)).toBe(true)
  })

  it('trim khoảng trắng hai đầu', () => {
    expect(normalizeDisplayName('  Bình Trần  ', 'b@gmail.com')).toBe('Bình Trần')
  })
})
