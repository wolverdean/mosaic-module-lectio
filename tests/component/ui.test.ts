import { describe, it, expect, beforeEach, vi } from 'vitest'
import fs   from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uiSrc = fs.readFileSync(path.resolve(__dirname, '../../public/ui.js'), 'utf8')

// ── Pure helpers re-implemented for unit testing ──────────────────────────────

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function fmtDate(d: string | null): string {
  if (!d) return ''
  const today = new Date().toISOString().slice(0, 10)
  return d < today ? `<span class="lr-overdue">${esc(d)}</span>` : `<span>${esc(d)}</span>`
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let t: ReturnType<typeof setTimeout>
  return ((...args: any[]) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }) as T
}

// ── esc() ─────────────────────────────────────────────────────────────────────

describe('esc()', () => {
  it('escapes &, <, >, "', () => {
    expect(esc('<script>&"test"</script>')).toBe('&lt;script&gt;&amp;&quot;test&quot;&lt;/script&gt;')
  })
  it('returns empty string for null/undefined', () => {
    expect(esc(null)).toBe('')
    expect(esc(undefined)).toBe('')
  })
  it('coerces numbers', () => {
    expect(esc(42)).toBe('42')
  })
})

// ── fmtDate() ─────────────────────────────────────────────────────────────────

describe('fmtDate()', () => {
  it('returns empty for null', () => {
    expect(fmtDate(null)).toBe('')
  })
  it('marks past dates', () => {
    expect(fmtDate('2000-01-01')).toContain('lr-overdue')
  })
  it('does not mark future dates', () => {
    expect(fmtDate('2099-12-31')).not.toContain('lr-overdue')
  })
})

// ── debounce() ────────────────────────────────────────────────────────────────

describe('debounce()', () => {
  it('fires once after delay', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const d = debounce(fn, 100)
    d(); d(); d()
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})

// ── Module structure ──────────────────────────────────────────────────────────

describe('ui.js module structure', () => {
  it('wraps code in an IIFE', () => {
    expect(uiSrc).toMatch(/;\(function\s*\(\)/)
  })
  it('calls window.Mosaic.registerModule', () => {
    expect(uiSrc).toContain('window.Mosaic.registerModule')
  })
  it('registers slug as lectio', () => {
    expect(uiSrc).toContain("slug: 'lectio'")
  })
  it('exports init, onActivate, onDeactivate', () => {
    expect(uiSrc).toContain('init(')
    expect(uiSrc).toContain('onActivate(')
    expect(uiSrc).toContain('onDeactivate(')
  })
  it('does not hardcode auth headers', () => {
    expect(uiSrc).not.toContain("'Authorization'")
    expect(uiSrc).not.toContain('"Authorization"')
  })
  it('does not contain inline <script> tags', () => {
    const stripped = uiSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')
    expect((stripped.match(/<script/gi) ?? [])).toHaveLength(0)
  })
})

// ── API endpoints referenced ──────────────────────────────────────────────────

describe('API endpoint references', () => {
  it('references journal endpoints', () => {
    expect(uiSrc).toContain('/journal')
  })
  it('references readings endpoints', () => {
    expect(uiSrc).toContain('/readings/')
  })
  it('references contemplative endpoints', () => {
    expect(uiSrc).toContain('/contemplative/')
  })
  it('references intercessions endpoint', () => {
    expect(uiSrc).toContain('/intercessions')
  })
  it('references ignatian endpoint', () => {
    expect(uiSrc).toContain('/ignatian')
  })
})

// ── State shape ───────────────────────────────────────────────────────────────

describe('state shape', () => {
  it('declares expected state keys', () => {
    expect(uiSrc).toContain('tab:')
    expect(uiSrc).toContain('journalDate:')
    expect(uiSrc).toContain('intercessions:')
    expect(uiSrc).toContain('readingSource:')
    expect(uiSrc).toContain('todayPassage:')
  })
})

// ── Tab coverage ──────────────────────────────────────────────────────────────

describe('tab coverage', () => {
  it('has all 5 tabs', () => {
    expect(uiSrc).toContain("'journal'")
    expect(uiSrc).toContain("'readings'")
    expect(uiSrc).toContain("'prayer'")
    expect(uiSrc).toContain("'contemplative'")
    expect(uiSrc).toContain("'ignatian'")
  })
})
