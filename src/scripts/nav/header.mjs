// Header shell: day/night theme, scroll collapse, compact capsule width and the
// light/dark lettering that follows the page under the bar.
import { compactBarWidth, nextScrolled } from './motion.mjs'
import { barSurface, blendGradient, parseColor, toneOfLayers } from './surface.mjs'

/** Fired on the header when it collapses or expands, so open menus can close. */
export const STATE_EVENT = 'header:state'

function initTheme(header) {
  const root = document.documentElement
  const buttons = header.querySelectorAll('[data-theme-toggle]')
  const system = matchMedia('(prefers-color-scheme: dark)')
  let stored
  try { stored = localStorage.getItem('theme') } catch {}
  let followSystem = stored !== 'day' && stored !== 'night'
  const setTheme = (theme) => {
    root.dataset.theme = theme
    window.__setBrowserThemeColor?.(theme)
    buttons.forEach((button) => {
      button.setAttribute('aria-checked', String(theme === 'night'))
      button.title = `Switch to ${theme === 'night' ? 'light' : 'dark'} theme`
    })
  }
  setTheme(root.dataset.theme || (system.matches ? 'night' : 'day'))
  buttons.forEach((button) => button.addEventListener('click', () => {
    followSystem = false
    const theme = root.dataset.theme === 'night' ? 'day' : 'night'
    setTheme(theme)
    try { localStorage.setItem('theme', theme) } catch {}
  }))
  system.addEventListener('change', (event) => { if (followSystem) setTheme(event.matches ? 'night' : 'day') })
}

// Photo heroes declare their dark treatment; other sections use their computed background.
function sectionTone(section) {
  const declared = section.closest('[data-nav-surface]')?.dataset.navSurface
  if (declared === 'dark' || declared === 'light') return declared
  if (section.closest('.hero--dark')) return 'dark'
  const layers = []
  for (let element = section; element; element = element.parentElement) {
    const style = getComputedStyle(element)
    const color = blendGradient(style.backgroundImage, parseColor(style.backgroundColor))
    layers.push(color)
    if (color[3] >= 1) break
  }
  const fallback = document.documentElement.dataset.theme === 'night' ? [15, 17, 21, 1] : [255, 255, 255, 1]
  return toneOfLayers(layers, fallback)
}

export function initHeader(header) {
  const root = document.documentElement
  const bar = header.querySelector('.glass-bar')
  const track = header.querySelector('[data-nm-track]')
  const cta = header.querySelector('.cta')
  const desktop = matchMedia('(min-width: 1100px)')
  const home = header.hasAttribute('data-home')
  initTheme(header)

  const measure = () => {
    if (!desktop.matches || !track || !cta) return
    const width = compactBarWidth({
      navWidth: track.scrollWidth,
      ctaWidth: cta.offsetWidth,
      ctaIsCompact: header.classList.contains('is-scrolled'),
    })
    bar.style.setProperty('--compact-w', `${width}px`)
  }

  let scrolled = header.classList.contains('is-scrolled')
  let scheduled = false
  const update = () => {
    scheduled = false
    if (header.querySelector('dialog[open]')) return
    const next = nextScrolled(scrollY, scrolled)
    if (next !== scrolled) {
      scrolled = next
      header.classList.toggle('is-scrolled', scrolled)
      header.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: { scrolled } }))
    }
    const bounds = bar.getBoundingClientRect()
    const y = Math.min(bounds.top + bounds.height / 2, innerHeight - 1)
    const tones = [0.12, 0.5, 0.88].map((position) => {
      const underneath = document.elementsFromPoint(bounds.left + bounds.width * position, y)
        .find((element) => !header.contains(element) && element.closest('main, footer, .prefooter'))
      return sectionTone(underneath?.closest('section, footer, article, main') || document.body)
    })
    const surface = barSurface(tones, { home, scrolled })
    if (bar.dataset.surface !== surface) {
      bar.dataset.surface = surface
      header.dataset.surface = surface
    }
  }
  const schedule = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(update)
  }

  addEventListener('scroll', schedule, { passive: true })
  addEventListener('resize', () => { measure(); schedule() }, { passive: true })
  addEventListener('pageshow', schedule)
  addEventListener('load', () => { measure(); schedule() }, { once: true })
  document.fonts?.ready.then(measure)
  desktop.addEventListener('change', () => { measure(); schedule() })
  bar.addEventListener('transitionend', (event) => {
    if (event.target === bar && event.propertyName === 'width') schedule()
  })
  header.addEventListener('mobile-menu:close', schedule)
  let themeSettle
  new MutationObserver(() => {
    schedule()
    clearTimeout(themeSettle)
    themeSettle = setTimeout(schedule, 350)
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] })

  measure()
  update()
  requestAnimationFrame(() => { header.dataset.surfaceReady = '' })
}
