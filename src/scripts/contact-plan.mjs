// DOM wiring for the "Plan your day" request builder (src/components/contact/PlanRequest.astro).
// Payload rules live in contact-request.mjs; URL prefill in contact-prefill.mjs.
// Everything user-provided is written through textContent / .value, never as HTML.
import { buildContactRequest, clampGuests, isAskOnly, whatsappText, MAX_GUESTS } from './contact-request.mjs'
import { contactPrefill } from './contact-prefill.mjs'

const STEPS = 3
const MIN_FILL_MS = 3500
const COOLDOWN_MS = 60_000
const COOLDOWN_KEY = 'amalfi-contact-last-submit-at'
const FALLBACK_EMAIL = 'hello@amalfi.day'
const RETRY_CODES = new Set([404, 405, 500, 502, 503, 504])
const STEP_FIELDS = { 1: ['services'], 2: ['dates', 'to'], 3: ['contact', 'message', 'gdpr'] }
const FIELD_STEP = { services: 1, dates: 2, to: 2, contact: 3, message: 3, gdpr: 3 }

const isoToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const nextIso = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + 1))
  return t.toISOString().slice(0, 10)
}

function withTimeout(promise, ms) {
  let id
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      id = setTimeout(() => reject(new Error('timeout')), ms)
    }),
  ]).finally(() => clearTimeout(id))
}

