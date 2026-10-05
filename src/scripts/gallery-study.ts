import { setupPhotoDialog } from './photo-dialog'

type BrowserFrame = { original: string; src: string; alt: string }
const root = document.querySelector<HTMLElement>('[data-gallery-study]')
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
const desktop = window.matchMedia('(min-width: 1100px) and (hover: hover) and (pointer: fine)')
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const two = (n: number) => String(n + 1).padStart(2, '0')
const smooth = () => reduced.matches ? 'instant' as const : 'smooth' as const

if (root) {
  const galleryFrames: BrowserFrame[] = JSON.parse(root.querySelector('[data-gallery-frames]')!.textContent!)
  const header = document.querySelector<HTMLElement>('.header')
  const immersiveGalleries = Array.from(root.querySelectorAll<HTMLElement>('[data-gallery="immersive"]'))
  const updateHeaderContrast = () => {
    header?.classList.toggle('gs-over-contained-photo', immersiveGalleries.some(gallery => {
      const rect = gallery.getBoundingClientRect()
      return gallery.dataset.activeFit === 'contain' && rect.top < 80 && rect.bottom > 80
    }))
  }
  const isPinned = () => desktop.matches && !reduced.matches
  const hero = root.querySelector<HTMLElement>('.gs-hero')!
  const pauseButton = root.querySelector<HTMLButtonElement>('.gs-motion-toggle')!
  let paused = false
  pauseButton.addEventListener('click', () => {
    paused = !paused
    hero.classList.toggle('is-paused', paused)
    pauseButton.setAttribute('aria-pressed', String(paused))
    pauseButton.setAttribute('aria-label', paused ? 'Play cover animation' : 'Pause cover animation')
    pauseButton.innerHTML = `<i class="ph ph-${paused ? 'play' : 'pause'}" aria-hidden="true"></i>`
    if (paused) hero.style.setProperty('--hero-drift', '0px')
  })
  new IntersectionObserver(entries => {
    hero.classList.toggle('is-paused', paused || !entries[0].isIntersecting)
  }).observe(hero)

  root.classList.add('gs-motion-ready', 'is-enhanced')
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible')
      reveal.unobserve(entry.target)
    }
  }), { threshold: .08 })
  root.querySelectorAll('[data-reveal]').forEach(element => reveal.observe(element))

  function updateControls(container: HTMLElement, index: number, count = galleryFrames.length, paired = false) {
    const start = paired ? Math.floor(index / 2) * 2 : index
    const end = paired ? Math.min(start + 1, count - 1) : index
    const label = start === end ? two(start) : `${two(start)}–${two(end)}`
    const counter = container.querySelector<HTMLElement>('[data-current]')!
    if (counter.textContent !== label) {
      counter.textContent = label
      if (!reduced.matches) counter.animate([{ opacity: .25, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 250 })
    }
    container.querySelectorAll<HTMLButtonElement>('[data-frame]').forEach(button => {
      const active = Number(button.dataset.frame) === index
      button.setAttribute('aria-current', String(active))
      button.dataset.visible = String(Number(button.dataset.frame) >= start && Number(button.dataset.frame) <= end)
      if (active) {
        const strip = button.parentElement!
        const left = button.offsetLeft - strip.offsetLeft
        if (left < strip.scrollLeft || left + button.offsetWidth > strip.scrollLeft + strip.clientWidth) {
          strip.scrollTo({ left: left - strip.clientWidth / 2 + button.offsetWidth / 2, behavior: smooth() })
        }
      }
    })
    container.querySelector<HTMLButtonElement>('[data-prev]')!.disabled = start === 0
    container.querySelector<HTMLButtonElement>('[data-next]')!.disabled = end >= count - 1
  }

  const controllers = Array.from(root.querySelectorAll<HTMLElement>('[data-gallery]')).map(gallery => {
    const type = gallery.dataset.gallery!
    const indices: number[] = gallery.dataset.frameIndices ? JSON.parse(gallery.dataset.frameIndices) : galleryFrames.map((_, index) => index)
    const galleryImages = indices.map(index => galleryFrames[index])
    const viewport = gallery.querySelector<HTMLElement>(`.gs-${type === 'spreads' ? 'spreads' : type}__viewport`)!
    const track = gallery.querySelector<HTMLElement>('.gs-rail__track')
    const scene = gallery.querySelector<HTMLElement>('.gs-scroll-scene')
    const stage = gallery.querySelector<HTMLElement>('.gs-stage')
    const pinnedScene = () => Boolean(scene) && isPinned()
    const frames = Array.from(gallery.querySelectorAll<HTMLElement>(type === 'spreads' ? '[data-spread]' : `.gs-${type}__frame`))
    let current = 0
    let paintedIndex = -1
    let distance = 0
    let maxX = 0
    let positions: number[] = []

    const paint = (index: number) => {
      if (type === 'immersive' && paintedIndex === index) return
      paintedIndex = index
      current = index
      const visible = type === 'spreads' ? frames[Math.floor(index / 2)] : frames[index]
      if (type !== 'immersive' || gallery.getBoundingClientRect().top < window.innerHeight * 1.5) {
        visible.querySelectorAll<HTMLImageElement>('img').forEach(image => { image.loading = 'eager' })
      }
      updateControls(gallery, index, galleryImages.length, type === 'spreads')
      if (type === 'dissolve') frames.forEach((frame, i) => {
        frame.classList.toggle('is-active', i === index)
        // Invisible overlapping slides must not receive keyboard focus.
        frame.inert = isPinned() && i !== index
      })
      if (type === 'immersive') {
        gallery.dataset.activeFit = frames[index].dataset.fit || 'cover'
        updateHeaderContrast()
        const image = galleryImages[index]
        const open = gallery.querySelector<HTMLAnchorElement>('[data-immersive-open]')!
        open.dataset.openPhoto = String(indices[index])
        open.href = image.original
        open.setAttribute('aria-label', `Open photograph ${index + 1} in full`)
        const caption = gallery.querySelector<HTMLElement>('[data-immersive-caption]')!
        if (caption.textContent !== image.alt) {
          caption.textContent = image.alt
          gallery.querySelector('[data-immersive-status]')!.textContent = `Photograph ${index + 1} of ${galleryImages.length}. ${image.alt}`
        }
        frames.forEach((frame, i) => frame.setAttribute('aria-hidden', String(i !== index)))
      }
    }
    const measure = () => {
      maxX = track ? Math.max(0, track.scrollWidth - viewport.clientWidth) : 0
      positions = frames.map(frame => clamp(frame.offsetLeft + frame.offsetWidth / 2 - viewport.clientWidth / 2, 0, maxX))
      distance = type === 'rail' ? Math.min(maxX, window.innerHeight * 4) : window.innerHeight * Math.min(3.2, Math.max(0, frames.length - 1))
      if (scene && stage) scene.style.setProperty('--scene-height', isPinned() ? `${stage.offsetHeight + distance}px` : 'auto')
      if (track && !isPinned()) track.style.transform = ''
      if (pinnedScene()) viewport.scrollLeft = 0
      else {
        const frame = frames[type === 'spreads' ? Math.floor(current / 2) : current]
        viewport.scrollTo({ left: type === 'rail' ? positions[current] : frame.offsetLeft - frames[0].offsetLeft, behavior: 'instant' })
      }
      frames.forEach((frame, i) => { frame.inert = type === 'dissolve' && isPinned() && i !== current })
    }
    const progress = () => scene && distance ? clamp((92 - scene.getBoundingClientRect().top) / distance) : 0
    const nearest = (x: number) => positions.reduce((best, value, index) => Math.abs(value - x) < Math.abs(positions[best] - x) ? index : best, 0)
    const onPageScroll = () => {
      if (!isPinned() || type === 'spreads' || !scene) return
      const rect = scene.getBoundingClientRect()
      if (rect.top > window.innerHeight || rect.bottom < 0) return
      const p = progress()
      if (track) {
        track.style.transform = `translate3d(${-p * maxX}px, 0, 0)`
        paint(nearest(p * maxX))
      } else paint(Math.round(p * (frames.length - 1)))
    }
    const go = (index: number) => {
      index = clamp(index, 0, galleryImages.length - 1)
      if (pinnedScene() && scene) {
        const p = type === 'rail' ? (maxX ? positions[index] / maxX : 0) : (frames.length > 1 ? index / (frames.length - 1) : 0)
        window.scrollTo({ top: window.scrollY + scene.getBoundingClientRect().top - 92 + p * distance, behavior: smooth() })
      } else {
        const page = type === 'spreads' ? Math.floor(index / 2) : index
        const frame = frames[page]
        const left = type === 'rail' ? positions[index] : frame.offsetLeft - frames[0].offsetLeft
        const alreadyVisible = Math.abs(viewport.scrollLeft - left) < 1
        viewport.scrollTo({ left, behavior: smooth() })
        // During a smooth transition, controls and the viewer opener must track
        // the photograph actually on screen, not briefly jump ahead and back.
        if (reduced.matches || alreadyVisible) paint(index)
      }
    }
    if (type === 'spreads') {
      let drag: { pointerId: number, x: number, left: number, active: boolean } | null = null
      let suppressClick = false
      const finishDrag = (cancelled = false) => {
        if (!drag) return
        const ended = drag
        drag = null
        if (viewport.hasPointerCapture(ended.pointerId)) viewport.releasePointerCapture(ended.pointerId)
        if (!ended.active) return
        const width = viewport.clientWidth
        const distance = viewport.scrollLeft - ended.left
        const startPage = Math.round(ended.left / width)
        let page = Math.round(viewport.scrollLeft / width)
        // A deliberate short pull also turns the page on a wide desktop.
        if (!cancelled && page === startPage && Math.abs(distance) > Math.min(100, width * .2)) page += Math.sign(distance)
        viewport.classList.remove('is-dragging')
        go(clamp(page, 0, frames.length - 1) * 2)
      }
      viewport.addEventListener('pointerdown', event => {
        // Touch keeps the browser's native scrolling, momentum and vertical gestures.
        if (event.pointerType !== 'mouse' || event.button !== 0 || !event.isPrimary || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
        suppressClick = false
        drag = { pointerId: event.pointerId, x: event.clientX, left: viewport.scrollLeft, active: false }
      })
      viewport.addEventListener('pointermove', event => {
        if (!drag || event.pointerId !== drag.pointerId) return
        if (!(event.buttons & 1)) { finishDrag(true); return }
        const dx = event.clientX - drag.x
        if (!drag.active) {
          if (Math.abs(dx) < 6) return
          drag.active = true
          suppressClick = true
          viewport.classList.add('is-dragging')
          viewport.setPointerCapture(event.pointerId)
          viewport.focus({ preventScroll: true })
        }
        event.preventDefault()
        viewport.scrollTo({ left: drag.left - dx, behavior: 'instant' })
      })
      viewport.addEventListener('pointerup', event => { if (event.pointerId === drag?.pointerId) finishDrag() })
      viewport.addEventListener('pointercancel', () => finishDrag(true))
      viewport.addEventListener('lostpointercapture', () => finishDrag(true))
      window.addEventListener('blur', () => finishDrag(true))
      viewport.addEventListener('dragstart', event => event.preventDefault())
      viewport.addEventListener('click', event => {
        if (!suppressClick || event.detail === 0) return
        event.preventDefault()
        event.stopImmediatePropagation()
        suppressClick = false
      }, true)
    }
    let scrollFrame = 0
    viewport.addEventListener('scroll', () => {
      if (pinnedScene()) return
      if (scrollFrame) return
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0
        const page = clamp(Math.round(viewport.scrollLeft / viewport.clientWidth), 0, frames.length - 1)
        paint(type === 'rail' ? nearest(viewport.scrollLeft) : type === 'spreads' ? (Math.floor(current / 2) === page ? current : page * 2) : page)
      })
    }, { passive: true })
    gallery.querySelectorAll<HTMLButtonElement>('[data-frame]').forEach(button => button.addEventListener('click', () => go(Number(button.dataset.frame))))
    const move = (direction: number) => go(type === 'spreads' ? (Math.floor(current / 2) + direction) * 2 : current + direction)
    gallery.querySelector('[data-prev]')!.addEventListener('click', () => move(-1))
    gallery.querySelector('[data-next]')!.addEventListener('click', () => move(1))
    viewport.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        move(event.key === 'ArrowLeft' ? -1 : 1)
      }
    })
    measure()
    paint(0)
    return { measure, onPageScroll }
  })

  let raf = 0
  function tick() {
    raf = 0
    controllers.forEach(controller => controller.onPageScroll())
    updateHeaderContrast()
    if (!reduced.matches && !paused && hero.getBoundingClientRect().bottom > 0) hero.style.setProperty('--hero-drift', `${Math.min(window.scrollY * .12, 90)}px`)
  }
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick) }, { passive: true })
  const refresh = () => { controllers.forEach(controller => controller.measure()); tick() }
  const touchViewport = window.matchMedia('(hover: none), (pointer: coarse)')
  let layoutWidth = document.documentElement.clientWidth
  window.addEventListener('resize', () => {
    const width = document.documentElement.clientWidth
    // Browser toolbars change the height while scrolling. Leave native swipes
    // alone; svh keeps the scenes stable until the width/orientation changes.
    if (touchViewport.matches && width === layoutWidth) return
    layoutWidth = width
    refresh()
  }, { passive: true })
  desktop.addEventListener('change', refresh)
  reduced.addEventListener('change', refresh)
  document.fonts.ready.then(refresh)
  window.addEventListener('load', refresh, { once: true })
  tick()

  const lightbox = document.querySelector<HTMLDialogElement>('#gs-lightbox')!
  const openLightbox = setupPhotoDialog(lightbox)
  const largeImage = lightbox.querySelector<HTMLImageElement>('.gs-lightbox__image img')!
  let lightboxIndex = 0
  let loadToken = 0
  const showPhoto = async (index: number) => {
    lightboxIndex = clamp(index, 0, galleryFrames.length - 1)
    const frame = galleryFrames[lightboxIndex]
    updateControls(lightbox, lightboxIndex)
    lightbox.querySelector('[data-lightbox-status]')!.textContent = `Photograph ${lightboxIndex + 1} of ${galleryFrames.length}. ${frame.alt}`
    largeImage.alt = frame.alt
    largeImage.src = frame.src
    const token = ++loadToken
    // Show the responsive image immediately; replace it with the full original once decoded.
    const original = new Image()
    original.src = frame.original
    try {
      await original.decode()
      if (token === loadToken) largeImage.src = frame.original
    } catch { /* The responsive image remains available if the original fails. */ }
  }
  root.querySelectorAll<HTMLAnchorElement>('[data-open-photo]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    showPhoto(Number(link.dataset.openPhoto))
    openLightbox(link)
  }))
  lightbox.querySelectorAll<HTMLButtonElement>('[data-frame]').forEach(button => button.addEventListener('click', () => showPhoto(Number(button.dataset.frame))))
  lightbox.querySelector('[data-prev]')!.addEventListener('click', () => showPhoto(lightboxIndex - 1))
  lightbox.querySelector('[data-next]')!.addEventListener('click', () => showPhoto(lightboxIndex + 1))
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      showPhoto(lightboxIndex + (event.key === 'ArrowRight' ? 1 : -1))
    }
  })
  let touchStart: { x: number, y: number } | null = null
  const lightboxImageArea = lightbox.querySelector<HTMLElement>('.gs-lightbox__image')!
  lightboxImageArea.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null
  }, { passive: true })
  lightboxImageArea.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches[0]) return
    const dx = event.changedTouches[0].clientX - touchStart.x
    const dy = event.changedTouches[0].clientY - touchStart.y
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(lightboxIndex + (dx < 0 ? 1 : -1))
    touchStart = null
  }, { passive: true })

}
