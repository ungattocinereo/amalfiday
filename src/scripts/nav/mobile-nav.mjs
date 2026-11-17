// Mobile menu dialog (below 1100px). Moved as is from the previous Header;
// the mobile redesign replaces it.
export function initMobileNav(header) {
  const menu = header.querySelector('#mobile-menu')
  const menuToggle = header.querySelector('.menu-toggle')
  if (!menu || !menuToggle) return
  const desktop = matchMedia('(min-width: 1100px)')
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  let previousOverflow = ''
  let menuState = 'closed'
  let menuFrame = 0
  let closeTimer
  const finishClose = () => {
    cancelAnimationFrame(menuFrame)
    clearTimeout(closeTimer)
    if (menu.open) menu.close()
  }
  const closeMenu = (immediately = false) => {
    if (!menu.open) return
    if (immediately || reducedMotion.matches) { finishClose(); return }
    if (menuState === 'closing') return
    cancelAnimationFrame(menuFrame)
    const wasVisible = menu.classList.contains('is-visible')
    menuState = 'closing'
    menu.classList.add('is-closing')
    menu.classList.remove('is-visible')
    if (!wasVisible) { finishClose(); return }
    // Keep the native focus trap until the panel has faded out.
    closeTimer = setTimeout(finishClose, 300)
  }
  menuToggle.addEventListener('click', () => {
    if (menu.open || menuState !== 'closed') return
    cancelAnimationFrame(menuFrame)
    clearTimeout(closeTimer)
    previousOverflow = document.body.style.overflow
    menuState = 'opening'
    menu.classList.remove('is-visible', 'is-closing')
    menu.showModal()
    menu.querySelector('.mobile-menu__body').scrollTop = 0
    document.body.style.overflow = 'hidden'
    menuToggle.setAttribute('aria-expanded', 'true')
    // Commit the starting pose before transitioning into the open state.
    menu.getBoundingClientRect()
    if (reducedMotion.matches) { menu.classList.add('is-visible'); menuState = 'open' }
    else menuFrame = requestAnimationFrame(() => {
      if (menu.open && menuState === 'opening') menu.classList.add('is-visible')
    })
  })
  menu.querySelector('.menu-close').addEventListener('click', () => closeMenu())
  menu.addEventListener('cancel', (event) => {
    event.preventDefault()
    closeMenu()
  })
  menu.addEventListener('transitionend', (event) => {
    if (event.target !== menu || event.propertyName !== 'opacity') return
    if (menuState === 'closing') finishClose()
    else if (menuState === 'opening') menuState = 'open'
  })
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) { closeMenu(true); return }
    if (event.target !== menu) return
    const bounds = menu.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu()
  })
  menu.addEventListener('close', () => {
    cancelAnimationFrame(menuFrame)
    clearTimeout(closeTimer)
    menuState = 'closed'
    menu.classList.remove('is-visible', 'is-closing')
    document.body.style.overflow = previousOverflow
    menuToggle.setAttribute('aria-expanded', 'false')
    menu.querySelectorAll('details').forEach((details) => { details.open = false })
    if (desktop.matches) header.querySelector('.brand').focus({ preventScroll: true })
    else menuToggle.focus({ preventScroll: true })
    header.dispatchEvent(new CustomEvent('mobile-menu:close'))
  })
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches || !menu.open) return
    if (menuState === 'closing') finishClose()
    else { menu.classList.add('is-visible'); menuState = 'open' }
  })
  desktop.addEventListener('change', () => { if (menu.open) closeMenu(true) })
}
