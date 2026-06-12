import fs   from 'node:fs'
import path from 'node:path'
import type Database from 'better-sqlite3'

// ── Lazy-loaded bundles ───────────────────────────────────────────────────────

let _psalms: Record<number, unknown[]> | null = null
function psalmsBundle(): Record<number, unknown[]> {
  if (_psalms === null) {
    const p = path.resolve(__dirname, '../data/psalms-drb.json')
    _psalms = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {}
  }
  return _psalms!
}

let _utmost: Record<string, unknown> | null = null
function utmostBundle(): Record<string, unknown> {
  if (_utmost === null) {
    const p = path.resolve(__dirname, '../data/utmost.json')
    _utmost = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {}
  }
  return _utmost!
}

function pad(n: number): string { return String(n).padStart(2, '0') }

export function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// ── 24-hour SQLite cache ──────────────────────────────────────────────────────

export async function getCached<T>(db: Database.Database, key: string, fetchFn: () => Promise<T>): Promise<T> {
  const row = db.prepare('SELECT content, fetched_at FROM lectio_reading_cache WHERE key = ?').get(key) as any
  if (row && (row.fetched_at as string).slice(0, 10) === todayKey()) {
    return JSON.parse(row.content) as T
  }
  const data = await fetchFn()
  db.prepare(`
    INSERT INTO lectio_reading_cache (key, content, fetched_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET content = excluded.content, fetched_at = excluded.fetched_at
  `).run(key, JSON.stringify(data))
  return data
}

// ── Shared HTML cleaner ───────────────────────────────────────────────────────

export function cleanHtml(html: string): string {
  return html
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"').replace(/&mdash;/g, '—')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#[0-9]+;/g, '')
    .replace(/\s+/g, ' ').trim()
}

// ── Sacred Space ──────────────────────────────────────────────────────────────

export async function fetchSacredSpace(): Promise<unknown> {
  const d    = new Date()
  const yyyy = d.getFullYear()
  const mm   = pad(d.getMonth() + 1)
  const dd   = pad(d.getDate())
  const url  = `https://sacredspace.com/daily-prayer/${yyyy}-${mm}-${dd}/print/`
  const res  = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Lectio/1.0)' } })
  if (!res.ok) throw new Error(`Sacred Space returned ${res.status}`)
  const html = await res.text()

  function extractSection(name: string): string {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const m = html.match(new RegExp(`<h3[^>]*>${escaped}<\\/h3>([\\s\\S]*?)(?=<h3|Printed from)`, 'i'))
    if (!m) return ''
    return cleanHtml(
      m[1]
        .replace(/<div[^>]*id="scripture-copyright[^"]*"[\s\S]*?<\/div>/g, '')
        .replace(/<div[^>]*>[\s\S]*?<\/div>/g, '')
    )
  }

  const scriptureRef = (html.match(/<h3[^>]*>The Word of God<\/h3><strong>(.*?)<\/strong>/) || [])[1] || ''
  const sections = {
    presence:      extractSection('Presence'),
    freedom:       extractSection('Freedom'),
    consciousness: extractSection('Consciousness'),
    word_of_god:   extractSection('The Word of God'),
    inspiration:   extractSection('Inspiration'),
    conversation:  extractSection('Conversation'),
    conclusion:    extractSection('Conclusion'),
  }
  if (!sections.inspiration && !sections.word_of_god) throw new Error('Could not parse Sacred Space content')

  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return {
    date: dateStr,
    scripture: cleanHtml(scriptureRef),
    sections,
    source: 'Sacred Space · Irish Jesuits',
    url: `https://sacredspace.com/daily-prayer/${yyyy}-${mm}-${dd}/`,
  }
}

// ── My Utmost for His Highest ─────────────────────────────────────────────────

