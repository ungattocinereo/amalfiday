// Mobile menu sheet (below 1100px): open/close, photo cards that open in place with a spring,
// swipe-down to close, the system "back" button, scroll lock and focus return.
import { springEasing } from './motion.mjs'
import { dragOffset, nextOpenCard, shouldDismiss } from './mobile-gesture.mjs'
import { MENU_STATE, isMenuState, isPlainNavigation, planClose } from './mobile-history.mjs'

const CLOSE_MS = 280
const LEAVE_FALLBACK_MS = 350

export function initMobileNav(header) {
  const menu = header.querySelector('#mobile-menu')
  const toggle = header.querySelector('.menu-toggle')
  if (!menu || !toggle) return
  const body = menu.querySelector('[data-body]')
  const grab = menu.querySelector('[data-grab]')
  const cards = [...menu.querySelectorAll('[data-card]')]
  const desktop = matchMedia('(min-width: 1100px)')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')

  for (const [name, stiffness, damping] of [['sheet', 500, 46], ['card', 520, 44]]) {
    const { easing, ms } = springEasing(stiffness, damping)
    menu.style.setProperty(`--${name}-ease`, easing)
    menu.style.setProperty(`--${name}-ms`, `${ms}ms`)
  }
  const card = springEasing(520, 44)

  // Stale entry from a reload while the menu was open.
  if (isMenuState(history.state)) history.replaceState(null, '')

  // ---- Photos load on the first sign of interest ----
  let imagesLoaded = false
  const loadImages = () => {
    if (imagesLoaded) return
    imagesLoaded = true
    menu.querySelectorAll('img[data-src]').forEach((img) => {
      img.src = img.dataset.src
      img.removeAttribute('data-src')
    })
  }
  for (const type of ['pointerdown', 'focus', 'touchstart']) toggle.addEventListener(type, loadImages, { once: true, passive: true })

  // ---- Cards (one open at a time, height by spring) ----
  let openCard = null
  const animations = new WeakMap()
  const cardPart = (el) => ({ head: el.querySelector('.mc__head'), panel: el.querySelector('.mc__body') })

  function setCard(el, open, animate) {
    const { head, panel } = cardPart(el)
    const running = animations.get(panel)
    const from = panel.getBoundingClientRect().height
    running?.cancel()
    head.setAttribute('aria-expanded', String(open))
    if (open) {
      el.classList.add('is-open')
      panel.inert = false
    } else {
      panel.inert = true
    }
    if (!animate || reduced.matches) {
      el.classList.toggle('is-open', open)
      return Promise.resolve()
    }
    const to = open ? panel.scrollHeight : 0
    const player = panel.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: card.ms, easing: card.easing })
    animations.set(panel, player)
    return player.finished.then(
      () => { if (!open) el.classList.remove('is-open') },
      () => {}, // cancelled by the next tap
    )
  }

  function selectCard(id, animate = true) {
    const next = nextOpenCard(openCard, id)
    const jobs = []
    for (const el of cards) {
      const isOpen = el.dataset.card === openCard
      const shouldOpen = el.dataset.card === next
      if (isOpen !== shouldOpen) jobs.push(setCard(el, shouldOpen, animate))
    }
    openCard = next
    if (next) {
      const el = cards.find((c) => c.dataset.card === next)
      Promise.all(jobs).then(() => {
        if (openCard === next) el.scrollIntoView({ block: 'nearest', behavior: reduced.matches ? 'auto' : 'smooth' })
      })
    }
  }
  cards.forEach((el) => cardPart(el).head.addEventListener('click', () => selectCard(el.dataset.card)))

  // ---- Open / close ----
  let state = 'closed' // closed | open | closing
  let pushed = false
  let pendingGo = null
  let closeTimer
  let frame = 0
  let previous = { html: '', body: '' }

  function lockScroll(lock) {
    const root = document.documentElement
    if (lock) {
      previous = { html: root.style.overflow, body: document.body.style.overflow }
      root.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      root.style.overflow = previous.html
      document.body.style.overflow = previous.body
    }
  }

  function finish() {
    cancelAnimationFrame(frame)
    clearTimeout(closeTimer)
    if (menu.open) menu.close() // the 'close' listener resets everything else
  }

  /** `source`: 'button' | 'esc' | 'swipe' | 'popstate' | 'link' | 'resize'. */
  function close(source = 'button', { immediately = false } = {}) {
    if (!menu.open || state === 'closing') return
    state = 'closing'
    if (source !== 'popstate' && pushed && isMenuState(history.state) && source !== 'link') {
      pushed = false
      history.back()
    }
    cancelAnimationFrame(frame)
    const wasVisible = menu.classList.contains('is-visible')
    menu.classList.remove('is-visible')
    if (immediately || reduced.matches || !wasVisible) { finish(); return }
    clearTimeout(closeTimer)
    closeTimer = setTimeout(finish, CLOSE_MS)
  }

  function open() {
    if (menu.open || state !== 'closed') return
    loadImages()
    clearTimeout(closeTimer)
    menu.classList.remove('is-visible', 'is-swiping', 'is-dragging')
    menu.style.transform = ''
    menu.showModal()
    state = 'open'
    body.scrollTop = 0
    lockScroll(true)
    toggle.setAttribute('aria-expanded', 'true')
    history.pushState(MENU_STATE, '')
    pushed = true
    menu.getBoundingClientRect() // commit the start pose before transitioning
    if (reduced.matches) menu.classList.add('is-visible')
    else frame = requestAnimationFrame(() => { if (menu.open && state === 'open') menu.classList.add('is-visible') })
  }

  toggle.addEventListener('click', open)
  menu.querySelector('.mm__close').addEventListener('click', () => close('button'))
  menu.addEventListener('cancel', (event) => {
    event.preventDefault()
    close('esc')
  })
  menu.addEventListener('close', () => {
    cancelAnimationFrame(frame)
    clearTimeout(closeTimer)
    state = 'closed'
    menu.classList.remove('is-visible', 'is-swiping', 'is-dragging')
    menu.style.transform = ''
    lockScroll(false)
    toggle.setAttribute('aria-expanded', 'false')
    if (openCard) selectCard(openCard, false)
    toggle.focus({ preventScroll: true })
    header.dispatchEvent(new CustomEvent('mobile-menu:close'))
  })

  // Tap on the dimmed area beside the sheet (tablet portrait).
  menu.addEventListener('click', (event) => {
    if (event.target !== menu) return
    const r = menu.getBoundingClientRect()
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close('button')
  })

  // ---- System back ----
  addEventListener('popstate', () => {
    pushed = false
    const go = pendingGo
    pendingGo = null
    if (go) { finish(); location.assign(go); return }
    if (menu.open && state !== 'closing') close('popstate')
  })

  // ---- Links: pop our history entry first so back does not land on a stale one ----
  menu.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]')
    if (!link || event.defaultPrevented || !isPlainNavigation({ button: event.button, metaKey: event.metaKey, ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, target: link.getAttribute('target'), download: link.getAttribute('download') })) return
    const url = new URL(link.href, location.href)
    if (url.origin !== location.origin) return
    event.preventDefault()
    const samePage = url.pathname === location.pathname && url.search === location.search
    const plan = planClose({ source: 'link', state: history.state })
    if (samePage && !url.hash) { close('button'); return }
    if (plan === 'back-then-go') {
      pendingGo = url.href
      history.back()
      setTimeout(() => {
        if (pendingGo) { const go = pendingGo; pendingGo = null; finish(); location.assign(go) }
      }, LEAVE_FALLBACK_MS)
    } else {
      finish()
      location.assign(url.href)
    }
  })

  // ---- Swipe down from the handle / top bar ----
  let drag = null
  grab.addEventListener('pointerdown', (event) => {
    if (event.button > 0 || event.target.closest('a, button')) return
    drag = { id: event.pointerId, y: event.clientY, t: event.timeStamp, dy: 0 }
    grab.setPointerCapture(event.pointerId)
    menu.classList.add('is-dragging')
  })
  grab.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return
    drag.dy = event.clientY - drag.y
    menu.style.transform = `translateY(${dragOffset(drag.dy)}px)`
  })
  const endDrag = (event, cancelled) => {
    if (!drag || event.pointerId !== drag.id) return
    const { dy, t } = drag
    drag = null
    menu.classList.remove('is-dragging')
    if (!cancelled && shouldDismiss({ dy, dt: event.timeStamp - t, height: menu.offsetHeight })) {
      menu.classList.add('is-swiping')
      menu.style.transform = 'translateY(100%)'
      if (reduced.matches) menu.style.transform = ''
      close('swipe')
    } else {
      menu.style.transform = ''
    }
  }
  grab.addEventListener('pointerup', (event) => endDrag(event, false))
  grab.addEventListener('pointercancel', (event) => endDrag(event, true))

  // ---- Environment changes ----
  reduced.addEventListener('change', () => {
    if (reduced.matches && menu.open) {
      if (state === 'closing') finish()
      else menu.classList.add('is-visible')
    }
  })
  desktop.addEventListener('change', () => { if (menu.open) close('resize', { immediately: true }) })
}
