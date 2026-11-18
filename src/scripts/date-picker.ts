// Site-wide date picker: a large calendar (two months on desktop, a bottom sheet on phones)
// built on Cally web components. It enhances existing <input type="date"> fields in place:
// the inputs stay in the form as hidden YYYY-MM-DD values, page code keeps reading
// and setting `.value`, `.min` and `.max`, and the picker fires `input` + `change` on them.
import 'cally'
import '../styles/date-picker.css'

export type DatePickerOptions = {
  /** The first (or only) date input. */
  from: HTMLInputElement
  /** The end date input; omit for a single date. */
  to?: HTMLInputElement
  /** Element the desktop popover lines up under (defaults to the trigger's field). */
  anchor?: HTMLElement
  /** Titles of the two slots in the picker header. */
  labels?: { from: string; to?: string }
  /** Text for an empty trigger. */
  placeholder?: string
  /** Footer text for a chosen range, e.g. "5 nights". */
  countLabel?: (nights: number) => string
}

export type DatePicker = {
  /** Extra Cally part names per ISO date, e.g. 'closed', for CSS in date-picker.css. */
  setDayParts: (fn: ((iso: string) => string) | null) => void
  open: (slot?: 'from' | 'to') => void
  close: () => void
}

type CalendarEl = HTMLElement & {
  value: string
  min: string
  max: string
  months: number
  focusedDate?: string
  tentative?: string
  getDayParts?: (date: Date) => string
}

const DESKTOP = '(min-width: 760px)'
const CLOSE_MS = 220
const AUTO_CLOSE_MS = 420

const dayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const isoToUtc = (iso: string) => new Date(`${iso}T00:00:00Z`)
const formatDay = (iso: string) => (iso ? dayFormat.format(isoToUtc(iso)) : '')
const nightsBetween = (a: string, b: string) => Math.round((isoToUtc(b).getTime() - isoToUtc(a).getTime()) / 86_400_000)
const toIso = (d: Date) => d.toISOString().slice(0, 10)
const isIso = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v)

const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!

function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: Array<Node | string>) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v)
  node.append(...children)
  return node
}

const icon = (name: string, slot?: string) => {
  const i = h('i', { class: `ph ph-${name}`, 'aria-hidden': 'true' })
  if (slot) i.setAttribute('slot', slot)
  return i
}

let uid = 0