// Same visitor metadata the old form sent (city/IP help us answer in the right language).
async function fetchIpMeta() {
  for (const url of ['https://ipapi.co/json/', 'https://ipwho.is/']) {
    try {
      const res = await withTimeout(fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' }), 1800)
      if (!res.ok) continue
      const data = await res.json()
      const location = [data?.city, data?.region || data?.region_name, data?.country_name || data?.country].filter(Boolean).join(', ')
      const lat = data?.latitude ?? data?.lat ?? ''
      const lon = data?.longitude ?? data?.lon ?? ''
      const coords = lat !== '' && lon !== '' ? `${lat}, ${lon}` : ''
      if (data?.ip || location || coords) return { ip: data?.ip || '', location, coords }
    } catch {
      // try the next one
    }
  }
  return { ip: '', location: '', coords: '' }
}

async function postJson(endpoint, body) {
  let res
  try {
    res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch {
    throw Object.assign(new Error('Network error'), { code: 'network' })
  }
  let result = {}
  try {
    const raw = await res.text()
    result = raw ? JSON.parse(raw) : {}
  } catch {
    result = {}
  }
  if (!res.ok || result.error) {
    throw Object.assign(new Error(result.error || `Request failed (${res.status})`), {
      status: res.status,
      code: res.status >= 500 || RETRY_CODES.has(res.status) ? 'server' : 'request',
    })
  }
}

/**
 * @param {HTMLElement} root  [data-plan]
 * @param {{ packages?: Array<{id:string,name:string,durationMinutes:number,photoCount:number,price:number}> }} [options]
 */
export function initPlan(root, options = {}) {
  const form = root.querySelector('.plan-form')
  if (!form) return
  const $ = (sel) => root.querySelector(sel)
  const $$ = (sel) => Array.from(root.querySelectorAll(sel))

  const panels = $$('[data-step-panel]')
  const dots = $$('[data-goto]')
  const progress = $('[data-plan-progress]')
  const backBtn = $('[data-plan-back]')
  const nextBtn = $('[data-plan-next]')
  const submitBtn = $('[data-plan-submit]')
  const status = $('[data-plan-status]')
  const summary = $('[data-plan-summary]')
  const done = $('[data-plan-done]')
  const rooms = $('[data-needs="stay"]')
  const roomsNote = $('[data-rooms-note]')
  const serviceBoxes = $$('input[name="service"]')
  const unitRadios = $$('input[name="unit"]')
  const field = (name) => form.querySelector(`[name="${name}"]`)
  const fromInput = field('from')
  const toInput = field('to')
  const guestsInput = field('guests')
  const gdpr = field('gdpr')
  const honeypot = field('company_website')
  const primaryEndpoint = form.dataset.primaryEndpoint || '/api/contact'
  const fallbackEndpoint = form.dataset.fallbackEndpoint || ''

  let step = 1
  let reached = 1
  let startedAt = Date.now()

  // ---- enhance -------------------------------------------------------------
  root.classList.add('is-enhanced')
  form.noValidate = true
  form.removeAttribute('action')
  form.removeAttribute('enctype')
  progress.hidden = false
  summary.hidden = false
  $$('.plan-stepper__btn').forEach((b) => (b.hidden = false))
  const today = isoToday()
  fromInput.min = today
  toInput.min = nextIso(today)

  const state = () => ({
    services: serviceBoxes.filter((b) => b.checked).map((b) => b.value),
    from: fromInput.value,
    to: toInput.value,
    place: field('place').value,
    guests: guestsInput.value,
    unit: unitRadios.find((r) => r.checked)?.value || '',
    name: field('name').value,
    contact: field('contact').value,
    message: field('message').value,
    honeypot: honeypot?.value || '',
  })

  const setStatus = (text, kind = '') => {
    status.textContent = text
    status.dataset.state = kind
  }

  // ---- errors --------------------------------------------------------------
  const errorTargets = {
    services: () => serviceBoxes,
    dates: () => [fromInput, field('place')],
    to: () => [toInput],
    contact: () => [field('contact')],
    message: () => [field('message')],
    gdpr: () => [gdpr],
  }

  function showErrors(errors, names) {
    let first = null
    for (const name of names) {
      const box = root.querySelector(`[data-error="${name}"]`)
      const msg = errors[name] || ''
      if (box) {
        box.textContent = msg
        box.hidden = !msg
      }
      for (const el of errorTargets[name]?.() ?? []) {
        if (msg) el.setAttribute('aria-invalid', 'true')
        else el.removeAttribute('aria-invalid')
      }
      if (msg && !first) first = errorTargets[name]?.()[0] ?? null
    }
    return first
  }

  function errorsFor(n) {
    const { errors } = buildContactRequest(state())
    if (n === 3 && !gdpr.checked) errors.gdpr = 'Please tick the consent box so we can send your request.'
    const names = STEP_FIELDS[n]
    const own = Object.fromEntries(names.filter((k) => errors[k]).map((k) => [k, errors[k]]))
    return { own, names }
  }

  function validateStep(n) {
    const { own, names } = errorsFor(n)
    const first = showErrors(own, names)
    if (first) first.focus()
    return !first
  }

  // ---- steps ---------------------------------------------------------------
  function render(focus) {
    root.dataset.step = String(step)
    panels.forEach((p) => (p.hidden = Number(p.dataset.stepPanel) !== step))
    dots.forEach((d) => {
      const n = Number(d.dataset.goto)
      d.classList.toggle('is-current', n === step)
      d.classList.toggle('is-done', n < step)
      d.disabled = n > reached || n === step || (n === 2 && askOnly())
      if (n === step) d.setAttribute('aria-current', 'step')
      else d.removeAttribute('aria-current')
    })
    backBtn.hidden = step === 1
    nextBtn.hidden = step === STEPS
    submitBtn.hidden = step !== STEPS
    if (focus) {
      const title = panels[step - 1].querySelector('.plan-step__title')
      title?.focus({ preventScroll: true })
      const top = root.getBoundingClientRect().top
      if (top < 0 || top > innerHeight * 0.5) root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    }
  }

  const askOnly = () => isAskOnly(state().services)

  function go(n, focus = true) {
    // A plain question skips the dates step in both directions.
    if (n === 2 && askOnly()) n = step > 2 ? 1 : 3
    step = Math.min(Math.max(n, 1), STEPS)
    reached = Math.max(reached, step)
    setStatus('')
    render(focus)
  }

  nextBtn.addEventListener('click', () => {
    if (validateStep(step)) go(step + 1)
  })
  backBtn.addEventListener('click', () => go(step - 1))
  dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.goto))))

  // Enter in a text field moves forward instead of submitting half a request.
  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.isComposing || step === STEPS) return
    const t = event.target
    if (t instanceof HTMLInputElement && t.type !== 'checkbox' && t.type !== 'radio') {
      event.preventDefault()
      nextBtn.click()
    }
  })

  // ---- live parts ----------------------------------------------------------
  function syncRooms() {
    const s = state()
    const stay = s.services.includes('stay')
    rooms.hidden = !stay
    const guests = clampGuests(s.guests)
    let dropped = ''
    unitRadios.forEach((r) => {
      const max = Number(r.closest('[data-max-guests]')?.dataset.maxGuests || MAX_GUESTS)
      const tooSmall = guests > max
      r.disabled = tooSmall
      if (tooSmall && r.checked) {
        dropped = r.dataset.label || ''
        r.checked = false
        unitRadios[0].checked = true
      }
    })
    const anyDisabled = unitRadios.some((r) => r.disabled)
    roomsNote.hidden = !anyDisabled
    roomsNote.textContent = anyDisabled
      ? `${dropped ? `${dropped} is too small for ${guests}. ` : ''}Rooms for fewer than ${guests} guests are greyed out; for bigger groups we combine rooms.`
      : ''
  }

  function syncGuestsButtons() {
    const g = clampGuests(guestsInput.value)
    root.querySelector('[data-guests="-1"]').disabled = g <= 1
    root.querySelector('[data-guests="1"]').disabled = g >= MAX_GUESTS
  }

  function syncSummary() {
    const { summary: s } = buildContactRequest(state())
    const put = (key, value) => {
      const dd = root.querySelector(`[data-sum="${key}"]`)
      if (!dd) return
      dd.textContent = value || dd.dataset.empty || ''
      dd.classList.toggle('is-empty', !value)
    }
    put('services', s.services.join(' + '))
    put('when', [s.dates, s.place].filter(Boolean).join(' · '))
    put('guests', s.guests)
    put('room', s.room)
    root.querySelector('[data-sum-row="room"]').hidden = !s.room
    put('from', [s.name, s.contact].filter(Boolean).join(' · '))
  }

  function syncAll() {
    syncRooms()
    syncGuestsButtons()
    syncSummary()
  }

  form.addEventListener('input', (event) => {
    if (event.target === fromInput && fromInput.value) {
      toInput.min = nextIso(fromInput.value)
      if (toInput.value && toInput.value <= fromInput.value) toInput.value = ''
    }
    // Clear a shown error as soon as the visitor fixes that field.
    const name = Object.keys(errorTargets).find((k) => errorTargets[k]().includes(event.target))
    if (name && root.querySelector(`[data-error="${name}"]:not([hidden])`)) {
      const { own } = errorsFor(FIELD_STEP[name])
      showErrors(own, [name])
    }
    syncAll()
  })
  const messageLabel = root.querySelector('[data-message-label]')
  const messageField = field('message')
  const messageDefaults = { label: messageLabel?.innerHTML || '', placeholder: messageField.placeholder }
  function syncAskMode() {
    const ask = askOnly()
    root.toggleAttribute('data-ask', ask)
    if (messageLabel) messageLabel.innerHTML = ask ? 'Your question' : messageDefaults.label
    messageField.placeholder = ask ? 'Ask us anything: transfers, porters, workshops, the coast…' : messageDefaults.placeholder
    messageField.required = ask
  }

  function startAsk() {
    serviceBoxes.forEach((b) => (b.checked = b.value === 'other'))
    showErrors({}, ['services'])
    syncAll()
    syncAskMode()
    reached = STEPS
    go(STEPS)
  }
  root.querySelector('[data-ask-btn]')?.addEventListener('click', startAsk)

  form.addEventListener('change', (event) => {
    const box = event.target
    if (box instanceof HTMLInputElement && box.name === 'service' && box.checked) {
      // "Ask" stands alone and opens the contact step straight away.
      if (box.value === 'other') {
        startAsk()
        return
      }
      serviceBoxes.forEach((b) => { if (b.value === 'other') b.checked = false })
    }
    syncAll()
    syncAskMode()
  })

  root.querySelectorAll('[data-guests]').forEach((btn) =>
    btn.addEventListener('click', () => {
      guestsInput.value = String(clampGuests(Number(guestsInput.value) + Number(btn.dataset.guests)))
      syncAll()
    }),
  )
  guestsInput.addEventListener('blur', () => {
    guestsInput.value = String(clampGuests(guestsInput.value))
    syncAll()
  })

  // ---- prefill -------------------------------------------------------------
  function applyPrefill(search) {
    const params = new URLSearchParams(search)
    const p = contactPrefill(params)
    const spot = params.get('spot')
    const location = params.get('location')
    const pkg = (options.packages || []).find((x) => x.id === params.get('package'))
    const tile = p.tile || (spot || pkg ? 'photoshoot' : null)
    if (tile) serviceBoxes.forEach((b) => (b.checked = b.checked || b.value === tile))
    if (p.unit) {
      const radio = unitRadios.find((r) => r.value === p.unit.id)
      if (radio) radio.checked = true
      const max = Number(radio?.closest('[data-max-guests]')?.dataset.maxGuests || 0)
      if (max && clampGuests(guestsInput.value) > max) guestsInput.value = String(max)
    }
    const place = field('place')
    if (!place.value.trim()) {
      if (p.dates) place.value = p.dates
      else if (location) place.value = location
    }
    const message = field('message')
    if (!message.value.trim()) {
      if (p.message) message.value = p.message
      else if (pkg) message.value = `I'd like to book ${pkg.name}: ${pkg.durationMinutes} minutes, ${pkg.photoCount}+ retouched photos, base price €${pkg.price}.`
      else if (spot) message.value = `I'm interested in a photoshoot at ${location ? `${spot}, ${location}` : spot}.`
    }
    syncAll()
    return Boolean(tile)
  }

  if (applyPrefill(location.search)) {
    reached = askOnly() ? STEPS : 2
    step = reached
  }
  syncAskMode()
  render(false)

  // Links on this page to /contact/?service=… pick the tile without a reload.
  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[data-plan-link]') : null
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return
    const url = new URL(link.href, location.href)
    if (url.pathname !== location.pathname) return
    event.preventDefault()
    if (!done.hidden) resetAll()
    if (url.searchParams.get('service') === 'other') serviceBoxes.forEach((b) => (b.checked = false))
    applyPrefill(url.search)
    syncAskMode()
    history.replaceState(null, '', `${url.pathname}${url.search}#plan`)
    const target = askOnly() ? STEPS : 2
    reached = Math.max(reached, target)
    go(target)
  })

  // ---- submit --------------------------------------------------------------
  function lastSubmitAt() {
    try {
      return Number(localStorage.getItem(COOLDOWN_KEY)) || 0
    } catch {
      return 0
    }
  }

  function showDone(s) {
    form.hidden = true
    progress.hidden = true
    summary.hidden = true
    $('.plan__head > p').hidden = true
    $('[data-done-name]').textContent = s.name ? `, ${s.name.split(' ')[0]}` : ''
    const wa = $('[data-done-whatsapp]')
    const base = wa.getAttribute('href').split('?')[0]
    wa.href = `${base}?text=${encodeURIComponent(whatsappText(s))}`
    done.hidden = false
    done.focus({ preventScroll: true })
    if (root.getBoundingClientRect().top < 0) root.scrollIntoView({ block: 'start' })
  }

  function resetAll() {
    form.reset()
    done.hidden = true
    form.hidden = false
    summary.hidden = false
    $('.plan__head > p').hidden = false
    startedAt = Date.now()
    reached = 1
    showErrors({}, Object.keys(errorTargets))
    syncAll()
    syncAskMode()
    go(1)
  }

  $('[data-plan-again]').addEventListener('click', resetAll)

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (step !== STEPS) {
      nextBtn.click()
      return
    }

    const request = buildContactRequest(state())

    if (request.payload.company_website.trim()) {
      showDone(request.summary)
      return
    }

    // Re-check every step; jump back to the first one with a problem.
    for (let n = 1; n <= STEPS; n += 1) {
      const { own } = errorsFor(n)
      if (Object.keys(own).length) {
        if (n !== step) go(n, false)
        validateStep(n)
        setStatus('Please check the highlighted field.', 'error')
        return
      }
    }

    if (Date.now() - startedAt < MIN_FILL_MS) {
      setStatus('Please wait a few seconds before sending.', 'error')
      return
    }
    const last = lastSubmitAt()
    if (last && Date.now() - last < COOLDOWN_MS) {
      setStatus('Please wait one minute before sending another request.', 'error')
      return
    }

    setStatus('Sending your request…')
    submitBtn.disabled = true
    const meta = await fetchIpMeta()
    const body = {
      ...request.payload,
      _form_started_at: String(startedAt),
      ip: meta.ip,
      location: meta.location,
      coords: meta.coords,
      language: navigator.language || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      userAgent: navigator.userAgent || '',
      referrer: document.referrer || location.href,
      page: location.href,
    }

    try {
      try {
        await postJson(primaryEndpoint, body)
      } catch (error) {
        const retry = fallbackEndpoint && fallbackEndpoint !== primaryEndpoint && (error.code === 'network' || error.code === 'server')
        if (!retry) throw error
        await postJson(fallbackEndpoint, body)
      }
      try {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
      } catch {
        // storage is optional
      }
      setStatus('')
      showDone(request.summary)
    } catch (error) {
      console.error('Contact form request failed:', error)
      setStatus(
        error?.status === 429
          ? 'Too many requests from this connection. Please try again in a few minutes, or write on WhatsApp.'
          : `Sorry, the request did not go through. Write to ${FALLBACK_EMAIL} or on WhatsApp.`,
        'error',
      )
    } finally {
      submitBtn.disabled = false
    }
  })
}