export async function fetchUtmost(useLocal = true): Promise<unknown> {
  const today = new Date()
  const mmdd  = `${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  if (useLocal) {
    const bundle = utmostBundle()
    if (bundle[mmdd]) return { ...bundle[mmdd], source: 'My Utmost for His Highest · Oswald Chambers' }
  }

  const url = 'https://utmost.org/modern-classic/today/'
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Lectio/1.0)' } })
  if (!res.ok) throw new Error(`utmost.org returned ${res.status}`)
  const html = await res.text()

  const titleMatch = html.match(/<h1[^>]+class="[^"]*elementor-heading-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/)
  const title = titleMatch ? cleanHtml(titleMatch[1]) : 'My Utmost for His Highest'

  const pChunks      = html.split('</p>')
  const scripturePara = pChunks.find(c => c.includes('biblegateway.com'))
  const spStart       = scripturePara ? scripturePara.lastIndexOf('<p') : -1
  const scripture     = spStart >= 0 ? cleanHtml(scripturePara!.slice(spStart)) : ''

  const postStart = html.indexOf('data-widget_type="theme-post-content.default"')
  let content = ''
  if (postStart > 0) {
    const containerStart = html.indexOf('<div class="elementor-widget-container">', postStart)
    const chunk = html.slice(containerStart, containerStart + 8000)
    const paras = [...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    content = paras.map(m => cleanHtml(m[1])).filter(p => p.length > 30).join('\n\n')
  }

  if (!content) throw new Error('Could not parse content from utmost.org')
  return { title, scripture, content, source: 'My Utmost for His Highest · Oswald Chambers', url }
}

// ── Daily Psalm ───────────────────────────────────────────────────────────────

export async function fetchPsalm(useLocal = true): Promise<unknown> {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const epoch = new Date('2024-01-01T00:00:00')
  const psalmNum = (Math.floor((today.getTime() - epoch.getTime()) / 86400000) % 150) + 1
  const dateStr  = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (useLocal) {
    const bundle = psalmsBundle()
    if (bundle[psalmNum]) {
      return { date: dateStr, psalmNumber: psalmNum, reference: `Psalm ${psalmNum}`, verses: bundle[psalmNum], translation: 'Douay-Rheims 1899', source: 'Psalms · Douay-Rheims 1899' }
    }
  }

  const url = `https://bolls.life/get-chapter/DRB/19/${psalmNum}/`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Lectio/1.0)' } })
  if (!res.ok) throw new Error(`bolls.life returned ${res.status}`)
  const verses = await res.json() as any[]
  return { date: dateStr, psalmNumber: psalmNum, reference: `Psalm ${psalmNum}`, verses: verses.map(v => ({ verse: v.verse, text: v.text.trim() })), translation: 'Douay-Rheims 1899', source: 'Psalms · Douay-Rheims 1899' }
}

// ── Catholic / Universalis ────────────────────────────────────────────────────

export async function fetchCatholic(dateStr?: string): Promise<Record<string, unknown>> {
  const url = dateStr ? `https://universalis.com/${dateStr}/mass.htm` : 'https://universalis.com/mass.htm'
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Lectio/1.0)' } })
  if (!res.ok) throw new Error(`Universalis returned ${res.status}`)
  const html = await res.text()

  const titleMatch = html.match(/<title>([^<]+)/)
  const feast = titleMatch ? titleMatch[1].replace(/\s*[-–|].*$/, '').trim() : ''

  const KEEP      = /^(first reading|second reading|responsorial psalm|gospel)$/i
  const SKIP_SECT = /^(gospel acclamation|or:|sequence)/i

  const readings: unknown[] = []
  const chunks = html.split(/<table class="each"[^>]*>/)
  for (let i = 1; i < chunks.length; i++) {
    const tableEnd = chunks[i].indexOf('</table>')
    if (tableEnd < 0) continue
    const tableHtml  = chunks[i].slice(0, tableEnd)
    const leftTh     = (tableHtml.match(/<th[^>]*align="left"[^>]*>([\s\S]*?)<\/th>/)  || [])[1] || ''
    const rightTh    = (tableHtml.match(/<th[^>]*align="right"[^>]*>([\s\S]*?)<\/th>/) || [])[1] || ''
    const heading    = cleanHtml(leftTh)
    const reference  = cleanHtml(rightTh)
    if (!KEEP.test(heading) || SKIP_SECT.test(heading)) continue

    const rest       = chunks[i].slice(tableEnd + 8)
    const contentEnd = rest.search(/<table class="each"|<div class="audioclip"|<hr class="shortrule"|<p class="rubric"/)
    const snippet    = contentEnd >= 0 ? rest.slice(0, contentEnd) : rest
    const subtitle   = (snippet.match(/<h4[^>]*>([\s\S]*?)<\/h4>/) || [])[1]
    const lines      = [...snippet.matchAll(/<div class="[pvi][^"]*">([\s\S]*?)<\/div>/g)].map(m => cleanHtml(m[1])).filter(l => l.length > 0)
    const body       = lines.join('\n')
    const label      = reference ? `${heading} · ${reference}` : heading
    if (body) readings.push({ heading: label, subtitle: subtitle ? cleanHtml(subtitle) : '', body: body.slice(0, 3000) })
  }

  if (!readings.length) throw new Error('Could not parse readings from Universalis')
  return { feast, readings, source: 'Universalis · Catholic Daily Readings', url: 'https://universalis.com/mass.htm' }
}

