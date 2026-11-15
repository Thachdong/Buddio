import 'server-only'
import { createHash } from 'node:crypto'

type Severity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'
type Fields = Record<string, unknown>

/** NFR-27: field có tên trong danh sách này bị thay bằng [REDACTED] ở mọi độ sâu. */
const REDACT_KEYS = new Set(
  ['email', 'emailNorm', 'email_norm', 'text', 'displayName', 'display_name', 'token', 'idToken', 'authorization', 'cookie', 'photoUrl', 'photo_url']
    .map((k) => k.toLowerCase()),
)
export const REDACTED = '[REDACTED]'

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8 || value === null || typeof value !== 'object') return value
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack }
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1))
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, REDACT_KEYS.has(k.toLowerCase()) ? REDACTED : redact(v, depth + 1)]),
  )
}

/**
 * JSON một dòng — Cloud Logging tự đọc `severity`.
 * KHÔNG đưa dữ liệu người dùng vào `message`; để vào fields (sẽ được che) hoặc dùng hashForLog().
 */
function write(severity: Severity, message: string, fields: Fields = {}) {
  const line = JSON.stringify({ severity, message, time: new Date().toISOString(), ...(redact(fields) as Fields) })
  if (severity === 'ERROR') console.error(line)
  else console.log(line)
}

export const logger = {
  debug: (msg: string, f?: Fields) => write('DEBUG', msg, f),
  info: (msg: string, f?: Fields) => write('INFO', msg, f),
  warn: (msg: string, f?: Fields) => write('WARNING', msg, f),
  error: (msg: string, err?: unknown, f?: Fields) => write('ERROR', msg, { ...f, error: err }),
}

export const hashForLog = (value: string) =>
  createHash('sha256').update(value).digest('hex').slice(0, 12)