export function attachDatePicker(opts: DatePickerOptions): DatePicker {
  const { from, to } = opts
  const range = Boolean(to)
  const labels = { from: opts.labels?.from ?? (range ? 'Check-in' : 'Date'), to: opts.labels?.to ?? 'Check-out' }
  const placeholder = opts.placeholder ?? 'Add date'
  const countLabel = opts.countLabel ?? ((n: number) => `${n} night${n === 1 ? '' : 's'}`)
  const id = `dp-${++uid}`
  const inputs = range ? [from, to!] : [from]

  // ---- Triggers replace the native fields; the inputs become hidden value holders.
  const triggers = inputs.map((input, i) => {
    const button = h('button', {
      type: 'button',
      class: 'dp-trigger',
      'aria-haspopup': 'dialog',
      'aria-expanded': 'false',
      'aria-controls': id,
    })
    for (const attr of ['aria-describedby', 'aria-invalid']) {
      const v = input.getAttribute(attr)
      if (v) button.setAttribute(attr, v)
    }
    input.after(button)
    input.type = 'hidden'
    // Validation code focuses and marks the input: forward both to the visible button.
    input.focus = (o?: FocusOptions) => button.focus(o)
    new MutationObserver(() => {
      const v = input.getAttribute('aria-invalid')
      if (v) button.setAttribute('aria-invalid', v)
      else button.removeAttribute('aria-invalid')
    }).observe(input, { attributes: true, attributeFilter: ['aria-invalid'] })
    Object.defineProperty(input, 'value', {
      configurable: true,
      get() { return valueDescriptor.get!.call(this) },
      set(v: string) { valueDescriptor.set!.call(this, v); renderTriggers(); if (isOpen) syncCalendar() },
    })
    button.addEventListener('click', () => open(i === 0 ? 'from' : 'to'))
    return button
  })

  function renderTriggers() {
    inputs.forEach((input, i) => {
      const v = valueDescriptor.get!.call(input) as string
      const b = triggers[i]
      b.textContent = v ? formatDay(v) : placeholder
      b.classList.toggle('is-empty', !v)
    })
  }

  // ---- Picker panel (popover in the top layer, inside an open <dialog> if the field is in one).
  const tag = range ? 'calendar-range' : 'calendar-date'
  const cal = document.createElement(tag) as CalendarEl
  cal.className = 'dp__cal'
  cal.setAttribute('months', '2')
  cal.setAttribute('page-by', 'single')
  cal.setAttribute('first-day-of-week', '1')
  cal.setAttribute('locale', 'en-GB')
  cal.setAttribute('format-weekday', 'short')
  const months = h('div', { class: 'dp__months' },
    document.createElement('calendar-month'),
    Object.assign(document.createElement('calendar-month'), { offset: 1 }),
  )
  cal.append(icon('caret-left', 'previous'), icon('caret-right', 'next'), months)

  const slot = (name: 'from' | 'to', label: string) =>
    h('button', { type: 'button', class: 'dp__slot', 'data-slot': name },
      h('span', { class: 'dp__slot-label' }, label),
      h('span', { class: 'dp__slot-value' }),
    )
  const slots = range ? [slot('from', labels.from), slot('to', labels.to)] : [slot('from', labels.from)]
  const summary = h('div', { class: 'dp__summary' }, slots[0])
  if (range) summary.append(icon('arrow-right'), slots[1])

  const closeBtn = h('button', { type: 'button', class: 'dp__close', 'aria-label': 'Close calendar' }, icon('x'))
  const count = h('span', { class: 'dp__count', 'aria-live': 'polite' })
  const clearBtn = h('button', { type: 'button', class: 'dp__clear' }, 'Clear')
  const doneBtn = h('button', { type: 'button', class: 'dp__done' }, 'Done')

  const panel = h('div', { class: 'dp__panel' },
    h('div', { class: 'dp__grab', 'aria-hidden': 'true' }),
    h('div', { class: 'dp__top' }, summary, closeBtn),
    cal,
    h('div', { class: 'dp__foot' }, count, h('span', { class: 'dp__actions' }, clearBtn, doneBtn)),
  )
  const root = h('div', { class: 'dp', id, role: 'dialog', 'aria-label': range ? 'Choose dates' : 'Choose a date' }, panel)
  const canPopover = typeof root.showPopover === 'function'
  if (canPopover) root.popover = 'manual'
  ;(from.closest('dialog') ?? document.body).append(root)

  let isOpen = false
  let activeSlot: 'from' | 'to' = 'from'
  let returnFocus: HTMLElement | null = null
  let closeTimer: number | undefined
  let autoTimer: number | undefined
  let dayParts: ((iso: string) => string) | null = null
  const desktop = window.matchMedia(DESKTOP)

  const read = (input: HTMLInputElement) => valueDescriptor.get!.call(input) as string

  function write(changes: Array<[HTMLInputElement, string]>) {
    const changed = changes.filter(([input, v]) => read(input) !== v)
    for (const [input, v] of changed) valueDescriptor.set!.call(input, v)
    renderTriggers()
    for (const [input] of changed) {
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  function renderSummary(pendingFrom?: string) {
    const a = pendingFrom ?? read(from)
    const b = pendingFrom ? '' : range ? read(to!) : ''
    const set = (el: HTMLElement, v: string) => {
      const value = el.querySelector<HTMLElement>('.dp__slot-value')!
      value.textContent = v ? formatDay(v) : placeholder
      el.classList.toggle('is-empty', !v)
    }
    set(slots[0], a)
    if (range) set(slots[1], b)
    slots.forEach((s) => s.classList.toggle('is-active', s.dataset.slot === activeSlot))
    count.textContent = range && a && b ? countLabel(nightsBetween(a, b)) : range && a ? `Now choose ${labels.to.toLowerCase()}` : ''
    clearBtn.disabled = !a && !b
  }

  function syncCalendar() {
    const a = read(from)
    const b = range ? read(to!) : ''
    cal.min = from.min || ''
    cal.max = (range ? to!.max : '') || from.max || ''
    cal.value = range ? (a && b ? `${a}/${b}` : '') : a
    if (range) cal.tentative = activeSlot === 'to' && a && !b ? a : undefined
    const focus = (activeSlot === 'to' && b) || a || (isIso(cal.min) ? cal.min : '')
    if (focus) cal.focusedDate = focus
    renderSummary()
  }

  function layout() {
    const wide = desktop.matches
    cal.months = wide ? 2 : 1
    root.classList.toggle('dp--sheet', !wide)
    if (!wide) {
      root.style.removeProperty('top')
      root.style.removeProperty('left')
      return
    }
    const anchor = opts.anchor ?? triggers[0].closest('label, .field, div') ?? triggers[0]
    const r = (anchor as HTMLElement).getBoundingClientRect()
    const pw = panel.offsetWidth
    const ph = panel.offsetHeight
    const gap = 10
    const vw = document.documentElement.clientWidth
    const vh = window.innerHeight
    let left = Math.min(Math.max(12, r.left), vw - pw - 12)
    if (r.width > pw) left = Math.min(Math.max(12, r.left + (r.width - pw) / 2), vw - pw - 12)
    let top = r.bottom + gap
    const above = r.top - gap - ph
    if (top + ph > vh - 12 && above >= 12) top = above
    else if (top + ph > vh - 12) top = Math.max(12, vh - ph - 12)
    root.style.top = `${Math.round(top)}px`
    root.style.left = `${Math.round(left)}px`
    root.dataset.side = top < r.top ? 'above' : 'below'
  }

  // Desktop, page scroll only: when the panel fits neither below nor above the fields,
  // scroll the page so it opens under them instead of covering them.
  function makeRoom() {
    if (!desktop.matches || from.closest('dialog')) return
    const anchor = (opts.anchor ?? triggers[0]) as HTMLElement
    const r = anchor.getBoundingClientRect()
    const ph = panel.offsetHeight
    const vh = window.innerHeight
    const below = vh - r.bottom - 22
    const above = r.top - 22
    if (below >= ph || above >= ph) return
    const need = ph - below
    const header = 110
    const delta = Math.min(need, Math.max(0, r.top - header))
    if (delta > 0) window.scrollBy({ top: delta, behavior: 'instant' as ScrollBehavior })
  }

  function open(which: 'from' | 'to' = 'from') {
    window.clearTimeout(closeTimer)
    window.clearTimeout(autoTimer)
    activeSlot = range && which === 'to' && read(from) ? 'to' : 'from'
    if (!isOpen) returnFocus = document.activeElement as HTMLElement | null
    isOpen = true
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'true'))
    syncCalendar()
    root.classList.remove('is-open')
    if (canPopover && !root.matches(':popover-open')) root.showPopover()
    root.classList.add('is-shown')
    makeRoom()
    layout()
    if (!desktop.matches) document.documentElement.classList.add('dp-lock')
    requestAnimationFrame(() => {
      root.classList.add('is-open')
      ;(cal as unknown as { focus: (o?: object) => void }).focus({ preventScroll: true })
    })
    document.addEventListener('pointerdown', onOutside, true)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', layout)
    window.addEventListener('scroll', onScroll, true)
  }

  function close(restoreFocus = true) {
    if (!isOpen) return
    isOpen = false
    window.clearTimeout(autoTimer)
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'))
    root.classList.remove('is-open')
    document.documentElement.classList.remove('dp-lock')
    document.removeEventListener('pointerdown', onOutside, true)
    document.removeEventListener('keydown', onKey, true)
    window.removeEventListener('resize', layout)
    window.removeEventListener('scroll', onScroll, true)
    closeTimer = window.setTimeout(() => {
      root.classList.remove('is-shown')
      if (canPopover && root.matches(':popover-open')) root.hidePopover()
    }, CLOSE_MS)
    if (restoreFocus) {
      const target = triggers.includes(returnFocus as HTMLButtonElement) ? returnFocus : triggers[0]
      target?.focus({ preventScroll: true })
    }
  }

  function onOutside(event: PointerEvent) {
    const path = event.composedPath()
    if (path.includes(panel) || triggers.some((t) => path.includes(t))) return
    // Clicking the field's label opens the picker again through the button: let it through.
    if (triggers.some((t) => path.includes(t.closest('label') as EventTarget))) return
    close(false)
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
    }
  }

  function onScroll(event: Event) {
    if (!desktop.matches || panel.contains(event.target as Node)) return
    layout()
  }

  // ---- Selection
  if (range) {
    cal.addEventListener('rangestart', (event) => {
      window.clearTimeout(autoTimer)
      const start = toIso((event as CustomEvent<Date>).detail)
      activeSlot = 'to'
      write([[to!, ''], [from, start]])
      renderSummary(start)
    })
    cal.addEventListener('change', () => {
      const [a, b] = cal.value.split('/')
      if (!a || !b) return
      if (a === b) {
        // A stay needs at least one night: keep the start and wait for a later end date.
        cal.value = ''
        cal.tentative = a
        renderSummary(a)
        return
      }
      write([[from, a], [to!, b]])
      activeSlot = 'from'
      renderSummary()
      autoTimer = window.setTimeout(() => close(), AUTO_CLOSE_MS)
    })
  } else {
    cal.addEventListener('change', () => {
      write([[from, cal.value]])
      renderSummary()
      autoTimer = window.setTimeout(() => close(), AUTO_CLOSE_MS)
    })
  }

  slots.forEach((s) => s.addEventListener('click', () => {
    if (s.dataset.slot === 'to' && read(from)) {
      activeSlot = 'to'
      cal.value = ''
      cal.tentative = read(from)
    } else {
      activeSlot = 'from'
      if (range) cal.tentative = undefined
    }
    renderSummary()
  }))

  clearBtn.addEventListener('click', () => {
    write(range ? [[to!, ''], [from, '']] : [[from, '']])
    activeSlot = 'from'
    syncCalendar()
  })
  doneBtn.addEventListener('click', () => close())
  closeBtn.addEventListener('click', () => close())

  // Month change: slide the months in from the side they come from.
  const slide = (dir: 'next' | 'prev') => {
    months.classList.remove('is-next', 'is-prev')
    void months.offsetWidth
    months.classList.add(dir === 'next' ? 'is-next' : 'is-prev')
  }
  cal.addEventListener('click', (event) => {
    const target = event.composedPath().find((n) => n instanceof HTMLElement && n.getAttribute('part')?.includes('button')) as HTMLElement | undefined
    const part = target?.getAttribute('part') ?? ''
    if (/\bnext\b/.test(part) && !/\bdisabled\b/.test(part)) slide('next')
    else if (/\bprevious\b/.test(part) && !/\bdisabled\b/.test(part)) slide('prev')
  })

  // Swipe between months on touch screens.
  let touchX = 0
  let touchY = 0
  months.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY }, { passive: true })
  months.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX
    const dy = e.changedTouches[0].clientY - touchY
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    const btn = cal.shadowRoot?.querySelector<HTMLButtonElement>(`[part~="${dx < 0 ? 'next' : 'previous'}"]`)
    if (btn && btn.getAttribute('aria-disabled') !== 'true') {
      btn.click()
      slide(dx < 0 ? 'next' : 'prev')
    }
  }, { passive: true })

  renderTriggers()

  return {
    setDayParts(fn) {
      dayParts = fn
      cal.getDayParts = dayParts ? (d: Date) => dayParts!(toIso(d)) : undefined
    },
    open,
    close: () => close(),
  }
}
