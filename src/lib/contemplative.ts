import path from 'node:path'

export const VALID_SOURCES = ['cloud', 'cassian', 'merton', 'keating'] as const
export type ContemplativeSource = typeof VALID_SOURCES[number]

export const SOURCE_META: Record<ContemplativeSource, { label: string; period: string }> = {
  cloud:   { label: 'The Cloud of Unknowing', period: '14th century, Anonymous' },
  cassian: { label: 'John Cassian',           period: 'c. 360–435' },
  merton:  { label: 'Thomas Merton',          period: '1915–1968' },
  keating: { label: 'Thomas Keating',         period: '1923–2018' },
}

export interface Passage {
  id:         string
  source:     ContemplativeSource
  sourceMeta: { label: string; period: string }
  [key: string]: unknown
}

const _passages: Record<ContemplativeSource, Passage[]> = {} as any
let _all: Passage[] | null = null

function loadPassages(): Record<ContemplativeSource, Passage[]> {
  if (_all !== null) return _passages
  const dataDir = path.resolve(__dirname, '../data/contemplative')
  const fileMap: Record<ContemplativeSource, string> = {
    cloud:   'cloud-of-unknowing.json',
    cassian: 'cassian.json',
    merton:  'merton.json',
    keating: 'keating.json',
  }
  for (const src of VALID_SOURCES) {
    const raw = require(path.join(dataDir, fileMap[src]))
    _passages[src] = (raw as any[]).map(p => ({ ...p, source: src, sourceMeta: SOURCE_META[src] }))
  }
  _all = [
    ..._passages.cloud,
    ..._passages.cassian,
    ..._passages.merton,
    ..._passages.keating,
  ]
  return _passages
}

export function getAllPassages(): Passage[] {
  if (_all === null) loadPassages()
  return _all!
}

export function getPassagesBySource(): Record<ContemplativeSource, Passage[]> {
  loadPassages()
  return _passages
}

export function getTodayPassage(): Passage {
  const all = getAllPassages()
  const now   = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return all[dayOfYear % all.length]
}
