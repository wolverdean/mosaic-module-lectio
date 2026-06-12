;(function () {
  'use strict'

  // ── Utilities ───────────────────────────────────────────────────────────────

  function esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  }

  function fmtDate(d) {
    if (!d) return ''
    const today = new Date().toISOString().slice(0,10)
    return d < today
      ? `<span class="lr-overdue">${esc(d)}</span>`
      : `<span class="lr-date">${esc(d)}</span>`
  }

  function todayStr() {
    return new Date().toISOString().slice(0,10)
  }

  function debounce(fn, ms) {
    let t
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
  }

  // ── State ───────────────────────────────────────────────────────────────────

  const state = {
    tab: 'journal',
    // Journal
    journalDate: todayStr(),
    journalContent: '',
    journalIsJson: false,
    journalFields: {},
    journalHistory: [],
    journalHistoryOpen: false,
    journalSaving: false,
    // Readings
    readingSource: 'sacred-space',
    readingData: null,
    readingLoading: false,
    readingReflectionField: null,
    // Prayer
    practices: null,
    practicesLoading: false,
    intercessions: [],
    intercessionsLoading: false,
    practiceSection: 'offices',
    // Contemplative
    todayPassage: null,
    contemplativeReflection: '',
    contemplativeSaving: false,
    libraryOpen: false,
    librarySource: '',
    libraryData: null,
    // Ignatian
    ignatianData: null,
    ignatian18Data: null,
    ignatianTab: '19',
    ignatianStartDate: todayStr(),
  }

  const JOURNAL_FIELDS = [
    ['general_notes',          'Journal'],
    ['how',                    'How do you come today?'],
    ['desire',                 'What is your desire today?'],
    ['morning_reflection',     'Morning Prayer'],
    ['midday_reflection',      'Midday Prayer'],
    ['night_reflection',       'Night Prayer'],
    ['reflection',             'Reflection'],
    ['examen_gratitude',       'Gratitude'],
    ['examen_light',           'Ask for Light'],
    ['examen_review',          'Review the Day'],
    ['examen_shortcomings',    'Face Your Shortcomings'],
    ['examen_forward',         'Look Forward'],
    ['sacredspace_reflection', 'Sacred Space Reflection'],
    ['utmost_reflection',      'My Utmost Reflection'],
    ['psalm_reflection',       'Psalm Reflection'],
    ['orthodox_reflection',    'Orthodox Reflection'],
  ]

  const READING_SOURCES = [
    { id: 'sacred-space', label: 'Sacred Space', field: 'sacredspace_reflection' },
    { id: 'utmost',       label: 'My Utmost',    field: 'utmost_reflection' },
    { id: 'psalm',        label: 'Daily Psalm',  field: 'psalm_reflection' },
    { id: 'catholic',     label: 'Catholic',     field: null },
    { id: 'orthodox',     label: 'Orthodox',     field: 'orthodox_reflection' },
    { id: 'practices',    label: 'Practices',    field: null },
  ]

  // ── Styles ──────────────────────────────────────────────────────────────────

  const CSS = `
    .lr-wrap { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 16px; color: #1a1a1a; }
    .lr-tabs { display: flex; gap: 4px; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px; flex-wrap: wrap; }
    .lr-tab { padding: 8px 16px; border: none; background: none; cursor: pointer; color: #6b7280; font-size: 14px; border-bottom: 2px solid transparent; margin-bottom: -2px; font-weight: 500; }
    .lr-tab.active { color: #4f46e5; border-bottom-color: #4f46e5; }
    .lr-tab:hover:not(.active) { color: #374151; }
    .lr-panel { display: none; }
    .lr-panel.active { display: block; }
    .lr-row { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
    .lr-btn { padding: 7px 14px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; font-size: 13px; color: #374151; }
    .lr-btn:hover { background: #f9fafb; }
    .lr-btn.primary { background: #4f46e5; color: #fff; border-color: #4f46e5; }
    .lr-btn.primary:hover { background: #4338ca; }
    .lr-btn.danger { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }
    .lr-btn.sm { padding: 4px 10px; font-size: 12px; }
    .lr-btn.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }
    .lr-input { padding: 7px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; width: 100%; box-sizing: border-box; }
    .lr-textarea { padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; width: 100%; box-sizing: border-box; resize: vertical; min-height: 80px; font-family: inherit; }
    .lr-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; display: block; }
    .lr-field-group { margin-bottom: 16px; }
    .lr-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .lr-card h3 { margin: 0 0 8px; font-size: 15px; color: #111827; }
    .lr-card p { margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6; }
    .lr-prose { font-size: 14px; color: #374151; line-height: 1.7; white-space: pre-wrap; }
    .lr-section-title { font-size: 18px; font-weight: 700; margin: 0 0 16px; color: #111827; }
    .lr-sub-title { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 20px 0 10px; }
    .lr-overdue { color: #dc2626; font-size: 12px; }
    .lr-date { color: #6b7280; font-size: 12px; }
    .lr-badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; margin-right: 4px; }
    .lr-badge-phase { background: #ede9fe; color: #5b21b6; }
    .lr-badge-source { background: #dbeafe; color: #1e40af; }
    .lr-intercession { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .lr-intercession:last-child { border-bottom: none; }
    .lr-intercession-name { font-size: 14px; font-weight: 500; flex: 1; }
    .lr-intercession-intention { font-size: 12px; color: #6b7280; }
    .lr-inactive { opacity: 0.45; }
    .lr-history-item { padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; justify-content: space-between; }
    .lr-history-item:hover { background: #f3f4f6; }
    .lr-history-item.selected { background: #ede9fe; color: #4f46e5; font-weight: 600; }
    .lr-split { display: grid; grid-template-columns: 220px 1fr; gap: 20px; }
    .lr-sidebar { border-right: 1px solid #e5e7eb; padding-right: 16px; }
    .lr-source-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .lr-reading-body { font-size: 14px; line-height: 1.8; color: #374151; }
    .lr-reading-heading { font-size: 13px; font-weight: 700; color: #1e40af; margin: 16px 0 4px; }
    .lr-offices { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 10px; }
    .lr-office-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; cursor: pointer; }
    .lr-office-card h4 { margin: 0 0 4px; font-size: 13px; color: #111827; }
    .lr-office-card p { margin: 0; font-size: 12px; color: #6b7280; }
    .lr-passage-meta { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .lr-passage-text { font-size: 14px; line-height: 1.8; color: #374151; border-left: 3px solid #e5e7eb; padding-left: 12px; margin: 8px 0; }
    .lr-library-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 12px; }
    .lr-library-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
    .lr-library-card h4 { margin: 0 0 6px; font-size: 13px; color: #111827; }
    .lr-library-card p { margin: 0; font-size: 12px; color: #4b5563; line-height: 1.6; }
    .lr-ignatian-card { background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 20px; }
    .lr-ignatian-card h3 { margin: 0 0 8px; font-size: 16px; color: #166534; }
    .lr-ignatian-card .grace { font-style: italic; color: #15803d; margin: 12px 0; font-size: 14px; }
    .lr-ignatian-card .scripture { font-weight: 600; color: #166534; font-size: 13px; }
    .lr-loading { color: #9ca3af; font-size: 14px; padding: 20px 0; }
    .lr-error { color: #dc2626; font-size: 13px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 10px 14px; }
    .lr-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .lr-modal { background: #fff; border-radius: 10px; padding: 24px; width: 420px; max-width: calc(100vw - 32px); }
    .lr-modal h3 { margin: 0 0 16px; font-size: 16px; }
    @media (max-width: 640px) { .lr-split { grid-template-columns: 1fr; } .lr-sidebar { border-right: none; padding-right: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; } }
  `

  // ── Shell/API reference ──────────────────────────────────────────────────────

  let _shell = null
  const BASE = '/lectio'
  const api = {
    get:    p      => _shell.api.get(BASE + p),
    post:   (p, b) => _shell.api.post(BASE + p, b),
    put:    (p, b) => _shell.api.put(BASE + p, b),
    delete: p      => _shell.api.delete(BASE + p),
  }

  // ── Render helpers ───────────────────────────────────────────────────────────

  function renderTabs() {
    const tabs = [
      { id: 'journal',       label: '📖 Journal' },
      { id: 'readings',      label: '📜 Readings' },
      { id: 'prayer',        label: '🙏 Prayer' },
      { id: 'contemplative', label: '🕯️ Contemplative' },
      { id: 'ignatian',      label: '✝️ Ignatian' },
    ]
    return `<div class="lr-tabs">${tabs.map(t =>
      `<button class="lr-tab${state.tab===t.id?' active':''}" data-tab="${t.id}">${t.label}</button>`
    ).join('')}</div>`
  }

  // ── Journal tab ──────────────────────────────────────────────────────────────

  function renderJournalFieldEditor() {
    return JOURNAL_FIELDS.map(([key, label]) => `
      <div class="lr-field-group">
        <label class="lr-label">${esc(label)}</label>
        <textarea class="lr-textarea" data-field="${key}" rows="3">${esc(state.journalFields[key] || '')}</textarea>
      </div>
    `).join('')
  }

  function renderJournalPanel() {
    const historyItems = state.journalHistory.map(e => `
      <div class="lr-history-item${e.date===state.journalDate?' selected':''}" data-date="${e.date}">
        <span>${esc(e.date)}</span>
        <span style="color:#9ca3af;font-size:11px">${e.content ? '✓' : ''}</span>
      </div>
    `).join('')

    const editorSection = state.journalIsJson
      ? renderJournalFieldEditor()
      : `<textarea class="lr-textarea" id="lr-journal-plain" rows="12">${esc(state.journalContent)}</textarea>`

    return `
      <div class="lr-split">
        <div class="lr-sidebar">
          <div class="lr-row" style="margin-bottom:10px">
            <input type="date" class="lr-input" id="lr-journal-date" value="${state.journalDate}" style="width:auto">
            <button class="lr-btn sm" id="lr-history-toggle">${state.journalHistoryOpen?'Hide':'History'}</button>
          </div>
          ${state.journalHistoryOpen ? `<div id="lr-history-list" style="max-height:400px;overflow-y:auto">${historyItems}</div>` : ''}
        </div>
        <div>
          <div class="lr-row" style="margin-bottom:14px">
            <span class="lr-section-title" style="margin:0">${esc(state.journalDate)}</span>
            <button class="lr-btn sm${state.journalIsJson?'':' active'}" id="lr-mode-plain">Plain</button>
            <button class="lr-btn sm${state.journalIsJson?' active':''}" id="lr-mode-fields">Fields</button>
            <button class="lr-btn sm primary" id="lr-journal-save">${state.journalSaving?'Saving…':'Save'}</button>
          </div>
          ${editorSection}
        </div>
      </div>
    `
  }

  // ── Readings tab ─────────────────────────────────────────────────────────────

  function renderReadingContent() {
    if (state.readingLoading) return '<p class="lr-loading">Loading…</p>'
    const d = state.readingData
    if (!d) return '<p style="color:#9ca3af;font-size:14px">Select a source above.</p>'
    if (d.error) return `<div class="lr-error">${esc(d.error)}</div>`

    const src = READING_SOURCES.find(s => s.id === state.readingSource)
    let html = ''

    if (state.readingSource === 'sacred-space' && d.sections) {
      const order = ['presence','freedom','consciousness','word_of_god','inspiration','conversation','conclusion']
      html = order.filter(k => d.sections[k]).map(k =>
        `<div class="lr-reading-heading">${esc(k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()))}</div>
         <p class="lr-reading-body">${esc(d.sections[k])}</p>`
      ).join('')
    } else if (state.readingSource === 'catholic' && d.readings) {
      if (d.feast) html += `<div class="lr-reading-heading">${esc(d.feast)}</div>`
      html += d.readings.map(r =>
        `<div class="lr-reading-heading">${esc(r.heading)}</div>
         ${r.subtitle ? `<p style="font-style:italic;color:#6b7280;font-size:13px;margin:4px 0">${esc(r.subtitle)}</p>` : ''}
         <p class="lr-reading-body">${esc(r.body)}</p>`
      ).join('')
    } else if (state.readingSource === 'psalm' && d.verses) {
      html = `<div class="lr-reading-heading">${esc(d.reference)} · ${esc(d.translation)}</div>`
      html += d.verses.map(v =>
        `<span style="color:#9ca3af;font-size:11px">${v.verse} </span><span class="lr-prose">${esc(v.text)}</span><br>`
      ).join('')
    } else if (state.readingSource === 'utmost') {
      if (d.title) html += `<div class="lr-reading-heading">${esc(d.title)}</div>`
      if (d.scripture) html += `<p style="font-style:italic;color:#4b5563;font-size:13px">${esc(d.scripture)}</p>`
      html += `<p class="lr-reading-body">${esc(d.content || '')}</p>`
    } else if (state.readingSource === 'orthodox') {
      if (d.titles?.length) html += `<div class="lr-reading-heading">${d.titles.map(esc).join(' · ')}</div>`
      if (d.fastLevelDesc && d.fastLevelDesc !== 'No Fast') {
        html += `<p style="font-size:12px;color:#b45309">🍽️ ${esc(d.fastLevelDesc)}</p>`
      }
      html += (d.readings||[]).map(r =>
        `<div class="lr-reading-heading">${esc(r.display)}</div>` +
        r.paragraphs.map(pg =>
          `<p class="lr-reading-body">${pg.map(v => `<span style="color:#9ca3af;font-size:11px">[${v.verse}]</span> ${esc(v.text)}`).join(' ')}</p>`
        ).join('')
      ).join('')
    } else if (state.readingSource === 'practices') {
      html = renderPracticesReading(d)
    }

    const reflField = src?.field
    const reflLabel = JOURNAL_FIELDS.find(([k]) => k === reflField)?.[1]
    const reflNote = reflField
      ? `<div style="margin-top:20px;padding:12px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:13px">
           <strong>Add reflection to journal</strong> — this reading links to the <em>${esc(reflLabel||reflField)}</em> field.
           <button class="lr-btn sm primary" id="lr-goto-reflection" data-field="${reflField}" style="margin-left:8px">Open in Journal</button>
         </div>`
      : ''

    return `
      <div style="font-size:12px;color:#9ca3af;margin-bottom:12px">
        ${esc(d.source || '')}${d.url ? ` · <a href="${esc(d.url)}" target="_blank" style="color:#6b7280">source</a>` : ''}
      </div>
      ${html}
      ${reflNote}
    `
  }

  function renderPracticesReading(d) {
    if (!d || !d.liturgy) return ''
    let html = ''
    const offices = [
      { key: 'lauds',    label: 'Morning Prayer (Lauds)' },
      { key: 'midday',   label: 'Midday Prayer' },
      { key: 'vespers',  label: 'Evening Prayer (Vespers)' },
      { key: 'compline', label: 'Night Prayer (Compline)' },
    ]
    offices.forEach(o => {
      const sections = d.liturgy[o.key]
      if (sections?.length) {
        html += `<div class="lr-reading-heading">${esc(o.label)}</div>`
        html += sections.map(s =>
          `<p style="font-weight:600;font-size:12px;color:#6b7280;margin:8px 0 2px">${esc(s.heading)}</p>
           <p class="lr-reading-body">${esc(s.text)}</p>`
        ).join('')
      }
    })
    if (d.rosary) {
      html += `<div class="lr-reading-heading">Today's Rosary: ${esc(d.rosary.name)}</div>`
      html += `<p style="color:#6b7280;font-size:12px">${esc(d.rosary.days)}</p>`
      html += d.rosary.mysteries.map(m =>
        `<p class="lr-reading-body"><strong>${m.n}.</strong> ${esc(m.name)} — <em>${esc(m.fruit)}</em> · ${esc(m.ref)}</p>`
      ).join('')
    }
    if (d.rcFast) html += `<p style="font-size:12px;color:#b45309;margin-top:12px">⚠️ Fasting / Abstinence today (RC)</p>`
    if (d.allSaints?.length) {
      html += `<div class="lr-reading-heading">Saints</div>`
      html += d.allSaints.slice(0,3).map(s =>
        `<p class="lr-reading-body"><strong>${esc(s.name)}</strong>${s.bio ? ` — ${esc(s.bio.slice(0,200))}…` : ''}</p>`
      ).join('')
    }
    return html
  }

  function renderReadingsPanel() {
    return `
      <div class="lr-source-btns">
        ${READING_SOURCES.map(s =>
          `<button class="lr-btn${state.readingSource===s.id?' active':''}" data-source="${s.id}">${esc(s.label)}</button>`
        ).join('')}
      </div>
      <div id="lr-reading-content">${renderReadingContent()}</div>
    `
  }

  // ── Prayer tab ───────────────────────────────────────────────────────────────

  function renderPrayerPanel() {
    return `
      <div class="lr-row" style="margin-bottom:16px">
        <button class="lr-btn${state.practiceSection==='offices'?' active':''}" data-psec="offices">Offices &amp; Practices</button>
        <button class="lr-btn${state.practiceSection==='intercessions'?' active':''}" data-psec="intercessions">Intercessions</button>
      </div>
      ${state.practiceSection==='offices' ? renderOfficesSection() : renderIntercessionsSection()}
    `
  }

  function renderOfficesSection() {
    if (state.practicesLoading) return '<p class="lr-loading">Loading practices…</p>'
    if (!state.practices) {
      return `<button class="lr-btn primary" id="lr-load-practices">Load Today's Practices</button>`
    }
    return renderPracticesReading(state.practices)
  }

  function renderIntercessionsSection() {
    const list = state.intercessions.length
      ? state.intercessions.map(i => `
        <div class="lr-intercession${i.active?'':' lr-inactive'}">
          <div style="flex:1">
            <div class="lr-intercession-name">${esc(i.name)}</div>
            ${i.intention ? `<div class="lr-intercession-intention">${esc(i.intention)}</div>` : ''}
          </div>
          <button class="lr-btn sm" data-toggle-intercession="${i.id}" title="${i.active?'Pause':'Resume'}">${i.active?'⏸':'▶'}</button>
          <button class="lr-btn sm danger" data-delete-intercession="${i.id}" title="Delete">✕</button>
        </div>
      `).join('')
      : `<p style="color:#9ca3af;font-size:14px">No intercessions yet.</p>`

    return `
      <div class="lr-row" style="margin-bottom:8px">
        <p class="lr-section-title" style="margin:0">Prayers for Others</p>
        <button class="lr-btn sm primary" id="lr-add-intercession">+ Add Person</button>
      </div>
      <p style="font-size:13px;color:#6b7280;margin-bottom:16px">People and intentions you bring to prayer each day.</p>
      <div id="lr-intercession-list">${list}</div>
    `
  }

  // ── Contemplative tab ────────────────────────────────────────────────────────

  function renderContemplativePanel() {
    if (state.libraryOpen) return renderContemplativeLibrary()

    if (!state.todayPassage) {
      return `
        <button class="lr-btn primary" id="lr-load-contemplative">Load Today's Passage</button>
      `
    }

    const p = state.todayPassage
    return `
      <div class="lr-row" style="margin-bottom:16px">
        <p class="lr-section-title" style="margin:0">Today's Passage</p>
        <button class="lr-btn sm" id="lr-open-library">Browse Library</button>
      </div>
      <div class="lr-passage-meta">
        <span class="lr-badge lr-badge-source">${esc(p.sourceMeta?.label || p.source)}</span>
        <span style="color:#9ca3af;font-size:12px">${esc(p.sourceMeta?.period || '')}</span>
      </div>
      ${p.title ? `<h3 style="margin:10px 0 6px;font-size:16px">${esc(p.title)}</h3>` : ''}
      ${p.reference ? `<p style="font-size:13px;font-style:italic;color:#6b7280">${esc(p.reference)}</p>` : ''}
      <div class="lr-passage-text">${esc(p.text || p.body || '')}</div>

      <div class="lr-field-group" style="margin-top:20px">
        <label class="lr-label">My Reflection</label>
        <textarea class="lr-textarea" id="lr-contemp-reflection" rows="5">${esc(state.contemplativeReflection)}</textarea>
        <button class="lr-btn primary" id="lr-save-contemp-reflection" style="margin-top:8px">
          ${state.contemplativeSaving?'Saving…':'Save Reflection'}
        </button>
      </div>
    `
  }

  function renderContemplativeLibrary() {
    const sources = [
      { id: '', label: 'All' },
      { id: 'cloud', label: 'Cloud of Unknowing' },
      { id: 'cassian', label: 'John Cassian' },
      { id: 'merton', label: 'Thomas Merton' },
      { id: 'keating', label: 'Thomas Keating' },
    ]
    let passageHtml = ''
    if (!state.libraryData) {
      passageHtml = '<p class="lr-loading">Loading library…</p>'
    } else {
      const all = state.librarySource
        ? (state.libraryData.sources?.[state.librarySource] || [])
        : Object.values(state.libraryData.sources || {}).flat()
      passageHtml = all.length
        ? `<div class="lr-library-grid">${all.map(p => `
            <div class="lr-library-card">
              <p class="lr-passage-meta">${esc(p.sourceMeta?.label||p.source)}</p>
              <h4>${esc(p.title || p.reference || '')}</h4>
              <p>${esc((p.text||p.body||'').slice(0,160))}…</p>
            </div>`).join('')}</div>`
        : '<p style="color:#9ca3af;font-size:14px">No passages found.</p>'
    }

    return `
      <div class="lr-row" style="margin-bottom:16px">
        <p class="lr-section-title" style="margin:0">Contemplative Library</p>
        <button class="lr-btn sm" id="lr-close-library">← Today's Passage</button>
      </div>
      <div class="lr-source-btns" style="margin-bottom:16px">
        ${sources.map(s =>
          `<button class="lr-btn sm${state.librarySource===s.id?' active':''}" data-lib-source="${s.id}">${esc(s.label)}</button>`
        ).join('')}
      </div>
      ${passageHtml}
    `
  }

  // ── Ignatian tab ─────────────────────────────────────────────────────────────

  function renderIgnatianPanel() {
    return `
      <div class="lr-row" style="margin-bottom:16px">
        <button class="lr-btn${state.ignatianTab==='19'?' active':''}" data-ig-tab="19">19th Annotation</button>
        <button class="lr-btn${state.ignatianTab==='18'?' active':''}" data-ig-tab="18">18th Annotation</button>
      </div>
      ${state.ignatianTab==='19' ? renderIgnatianCard(state.ignatianData, '19') : renderIgnatianCard(state.ignatian18Data, '18')}
    `
  }

  function renderIgnatianCard(data, annotation) {
    if (!data) {
      return `<button class="lr-btn primary" data-load-ig="${annotation}">Load Retreat</button>`
    }
    if (data.needsSetup) {
      return `
        <div class="lr-card">
          <p class="lr-label">Start ${annotation === '19' ? '19th Annotation (34 weeks)' : '18th Annotation (shorter retreat)'}</p>
          <div class="lr-row" style="margin-top:10px">
            <input type="date" class="lr-input" id="lr-ig${annotation}-start-date" value="${state.ignatianStartDate}" style="width:auto">
            <button class="lr-btn primary" data-start-ig="${annotation}">Begin Retreat</button>
          </div>
        </div>
      `
    }
    if (data.completed) {
      return `
        <div class="lr-ignatian-card">
          <h3>🎉 Retreat Complete</h3>
          <p style="font-size:14px;color:#166534">You have completed all ${data.totalWeeks} weeks. Glory to God.</p>
          <button class="lr-btn sm" data-reset-ig="${annotation}" style="margin-top:12px">Reset</button>
        </div>
      `
    }
    if (data.notStarted) {
      return `<div class="lr-card"><p style="font-size:14px">Retreat begins on ${esc(data.startDate)} (${data.daysUntil} days away).</p></div>`
    }

    const day = data.day
    return `
      <div class="lr-ignatian-card">
        <div class="lr-row" style="margin-bottom:8px">
          <span class="lr-badge lr-badge-phase">${esc(data.phase)}</span>
          <span style="font-size:13px;color:#166534">Week ${data.weekNumber} · ${data.isRestDay?'Rest Day':'Day '+(data.dayOfWeek+1)}</span>
          ${data.isPaused ? '<span class="lr-badge" style="background:#fef3c7;color:#92400e">⏸ Paused</span>' : ''}
        </div>
        <h3>${esc(data.weekTitle)}</h3>
        ${data.grace ? `<div class="grace">${esc(data.grace)}</div>` : ''}
        ${day ? `
          <div style="margin-top:12px">
            <div class="scripture">${esc(day.scripture)}</div>
            <p style="font-size:14px;color:#374151;margin:8px 0;line-height:1.7">${esc(day.reflection)}</p>
          </div>
        ` : '<p style="font-size:13px;color:#6b7280">Rest and review day — no new material.</p>'}
        <div class="lr-row" style="margin-top:14px">
          ${data.isPaused
            ? `<button class="lr-btn sm primary" data-resume-ig="${annotation}">Resume</button>`
            : `<button class="lr-btn sm" data-pause-ig="${annotation}">Pause</button>`
          }
          <button class="lr-btn sm danger" data-reset-ig="${annotation}">Reset</button>
        </div>
      </div>
    `
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  function render(container) {
    const panels = {
      journal:       renderJournalPanel(),
      readings:      renderReadingsPanel(),
      prayer:        renderPrayerPanel(),
      contemplative: renderContemplativePanel(),
      ignatian:      renderIgnatianPanel(),
    }
    container.innerHTML = `
      <div class="lr-wrap">
        ${renderTabs()}
        ${Object.entries(panels).map(([id, html]) =>
          `<div class="lr-panel${state.tab===id?' active':''}" data-panel="${id}">${html}</div>`
        ).join('')}
      </div>
    `
    bindEvents(container)
  }

  // ── Modal ────────────────────────────────────────────────────────────────────

  function showModal(title, fields, onSubmit) {
    const bg = document.createElement('div')
    bg.className = 'lr-modal-bg'
    bg.innerHTML = `
      <div class="lr-modal">
        <h3>${esc(title)}</h3>
        ${fields.map(f => `
          <div class="lr-field-group">
            <label class="lr-label">${esc(f.label)}</label>
            ${f.multiline
              ? `<textarea class="lr-textarea" id="lr-modal-${f.id}" rows="3">${esc(f.value||'')}</textarea>`
              : `<input class="lr-input" id="lr-modal-${f.id}" value="${esc(f.value||'')}" placeholder="${esc(f.placeholder||'')}">` }
          </div>
        `).join('')}
        <div class="lr-row" style="margin-top:16px;justify-content:flex-end">
          <button class="lr-btn" id="lr-modal-cancel">Cancel</button>
          <button class="lr-btn primary" id="lr-modal-submit">Save</button>
        </div>
      </div>
    `
    document.body.appendChild(bg)
    bg.querySelector('#lr-modal-cancel').onclick = () => bg.remove()
    bg.querySelector('#lr-modal-submit').onclick = () => {
      const values = {}
      fields.forEach(f => {
        values[f.id] = bg.querySelector(`#lr-modal-${f.id}`).value.trim()
      })
      bg.remove()
      onSubmit(values)
    }
  }

  // ── Event binding ────────────────────────────────────────────────────────────

  function bindEvents(container) {
    // Tab switching
    container.querySelectorAll('.lr-tab').forEach(btn => {
      btn.onclick = () => { state.tab = btn.dataset.tab; render(container) }
    })

    // ── Journal ──
    const dateInput = container.querySelector('#lr-journal-date')
    if (dateInput) {
      dateInput.onchange = e => {
        state.journalDate = e.target.value
        loadJournalEntry(container)
      }
    }

    const plainBtn = container.querySelector('#lr-mode-plain')
    if (plainBtn) {
      plainBtn.onclick = () => {
        if (state.journalIsJson) {
          state.journalContent = JSON.stringify(state.journalFields)
        }
        state.journalIsJson = false
        render(container)
      }
    }

    const fieldsBtn = container.querySelector('#lr-mode-fields')
    if (fieldsBtn) {
      fieldsBtn.onclick = () => {
        if (!state.journalIsJson) {
          try { state.journalFields = JSON.parse(state.journalContent) } catch { state.journalFields = {} }
        }
        state.journalIsJson = true
        render(container)
      }
    }

    const saveBtn = container.querySelector('#lr-journal-save')
    if (saveBtn) {
      saveBtn.onclick = async () => {
        state.journalSaving = true
        render(container)
        let content = state.journalContent
        if (state.journalIsJson) {
          container.querySelectorAll('[data-field]').forEach(el => {
            state.journalFields[el.dataset.field] = el.value
          })
          content = JSON.stringify(state.journalFields)
        } else {
          const plain = container.querySelector('#lr-journal-plain')
          if (plain) content = plain.value
        }
        await api.put(`/journal/${state.journalDate}`, { content })
        state.journalContent = content
        state.journalSaving = false
        render(container)
      }
    }

    const histToggle = container.querySelector('#lr-history-toggle')
    if (histToggle) {
      histToggle.onclick = async () => {
        state.journalHistoryOpen = !state.journalHistoryOpen
        if (state.journalHistoryOpen && !state.journalHistory.length) {
          const rows = await api.get('/journal')
          state.journalHistory = rows
        }
        render(container)
      }
    }

    container.querySelectorAll('.lr-history-item[data-date]').forEach(el => {
      el.onclick = () => {
        state.journalDate = el.dataset.date
        loadJournalEntry(container)
      }
    })

    // ── Readings ──
    container.querySelectorAll('[data-source]').forEach(btn => {
      btn.onclick = () => {
        state.readingSource = btn.dataset.source
        state.readingData = null
        render(container)
        loadReading(container)
      }
    })

    const gotoRefl = container.querySelector('#lr-goto-reflection')
    if (gotoRefl) {
      gotoRefl.onclick = () => {
        state.tab = 'journal'
        state.journalIsJson = true
        if (typeof state.journalContent === 'string') {
          try { state.journalFields = JSON.parse(state.journalContent) } catch { state.journalFields = {} }
        }
        render(container)
        const field = gotoRefl.dataset.field
        const el = container.querySelector(`[data-field="${field}"]`)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // ── Prayer: section toggle ──
    container.querySelectorAll('[data-psec]').forEach(btn => {
      btn.onclick = () => {
        state.practiceSection = btn.dataset.psec
        if (state.practiceSection === 'intercessions' && !state.intercessions.length) {
          loadIntercessions(container)
        }
        render(container)
      }
    })

    const loadPrac = container.querySelector('#lr-load-practices')
    if (loadPrac) {
      loadPrac.onclick = () => { loadPractices(container) }
    }

    // ── Intercessions ──
    const addBtn = container.querySelector('#lr-add-intercession')
    if (addBtn) {
      addBtn.onclick = () => {
        showModal('Add Intercession', [
          { id: 'name', label: 'Name *', placeholder: 'e.g. Mary' },
          { id: 'intention', label: 'Intention (optional)', placeholder: 'e.g. Recovery from illness', multiline: true },
        ], async ({ name, intention }) => {
          if (!name) return
          await api.post('/intercessions', { name, intention: intention || undefined })
          await loadIntercessions(container)
          render(container)
        })
      }
    }

    container.querySelectorAll('[data-toggle-intercession]').forEach(btn => {
      btn.onclick = async () => {
        const id = parseInt(btn.dataset.toggleIntercession, 10)
        const item = state.intercessions.find(i => i.id === id)
        if (!item) return
        await api.put(`/intercessions/${id}`, { active: item.active ? 0 : 1 })
        await loadIntercessions(container)
        render(container)
      }
    })

    container.querySelectorAll('[data-delete-intercession]').forEach(btn => {
      btn.onclick = async () => {
        const id = parseInt(btn.dataset.deleteIntercession, 10)
        await api.delete(`/intercessions/${id}`)
        await loadIntercessions(container)
        render(container)
      }
    })

    // ── Contemplative ──
    const loadContemp = container.querySelector('#lr-load-contemplative')
    if (loadContemp) {
      loadContemp.onclick = () => loadTodayPassage(container)
    }

    const openLib = container.querySelector('#lr-open-library')
    if (openLib) {
      openLib.onclick = () => {
        state.libraryOpen = true
        render(container)
        loadLibrary(container)
      }
    }

    const closeLib = container.querySelector('#lr-close-library')
    if (closeLib) {
      closeLib.onclick = () => { state.libraryOpen = false; render(container) }
    }

    container.querySelectorAll('[data-lib-source]').forEach(btn => {
      btn.onclick = () => {
        state.librarySource = btn.dataset.libSource
        render(container)
      }
    })

    const saveRefl = container.querySelector('#lr-save-contemp-reflection')
    if (saveRefl) {
      saveRefl.onclick = async () => {
        const val = container.querySelector('#lr-contemp-reflection')?.value || ''
        state.contemplativeSaving = true
        render(container)
        const p = state.todayPassage
        await api.put(`/contemplative/reflection/${todayStr()}`, {
          reflection: val,
          passage_id: p?.id || '',
          source: p?.source || '',
        })
        state.contemplativeReflection = val
        state.contemplativeSaving = false
        render(container)
      }
    }

    // ── Ignatian ──
    container.querySelectorAll('[data-ig-tab]').forEach(btn => {
      btn.onclick = () => { state.ignatianTab = btn.dataset.igTab; render(container) }
    })

    container.querySelectorAll('[data-load-ig]').forEach(btn => {
      btn.onclick = () => loadIgnatian(container, btn.dataset.loadIg)
    })

    container.querySelectorAll('[data-start-ig]').forEach(btn => {
      btn.onclick = async () => {
        const annotation = btn.dataset.startIg
        const dateEl = container.querySelector(`#lr-ig${annotation}-start-date`)
        const start_date = dateEl?.value || todayStr()
        const path = annotation === '19' ? '/ignatian/start' : '/ignatian18/start'
        const data = await api.put(path, { start_date })
        if (annotation === '19') state.ignatianData = data
        else state.ignatian18Data = data
        render(container)
      }
    })

    container.querySelectorAll('[data-pause-ig]').forEach(btn => {
      btn.onclick = async () => {
        const a = btn.dataset.pauseIg
        const data = await api.post(a === '19' ? '/ignatian/pause' : '/ignatian18/pause')
        if (a === '19') state.ignatianData = data; else state.ignatian18Data = data
        render(container)
      }
    })

    container.querySelectorAll('[data-resume-ig]').forEach(btn => {
      btn.onclick = async () => {
        const a = btn.dataset.resumeIg
        const data = await api.post(a === '19' ? '/ignatian/resume' : '/ignatian18/resume')
        if (a === '19') state.ignatianData = data; else state.ignatian18Data = data
        render(container)
      }
    })

    container.querySelectorAll('[data-reset-ig]').forEach(btn => {
      btn.onclick = async () => {
        const a = btn.dataset.resetIg
        const data = await api.post(a === '19' ? '/ignatian/reset' : '/ignatian18/reset')
        if (a === '19') state.ignatianData = data; else state.ignatian18Data = data
        render(container)
      }
    })
  }

  // ── Data loaders ─────────────────────────────────────────────────────────────

  async function loadJournalEntry(container) {
    const entry = await api.get(`/journal/${state.journalDate}`)
    state.journalContent = entry.content || ''
    state.journalIsJson = state.journalContent.trimStart().startsWith('{')
    if (state.journalIsJson) {
      try { state.journalFields = JSON.parse(state.journalContent) } catch { state.journalFields = {} }
    } else {
      state.journalFields = {}
    }
    render(container)
  }

  async function loadReading(container) {
    state.readingLoading = true
    render(container)
    try {
      state.readingData = await api.get(`/readings/${state.readingSource}`)
    } catch (e) {
      state.readingData = { error: e.message || 'Failed to load reading' }
    }
    state.readingLoading = false
    render(container)
  }

  async function loadPractices(container) {
    state.practicesLoading = true
    render(container)
    try {
      state.practices = await api.get('/readings/practices')
    } catch {}
    state.practicesLoading = false
    render(container)
  }

  async function loadIntercessions(container) {
    state.intercessions = await api.get('/intercessions') || []
  }

  async function loadTodayPassage(container) {
    const data = await api.get('/contemplative/today')
    state.todayPassage = data.passage
    state.contemplativeReflection = data.reflection || ''
    render(container)
  }

  async function loadLibrary(container) {
    state.libraryData = null
    render(container)
    state.libraryData = await api.get('/contemplative/browse')
    render(container)
  }

  async function loadIgnatian(container, annotation) {
    const path = annotation === '19' ? '/ignatian' : '/ignatian18'
    const data = await api.get(path)
    if (annotation === '19') state.ignatianData = data
    else state.ignatian18Data = data
    render(container)
  }

  // ── Module registration ──────────────────────────────────────────────────────

  let _container = null
  let _styleEl   = null

  window.Mosaic.registerModule({
    slug: 'lectio',

    init(shell) {
      _shell = shell
    },

    async onActivate(container) {
      _container = container

      // Inject styles once
      if (!document.getElementById('lr-styles')) {
        _styleEl = document.createElement('style')
        _styleEl.id = 'lr-styles'
        _styleEl.textContent = CSS
        document.head.appendChild(_styleEl)
      }

      render(container)
      await loadJournalEntry(container)
    },

    onDeactivate() {
      if (_styleEl) { _styleEl.remove(); _styleEl = null }
      _container = null
    },
  })

})()
