;(function () {
  'use strict'

  // ── Utilities ────────────────────────────────────────────────────────────────

  function esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10)
  }

  // ── Field registry ───────────────────────────────────────────────────────────

  const FIELD_META = [
    ['free_write',               'Journal'],
    ['morning_reflection',       'Morning Prayer (Lauds)'],
    ['midday_reflection',        'Midday Prayer'],
    ['evening_reflection',       'Evening Prayer (Vespers)'],
    ['night_reflection',         'Night Prayer (Compline)'],
    ['prayer_notes',             'Prayer Notes'],
    ['sacredspace_reflection',   'Sacred Space'],
    ['utmost_reflection',        'My Utmost'],
    ['psalm_reflection',         'Daily Psalm'],
    ['catholic_reflection',      'Catholic'],
    ['orthodox_reflection',      'Orthodox'],
    ['contemplative_reflection', 'Contemplative'],
    ['ignatian_reflection',      'Ignatian'],
    ['examen_gratitude',         'Examen — Gratitude'],
    ['examen_light',             'Examen — Ask for Light'],
    ['examen_review',            'Examen — Review the Day'],
    ['examen_shortcomings',      'Examen — Shortcomings'],
    ['examen_forward',           'Examen — Look Forward'],
  ]

  const READING_SOURCES = [
    { id: 'sacred-space', label: 'Sacred Space', field: 'sacredspace_reflection' },
    { id: 'utmost',       label: 'My Utmost',    field: 'utmost_reflection'      },
    { id: 'psalm',        label: 'Daily Psalm',  field: 'psalm_reflection'       },
    { id: 'catholic',     label: 'Catholic',     field: 'catholic_reflection'    },
    { id: 'orthodox',     label: 'Orthodox',     field: 'orthodox_reflection'    },
  ]

  // ── State ────────────────────────────────────────────────────────────────────

  const state = {
    tab: 'journal',
    // Shared auto-saved daily fields (today only)
    todayFields:        {},
    fieldsLoaded:       false,
    // Journal
    journalMode:        'write',   // 'write' | 'read'
    journalDate:        todayStr(),
    journalReadFields:  {},
    journalReadLoading: false,
    journalHistory:     [],
    journalHistoryOpen: false,
    // Readings
    readingSource:   'sacred-space',
    readingData:     null,
    readingLoading:  false,
    // Prayer
    practices:        null,
    practicesLoading: false,
    intercessions:    [],
    practiceSection:  'offices',
    // Contemplative
    todayPassage:  null,
    libraryOpen:   false,
    librarySource: '',
    libraryData:   null,
    // Ignatian
    ignatianData:      null,
    ignatian18Data:    null,
    ignatianTab:       '19',
    ignatianStartDate: todayStr(),
  }

  // ── Auto-save ────────────────────────────────────────────────────────────────

  let _saveTimer = null

  function setField(key, val) {
    state.todayFields[key] = val
    clearTimeout(_saveTimer)
    _saveTimer = setTimeout(() => {
      api.put(`/journal/${todayStr()}`, { content: JSON.stringify(state.todayFields) }).catch(() => {})
    }, 800)
  }

  // ── CSS ──────────────────────────────────────────────────────────────────────

  const CSS = `
    .lr-wrap { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 16px; }
    .lr-tabs { display: flex; gap: 4px; border-bottom: 2px solid #e5e7eb; margin-bottom: 20px; flex-wrap: wrap; }
    .lr-tab { padding: 8px 16px; border: none; background: none; cursor: pointer; color: #6b7280; font-size: 14px; border-bottom: 2px solid transparent; margin-bottom: -2px; font-weight: 500; }
    .lr-tab.active { color: #6366f1; border-bottom-color: #6366f1; }
    .lr-tab:hover:not(.active) { opacity: .8; }
    .lr-panel { display: none; }
    .lr-panel.active { display: block; }
    .lr-row { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
    .lr-btn { padding: 7px 14px; border: 1px solid currentColor; border-radius: 6px; background: transparent; cursor: pointer; font-size: 13px; opacity: .75; }
    .lr-btn:hover { opacity: 1; }
    .lr-btn.primary { background: #6366f1; color: #fff; border-color: #6366f1; opacity: 1; }
    .lr-btn.primary:hover { background: #4f46e5; }
    .lr-btn.danger { color: #dc2626; border-color: #dc2626; background: transparent; opacity: .8; }
    .lr-btn.sm { padding: 4px 10px; font-size: 12px; }
    .lr-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; opacity: 1; }
    .lr-input { padding: 7px 10px; border: 1px solid currentColor; border-radius: 6px; font-size: 14px; box-sizing: border-box; background: transparent; color: inherit; opacity: .8; }
    .lr-textarea { padding: 8px 10px; border: 1px solid currentColor; border-radius: 6px; font-size: 14px; width: 100%; box-sizing: border-box; resize: vertical; min-height: 80px; font-family: inherit; line-height: 1.7; background: transparent; color: inherit; opacity: .9; }
    .lr-textarea:focus { outline: none; opacity: 1; box-shadow: 0 0 0 2px rgba(99,102,241,.3); }
    .lr-label { font-size: 13px; font-weight: 600; margin-bottom: 4px; display: block; }
    .lr-field-group { margin-bottom: 16px; }
    .lr-card { border: 1px solid currentColor; border-radius: 8px; padding: 16px; margin-bottom: 12px; opacity: .9; }
    .lr-section-title { font-size: 18px; font-weight: 700; margin: 0 0 16px; }
    .lr-badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; margin-right: 4px; }
    .lr-badge-phase  { background: rgba(99,102,241,.15); color: #6366f1; }
    .lr-badge-source { background: rgba(59,130,246,.15); color: #3b82f6; }
    .lr-intercession { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid currentColor; opacity: .85; }
    .lr-intercession:last-child { border-bottom: none; }
    .lr-intercession-name { font-size: 14px; font-weight: 500; flex: 1; }
    .lr-intercession-intention { font-size: 12px; opacity: .65; }
    .lr-inactive { opacity: 0.35; }
    .lr-history-item { padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; justify-content: space-between; }
    .lr-history-item:hover { background: rgba(99,102,241,.08); }
    .lr-history-item.selected { background: rgba(99,102,241,.15); color: #6366f1; font-weight: 600; }
    .lr-source-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    /* Readings */
    .lr-reading-body { font-size: 15px; line-height: 1.9; color: inherit; margin: 0 0 10px; }
    .lr-reading-heading { font-size: 11px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.08em; margin: 20px 0 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(99,102,241,.25); }
    .lr-passage-meta { font-size: 12px; opacity: .6; margin-bottom: 4px; }
    .lr-passage-text { font-size: 15px; line-height: 1.9; color: inherit; border-left: 3px solid rgba(99,102,241,.4); padding-left: 14px; margin: 8px 0 16px; }
    .lr-library-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 12px; }
    .lr-library-card { border: 1px solid currentColor; border-radius: 8px; padding: 14px; opacity: .8; transition: opacity .15s; }
    .lr-library-card:hover { opacity: 1; }
    .lr-library-card h4 { margin: 0 0 6px; font-size: 13px; }
    .lr-library-card p { margin: 0; font-size: 12px; opacity: .7; line-height: 1.6; }
    .lr-ignatian-card { border: 1px solid rgba(34,197,94,.4); border-radius: 10px; padding: 20px; background: rgba(34,197,94,.06); }
    .lr-ignatian-card h3 { margin: 0 0 8px; font-size: 16px; color: #22c55e; }
    .lr-ignatian-card .grace { font-style: italic; color: #4ade80; margin: 12px 0; font-size: 14px; }
    .lr-ignatian-card .scripture { font-weight: 600; color: #4ade80; font-size: 13px; }
    .lr-loading { opacity: .5; font-size: 14px; padding: 20px 0; }
    .lr-error { color: #f87171; font-size: 13px; background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.3); border-radius: 6px; padding: 10px 14px; }
    .lr-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .lr-modal { background: Canvas; color: CanvasText; border-radius: 10px; padding: 24px; width: 420px; max-width: calc(100vw - 32px); border: 1px solid currentColor; }
    .lr-modal h3 { margin: 0 0 16px; font-size: 16px; }
    /* Reflection areas */
    .lr-reflection { margin-top: 20px; padding: 14px 14px 10px; background: rgba(99,102,241,.07); border: 1px solid rgba(99,102,241,.3); border-radius: 8px; }
    .lr-reflection-label { font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; display: block; }
    .lr-reflection .lr-textarea { border-color: rgba(99,102,241,.35); }
    .lr-reflection .lr-textarea:focus { border-color: #818cf8; box-shadow: 0 0 0 2px rgba(99,102,241,.2); }
    /* Journal read view */
    .lr-read-entry { margin-bottom: 20px; }
    .lr-read-label { font-size: 11px; font-weight: 700; opacity: .55; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
    .lr-read-body { font-size: 15px; line-height: 1.8; color: inherit; white-space: pre-wrap; padding: 12px 14px; background: rgba(128,128,128,.08); border-radius: 6px; border: 1px solid rgba(128,128,128,.2); }
    /* Examen steps */
    .lr-examen-step { margin-bottom: 22px; padding-bottom: 22px; border-bottom: 1px solid rgba(128,128,128,.15); }
    .lr-examen-step:last-child { border-bottom: none; }
    .lr-examen-num { font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: .06em; }
    .lr-examen-title { font-size: 15px; font-weight: 700; margin: 2px 0 3px; }
    .lr-examen-desc { font-size: 13px; opacity: .6; margin: 0 0 8px; }
    @media (max-width: 640px) { .lr-source-btns { flex-direction: column; } }
  `

  // ── Shell / API ──────────────────────────────────────────────────────────────

  let _shell     = null
  let _container = null
  let _styleEl   = null

  const api = {
    get:    p      => _shell.api.get(p),
    post:   (p, b) => _shell.api.post(p, b),
    put:    (p, b) => _shell.api.put(p, b),
    delete: p      => _shell.api.delete(p),
  }

  // ── Shared: reflection textarea ──────────────────────────────────────────────

  function renderReflection(fieldKey, placeholder) {
    const val = state.todayFields[fieldKey] || ''
    return `
      <div class="lr-reflection">
        <span class="lr-reflection-label">✏ Reflection</span>
        <textarea class="lr-textarea lr-auto-field" data-field-key="${fieldKey}" rows="4"
          placeholder="${esc(placeholder || 'Write your reflection…')}">${esc(val)}</textarea>
      </div>
    `
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────────

  function renderTabs() {
    const tabs = [
      { id: 'journal',       label: '📖 Journal'      },
      { id: 'readings',      label: '📜 Readings'     },
      { id: 'prayer',        label: '🙏 Prayer'       },
      { id: 'contemplative', label: '🕯️ Contemplative' },
      { id: 'ignatian',      label: '✝️ Ignatian'     },
    ]
    return `<div class="lr-tabs">${tabs.map(t =>
      `<button class="lr-tab${state.tab===t.id?' active':''}" data-tab="${t.id}">${t.label}</button>`
    ).join('')}</div>`
  }

  // ── Journal tab ──────────────────────────────────────────────────────────────

  function renderJournalPanel() {
    if (state.journalMode === 'write') {
      const val = state.todayFields['free_write'] || ''
      return `
        <div class="lr-row" style="margin-bottom:14px">
          <p class="lr-section-title" style="margin:0">Journal</p>
          <button class="lr-btn sm" id="lr-journal-mode-read">Read All</button>
        </div>
        <p style="font-size:13px;color:#6b7280;margin:0 0 14px">Free write — auto-saves as you type.</p>
        <textarea class="lr-textarea lr-auto-field" data-field-key="free_write" rows="18"
          placeholder="Write freely…" style="font-size:15px;line-height:1.8">${esc(val)}</textarea>
      `
    }

    // Read All mode
    const isToday   = state.journalDate === todayStr()
    const fields    = isToday ? state.todayFields : (state.journalReadFields || {})
    const hasEntry  = FIELD_META.some(([k]) => fields[k]?.trim())

    const histItems = state.journalHistory.map(e => `
      <div class="lr-history-item${e.date===state.journalDate?' selected':''}" data-date="${e.date}">
        <span>${esc(e.date)}</span>
        <span style="color:#9ca3af;font-size:11px">${e.content ? '✓' : ''}</span>
      </div>
    `).join('')

    return `
      <div class="lr-row" style="margin-bottom:14px">
        <p class="lr-section-title" style="margin:0">Daily Review</p>
        <button class="lr-btn sm" id="lr-journal-mode-write">Write</button>
        <button class="lr-btn sm" id="lr-history-toggle">${state.journalHistoryOpen?'Hide':'History'}</button>
      </div>
      ${state.journalHistoryOpen
        ? `<div style="max-height:200px;overflow-y:auto;margin-bottom:16px;border:1px solid #e5e7eb;border-radius:6px;padding:6px">${histItems}</div>`
        : ''}
      <div class="lr-row" style="margin-bottom:20px">
        <input type="date" class="lr-input" id="lr-read-date" value="${state.journalDate}">
      </div>
      ${state.journalReadLoading
        ? '<p class="lr-loading">Loading…</p>'
        : !hasEntry
          ? `<p style="color:#9ca3af;font-size:14px">No entries for ${esc(state.journalDate)}.</p>`
          : FIELD_META.map(([key, label]) => {
              const text = fields[key]?.trim()
              if (!text) return ''
              return `
                <div class="lr-read-entry">
                  <div class="lr-read-label">${esc(label)}</div>
                  <div class="lr-read-body">${esc(text)}</div>
                </div>`
            }).join('')
      }
    `
  }

  // ── Readings tab ─────────────────────────────────────────────────────────────

  function renderReadingContent() {
    if (state.readingLoading) return '<p class="lr-loading">Loading…</p>'
    const d = state.readingData
    if (!d) return ''
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
      html += `<p style="padding-left:4px">${d.verses.map(v =>
        `<span style="color:#9ca3af;font-size:11px;margin-right:4px">${v.verse}</span><span class="lr-reading-body" style="display:inline">${esc(v.text)}</span>`
      ).join('<br>')}</p>`
    } else if (state.readingSource === 'utmost') {
      if (d.title)    html += `<div class="lr-reading-heading">${esc(d.title)}</div>`
      if (d.scripture) html += `<p style="font-style:italic;color:#4b5563;font-size:14px;margin-bottom:12px">${esc(d.scripture)}</p>`
      html += `<p class="lr-reading-body">${esc(d.content || '')}</p>`
    } else if (state.readingSource === 'orthodox') {
      if (d.titles?.length) html += `<div class="lr-reading-heading">${d.titles.map(esc).join(' · ')}</div>`
      if (d.fastLevelDesc && d.fastLevelDesc !== 'No Fast') {
        html += `<p style="font-size:13px;color:#b45309;margin-bottom:12px">🍽️ ${esc(d.fastLevelDesc)}</p>`
      }
      html += (d.readings||[]).map(r =>
        `<div class="lr-reading-heading">${esc(r.display)}</div>` +
        r.paragraphs.map(pg =>
          `<p class="lr-reading-body">${pg.map(v =>
            `<span style="color:#9ca3af;font-size:11px">[${v.verse}]</span> ${esc(v.text)}`
          ).join(' ')}</p>`
        ).join('')
      ).join('')
    }

    const sourceNote = `<p style="font-size:12px;color:#9ca3af;margin-bottom:16px">
      ${esc(d.source || '')}${d.url ? ` · <a href="${esc(d.url)}" target="_blank" style="color:#6b7280">source ↗</a>` : ''}
    </p>`

    const reflField = src?.field
    const reflNote  = reflField
      ? renderReflection(reflField, `Reflect on today's ${src.label} reading…`)
      : ''

    return sourceNote + html + reflNote
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

  const OFFICE_FIELDS = {
    lauds:    ['morning_reflection', 'How was your morning prayer?'],
    midday:   ['midday_reflection',  'How was your midday prayer?'],
    vespers:  ['evening_reflection', 'How was your evening prayer?'],
    compline: ['night_reflection',   'How was your night prayer?'],
  }

  function renderPracticesContent(d) {
    if (!d?.liturgy) return ''
    let html = ''
    const offices = [
      { key: 'lauds',    label: 'Morning Prayer (Lauds)'   },
      { key: 'midday',   label: 'Midday Prayer'            },
      { key: 'vespers',  label: 'Evening Prayer (Vespers)' },
      { key: 'compline', label: 'Night Prayer (Compline)'  },
    ]
    offices.forEach(o => {
      const sections = d.liturgy[o.key]
      if (sections?.length) {
        html += `<div class="lr-reading-heading">${esc(o.label)}</div>`
        html += sections.map(s =>
          `<p style="font-weight:600;font-size:12px;color:#6b7280;margin:8px 0 2px">${esc(s.heading)}</p>
           <p class="lr-reading-body">${esc(s.text)}</p>`
        ).join('')
        const [fieldKey, placeholder] = OFFICE_FIELDS[o.key] || []
        if (fieldKey) html += renderReflection(fieldKey, placeholder)
      }
    })
    if (d.rosary) {
      html += `<div class="lr-reading-heading">Today's Rosary: ${esc(d.rosary.name)}</div>`
      html += `<p style="color:#6b7280;font-size:13px;margin-bottom:8px">${esc(d.rosary.days)}</p>`
      html += d.rosary.mysteries.map(m =>
        `<p class="lr-reading-body"><strong>${m.n}.</strong> ${esc(m.name)} — <em>${esc(m.fruit)}</em> · ${esc(m.ref)}</p>`
      ).join('')
    }
    if (d.rcFast) html += `<p style="font-size:13px;color:#b45309;margin-top:12px">⚠️ Fasting / Abstinence today (RC)</p>`
    if (d.allSaints?.length) {
      html += `<div class="lr-reading-heading">Saints</div>`
      html += d.allSaints.slice(0,3).map(s =>
        `<p class="lr-reading-body"><strong>${esc(s.name)}</strong>${s.bio ? ` — ${esc(s.bio.slice(0,200))}…` : ''}</p>`
      ).join('')
    }
    return html
  }

  function renderOfficesSection() {
    if (state.practicesLoading) return '<p class="lr-loading">Loading practices…</p>'
    if (!state.practices) {
      return `<button class="lr-btn primary" id="lr-load-practices">Load Today's Practices</button>`
    }
    return renderPracticesContent(state.practices)
  }

  function renderIntercessionsSection() {
    const list = state.intercessions.length
      ? state.intercessions.map(i => `
          <div class="lr-intercession${i.active?'':' lr-inactive'}">
            <div style="flex:1">
              <div class="lr-intercession-name">${esc(i.name)}</div>
              ${i.intention ? `<div class="lr-intercession-intention">${esc(i.intention)}</div>` : ''}
            </div>
            <button class="lr-btn sm" data-toggle-intercession="${i.id}">${i.active?'⏸':'▶'}</button>
            <button class="lr-btn sm danger" data-delete-intercession="${i.id}">✕</button>
          </div>`).join('')
      : `<p style="color:#9ca3af;font-size:14px">No intercessions yet.</p>`

    return `
      <div class="lr-row" style="margin-bottom:8px">
        <p class="lr-section-title" style="margin:0">Prayers for Others</p>
        <button class="lr-btn sm primary" id="lr-add-intercession">+ Add Person</button>
      </div>
      <p style="font-size:13px;color:#6b7280;margin-bottom:16px">People and intentions you bring to prayer each day.</p>
      <div id="lr-intercession-list">${list}</div>
      ${renderReflection('prayer_notes', 'General prayer notes for today…')}
    `
  }

  const EXAMEN_STEPS = [
    { key: 'examen_gratitude',    title: 'Gratitude',         desc: 'Give thanks for the gifts of the day' },
    { key: 'examen_light',        title: 'Ask for Light',     desc: 'Pray for clarity to see where God has been at work' },
    { key: 'examen_review',       title: 'Review the Day',    desc: 'Walk through your day with awareness' },
    { key: 'examen_shortcomings', title: 'Shortcomings',      desc: 'Where did you fall short of your values?' },
    { key: 'examen_forward',      title: 'Look Forward',      desc: 'Resolve and look toward tomorrow with hope' },
  ]

  function renderExamenSection() {
    return `
      <p class="lr-section-title">Daily Examen</p>
      <p style="font-size:13px;opacity:.6;margin:-8px 0 20px">A prayerful review of the day in five steps.</p>
      ${EXAMEN_STEPS.map((step, i) => `
        <div class="lr-examen-step">
          <div class="lr-examen-num">Step ${i + 1}</div>
          <div class="lr-examen-title">${esc(step.title)}</div>
          <div class="lr-examen-desc">${esc(step.desc)}</div>
          <textarea class="lr-textarea lr-auto-field" data-field-key="${step.key}" rows="3"
            placeholder="Write your reflection…">${esc(state.todayFields[step.key] || '')}</textarea>
        </div>`).join('')}
    `
  }

  function renderPrayerPanel() {
    return `
      <div class="lr-row" style="margin-bottom:16px">
        <button class="lr-btn${state.practiceSection==='offices'?' active':''}" data-psec="offices">Offices &amp; Practices</button>
        <button class="lr-btn${state.practiceSection==='intercessions'?' active':''}" data-psec="intercessions">Intercessions</button>
        <button class="lr-btn${state.practiceSection==='examen'?' active':''}" data-psec="examen">Examen</button>
      </div>
      ${state.practiceSection==='offices'       ? renderOfficesSection()       :
        state.practiceSection==='intercessions' ? renderIntercessionsSection() :
                                                  renderExamenSection()}
    `
  }

  // ── Contemplative tab ────────────────────────────────────────────────────────

  function renderContemplativeLibrary() {
    const sources = [
      { id: '',       label: 'All'                  },
      { id: 'cloud',  label: 'Cloud of Unknowing'   },
      { id: 'cassian',label: 'John Cassian'         },
      { id: 'merton', label: 'Thomas Merton'        },
      { id: 'keating',label: 'Thomas Keating'       },
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
            <div class="lr-library-card" data-lib-id="${esc(p.id)}" data-lib-src="${esc(p.source)}"
              style="cursor:pointer" title="Click to use as today's passage">
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

  function renderContemplativePanel() {
    if (state.libraryOpen) return renderContemplativeLibrary()

    if (!state.todayPassage) {
      return `<button class="lr-btn primary" id="lr-load-contemplative">Load Today's Passage</button>`
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
      ${p.title    ? `<h3 style="margin:10px 0 6px;font-size:16px">${esc(p.title)}</h3>` : ''}
      ${p.reference ? `<p style="font-size:13px;font-style:italic;color:#6b7280;margin-bottom:10px">${esc(p.reference)}</p>` : ''}
      <div class="lr-passage-text">${esc(p.text || p.body || '')}</div>
      ${renderReflection('contemplative_reflection', 'Your reflection on this passage…')}
    `
  }

  // ── Ignatian tab ─────────────────────────────────────────────────────────────

  function renderIgnatianCard(data, annotation) {
    if (!data) {
      return `<button class="lr-btn primary" data-load-ig="${annotation}">Load Retreat</button>`
    }
    if (data.needsSetup) {
      return `
        <div class="lr-card">
          <p class="lr-label">Start ${annotation === '19' ? '19th Annotation (34 weeks)' : '18th Annotation (shorter retreat)'}</p>
          <div class="lr-row" style="margin-top:10px">
            <input type="date" class="lr-input" id="lr-ig${annotation}-start-date" value="${state.ignatianStartDate}">
            <button class="lr-btn primary" data-start-ig="${annotation}">Begin Retreat</button>
          </div>
        </div>`
    }
    if (data.completed) {
      return `
        <div class="lr-ignatian-card">
          <h3>🎉 Retreat Complete</h3>
          <p style="font-size:14px;color:#166534">You have completed all ${data.totalWeeks} weeks. Glory to God.</p>
          <button class="lr-btn sm" data-reset-ig="${annotation}" style="margin-top:12px">Reset</button>
        </div>`
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
            <p style="font-size:15px;color:#1a2e1a;margin:10px 0;line-height:1.8">${esc(day.reflection)}</p>
          </div>` : '<p style="font-size:13px;color:#6b7280">Rest and review day — no new material.</p>'}
        <div class="lr-row" style="margin-top:14px">
          ${data.isPaused
            ? `<button class="lr-btn sm primary" data-resume-ig="${annotation}">Resume</button>`
            : `<button class="lr-btn sm" data-pause-ig="${annotation}">Pause</button>`}
          <button class="lr-btn sm danger" data-reset-ig="${annotation}">Reset</button>
        </div>
      </div>
      ${renderReflection('ignatian_reflection', "Your reflection on today's retreat material…")}
    `
  }

  function renderIgnatianPanel() {
    return `
      <div class="lr-row" style="margin-bottom:16px">
        <button class="lr-btn${state.ignatianTab==='19'?' active':''}" data-ig-tab="19">19th Annotation</button>
        <button class="lr-btn${state.ignatianTab==='18'?' active':''}" data-ig-tab="18">18th Annotation</button>
      </div>
      ${state.ignatianTab==='19'
        ? renderIgnatianCard(state.ignatianData, '19')
        : renderIgnatianCard(state.ignatian18Data, '18')}
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

  // ── Modal ─────────────────────────────────────────────────────────────────────

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
          </div>`).join('')}
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
      fields.forEach(f => { values[f.id] = bg.querySelector(`#lr-modal-${f.id}`).value.trim() })
      bg.remove()
      onSubmit(values)
    }
  }

  // ── Event binding ────────────────────────────────────────────────────────────

  function bindEvents(container) {
    // ── Tabs ──
    container.querySelectorAll('.lr-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        state.tab = btn.dataset.tab
        render(container)
        if (state.tab === 'readings' && !state.readingData && !state.readingLoading) {
          loadReading(container)
        }
      })
    })

    // ── Auto-save fields ──
    container.querySelectorAll('.lr-auto-field').forEach(el => {
      el.addEventListener('input', () => setField(el.dataset.fieldKey, el.value))
    })

    // ── Journal ──
    container.querySelector('#lr-journal-mode-write')?.addEventListener('click', () => {
      state.journalMode = 'write'
      state.journalDate = todayStr()
      render(container)
    })

    container.querySelector('#lr-journal-mode-read')?.addEventListener('click', async () => {
      state.journalMode = 'read'
      if (!state.journalHistory.length) state.journalHistory = await api.get('/journal') || []
      state.journalDate     = todayStr()
      state.journalReadFields = state.todayFields
      render(container)
    })

    container.querySelector('#lr-history-toggle')?.addEventListener('click', async () => {
      state.journalHistoryOpen = !state.journalHistoryOpen
      if (state.journalHistoryOpen && !state.journalHistory.length) {
        state.journalHistory = await api.get('/journal') || []
      }
      render(container)
    })

    container.querySelectorAll('.lr-history-item[data-date]').forEach(el => {
      el.addEventListener('click', () => {
        state.journalDate = el.dataset.date
        loadJournalDate(container, el.dataset.date)
      })
    })

    container.querySelector('#lr-read-date')?.addEventListener('change', e => {
      state.journalDate = e.target.value
      loadJournalDate(container, e.target.value)
    })

    // ── Readings ──
    container.querySelectorAll('[data-source]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.readingSource = btn.dataset.source
        state.readingData   = null
        render(container)
        loadReading(container)
      })
    })

    // ── Prayer: section toggle ──
    container.querySelectorAll('[data-psec]').forEach(btn => {
      btn.addEventListener('click', async () => {
        state.practiceSection = btn.dataset.psec
        render(container)
        if (state.practiceSection === 'intercessions' && !state.intercessions.length) {
          await loadIntercessions(container)
          render(container)
        }
      })
    })

    container.querySelector('#lr-load-practices')?.addEventListener('click', () => {
      loadPractices(container)
    })

    // ── Intercessions ──
    container.querySelector('#lr-add-intercession')?.addEventListener('click', () => {
      showModal('Add Intercession', [
        { id: 'name',      label: 'Name *',               placeholder: 'e.g. Mary' },
        { id: 'intention', label: 'Intention (optional)', placeholder: 'e.g. Recovery from illness', multiline: true },
      ], async ({ name, intention }) => {
        if (!name) return
        await api.post('/intercessions', { name, intention: intention || undefined })
        await loadIntercessions(container)
        render(container)
      })
    })

    container.querySelectorAll('[data-toggle-intercession]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id   = parseInt(btn.dataset.toggleIntercession, 10)
        const item = state.intercessions.find(i => i.id === id)
        if (!item) return
        await api.put(`/intercessions/${id}`, { active: item.active ? 0 : 1 })
        await loadIntercessions(container)
        render(container)
      })
    })

    container.querySelectorAll('[data-delete-intercession]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await api.delete(`/intercessions/${parseInt(btn.dataset.deleteIntercession, 10)}`)
        await loadIntercessions(container)
        render(container)
      })
    })

    // ── Contemplative ──
    container.querySelector('#lr-load-contemplative')?.addEventListener('click', () => {
      loadTodayPassage(container)
    })

    container.querySelector('#lr-open-library')?.addEventListener('click', () => {
      state.libraryOpen = true
      render(container)
      loadLibrary(container)
    })

    container.querySelector('#lr-close-library')?.addEventListener('click', () => {
      state.libraryOpen = false
      render(container)
    })

    container.querySelectorAll('[data-lib-source]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.librarySource = btn.dataset.libSource
        render(container)
      })
    })

    container.querySelectorAll('.lr-library-card[data-lib-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id       = card.dataset.libId
        const src      = card.dataset.libSrc
        const passages = state.libraryData?.sources?.[src] || []
        const passage  = passages.find(p => p.id === id)
        if (!passage) return
        state.todayPassage = passage
        state.libraryOpen  = false
        render(container)
      })
    })

    // ── Ignatian ──
    container.querySelectorAll('[data-ig-tab]').forEach(btn => {
      btn.addEventListener('click', () => { state.ignatianTab = btn.dataset.igTab; render(container) })
    })

    container.querySelectorAll('[data-load-ig]').forEach(btn => {
      btn.addEventListener('click', () => loadIgnatian(container, btn.dataset.loadIg))
    })

    container.querySelectorAll('[data-start-ig]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const a      = btn.dataset.startIg
        const dateEl = container.querySelector(`#lr-ig${a}-start-date`)
        const data   = await api.put(a === '19' ? '/ignatian/start' : '/ignatian18/start',
          { start_date: dateEl?.value || todayStr() })
        if (a === '19') state.ignatianData = data; else state.ignatian18Data = data
        render(container)
      })
    })

    container.querySelectorAll('[data-pause-ig]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const a    = btn.dataset.pauseIg
        const data = await api.post(a === '19' ? '/ignatian/pause' : '/ignatian18/pause', {})
        if (a === '19') state.ignatianData = data; else state.ignatian18Data = data
        render(container)
      })
    })

    container.querySelectorAll('[data-resume-ig]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const a    = btn.dataset.resumeIg
        const data = await api.post(a === '19' ? '/ignatian/resume' : '/ignatian18/resume', {})
        if (a === '19') state.ignatianData = data; else state.ignatian18Data = data
        render(container)
      })
    })

    container.querySelectorAll('[data-reset-ig]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const a    = btn.dataset.resetIg
        const data = await api.post(a === '19' ? '/ignatian/reset' : '/ignatian18/reset', {})
        if (a === '19') state.ignatianData = data; else state.ignatian18Data = data
        render(container)
      })
    })
  }

  // ── Data loaders ─────────────────────────────────────────────────────────────

  async function loadTodayFields() {
    const entry   = await api.get(`/journal/${todayStr()}`)
    const content = entry.content || ''
    if (content.trimStart().startsWith('{')) {
      try { state.todayFields = JSON.parse(content) } catch { state.todayFields = {} }
    } else if (content.trim()) {
      state.todayFields = { free_write: content }
    } else {
      state.todayFields = {}
    }
    state.fieldsLoaded = true
  }

  async function loadJournalDate(container, date) {
    if (date === todayStr()) {
      state.journalReadFields  = state.todayFields
      state.journalReadLoading = false
      render(container)
      return
    }
    state.journalReadLoading = true
    render(container)
    const entry   = await api.get(`/journal/${date}`)
    const content = entry.content || ''
    if (content.trimStart().startsWith('{')) {
      try { state.journalReadFields = JSON.parse(content) } catch { state.journalReadFields = {} }
    } else if (content.trim()) {
      state.journalReadFields = { free_write: content }
    } else {
      state.journalReadFields = {}
    }
    state.journalReadLoading = false
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
    try { state.practices = await api.get('/readings/practices') } catch {}
    state.practicesLoading = false
    render(container)
  }

  async function loadIntercessions() {
    state.intercessions = await api.get('/intercessions') || []
  }

  async function loadTodayPassage(container) {
    const data = await api.get('/contemplative/today')
    state.todayPassage = data.passage
    render(container)
  }

  async function loadLibrary(container) {
    state.libraryData = null
    render(container)
    state.libraryData = await api.get('/contemplative/browse')
    render(container)
  }

  async function loadIgnatian(container, annotation) {
    const data = await api.get(annotation === '19' ? '/ignatian' : '/ignatian18')
    if (annotation === '19') state.ignatianData = data; else state.ignatian18Data = data
    render(container)
  }

  // ── Module registration ──────────────────────────────────────────────────────

  window.Mosaic.registerModule({
    slug: 'lectio',

    init(shell) { _shell = shell },

    async onActivate(container) {
      _container = container

      if (!document.getElementById('lr-styles')) {
        _styleEl = document.createElement('style')
        _styleEl.id = 'lr-styles'
        _styleEl.textContent = CSS
        document.head.appendChild(_styleEl)
      }

      render(container)
      await loadTodayFields()
      render(container)

      // kick off background loads
      if (!state.todayPassage)  loadTodayPassage(container)
      if (state.tab === 'readings' && !state.readingData) loadReading(container)
    },

    onDeactivate() {
      clearTimeout(_saveTimer)
      _saveTimer = null
      if (_styleEl) { _styleEl.remove(); _styleEl = null }
      _container = null
    },
  })

})()
