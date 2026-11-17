// Desktop navigation menu: sliding highlight, one shared popup that morphs between
// panels, direction-aware content, pin-on-click, keyboard support.
import { placePanel, springEasing, transitionDirection } from './motion.mjs'
import { STATE_EVENT } from './header.mjs'

const CLOSE_DELAY = 160
const PIN_WINDOW = 500
const LEAVE_MS = 240

/**
 * Without JS the triggers are links to the hub pages. With JS, triggers without
 * data-link-trigger become disclosure buttons; link triggers stay links (hover or a
 * first tap opens the panel, a click goes to the section).
 */
function upgradeTriggers(nav) {
  nav.querySelectorAll('a.nm-trigger[data-panel]:not([data-link-trigger])').forEach((link) => {
    const button = document.createElement('button')
    for (const { name, value } of link.attributes) {
      if (name !== 'href' && name !== 'aria-current') button.setAttribute(name, value)
    }
    button.type = 'button'
    button.setAttribute('aria-expanded', 'false')
    button.setAttribute('aria-controls', link.dataset.panel)
    button.append(...link.childNodes)
    link.replaceWith(button)
  })
}

export function initDesktopNav(nav) {
  const header = nav.closest('header')
  const track = nav.querySelector('[data-nm-track]')
  const hl = nav.querySelector('.nm-hl')
  const popup = nav.querySelector('[data-popup]')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const desktop = matchMedia('(min-width: 1100px)')

  for (const [name, stiffness, damping] of [['hl', 500, 40], ['pop', 660, 52], ['in', 450, 43]]) {
    const { easing, ms } = springEasing(stiffness, damping)
    nav.style.setProperty(`--${name}-ease`, easing)
    nav.style.setProperty(`--${name}-ms`, `${ms}ms`)
  }

  upgradeTriggers(nav)
  nav.classList.add('is-enhanced')
  const triggers = [...nav.querySelectorAll('.nm-trigger')]
  const panelTriggers = triggers.filter((t) => t.dataset.panel)
  const order = panelTriggers.map((t) => t.dataset.panel)
  const panels = Object.fromEntries(order.map((id) => [id, document.getElementById(id)]))
  const triggerFor = (id) => panelTriggers.find((t) => t.dataset.panel === id)
  let active = null
  let closeTimer
  let openedAt = 0
  let pinned = false
  let lastPointer = ''

  // Menu photos load on the first sign of interest, not with the page.
  let imagesLoaded = false
  const loadImages = () => {
    if (imagesLoaded) return
    imagesLoaded = true
    popup.querySelectorAll('img[data-src]').forEach((img) => {
      img.src = img.dataset.src
      img.removeAttribute('data-src')
    })
  }
  nav.addEventListener('pointerenter', loadImages, { once: true })
  nav.addEventListener('focusin', loadImages, { once: true })

  const moveHighlight = (el) => {
    if (!el) { hl.classList.remove('is-on'); return }
    const a = el.getBoundingClientRect()
    const b = track.getBoundingClientRect()
    const first = !hl.classList.contains('is-on')
    // The first appearance fades in place instead of gliding from the last position.
    if (first) hl.style.transition = 'opacity 200ms ease'
    hl.style.transform = `translateX(${a.left - b.left}px)`
    hl.style.width = `${a.width}px`
    hl.classList.add('is-on')
    if (first) requestAnimationFrame(() => { hl.style.transition = '' })
  }

  const place = (trigger, panel) => {
    const t = trigger.getBoundingClientRect()
    const { x, originX } = placePanel({
      triggerLeft: t.left,
      triggerWidth: t.width,
      panelWidth: panel.offsetWidth,
      navLeft: nav.getBoundingClientRect().left,
      viewportWidth: document.documentElement.clientWidth,
    })
    popup.style.setProperty('--x', `${x}px`)
    popup.style.setProperty('--w', `${panel.offsetWidth}px`)
    popup.style.setProperty('--h', `${panel.offsetHeight}px`)
    popup.style.setProperty('--ox', `${originX}px`)
  }

  const open = (trigger) => {
    clearTimeout(closeTimer)
    const id = trigger.dataset.panel
    if (active === id) return
    loadImages()
    const panel = panels[id]
    const prev = active && panels[active]
    const fromClosed = !active
    const dir = transitionDirection(order, active, id)
    panelTriggers.forEach((t) => t.setAttribute('aria-expanded', String(t === trigger)))
    if (fromClosed) popup.classList.add('no-move')
    place(trigger, panel)
    if (prev) {
      prev.style.setProperty('--dir', -dir)
      prev.classList.remove('is-active', 'is-stagger')
      prev.classList.add('is-leaving')
      setTimeout(() => prev.classList.remove('is-leaving'), LEAVE_MS)
    }
    panel.classList.remove('is-leaving')
    panel.style.setProperty('--dir', dir)
    panel.classList.add('is-entering')
    panel.classList.toggle('is-stagger', fromClosed && !reduced.matches)
    panel.getBoundingClientRect()
    panel.classList.remove('is-entering')
    panel.classList.add('is-active')
    popup.classList.add('is-open')
    if (fromClosed) {
      popup.getBoundingClientRect()
      requestAnimationFrame(() => popup.classList.remove('no-move'))
    }
    active = id
    openedAt = performance.now()
  }

  const close = () => {
    clearTimeout(closeTimer)
    if (!active) return
    panels[active].classList.remove('is-active', 'is-stagger')
    popup.classList.remove('is-open')
    panelTriggers.forEach((t) => t.setAttribute('aria-expanded', 'false'))
    active = null
    pinned = false
    moveHighlight(null)
  }
  const scheduleClose = () => {
    if (pinned) return
    clearTimeout(closeTimer)
    closeTimer = setTimeout(close, CLOSE_DELAY)
  }

  triggers.forEach((t) => {
    t.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch') return
      moveHighlight(t)
      if (t.dataset.panel) open(t)
      else scheduleClose()
    })
    t.addEventListener('focus', () => moveHighlight(t))
    if (!t.dataset.panel) return
    if (t.matches('a[data-link-trigger]')) {
      t.setAttribute('aria-expanded', 'false')
      // Mouse and keyboard follow the link. On touch the first tap opens the panel,
      // a second tap on the same trigger goes to the section.
      t.addEventListener('pointerdown', (event) => { lastPointer = event.pointerType })
      t.addEventListener('click', (event) => {
        const touch = lastPointer === 'touch' || lastPointer === 'pen'
        lastPointer = ''
        if (!touch || active === t.dataset.panel) return
        event.preventDefault()
        open(t)
        pinned = true
        moveHighlight(t)
      })
    } else t.addEventListener('click', () => {
      if (active === t.dataset.panel) {
        // A click soon after the hover that opened the panel pins it open.
        if (performance.now() - openedAt < PIN_WINDOW) { pinned = true; return }
        close()
        return
      }
      open(t)
      pinned = true
      moveHighlight(t)
    })
    t.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return
      event.preventDefault()
      open(t)
      moveHighlight(t)
      panels[t.dataset.panel].querySelector('a')?.focus({ preventScroll: true })
    })
  })
  nav.addEventListener('pointerleave', scheduleClose)
  nav.addEventListener('pointerenter', () => clearTimeout(closeTimer))
  track.addEventListener('pointerleave', () => { if (!active) moveHighlight(null) })
  nav.addEventListener('focusout', (event) => {
    if (!nav.contains(event.relatedTarget)) {
      close()
      moveHighlight(null)
    }
  })
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !active) return
    const trigger = triggerFor(active)
    close()
    trigger.focus()
  })
  document.addEventListener('click', (event) => { if (!nav.contains(event.target)) close() })
  addEventListener('resize', () => { if (active) place(triggerFor(active), panels[active]) })
  header?.addEventListener(STATE_EVENT, close)
  desktop.addEventListener('change', close)
}
