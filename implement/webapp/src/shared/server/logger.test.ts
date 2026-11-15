import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger, REDACTED } from './logger'

afterEach(() => vi.restoreAllMocks())

const capture = () => {
  const lines: string[] = []
  vi.spyOn(console, 'log').mockImplementation((l: unknown) => void lines.push(String(l)))
  vi.spyOn(console, 'error').mockImplementation((l: unknown) => void lines.push(String(l)))
  return lines
}

describe('logger (NFR-27)', () => {
  it('AC-4: email và text bị thay bằng [REDACTED], không còn giá trị gốc', () => {
    const lines = capture()
    logger.info('test', { email: 'a@gmail.com', text: 'xin chào', authorization: 'Bearer abc', roomId: 'r1' })
    expect(lines).toHaveLength(1)
    const line = lines[0]
    const json = JSON.parse(line)
    expect(json).toMatchObject({ severity: 'INFO', message: 'test', email: REDACTED, text: REDACTED, authorization: REDACTED, roomId: 'r1' })
    expect(line).not.toContain('a@gmail.com')
    expect(line).not.toContain('xin chào')
    expect(line).not.toContain('Bearer abc')
  })

  it('AC-4: che ở mọi độ sâu và đủ danh sách field của task', () => {
    const lines = capture()
    const fields = { email: 'x', emailNorm: 'x', email_norm: 'x', text: 'x', displayName: 'x', token: 'x', authorization: 'x' }
    logger.error('boom', new Error('e'), { nested: { list: [fields] } })
    const json = JSON.parse(lines[0])
    expect(json.severity).toBe('ERROR')
    expect(json.nested.list[0]).toEqual(Object.fromEntries(Object.keys(fields).map((k) => [k, REDACTED])))
  })
})