// ── Greek Orthodox / orthocal.info ────────────────────────────────────────────

export async function fetchOrthodox(): Promise<unknown> {
  const d    = new Date()
  const yyyy = d.getFullYear()
  const mm   = pad(d.getMonth() + 1)
  const dd   = pad(d.getDate())

  const r = await fetch(`https://orthocal.info/api/gregorian/${yyyy}/${mm}/${dd}/`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Lectio/1.0)' },
  })
  if (!r.ok) throw new Error(`orthocal.info returned ${r.status}`)
  const ortho = await r.json() as any

  const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  const readings = (ortho.readings || []).map((reading: any) => {
    const paragraphs: { verse: number; text: string }[][] = []
    let current: { verse: number; text: string }[] = []
    for (const v of (reading.passage || [])) {
      if (v.paragraph_start && current.length) { paragraphs.push(current); current = [] }
      current.push({ verse: v.verse, text: v.content })
    }
    if (current.length) paragraphs.push(current)
    return { source: reading.source, display: reading.display, description: reading.description || '', paragraphs }
  })

  const stories = (ortho.stories || []).map((s: any) => ({ title: s.title, story: cleanHtml(s.story || '') }))

  return {
    date: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    weekday: WEEKDAYS[ortho.weekday] || '',
    titles: ortho.titles || [],
    tone: ortho.tone,
    feastLevel: ortho.feast_level,
    feastLevelDesc: ortho.feast_level_description || '',
    fastLevel: ortho.fast_level,
    fastLevelDesc: ortho.fast_level_desc || 'No Fast',
    saints: ortho.saints || [],
    readings,
    stories,
  }
}

// ── Universalis Liturgy of the Hours ─────────────────────────────────────────

