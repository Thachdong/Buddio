import 'server-only'
import { createHash } from 'node:crypto'

type Severity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'
type Fields = Record<string, unknown>

/**
 * JSON một dòng — Cloud Logging tự đọc `severity`.
 * NFR-27: KHÔNG log email dạng đọc được, nội dung tin, URL ảnh, token. Cần định danh → hashForLog().
 */
function write(severity: Severity, message: string, fields: Fields = {}) {
  const line = JSON.stringify({ severity, message, time: new Date().toISOString(), ...fields })
  if (severity === 'ERROR') console.error(line)
  else console.log(line)
}

export const logger = {
  debug: (msg: string, f?: Fields) => write('DEBUG', msg, f),
  info: (msg: string, f?: Fields) => write('INFO', msg, f),
  warn: (msg: string, f?: Fields) => write('WARNING', msg, f),
  error: (msg: string, err?: unknown, f?: Fields) =>
    write('ERROR', msg, {
      ...f,
      error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
    }),
}

export const hashForLog = (value: string) =>
  createHash('sha256').update(value).digest('hex').slice(0, 12)