async function parseUniversalisOffice(officePath: string): Promise<{ heading: string; text: string }[]> {
  const res = await fetch(`http://universalis.com/${officePath}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Lectio/1.0)' },
  })
  if (!res.ok) return []
  const html    = await res.text()
  const sections: { heading: string; text: string }[] = []
  const chunks  = html.split(/<table class="each"[^>]*>/)
  for (let i = 1; i < chunks.length; i++) {
    const tableEnd = chunks[i].indexOf('</table>')
    if (tableEnd < 0) continue
    const tableHtml = chunks[i].slice(0, tableEnd)
    const heading   = cleanHtml((tableHtml.match(/<th[^>]*align="left"[^>]*>([\s\S]*?)<\/th>/) || [])[1] || '')
    const rest      = chunks[i].slice(tableEnd + 8)
    const contentEnd = rest.search(/<table class="each"|<div class="audioclip"|<hr class="shortrule"/)
    const snippet   = contentEnd >= 0 ? rest.slice(0, contentEnd) : rest
    const lines     = [...snippet.matchAll(/<div class="[pvi][^"]*">([\s\S]*?)<\/div>/g)].map(m => cleanHtml(m[1])).filter(l => l.length > 0)
    if (heading && lines.length) sections.push({ heading, text: lines.join('\n') })
  }
  return sections
}

async function fetchRCSaints(): Promise<unknown[]> {
  const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  const listRes = await fetch('https://www.catholic.org/saints/sofd.php', { headers })
  if (!listRes.ok) throw new Error(`Catholic.org returned ${listRes.status}`)
  const listHtml = await listRes.text()

  const sofdIdx = listHtml.indexOf('id="saintsSofd"')
  if (sofdIdx < 0) return []
  const moreIdx = listHtml.indexOf('More Saints', sofdIdx)
  const chunk   = listHtml.slice(sofdIdx, moreIdx > 0 ? moreIdx : sofdIdx + 4000)

  const saintMatch = chunk.match(/saint\.php\?saint_id=(\d+)"[^>]*>([^<]+)<\/a>/i)
  if (!saintMatch) return []
  const saintId = saintMatch[1]
  const name    = cleanHtml(saintMatch[2]).trim()
  const link    = `https://www.catholic.org/saints/saint.php?saint_id=${saintId}`

  let bio = ''
  try {
    const detailRes = await fetch(link, { headers })
    if (detailRes.ok) {
      const detailHtml    = await detailRes.text()
      const contentStart  = detailHtml.indexOf('id="saintContent"')
      const contentEnd    = detailHtml.indexOf('id="saintWiki"')
      if (contentStart >= 0) {
        const range = contentEnd > contentStart ? detailHtml.slice(contentStart, contentEnd) : detailHtml.slice(contentStart, contentStart + 8000)
        const paras = [...range.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
        bio = paras.map(m => cleanHtml(m[1])).filter(p => p.length > 5).join('\n\n')
      }
    }
  } catch { /* fall through with empty bio */ }

  return [{ name, bio, link, tradition: 'rc' }]
}

const ROSARY_MYSTERIES: Record<string, unknown> = {
  joyful:    { name: 'Joyful Mysteries',    days: 'Monday & Saturday',   mysteries: [{ n:1, name:'The Annunciation',              fruit:'Humility',              ref:'Lk 1:26–38' },{ n:2, name:'The Visitation',                fruit:'Love of Neighbor',      ref:'Lk 1:39–56' },{ n:3, name:'The Nativity',                  fruit:'Poverty of Spirit',     ref:'Lk 2:1–20'  },{ n:4, name:'The Presentation in the Temple',fruit:'Obedience',             ref:'Lk 2:22–38' },{ n:5, name:'The Finding in the Temple',     fruit:'Joy in Finding Jesus',  ref:'Lk 2:41–52' }] },
  luminous:  { name: 'Luminous Mysteries',  days: 'Thursday',            mysteries: [{ n:1, name:'The Baptism of Jesus',           fruit:'Openness to the Spirit',ref:'Mt 3:13–17'  },{ n:2, name:'The Wedding at Cana',           fruit:'To Jesus through Mary', ref:'Jn 2:1–11'  },{ n:3, name:'Proclamation of the Kingdom',  fruit:'Repentance',            ref:'Mk 1:14–15' },{ n:4, name:'The Transfiguration',           fruit:'Desire for Holiness',   ref:'Lk 9:28–36' },{ n:5, name:'Institution of the Eucharist', fruit:'Eucharistic Adoration', ref:'Mt 26:26–28' }] },
  sorrowful: { name: 'Sorrowful Mysteries', days: 'Tuesday & Friday',    mysteries: [{ n:1, name:'The Agony in the Garden',        fruit:'Contrition',            ref:'Lk 22:39–46' },{ n:2, name:'The Scourging at the Pillar',  fruit:'Mortification',         ref:'Jn 19:1'    },{ n:3, name:'The Crowning with Thorns',      fruit:'Moral Courage',         ref:'Mt 27:27–31' },{ n:4, name:'The Carrying of the Cross',     fruit:'Patience',              ref:'Lk 23:26–32' },{ n:5, name:'The Crucifixion and Death',     fruit:'Perseverance',          ref:'Lk 23:33–46' }] },
  glorious:  { name: 'Glorious Mysteries',  days: 'Wednesday & Sunday',  mysteries: [{ n:1, name:'The Resurrection',               fruit:'Faith',                 ref:'Mk 16:1–8'  },{ n:2, name:'The Ascension',                 fruit:'Hope',                  ref:'Acts 1:6–11' },{ n:3, name:'Descent of the Holy Spirit',   fruit:'Love of God',           ref:'Acts 2:1–13' },{ n:4, name:'The Assumption of Mary',        fruit:'Grace of a Happy Death',ref:'Rev 12:1'   },{ n:5, name:'The Coronation of Mary',        fruit:"Trust in Mary's Prayer",ref:'Rev 12:1'   }] },
}
const ROSARY_BY_DOW = ['glorious','joyful','sorrowful','glorious','luminous','sorrowful','joyful']

export async function fetchPractices(): Promise<unknown> {
  const d   = new Date()
  const yyyy = d.getFullYear()
  const mm   = pad(d.getMonth() + 1)
  const dd   = pad(d.getDate())
  const dow  = d.getDay()

  const [orthoResult, rcSaintsResult, laudsResult, middayResult, vespersResult, complineResult] = await Promise.allSettled([
    fetch(`https://orthocal.info/api/gregorian/${yyyy}/${mm}/${dd}/`, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Lectio/1.0)' } }).then(r => r.ok ? r.json() : null),
    fetchRCSaints(),
    parseUniversalisOffice('lauds.htm'),
    parseUniversalisOffice('sext.htm'),
    parseUniversalisOffice('vespers.htm'),
    parseUniversalisOffice('compline.htm'),
  ])

  const ortho    = orthoResult.status    === 'fulfilled' ? orthoResult.value    : null
  const rcSaints = rcSaintsResult.status === 'fulfilled' ? rcSaintsResult.value : []
  const liturgy  = {
    lauds:    laudsResult.status    === 'fulfilled' ? laudsResult.value    : [],
    midday:   middayResult.status   === 'fulfilled' ? middayResult.value   : [],
    vespers:  vespersResult.status  === 'fulfilled' ? vespersResult.value  : [],
    compline: complineResult.status === 'fulfilled' ? complineResult.value : [],
  }

  const paschaDistance = (ortho as any)?.pascha_distance ?? null
  const goFastLevel    = (ortho as any)?.fast_level ?? 0

  let rcFast: string | null = null
  if (paschaDistance === -46 || paschaDistance === -2) rcFast = 'fast'
  else if (dow === 5) rcFast = 'abstinence'

  const goStories = ((ortho as any)?.stories || []).map((s: any) => ({ title: s.title, bio: cleanHtml(s.story || ''), tradition: 'go' }))

  return {
    date: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    liturgicalTitle: (ortho as any)?.titles?.[0] || '',
    rcSaints,
    allSaints: [...(rcSaints as any[]), ...goStories],
    rcFast,
    goFastLevel,
    goFastDesc: (ortho as any)?.fast_level_desc ?? 'No Fast',
    liturgy,
    rosary: ROSARY_MYSTERIES[ROSARY_BY_DOW[dow]],
    rosaryKey: ROSARY_BY_DOW[dow],
  }
}

// ── Overnight archive ─────────────────────────────────────────────────────────

export async function archiveDailyReadings(db: Database.Database): Promise<void> {
  const date = todayKey()
  const SOURCES = [
    { key: `catholic-${date}`,     fn: fetchCatholic,    label: 'Catholic'     },
    { key: `sacred-space-${date}`, fn: fetchSacredSpace, label: 'Sacred Space' },
    { key: `utmost-${date}`,       fn: fetchUtmost,      label: 'Utmost'       },
    { key: `psalm-${date}`,        fn: fetchPsalm,       label: 'Psalm'        },
    { key: `orthodox-${date}`,     fn: fetchOrthodox,    label: 'Orthodox'     },
    { key: `practices-${date}`,    fn: fetchPractices,   label: 'Practices'    },
  ]

  for (const { key, fn, label } of SOURCES) {
    try {
      const row = db.prepare('SELECT key FROM lectio_reading_cache WHERE key = ?').get(key)
      if (!row) await getCached(db, key, fn)
      console.log(`[lectio:archive] ${label}: stored`)
    } catch (e: any) {
      console.error(`[lectio:archive] ${label} failed: ${e.message}`)
    }
  }
}
